@echo off
echo.
echo ================================================
echo   CertifyAI  ^|  Optimized Lite Build
echo ================================================
echo.

call venv\Scripts\activate.bat

echo [1/3] Cleaning previous build...
if exist "build"  rmdir /s /q build
if exist "dist"   rmdir /s /q dist

echo [2/3] Building with PyInstaller (Lite version)...
pyinstaller CertifyAI_Lite.spec --noconfirm --clean

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed.
    pause
    exit /b 1
)

echo [3/3] Build complete!
echo.
echo  Output: dist\CertifyAI\CertifyAI.exe
echo.

echo [Validation] Testing executable...
python test_built_exe.py

if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Validation failed - check errors above
    pause
    exit /b 1
)

echo.
echo  Build validated successfully!
echo.

pause
