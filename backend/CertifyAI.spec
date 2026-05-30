# -*- mode: python ; coding: utf-8 -*-
"""
CertifyAI.spec  —  Lean PyInstaller build spec
- Does NOT bundle Tesseract (user must have it installed at default path)
- Bundles Poppler (already in repo)
- Only specific hidden imports (no collect_submodules)
- Aggressively excludes unused heavy packages

Run from backend/ directory:
    pyinstaller CertifyAI.spec --noconfirm --clean
"""

import os

HERE         = os.path.abspath(SPECPATH)
FRONTEND_DIR = os.path.join(HERE, '..', 'frontend')
POPPLER_BIN  = os.path.join(HERE, 'poppler', 'poppler-24.08.0', 'Library', 'bin')

block_cipher = None

# ── Only the imports we actually need ─────────────────────────────────────────
hidden_imports = [
    # uvicorn
    'uvicorn.logging',
    'uvicorn.loops',
    'uvicorn.loops.auto',
    'uvicorn.loops.asyncio',
    'uvicorn.protocols',
    'uvicorn.protocols.http',
    'uvicorn.protocols.http.auto',
    'uvicorn.protocols.http.h11_impl',
    'uvicorn.protocols.websockets',
    'uvicorn.protocols.websockets.auto',
    'uvicorn.lifespan',
    'uvicorn.lifespan.on',
    # fastapi / starlette essentials
    'fastapi',
    'fastapi.responses',
    'fastapi.staticfiles',
    'starlette.routing',
    'starlette.responses',
    'starlette.staticfiles',
    'starlette.middleware',
    # async
    'anyio',
    'anyio._backends._asyncio',
    'asyncio',
    # multipart (file uploads)
    'multipart',
    'python_multipart',
    # image / ocr / qr
    'pytesseract',
    'pyzbar.pyzbar',
    'PIL',
    'PIL.Image',
    'PIL.ImageEnhance',
    'PIL.ImageFilter',
    'cv2',
    'numpy',
    'pdf2image',
    # data / excel
    'openpyxl',
    'openpyxl.styles',
    'fuzzywuzzy',
    'Levenshtein',
    # webview
    'webview',
    # utils
    'requests',
    'dotenv',
    'h11',
]

a = Analysis(
    ['desktop.py'],
    pathex=[HERE],
    binaries=[],
    datas=[
        # Frontend static files
        (FRONTEND_DIR, 'frontend'),
        # Poppler binaries for PDF→image conversion
        (POPPLER_BIN, 'poppler/bin'),
    ],
    hiddenimports=hidden_imports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Heavy unused packages — remove to keep bundle small
        'scipy',
        'sklearn',
        'scikit_learn',
        'redis',
        'pymongo',
        'motor',
        'aiohttp',
        'aiosignal',
        'aiosqlite',
        'pytest',
        'black',
        'mypy',
        'ruff',
        'cloudinary',
        'qrcode',
        'PyPDF2',
        'pdfplumber',
        'pdfminer',
        'PyMuPDF',
        'tkinter',
        '_tkinter',
        'matplotlib',
        'unittest',
        'xmlrpc',
        'email',
        'html',
        'http.server',
        'ftplib',
        'imaplib',
        'poplib',
        'smtplib',
        'telnetlib',
        'nntplib',
        'ossaudiodev',
        'sunau',
        'aifc',
        'chunk',
        'cgi',
        'cgitb',
        'imghdr',
        'sndhdr',
        'uu',
        'xdrlib',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='CertifyAI',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,       # No terminal window
    icon=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='CertifyAI',
)
