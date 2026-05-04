from fastapi import FastAPI, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List
from ocr import extract_text
from qr_decoder import decode_qr
from comparator import compare_fields
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
import shutil
import os
import asyncio
import uuid
from concurrent.futures import ThreadPoolExecutor

app = FastAPI()

app.mount("/static", StaticFiles(directory="../frontend"), name="static")

executor = ThreadPoolExecutor(max_workers=4)

@app.get("/")
def index():
    return FileResponse("../frontend/index.html")


@app.post("/verify")
async def verify_certificate(certificate: UploadFile = File(...)):
    temp_path = f"temp_{certificate.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(certificate.file, buffer)

    try:
        extracted = extract_text(temp_path)
        qr_data = decode_qr(temp_path)

        if not qr_data:
            return {
                "name":    {"ocr": extracted.get("name"),   "qr": None, "match": False},
                "course":  {"ocr": extracted.get("course"), "qr": None, "match": False},
                "date":    {"ocr": extracted.get("date"),   "qr": None, "match": False},
                "verdict": "Manual Review - QR Unreadable"
            }

        result = compare_fields(extracted, qr_data)
        return result

    except Exception as e:
        import traceback; traceback.print_exc()
        return {
            "name":    {"ocr": None, "qr": None, "match": False},
            "course":  {"ocr": None, "qr": None, "match": False},
            "date":    {"ocr": None, "qr": None, "match": False},
            "verdict": "Manual Review - Processing Error"
        }
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass


def process_single(filename, temp_path):
    """Runs in thread pool — handles OCR + QR + compare for one file"""
    try:
        extracted = extract_text(temp_path)
        qr_data   = decode_qr(temp_path)

        if not qr_data:
            return {
                'filename': filename,
                'name':     extracted.get('name',   '—'),
                'course':   extracted.get('course', '—'),
                'date':     extracted.get('date',   '—'),
                'flag':     'Manual Review - QR Unreadable'
            }

        comparison = compare_fields(extracted, qr_data)
        return {
            'filename': filename,
            'name':     qr_data.get('name') or extracted.get('name') or '—',
            'course':   qr_data.get('course') or extracted.get('course') or '—',
            'date':     qr_data.get('date') or extracted.get('date') or '—',
            'flag':     comparison['verdict']
        }

    except Exception as e:
        print(f'Error processing {filename}: {e}')
        return {
            'filename': filename,
            'name': '—', 'course': '—', 'date': '—',
            'flag': 'Manual Review - Processing Error'
        }
    finally:
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except:
            pass


@app.post("/verify-bulk")
async def verify_bulk(certificates: List[UploadFile] = File(...)):
    # Save all files first
    tasks = []
    for cert in certificates:
        # Use UUID to avoid path issues with spaces in filenames
        ext = os.path.splitext(cert.filename)[1]
        temp_path = f"temp_{uuid.uuid4().hex}{ext}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(cert.file, buffer)
        tasks.append((cert.filename, temp_path))

    # Process all in parallel
    loop = asyncio.get_event_loop()
    futures = [
        loop.run_in_executor(executor, process_single, filename, temp_path)
        for filename, temp_path in tasks
    ]
    results = await asyncio.gather(*futures)

    # Generate Excel
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Verification Results"

    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1a1a1a", end_color="1a1a1a", fill_type="solid")

    headers = ["File Name", "Name", "Course", "Date", "Flag"]
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")

    green_fill = PatternFill(start_color="f0fdf4", end_color="f0fdf4", fill_type="solid")
    red_fill   = PatternFill(start_color="fff1f2", end_color="fff1f2", fill_type="solid")

    for row, result in enumerate(results, 2):
        ws.cell(row=row, column=1, value=result['filename'])
        ws.cell(row=row, column=2, value=result['name'])
        ws.cell(row=row, column=3, value=result['course'])
        ws.cell(row=row, column=4, value=result['date'])
        ws.cell(row=row, column=5, value=result['flag'])

        fill = green_fill if result['flag'] == 'Verified' else red_fill
        for col in range(1, 6):
            ws.cell(row=row, column=col).fill = fill
            ws.cell(row=row, column=col).alignment = Alignment(horizontal="center")

    ws.column_dimensions['A'].width = 25
    ws.column_dimensions['B'].width = 20
    ws.column_dimensions['C'].width = 30
    ws.column_dimensions['D'].width = 15
    ws.column_dimensions['E'].width = 12

    output_path = "verification_results.xlsx"
    wb.save(output_path)

    return FileResponse(
        output_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="verification_results.xlsx"
    )