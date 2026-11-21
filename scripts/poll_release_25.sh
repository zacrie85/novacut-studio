#!/usr/bin/env bash
# Pantau CI build-desktop.yml untuk release v1.0.25 sampai aset (exe) nempel.
set -u
TOK=$(sed -n 's/^GH_TOKEN=//p' /tmp/gh_auth.env)
REPO="zacrie85/novacut-studio"
END=$((SECONDS + 520))
while [ $SECONDS -lt $END ]; do
  RUN=$(python3 - "$TOK" "$REPO" <<'EOF'
import json, sys, urllib.request
tok, repo = sys.argv[1], sys.argv[2]
req = urllib.request.Request(f"https://api.github.com/repos/{repo}/actions/runs?event=release&per_page=1", headers={"Authorization": "token " + tok})
with urllib.request.urlopen(req, timeout=20) as r:
    runs = json.load(r).get("workflow_runs", [])
if not runs:
    print("run: belum ada")
else:
    w = runs[0]
    print(f"run {w['run_number']}: status={w['status']} conclusion={w['conclusion']} started={w['created_at']}")
EOF
)
  ASSETS=$(python3 - "$TOK" "$REPO" <<'EOF'
import json, sys, urllib.request
tok, repo = sys.argv[1], sys.argv[2]
req = urllib.request.Request(f"https://api.github.com/repos/{repo}/releases/tags/v1.0.27", headers={"Authorization": "token " + tok})
with urllib.request.urlopen(req, timeout=20) as r:
    rel = json.load(r)
assets = rel.get("assets", [])
print(f"aset: {len(assets)} -> " + ", ".join(f"{a['name']}({a['size']//1024//1024}MB)" for a in assets))
EOF
)
  echo "[$(date +%H:%M:%S)] $RUN | $ASSETS"
  case "$ASSETS" in
    "aset: 0"*) sleep 75 ;;
    *) echo "ASET TERPASANG ✓"; exit 0 ;;
  esac
done
echo "masih menunggu CI — lanjutkan pemantauan"
