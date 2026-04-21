#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_BIN_DIR="$HOME/.local/bin"
TARGET_CMD="$TARGET_BIN_DIR/normetales"

mkdir -p "$TARGET_BIN_DIR"
ln -sf "$ROOT_DIR/normetales" "$TARGET_CMD"

echo "Comando instalado en: $TARGET_CMD"
echo "Si aun no funciona en terminal nueva, agrega ~/.local/bin al PATH."
