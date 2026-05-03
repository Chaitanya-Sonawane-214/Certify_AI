import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import re
import os

# Tesseract path
pytesseract.pytesseract.tesseract_cmd = r'D:\CDS\SOFTWARE\Tesseract\tesseract.exe'

# Tessdata path
os.environ['TESSDATA_PREFIX'] = r'D:\CDS\SOFTWARE\Tesseract\tessdata'

# Poppler path
POPPLER_PATH = r'D:\CDS\SOFTWARE\POPPLER\poppler-25.12.0\Library\bin'

# date_pattern = re.compile(r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}')
# date_pattern = re.compile(r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s*\d{4}')

# def extract_text(image_path):
#     if image_path.lower().endswith('.pdf'):
#         pages = convert_from_path(image_path, dpi=200, poppler_path=POPPLER_PATH)
#         image = pages[0]
#     else:
#         image = Image.open(image_path)

#     raw_text = pytesseract.image_to_string(image, lang='eng')

#     # DEBUG - remove later
#     print("=== RAW OCR TEXT ===")
#     print(raw_text)
#     print("===================")

#     lines = [line.strip() for line in raw_text.split('\n') if line.strip()]

#     extracted = {'name': None, 'course': None, 'date': None}

#     for i, line in enumerate(lines):
#         lower = line.lower()

#         if 'awarded to' in lower or 'certificate is awarded to' in lower:
#             if i + 1 < len(lines):
#                 extracted['name'] = lines[i + 1]

#         if 'completing the course' in lower:
#             if i + 1 < len(lines):
#                 extracted['course'] = lines[i + 1]

#         # if date_pattern.search(line):
#         #     extracted['date'] = line
#         if date_pattern.search(line):
#             match = date_pattern.search(line)
#             extracted['date'] = match.group(0)  # extracts only the date part

#         for i, line in enumerate(lines):
#             lower = line.lower()
#             print(f"Line {i}: {line}")  # DEBUG

#     return extracted


date_pattern = re.compile(r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s*\d{4}')

def extract_text(image_path):
    if image_path.lower().endswith('.pdf'):
        pages = convert_from_path(image_path, dpi=200, poppler_path=POPPLER_PATH)
        image = pages[0]
    else:
        image = Image.open(image_path)

    raw_text = pytesseract.image_to_string(image, lang='eng')

    lines = [line.strip() for line in raw_text.split('\n') if line.strip()]

    extracted = {'name': None, 'course': None, 'date': None}

    for i, line in enumerate(lines):
        lower = line.lower()

        if 'awarded to' in lower or 'certificate is awarded to' in lower:
            if i + 1 < len(lines):
                extracted['name'] = lines[i + 1]

        if 'completing the course' in lower:
            if i + 1 < len(lines):
                extracted['course'] = lines[i + 1]

        # Check line starting with "on" for date
        if lower.startswith('on '):
            match = date_pattern.search(line)
            if match:
                extracted['date'] = match.group(0)
        elif date_pattern.search(line):
            match = date_pattern.search(line)
            extracted['date'] = match.group(0)

    return extracted