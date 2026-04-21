#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/scv-backend"
VENV_DIR="$BACKEND_DIR/venv"
MARKER_FILE="$VENV_DIR/.deps_installed"
PORT="${SCV_BACKEND_PORT:-9000}"

if [[ ! -d "$BACKEND_DIR" ]]; then
    echo "[backend] No se encontro el directorio: $BACKEND_DIR"
    exit 1
fi

if [[ ! -f "$BACKEND_DIR/requirements.txt" ]]; then
    echo "[backend] Falta requirements.txt en $BACKEND_DIR"
    exit 1
fi

if [[ ! -d "$VENV_DIR" ]]; then
    echo "[backend] Creando entorno virtual..."
    python3 -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"

if [[ ! -f "$MARKER_FILE" || "$BACKEND_DIR/requirements.txt" -nt "$MARKER_FILE" ]]; then
    echo "[backend] Instalando dependencias..."
    pip install -r "$BACKEND_DIR/requirements.txt"
    touch "$MARKER_FILE"
fi

echo "[backend] Iniciando API en http://localhost:$PORT"
cd "$BACKEND_DIR"
exec uvicorn main:app --reload --host 0.0.0.0 --port "$PORT"
