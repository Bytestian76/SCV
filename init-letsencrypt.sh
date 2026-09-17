#!/bin/bash
# Script de inicialización de Let's Encrypt para SCV
# Este script descarga certificados dummy temporales para que Nginx pueda iniciar,
# y luego solicita los certificados reales usando Certbot.

if ! [ -x "$(command -v docker-compose)" ] && ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker compose no está instalado.' >&2
  exit 1
fi

# Asegurarse de tener el archivo .env
if [ ! -f .env ]; then
  echo "Error: Falta el archivo .env. Por favor copia .env.example a .env y complétalo."
  exit 1
fi

# Cargar variables del .env
export $(grep -v '^#' .env | xargs)

if [ -z "$DOMAIN" ] || [ -z "$CERTBOT_EMAIL" ]; then
  echo "Error: DOMAIN y CERTBOT_EMAIL deben estar definidos en .env"
  exit 1
fi

domains=($DOMAIN)
rsa_key_size=4096
data_path="./nginx-gateway/certbot"

# Para evitar fallos, primero modificamos default.prod.conf para usar la ruta del dominio real
sed -i "s/midominio.com/$DOMAIN/g" nginx-gateway/conf.d/default.prod.conf
# Y descomentamos las líneas del certificado
sed -i 's/# ssl_certificate/ssl_certificate/g' nginx-gateway/conf.d/default.prod.conf

echo "### Generando parámetros SSL ..."
if [ ! -d "$data_path/conf/live/$domains" ]; then
  mkdir -p "$data_path/conf/live/$domains"
  echo "### Solicitando certificado para $domains ..."
  
  # Levantar nginx temporalmente en background
  docker compose -f docker-compose.prod.yml up -d nginx-gateway

  # Ejecutar certbot
  docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/html \
      -d $domains \
      --email $CERTBOT_EMAIL \
      --rsa-key-size $rsa_key_size \
      --agree-tos \
      --force-renewal" certbot

  echo "### Reiniciando nginx ..."
  docker compose -f docker-compose.prod.yml restart nginx-gateway
else
  echo "Certificados ya existen para $domains"
fi
