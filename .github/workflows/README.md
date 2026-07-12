# GitHub Actions Workflows

## Build and Test Desktop App

The `build-and-test-desktop.yml` workflow automatically builds the CertifyAI desktop application for Windows.

### Triggers
- Push to `main` branch
- Pull requests to `main` branch
- Manual trigger via workflow_dispatch
- Tags starting with `v` (e.g., `v1.0.0`) for releases

### What It Does

1. **Setup Environment**
   - Checks out the code
   - Sets up Python 3.11
   - Installs Tesseract OCR via Chocolatey

2. **Install Dependencies**
   - Installs all Python packages from `requirements.txt`
   - Ensures numpy is version 1.26.x (compatible with opencv-python-headless)
   - Installs PyInstaller and pywebview

3. **Build Application**
   - Runs PyInstaller with `CertifyAI_Lite.spec`
   - Creates standalone executable in `backend/dist/CertifyAI/`
   - Build time: ~3-5 minutes

4. **Validate Build**
   - Runs `test_built_exe.py` to verify the build
   - Checks exe size and bundled files

5. **Create Artifact**
   - Compresses the build folder to ZIP
   - Uploads as GitHub artifact (retained for 30 days)
   - Artifact name: `CertifyAI-Windows-{commit-sha}`

6. **Create Release** (only on version tags)
   - Automatically creates GitHub release
   - Attaches the ZIP file
   - Marks as stable release (not draft or prerelease)

### Usage

#### Trigger Manually
1. Go to Actions tab on GitHub
2. Select "Build and Test Desktop App"
3. Click "Run workflow"
4. Select branch
5. Click "Run workflow" button

#### Download Build
1. Go to Actions tab
2. Click on a successful workflow run
3. Scroll to "Artifacts" section
4. Download `CertifyAI-Windows-{commit-sha}.zip`
5. Extract and run `CertifyAI.exe`

#### Create Release
1. Create and push a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. Workflow runs automatically
3. Release appears in Releases tab with ZIP attached

### Requirements

The workflow requires:
- Windows runner (uses `windows-latest`)
- Chocolatey (pre-installed on GitHub Actions Windows runners)
- No secrets needed (uses default GITHUB_TOKEN)

### Build Output

The ZIP file contains:
```
CertifyAI/
├── CertifyAI.exe          # Main executable
├── _internal/              # Python runtime and dependencies
│   ├── frontend/           # Web UI files
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   ├── poppler/            # PDF processing binaries
│   └── ... (other dependencies)
```

### Known Issues

1. **Tesseract Installation Time**
   - Installing Tesseract via Chocolatey adds ~2-3 minutes to build
   - Required for OCR functionality

2. **Build Size**
   - Lite build: ~150 MB
   - Includes Python runtime, libraries, and frontend files

3. **Windows Defender**
   - Built executables may trigger Windows Defender warnings
   - This is normal for PyInstaller executables
   - Users need to allow the app through Windows Security

### Troubleshooting

#### Build Fails with NumPy Error
- Ensure numpy version is pinned to `>=1.26,<2.0` in requirements.txt
- opencv-python-headless 4.8.1.78 requires numpy 1.x

#### Tesseract Not Found
- Check that Tesseract installation step completed
- Verify PATH is updated in the workflow

#### Artifact Upload Fails
- Check that build completed successfully
- Verify ZIP file was created in `backend/dist/`

### Local Testing

To test the workflow locally before pushing:

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Build
pyinstaller CertifyAI_Lite.spec --noconfirm --clean

# Test
python test_built_exe.py

# Create ZIP
cd dist
Compress-Archive -Path CertifyAI -DestinationPath CertifyAI-Windows.zip
```

## Release Workflow

The `release.yml` workflow is separate and handles other release tasks (if present).

---

**Last Updated:** 2024
