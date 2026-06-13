"""
Test script to validate the built executable before distribution.
Run this after PyInstaller build completes to catch import errors.
"""
import subprocess
import sys
import time
import os

def test_exe_imports():
    """Test if the exe can start without import errors."""
    exe_path = os.path.join('dist', 'CertifyAI', 'CertifyAI.exe')
    
    if not os.path.exists(exe_path):
        print("❌ ERROR: Executable not found at", exe_path)
        return False
    
    print("🔍 Testing executable for import errors...")
    print(f"   Path: {exe_path}")
    print()
    
    try:
        # Start the exe as a subprocess
        process = subprocess.Popen(
            [exe_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a few seconds for startup
        time.sleep(5)
        
        # Check if process is still running
        poll = process.poll()
        
        if poll is None:
            # Process is running - SUCCESS!
            print("✅ PASS: Executable started successfully!")
            print("   No import errors detected.")
            process.terminate()
            process.wait(timeout=5)
            return True
        else:
            # Process exited - check for errors
            stdout, stderr = process.communicate()
            
            if "ImportError" in stderr or "ModuleNotFoundError" in stderr:
                print("❌ FAIL: Import error detected!")
                print()
                print("Error details:")
                print(stderr)
                return False
            else:
                print("⚠️  WARNING: Process exited unexpectedly")
                print("   Exit code:", poll)
                if stderr:
                    print("   Error output:", stderr)
                return False
                
    except Exception as e:
        print(f"❌ FAIL: Could not test executable")
        print(f"   Error: {e}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("  Desktop App Post-Build Validation")
    print("="*60)
    print()
    
    success = test_exe_imports()
    
    print()
    print("="*60)
    if success:
        print("✅ BUILD VALIDATED - Safe to distribute")
    else:
        print("❌ BUILD FAILED VALIDATION - Do NOT distribute")
        print("   Fix the errors above before releasing")
    print("="*60)
    
    sys.exit(0 if success else 1)
