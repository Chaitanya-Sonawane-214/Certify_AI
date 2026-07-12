"""
CertifyAI Desktop App Entry Point
Uses pywebview to render the FastAPI web app in a native window.
Handles both development mode and PyInstaller bundled mode.
"""

import webview
import threading
import uvicorn
import time
import requests
import sys
import os

# ── Resolve base paths (dev vs bundled .exe) ──────────────────────────────────
if getattr(sys, 'frozen', False):
    # Running as a PyInstaller bundle
    BASE_DIR     = sys._MEIPASS
    BACKEND_DIR  = BASE_DIR
    FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
else:
    # Running in development
    BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
    BACKEND_DIR  = BASE_DIR
    FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend')

# Make sure backend modules can be imported
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# ── Port config ───────────────────────────────────────────────────────────────
PORT = 5199   # Use a fixed port unlikely to conflict with anything

SERVER_URL = f'http://127.0.0.1:{PORT}'

# ── Splash window ─────────────────────────────────────────────────────────────
SPLASH_HTML = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #0d1117;
    font-family: 'Segoe UI', system-ui, sans-serif;
    color: #e6edf3;
    user-select: none;
  }
  .logo-wrap {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 32px;
  }
  .logo-mark {
    width: 48px; height: 48px;
    background: #1f6feb;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .logo-mark svg { width: 22px; height: 22px; }
  .logo-name { font-size: 28px; font-weight: 700; letter-spacing: -0.03em; }
  .tagline { font-size: 13px; color: #484f58; margin-bottom: 40px; }
  .bar-track {
    width: 220px; height: 3px;
    background: #21262d;
    border-radius: 99px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    width: 40%;
    background: #1f6feb;
    border-radius: 99px;
    animation: slide 1.4s ease-in-out infinite;
  }
  @keyframes slide {
    0%   { transform: translateX(-120%); }
    100% { transform: translateX(320%); }
  }
  .status { margin-top: 16px; font-size: 12px; color: #30363d; }
</style>
</head>
<body>
  <div class="logo-wrap">
    <div class="logo-mark">
      <svg viewBox="0 0 14 14" fill="none">
        <path d="M2.5 7l3 3 6-6" stroke="#fff" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <span class="logo-name">CertifyAI</span>
  </div>
  <p class="tagline">Infosys Springboard · Certificate Verification</p>
  <div class="bar-track"><div class="bar-fill"></div></div>
  <p class="status">Starting…</p>
</body>
</html>
"""


def run_server():
    """Run FastAPI in a background daemon thread."""
    # Import here so path patches above are in effect
    from app import app as fastapi_app
    uvicorn.run(fastapi_app, host='127.0.0.1', port=PORT, log_level='error')


def wait_for_server(timeout: int = 30) -> bool:
    """Poll until the server responds or we time out."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            r = requests.get(SERVER_URL, timeout=1)
            if r.status_code == 200:
                return True
        except Exception:
            pass
        time.sleep(0.3)
    return False


def on_closed():
    """Kill the process when the window is closed (stops the daemon server)."""
    os._exit(0)


def main():
    # 1. Show splash immediately
    splash = webview.create_window(
        'CertifyAI',
        html=SPLASH_HTML,
        width=480,
        height=300,
        resizable=False,
        frameless=True,
        on_top=True,
        background_color='#0d1117',
    )

    def _boot():
        # 2. Start FastAPI server in the background
        server_thread = threading.Thread(target=run_server, daemon=True)
        server_thread.start()

        # 3. Wait for server
        ready = wait_for_server(timeout=30)
        if not ready:
            splash.evaluate_js(
                "document.querySelector('.status').textContent = "
                "'Error: could not start server. Please restart the app.'"
            )
            time.sleep(4)
            os._exit(1)

        # 4. Destroy splash and open the real window
        splash.destroy()

        main_win = webview.create_window(
            'CertifyAI — Certificate Verification',
            SERVER_URL,
            width=1200,
            height=800,
            min_size=(800, 600),
            background_color='#0d1117',
        )
        main_win.events.closed += on_closed

    splash.events.shown += _boot
    webview.start(debug=False)


if __name__ == '__main__':
    main()
