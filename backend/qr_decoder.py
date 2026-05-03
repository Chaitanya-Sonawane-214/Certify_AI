import cv2
from pyzbar.pyzbar import decode
from pdf2image import convert_from_path
import numpy as np
import json
import os

POPPLER_PATH = r'D:\CDS\SOFTWARE\POPPLER\poppler-25.12.0\Library\bin'

def decode_qr(image_path):
    # Handle PDF
    if image_path.lower().endswith('.pdf'):
        pages = convert_from_path(image_path, dpi=200, poppler_path=POPPLER_PATH)
        pil_image = pages[0]
        image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    else:
        image = cv2.imread(image_path)

    qr_codes = decode(image)

    if not qr_codes:
        return None

    raw_data = qr_codes[0].data.decode('utf-8')

    try:
        qr_json = json.loads(raw_data)
        credential = qr_json.get('credentialSubject', {})

        extracted = {
            'name': credential.get('issuedTo', None),
            'course': credential.get('course', None),
            'date': credential.get('completedOn', None)
        }

        return extracted

    except json.JSONDecodeError:
        return None