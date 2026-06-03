#!/usr/bin/env bash
set -euo pipefail

# ───────────────────────────────────────────────────────────
# SCV Deploy Script — VPS (Docker Compose + Nginx Gateway)
# Uso: bash deploy/deploy-vps.sh v1.5.2
# ───────────────────────────────────────────────────────────

TAG="${1:?Uso: $0 <tag> (ej: v1.5.2)}"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_APP="$REPO_DIR/docker-compose.app.yml"
COMPOSE_GW="$REPO_DIR/docker-compose.gateway.vps.yml"
RELEASE_URL="https://gitlab.com/api/v4/projects/bytestian76-group%2FSCV/repository/archive.tar.gz?ref=$TAG"
TMP_DIR="/tmp/scv-deploy-$$"

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

echo "=== SCV Deploy v$TAG ==="

# 1. Fetch release tarball
echo "[1/5] Descargando release $TAG..."
mkdir -p "$TMP_DIR"
curl -sL --header "PRIVATE-TOKEN: ${GITLAB_TOKEN:-}" "$RELEASE_URL" | tar xz -C "$TMP_DIR" --strip-components=1

# 2. Backup current docker-compose files
echo "[2/5] Respaldando archivos actuales..."
cp "$COMPOSE_APP" "$COMPOSE_APP.bak" 2>/dev/null || true
cp "$COMPOSE_GW" "$COMPOSE_GW.bak" 2>/dev/null || true

# 3. Copy new files
echo "[3/5] Copiando nuevos archivos..."
cp "$TMP_DIR/docker-compose.app.yml" "$COMPOSE_APP"
cp "$TMP_DIR/docker-compose.gateway.vps.yml" "$COMPOSE_GW"
cp -r "$TMP_DIR/scv-backend" "$REPO_DIR/"
cp -r "$TMP_DIR/scv-frontend" "$REPO_DIR/"
cp -r "$TMP_DIR/infra" "$REPO_DIR/" 2>/dev/null || true

# 4. Build and restart
echo "[4/5] Construyendo imagenes y reiniciando..."
docker compose -f "$COMPOSE_APP" up -d --build

# 5. Healthcheck
echo "[5/5] Verificando salud..."
sleep 8
docker exec vps-gateway nginx -s reload 2>/dev/null || true
sleep 2

if docker exec scv-backend python -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:9000/ping', timeout=5).read().decode())" 2>/dev/null; then
    echo "✅ SCV $TAG desplegado exitosamente"
else
    echo "⚠️  Healthcheck fallo — revisa los logs con: docker logs scv-backend"
fi
