#!/bin/bash
# Script de inicialización de Let's Encrypt para SCV
# Este script usa una configuración temporal de Nginx para asegurar
# que Certbot obtenga el certificado sin caer en crash loops.

if ! [ -x "$(command -v docker-compose)" ] && ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker compose no está instalado.' >&2
  exit 1
fi

if [ ! -f .env ]; then
  echo "Error: Falta el archivo .env. Por favor ejecuta setup_vps.sh primero."
  exit 1
fi

export $(grep -v '^#' .env | xargs)

if [ -z "$DOMAIN" ] || [ -z "$CERTBOT_EMAIL" ]; then
  echo "Error: DOMAIN y CERTBOT_EMAIL deben estar definidos en .env"
  exit 1
fi

echo "1. Deteniendo contenedores para empezar en limpio..."
sudo docker compose -f docker-compose.prod.yml down

echo "2. Preparando archivos y rutas..."
# Asegurarnos de que el dominio esté configurado correctamente en el archivo real
sed -i "s/midominio.com/$DOMAIN/g" nginx-gateway/conf.d/default.prod.conf

# Borramos certificados previos que pudieran estar corruptos
sudo rm -rf ./nginx-gateway/certbot/conf/live/$DOMAIN
sudo rm -rf ./nginx-gateway/certbot/conf/archive/$DOMAIN
sudo rm -rf ./nginx-gateway/certbot/conf/renewal/$DOMAIN.conf

echo "3. Generando configuración de Nginx temporal (HTTP-only)..."
cp nginx-gateway/conf.d/default.prod.conf nginx-gateway/conf.d/default.prod.conf.bak
cat << 'INNER_EOF' > nginx-gateway/conf.d/default.prod.conf
server {
    listen 80;
    server_name _;
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}
INNER_EOF

echo "4. Iniciando Nginx en modo HTTP..."
sudo docker compose -f docker-compose.prod.yml up -d nginx-gateway

echo "5. Pidiendo certificado a Let's Encrypt..."
sudo docker compose -f docker-compose.prod.yml run --rm --entrypoint "certbot certonly --webroot -w /var/www/html -d $DOMAIN --email $CERTBOT_EMAIL --rsa-key-size 4096 --agree-tos --non-interactive --force-renewal" certbot

echo "6. Restaurando configuración original de Nginx..."
mv nginx-gateway/conf.d/default.prod.conf.bak nginx-gateway/conf.d/default.prod.conf

# Limpiador supremo de comentarios: Nos aseguramos de que ssl_certificate esté DESCOMENTADO sin importar cuántos '#' tenga
sed -i -E 's/^[ \t]*([#][ \t]*)*ssl_certificate/    ssl_certificate/g' nginx-gateway/conf.d/default.prod.conf

echo "7. Levantando la plataforma completa con SSL..."
sudo docker compose -f docker-compose.prod.yml down
sudo docker compose -f docker-compose.prod.yml up -d --build

echo "¡Completado exitosamente! El servidor debería estar respondiendo en https://$DOMAIN"
