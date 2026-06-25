#!/usr/bin/env bash
set -euo pipefail

# ───────────────────────────────────────────────────────────
# SCV Update & Deploy Script — VPS (Git pull + Docker Compose)
# Uso: bash deploy/update-vps.sh [rama_o_tag] (ej: main)
# ───────────────────────────────────────────────────────────

BRANCH="${1:-main}"

echo "=== Iniciando actualización de SCV (Rama/Tag: $BRANCH) ==="

# Definir nombre del proyecto Docker Compose fijo para evitar volúmenes duplicados
export COMPOSE_PROJECT_NAME=scv


# Obtener ruta absoluta del repositorio
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

# 1. Obtener cambios de GitLab
echo "[1/5] Actualizando repositorio local desde GitLab..."
git fetch origin --tags
git checkout "$BRANCH"
if git show-ref --tags "$BRANCH" >/dev/null 2>&1; then
    git reset --hard "$BRANCH"
else
    git reset --hard "origin/$BRANCH"
fi

# 2. Asegurar redes compartidas de Docker
echo "[2/5] Verificando redes de Docker..."
docker network create vps-gateway 2>/dev/null || true
docker network create scv-network 2>/dev/null || true

# 3. Levantar/actualizar Gateway
echo "[3/5] Desplegando e iniciando Gateway centralizada..."
# Evitar conflictos eliminando el contenedor si ya existe
docker rm -f vps-gateway 2>/dev/null || true
docker compose -f docker-compose.gateway.vps.yml up -d

# 4. Construir y levantar aplicación SCV
echo "[4/5] Construyendo imágenes y reiniciando contenedores de SCV..."
if [ ! -f scv-backend/.env ]; then
    echo "Creando archivo .env desde plantilla..."
    cp scv-backend/.env.example scv-backend/.env
fi
# Evitar conflictos eliminando los contenedores viejos
docker rm -f scv-backend scv-frontend 2>/dev/null || true
docker compose -f docker-compose.app.yml up -d --build


# 5. Probar y Recargar Nginx + Limpiar imágenes huérfanas
echo "[5/5] Verificando Nginx y liberando espacio..."
if docker exec vps-gateway nginx -t 2>/dev/null; then
    docker exec vps-gateway nginx -s reload
    echo "Nginx recargado correctamente."
else
    echo "⚠️  Error en la configuración de Nginx. Revisa con: docker exec vps-gateway nginx -t"
fi

echo "Limpiando imágenes de Docker en desuso..."
docker image prune -f

echo "✅ Proceso completado exitosamente para la rama/tag: $BRANCH"
