# Quick Start Guide - Desktop App Build

## ⚡ Fast Build (Recommended)

### PowerShell
```powershell
cd backend
.\build_lite.bat
```

### Command Prompt (CMD)
```cmd
cd backend
build_lite.bat
```

---

## 📋 Output

After build completes (3-5 minutes):
```
dist\CertifyAI\CertifyAI.exe
```

---

## 🚀 Run the App

```powershell
cd dist\CertifyAI
.\CertifyAI.exe
```

Or double-click: `dist\CertifyAI\CertifyAI.exe`

---

## ⚠️ Common Issues

### "build_lite.bat is not recognized"
**PowerShell requires `.\` prefix:**
```powershell
.\build_lite.bat    # ✅ Correct
build_lite.bat      # ❌ Wrong
```

### "pyparsing package is required"
**Already fixed in latest code!** Just pull from GitHub:
```powershell
git pull origin main
```

### Build takes too long
- Lite build: 3-5 minutes ⚡
- Full build: 10-20 minutes 🐌
- Use lite build for faster results

---

## 📦 What Gets Built

```
dist/
└── CertifyAI/
    ├── CertifyAI.exe          ← Main executable
    ├── frontend/              ← Web interface
    ├── poppler/              ← PDF tools
    └── (Python runtime DLLs)
```

Size: ~150-200 MB

---

## ✅ Features

- Native Windows desktop app
- No browser needed
- Same web interface
- Works offline
- Portable (after build)

---

**Need help?** See `BUILD_INSTRUCTIONS.md` for detailed guide.
