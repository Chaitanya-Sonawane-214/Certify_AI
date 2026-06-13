# -*- mode: python ; coding: utf-8 -*-
"""
CertifyAI_Lite.spec  —  Optimized lightweight build
- Faster build time (3-5 minutes)
- Smaller executable size
- Only essential hidden imports
- Simplified dependency tree

Run from backend/ directory:
    pyinstaller CertifyAI_Lite.spec --noconfirm --clean
"""

import os

HERE         = os.path.abspath(SPECPATH)
FRONTEND_DIR = os.path.join(HERE, '..', 'frontend')
POPPLER_BIN  = os.path.join(HERE, 'poppler', 'poppler-24.08.0', 'Library', 'bin')

block_cipher = None

# Minimal essential imports only
hidden_imports = [
    # Core uvicorn/fastapi
    'uvicorn.logging',
    'uvicorn.loops.auto',
    'uvicorn.protocols.http.auto',
    'uvicorn.protocols.websockets.auto',
    'uvicorn.lifespan.on',
    # Async
    'anyio._backends._asyncio',
    # Essential modules
    'PIL.Image',
    'PIL.ImageEnhance',
    'PIL.ImageFilter',
    'cv2',
    'numpy',
    'pytesseract',
    'pyzbar.pyzbar',
    'openpyxl',
    'openpyxl.styles',
    'pdf2image',
    'webview',
]

a = Analysis(
    ['desktop.py'],
    pathex=[HERE],
    binaries=[],
    datas=[
        (FRONTEND_DIR, 'frontend'),
        (POPPLER_BIN, 'poppler/bin'),
    ],
    hiddenimports=hidden_imports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Aggressively exclude unused packages
        'scipy', 'sklearn', 'scikit_learn', 'redis', 'pymongo', 'motor',
        'pytest', 'black', 'mypy', 'ruff', 'matplotlib', 'pandas',
        'tkinter', '_tkinter', 'unittest', 'test', 'tests',
        'setuptools', 'distutils', 'wheel', 'pip',
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
    console=False,
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
