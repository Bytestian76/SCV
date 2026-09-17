#!/usr/bin/env bash
# ===================================================================
#   Sistema de Control Vehicular (SCV) - Script de Inicio para Linux
# ===================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==================================================================="
echo "     Iniciando SCV (Sistema de Control Vehicular)"
echo "==================================================================="

VENV_DIR="$SCRIPT_DIR/api-services/venv"
PYTHON_BIN="$VENV_DIR/bin/python"

if [ ! -f "$PYTHON_BIN" ]; then
    echo "[!] Entorno virtual no detectado. Creando venv en Linux..."
    python3 -m venv "$VENV_DIR"
    echo "[*] Instalando dependencias de api-services/requirements.txt..."
    "$VENV_DIR/bin/pip" install --upgrade pip
    "$VENV_DIR/bin/pip" install -r "$SCRIPT_DIR/api-services/requirements.txt"
fi

exec "$PYTHON_BIN" "$SCRIPT_DIR/start_servers.py" "$@"
