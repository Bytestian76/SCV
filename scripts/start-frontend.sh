#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/scv-frontend"
PORT="${SCV_FRONTEND_PORT:-8080}"

if [[ ! -d "$FRONTEND_DIR" ]]; then
    echo "[frontend] No se encontro el directorio: $FRONTEND_DIR"
    exit 1
fi

if [[ ! -f "$FRONTEND_DIR/index.html" ]]; then
    echo "[frontend] Falta index.html en $FRONTEND_DIR"
    exit 1
fi

echo "[frontend] Iniciando PWA en http://localhost:$PORT"
cd "$FRONTEND_DIR"
exec python3 -m http.server "$PORT" --bind 0.0.0.0
