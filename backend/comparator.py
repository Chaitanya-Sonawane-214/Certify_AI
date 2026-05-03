from fuzzywuzzy import fuzz
from datetime import datetime
import re

def normalize_date(date_str):
    if not date_str:
        return None

    # Handle QR format: "2026-04-27T16:12:06Z"
    try:
        return datetime.strptime(date_str[:10], '%Y-%m-%d')
    except:
        pass

    # Handle OCR format: "April 27, 2026"
    try:
        return datetime.strptime(date_str.strip(), '%B %d, %Y')
    except:
        pass

    try:
        return datetime.strptime(date_str.strip(), '%B %d,%Y')
    except:
        pass

    return None


def compare_fields(ocr_data, qr_data):
    results = {
        'name':    {'ocr': ocr_data['name'],   'qr': qr_data['name'],   'match': False},
        'course':  {'ocr': ocr_data['course'], 'qr': qr_data['course'], 'match': False},
        'date':    {'ocr': ocr_data['date'],   'qr': qr_data['date'],   'match': False},
        'verdict': None
    }

    # Compare Name (fuzzy, case insensitive)
    if ocr_data['name'] and qr_data['name']:
        score = fuzz.ratio(
            ocr_data['name'].lower().strip(),
            qr_data['name'].lower().strip()
        )
        results['name']['match'] = score >= 90
        results['name']['score'] = score

    # Compare Course (fuzzy)
    if ocr_data['course'] and qr_data['course']:
        score = fuzz.ratio(
            ocr_data['course'].lower().strip(),
            qr_data['course'].lower().strip()
        )
        results['course']['match'] = score >= 90
        results['course']['score'] = score

    # Compare Date (normalize both first)
    if ocr_data['date'] and qr_data['date']:
        ocr_date = normalize_date(ocr_data['date'])
        qr_date  = normalize_date(qr_data['date'])
        if ocr_date and qr_date:
            results['date']['match'] = ocr_date == qr_date

    # Final Verdict
    all_match = (
        results['name']['match'] and
        results['course']['match'] and
        results['date']['match']
    )
    results['verdict'] = 'Verified' if all_match else 'Fraud'

    return results