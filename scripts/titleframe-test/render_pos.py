"""Render uji posisi vertikal + bingkai via drawTextOverlay ASLI."""
import functools
import http.server
import pathlib
import threading
from playwright.sync_api import sync_playwright

BASE = pathlib.Path("/home/z/my-project/scripts/titleframe-test")
OUT = BASE / "result-pos.png"

handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(BASE))
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1000, "height": 1400})
    errs = []
    pg.on("pageerror", lambda e: errs.append(f"pageerror: {e}"))
    pg.goto(f"http://127.0.0.1:{port}/test-pos.html")
    try:
        pg.wait_for_function("document.title === 'DONE2'", timeout=8000)
    except Exception:
        pass
    pg.screenshot(path=str(OUT), full_page=True)
    b.close()
    srv.shutdown()
    print("errors:", errs[:8] or "tidak ada")
print("OK ->", OUT)
