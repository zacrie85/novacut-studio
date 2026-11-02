#!/usr/bin/env python3
"""Tarik blob hasil export dari halaman uji (window.__expUrl) ke file lokal via CDP."""
import sys, base64, json
sys.path.insert(0, "/home/z/my-project/scripts/test")
import asyncio, websockets, urllib.request

PORT = 9333

def page_ws():
    data = json.loads(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json", timeout=3).read())
    return [t for t in data if t.get("type") == "page"][0]["webSocketDebuggerUrl"]

async def pull(out_path):
    async with websockets.connect(page_ws(), max_size=512 * 1024 * 1024) as ws:
        mid = 0

        async def ev(expr):
            nonlocal mid
            mid += 1
            await ws.send(json.dumps({"id": mid, "method": "Runtime.evaluate",
                "params": {"expression": expr, "returnByValue": True, "awaitPromise": True}}))
            while True:
                m = json.loads(await ws.recv())
                if m.get("id") == mid:
                    if "error" in m:
                        raise RuntimeError(m["error"])
                    return m["result"].get("result", {}).get("value")

        total = await ev("(async()=>{const rs=window.__novacutTest.useEditor.getState().exportState.results; window.__expUrl=rs[rs.length-1].url; return (await (await fetch(window.__expUrl)).arrayBuffer()).byteLength;})()")
        if not total:
            print("NO BLOB"); return
        with open(out_path, "wb") as f:
            CH = 900_000
            for off in range(0, total, CH):
                b64 = await ev(
                    f"(async()=>{{const ab=await (await fetch(window.__expUrl)).arrayBuffer();"
                    f"const sl=new Uint8Array(ab.slice({off},{off+CH}));let s='';"
                    f"for(let i=0;i<sl.length;i++)s+=String.fromCharCode(sl[i]);return btoa(s);}})()"
                )
                f.write(base64.b64decode(b64))
        print("SAVED", out_path, total, "bytes")

if __name__ == "__main__":
    asyncio.run(pull(sys.argv[1] if len(sys.argv) > 1 else "/tmp/nvtest/out1.mp4"))
