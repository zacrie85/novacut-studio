#!/usr/bin/env bash
# Selesaikan rilis v1.0.35 — jalankan SETELAH token tersedia.
# Token: simpan dulu dengan perintah:
#   echo 'GH_TOKEN=ghp_xxx' > /tmp/gh_auth.env
# Lalu jalankan:  bash scripts/release_v1035.sh
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
echo "[2/4] push tag v1.0.35..."
GIT_ASKPASS=/tmp/gh_askpass.sh git push origin v1.0.35
echo "[3/4] buat release..."
python3 scripts/rel_notes_35.py
echo "[4/4] pantau CI (build exe)..."
bash scripts/poll_release_25.sh
