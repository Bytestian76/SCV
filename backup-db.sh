#!/bin/bash
# Script de respaldo de base de datos PostgreSQL en contenedor Docker

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER_NAME="scv-postgres-db-prod"

# Asegurarse de tener el archivo .env
if [ ! -f .env ]; then
  echo "Error: Falta el archivo .env"
  exit 1
fi
export $(grep -v '^#' .env | xargs)

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

echo "Iniciando respaldo de base de datos $POSTGRES_DB desde $CONTAINER_NAME..."

# Ejecutar pg_dump dentro del contenedor y comprimir la salida
docker exec -t $CONTAINER_NAME pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Respaldo exitoso: $BACKUP_FILE"
  # Opcional: Mantener solo los últimos 7 respaldos
  ls -t $BACKUP_DIR/*.sql.gz | tail -n +8 | xargs -r rm --
else
  echo "Error al crear el respaldo"
  rm -f "$BACKUP_FILE"
  exit 1
fi
