# Pre-Release Checklist - Desktop App

## ✅ Before Distributing the Desktop App

### 1. Build Validation
- [ ] Build completes without errors
- [ ] Run `python test_built_exe.py` - passes all checks
- [ ] Executable file exists at `dist\CertifyAI\CertifyAI.exe`

### 2. Launch Testing
- [ ] Double-click `CertifyAI.exe` - no error dialogs
- [ ] Splash screen appears
- [ ] Main window opens within 10 seconds
- [ ] No console/error windows appear

### 3. Functional Testing
- [ ] Single certificate upload works
- [ ] Bulk certificate upload works (test with 3-5 files)
- [ ] Excel report downloads successfully
- [ ] Excel has all 6 columns: File Name, Name on Certificate, Issued By, Course, Date, Result
- [ ] Color coding works (green/red/yellow)

### 4. Error Handling
- [ ] Upload invalid file (e.g., .txt) - shows appropriate error
- [ ] Cancel file dialog - app doesn't crash
- [ ] Close window - app exits cleanly

### 5. Dependencies Check
- [ ] **Critical:** No "ImportError: pyparsing" on launch
- [ ] No "ModuleNotFoundError" errors
- [ ] No missing DLL errors

### 6. Package Contents
- [ ] `CertifyAI.exe` present
- [ ] `frontend/` folder present
- [ ] `poppler/bin/` folder present
- [ ] Total size: 150-250 MB

### 7. Documentation
- [ ] README.md updated with latest version
- [ ] BUILD_INSTRUCTIONS.md accurate
- [ ] QUICK_START.md helpful for users
- [ ] Known issues documented

### 8. Version Info
- [ ] Version number in filename (e.g., `CertifyAI-v2.0.7.zip`)
- [ ] Git tag created: `git tag v2.0.7`
- [ ] Git tag pushed: `git push origin v2.0.7`

### 9. Distribution Package
- [ ] Zip created: `CertifyAI-v2.0.7-Windows.zip`
- [ ] Zip contains entire `dist\CertifyAI\` folder
- [ ] Include README in zip
- [ ] Include Tesseract install link in README

### 10. Final Checks
- [ ] Test on clean Windows machine (or VM)
- [ ] Test without Tesseract installed - shows clear error
- [ ] Test with Tesseract installed - works perfectly
- [ ] Scan with antivirus - no false positives (or document them)

---

## 🚫 DO NOT RELEASE IF:

- ❌ Test script (`test_built_exe.py`) fails
- ❌ "pyparsing" error appears on launch
- ❌ Any import errors occur
- ❌ Executable doesn't start
- ❌ Main window doesn't open
- ❌ Functional tests fail

---

## 📦 Release Process

### 1. Create Release Package
```batch
cd backend\dist
powershell Compress-Archive -Path CertifyAI -DestinationPath CertifyAI-v2.0.7-Windows.zip
```

### 2. Upload to GitHub Releases
```batch
git tag v2.0.7
git push origin v2.0.7
```

Then manually upload zip to: https://github.com/VishalRaut2106/Certify_ai/releases

### 3. Update Release Notes

**Template:**
```markdown
# CertifyAI v2.0.7 - Windows Desktop App

## ✨ New Features
- Desktop app with native Windows interface
- Excel report with "Issued By" column
- Fraud detection via QR code verification

## 📦 Installation
1. Download `CertifyAI-v2.0.7-Windows.zip`
2. Extract to any folder
3. Install Tesseract OCR (link below)
4. Run `CertifyAI.exe`

## 📋 Requirements
- Windows 10 or later
- Tesseract OCR: https://github.com/UB-Mannheim/tesseract/wiki

## 🐛 Known Issues
- None

## 📝 Changelog
- Added "Issued By" column to Excel reports
- Fixed pyparsing import error
- Improved build speed with lite configuration
```

---

## 🔧 Quick Test Command

```batch
cd backend
python test_built_exe.py
```

If this passes, you're good to release! ✅

---

**Last Updated:** 2024
