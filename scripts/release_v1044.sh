#!/usr/bin/env bash
# Rilis v1.0.44 — sebab poster Z.ai persisten + toast jujur + judul poster per video + poster dari adegan
# Token: echo 'GH_TOKEN=ghp_xxx' > /tmp/gh_auth.env  lalu  bash scripts/release_v1044.sh
set -eu
cd /home/z/my-project
if [ ! -f /tmp/gh_auth.env ]; then
  echo "Token belum ada. Simpan dulu:  echo 'GH_TOKEN=ghp_xxx' > /tmp/gh_auth.env"
  exit 1
fi
cat > /tmp/gh_askpass.sh <<'EOS'
#!/usr/bin/env bash
sed -n 's/^GH_TOKEN=//p' /tmp/gh_auth.env
EOS
chmod +x /tmp/gh_askpass.sh
echo "[1/4] push main..."
GIT_ASKPASS=/tmp/gh_askpass.sh git push origin main
echo "[2/4] push tag v1.0.44..."
GIT_ASKPASS=/tmp/gh_askpass.sh git push origin v1.0.44 --force
echo "[3/4] buat release..."
python3 scripts/rel_notes_44.py
echo "[4/4] pantau CI (build exe)..."
python3 scripts/poll_release_44.py 480
