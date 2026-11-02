#!/usr/bin/env python3
"""Tiny HTTP receiver: save POST body to /tmp/result-export.webm (for browser test)."""
from http.server import BaseHTTPRequestHandler, HTTPServer

class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        n = int(self.headers.get("Content-Length", 0))
        data = self.rfile.read(n)
        with open("/tmp/result-export.webm", "wb") as f:
            f.write(data)
        self.send_response(200)
        self._cors()
        self.end_headers()
        self.wfile.write(b"ok")

    def log_message(self, *a):
        pass

HTTPServer(("127.0.0.1", 8898), H).serve_forever()
