#!/usr/bin/env python3
"""CDP driver kecil untuk uji E2E NOVACUT (pengganti agent-browser eval).
Pakai: python3 cdp.py open <url>   | python3 cdp.py eval '<js>' [--await] | python3 cdp.py console
"""
import sys, json, time, urllib.request, subprocess, os, signal

PORT = 9333
BASE = f"http://127.0.0.1:{PORT}"

def ensure_chrome():
    try:
        urllib.request.urlopen(f"{BASE}/json/version", timeout=2).read()
        return
    except Exception:
        pass
    subprocess.Popen(
        [
            "/home/z/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
            "--headless=new", "--remote-debugging-port=9333", "--no-sandbox",
            "--disable-gpu", "--no-first-run", "--user-data-dir=/tmp/chrome-test",
            "--autoplay-policy=no-user-gesture-required",
            "--disable-dev-shm-usage",
            "about:blank",
        ],
        stdout=open("/tmp/chrome.log", "ab"),
        stderr=open("/tmp/chrome.log", "ab"),
        start_new_session=True,
    )
    for _ in range(50):
        try:
            urllib.request.urlopen(f"{BASE}/json/version", timeout=2).read()
            return
        except Exception:
            time.sleep(0.2)
    raise RuntimeError("chrome tidak mau start")

def get_page_ws():
    data = json.loads(urllib.request.urlopen(f"{BASE}/json", timeout=3).read())
    pages = [t for t in data if t.get("type") == "page"]
    if not pages:
        raise RuntimeError("tidak ada page target")
    return pages[0]["webSocketDebuggerUrl"]

class CDP:
    def __init__(self, ws_url):
        import websocket  # websocket-client? cek
        raise SystemExit

def main():
    ensure_chrome()
    import asyncio, websockets

    async def run():
        ws_url = get_page_ws()
        async with websockets.connect(ws_url, max_size=512 * 1024 * 1024, open_timeout=15, close_timeout=5, ping_interval=20) as ws:
            mid = 0

            async def send(method, params=None):
                nonlocal mid
                mid += 1
                await ws.send(json.dumps({"id": mid, "method": method, "params": params or {}}))
                t0 = time.time()
                while True:
                    try:
                        msg = json.loads(await asyncio.wait_for(ws.recv(), timeout=150))
                    except asyncio.TimeoutError:
                        raise RuntimeError("CDP recv timeout 150s")
                    if msg.get("id") == mid:
                        if "error" in msg:
                            raise RuntimeError(json.dumps(msg["error"]))
                        return msg.get("result", {})
                    if time.time() - t0 > 150:
                        raise RuntimeError("CDP stall")

            cmd = sys.argv[1] if len(sys.argv) > 1 else "eval"
            if cmd == "open":
                url = sys.argv[2]
                await send("Page.enable")
                await send("Runtime.enable")
                await send("Page.navigate", {"url": url})
                # tunggu load
                t0 = time.time()
                while time.time() - t0 < 40:
                    r = await send("Runtime.evaluate", {"expression": "document.readyState", "returnByValue": True})
                    if r.get("result", {}).get("value") == "complete":
                        break
                    await asyncio.sleep(0.3)
                print("OPENED", url)
            elif cmd == "eval":
                expr = sys.argv[2]
                await_promise = "--await" in sys.argv
                await send("Runtime.enable")
                r = await send(
                    "Runtime.evaluate",
                    {
                        "expression": expr,
                        "returnByValue": True,
                        "awaitPromise": await_promise,
                        "timeout": 120000,
                    },
                )
                res = r.get("result", {})
                if res.get("subtype") == "error" or r.get("exceptionDetails"):
                    print("JSERROR:", json.dumps(r.get("exceptionDetails", {}), ensure_ascii=False)[:1500])
                    sys.exit(2)
                print(json.dumps(res.get("value"), ensure_ascii=False))
            elif cmd == "ready":
                r = await send("Runtime.evaluate", {"expression": "document.readyState", "returnByValue": True})
                print(r.get("result", {}).get("value"))
            else:
                print("perintah tidak dikenal", file=sys.stderr)
                sys.exit(1)

    asyncio.run(run())

if __name__ == "__main__":
    main()
