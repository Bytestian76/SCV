#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_DIR="$ROOT_DIR/release"
FRONTEND_SRC="$ROOT_DIR/scv-frontend"
BACKEND_SRC="$ROOT_DIR/scv-backend"

rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR/frontend" "$RELEASE_DIR/backend"

rsync -a --delete \
  --exclude ".git" \
  --exclude ".github" \
  --exclude "docs" \
  --exclude "*.log" \
  --exclude "node_modules" \
  "$FRONTEND_SRC/" "$RELEASE_DIR/frontend/"

rsync -a --delete \
  --exclude ".git" \
  --exclude ".github" \
  --exclude "tests" \
  --exclude "docs" \
  --exclude "__pycache__" \
  --exclude "*.pyc" \
  --exclude "*.db" \
  --exclude "test_api.py" \
  --exclude "venv" \
  --exclude ".venv" \
  --exclude ".pytest_cache" \
  "$BACKEND_SRC/" "$RELEASE_DIR/backend/"

cp -R "$ROOT_DIR/deploy" "$RELEASE_DIR/deploy"

echo "Release generada en: $RELEASE_DIR"
