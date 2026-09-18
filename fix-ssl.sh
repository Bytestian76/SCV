#!/bin/bash
# fix-ssl.sh - Solución definitiva para SCV

export $(grep -v '^#' .env | xargs)

echo "1. Configurando dominio en Nginx..."
sed -i "s/midominio.com/$DOMAIN/g" nginx-gateway/conf.d/default.prod.conf

echo "2. Borrando basura de intentos fallidos..."
rm -rf ./nginx-gateway/certbot/conf/live/$DOMAIN
rm -rf ./nginx-gateway/certbot/conf/archive/$DOMAIN
rm -rf ./nginx-gateway/certbot/conf/renewal/$DOMAIN.conf

echo "3. Desactivando requerimientos SSL temporalmente..."
sed -i 's/listen 443 ssl;/listen 443;/g' nginx-gateway/conf.d/default.prod.conf
sed -i 's/ssl_certificate/# ssl_certificate/g' nginx-gateway/conf.d/default.prod.conf

echo "4. Iniciando Nginx para recibir la validacion..."
docker compose -f docker-compose.prod.yml up -d nginx-gateway

echo "5. Pidiendo el certificado a Let's Encrypt..."
docker compose -f docker-compose.prod.yml up certbot

echo "6. Reactivando la seguridad SSL..."
sed -i 's/listen 443;/listen 443 ssl;/g' nginx-gateway/conf.d/default.prod.conf
sed -i 's/# ssl_certificate/ssl_certificate/g' nginx-gateway/conf.d/default.prod.conf

echo "7. Levantando todo el sistema en produccion..."
docker compose -f docker-compose.prod.yml restart nginx-gateway
docker compose -f docker-compose.prod.yml up -d

echo "¡Terminado!"
