"""
Quick validation test for built CertifyAI.exe
Checks if the executable exists and has reasonable size
"""
import os
import sys

EXE_PATH = os.path.join('dist', 'CertifyAI', 'CertifyAI.exe')

def validate_build():
    """Validate the build output"""
    
    # Check if exe exists
    if not os.path.exists(EXE_PATH):
        print(f"[ERROR] Executable not found at {EXE_PATH}")
        return False
    
    # Check file size (should be > 10MB, < 500MB)
    size_mb = os.path.getsize(EXE_PATH) / (1024 * 1024)
    print(f"[OK] Executable found: {EXE_PATH}")
    print(f"[OK] Size: {size_mb:.1f} MB")
    
    if size_mb < 10:
        print(f"[ERROR] Size too small ({size_mb:.1f} MB), may be missing dependencies")
        return False
    
    if size_mb > 500:
        print(f"[WARNING] Size very large ({size_mb:.1f} MB), might have unnecessary bloat")
    
    # Check if frontend files are bundled
    frontend_dir = os.path.join('dist', 'CertifyAI', '_internal', 'frontend')
    if os.path.exists(frontend_dir):
        html_exists = os.path.exists(os.path.join(frontend_dir, 'index.html'))
        css_exists = os.path.exists(os.path.join(frontend_dir, 'style.css'))
        js_exists = os.path.exists(os.path.join(frontend_dir, 'script.js'))
        
        if html_exists and css_exists and js_exists:
            print("[OK] Frontend files bundled correctly")
        else:
            print("[WARNING] Some frontend files may be missing")
            print(f"  HTML: {html_exists}, CSS: {css_exists}, JS: {js_exists}")
    else:
        print(f"[WARNING] Frontend directory not found at {frontend_dir}")
    
    print("\n[OK] Build validation passed!")
    print(f"\nYou can now test the app by running:")
    print(f"  {EXE_PATH}")
    
    return True

if __name__ == '__main__':
    success = validate_build()
    sys.exit(0 if success else 1)
