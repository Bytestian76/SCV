#!/bin/bash
# ===================================================================
#   Sistema de Control Vehicular (SCV) - Instalador Automático VPS
# ===================================================================
# Este script automatiza la instalación y despliegue del proyecto en
# un servidor Linux virgen (ej. Ubuntu/Debian en Google Cloud, AWS, etc).

set -e

# Asegurarnos de estar en el directorio correcto
cd "$(dirname "$0")"

# Colores para los mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================================================${NC}"
echo -e "${GREEN}   Instalador Rápido de SCV para Entornos de Producción (VPS)${NC}"
echo -e "${BLUE}===================================================================${NC}\n"

# 1. Comprobación e Instalación de Docker
echo -e "${YELLOW}[1/4] Comprobando dependencias del sistema...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "Docker no está instalado. Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}Docker instalado exitosamente.${NC}"
else
    echo -e "${GREEN}Docker ya está instalado.${NC}"
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "Instalando Docker Compose plugin..."
    sudo apt-get update && sudo apt-get install -y docker-compose-plugin
fi

# Iniciar Docker si no está corriendo
sudo systemctl enable docker
sudo systemctl start docker

# 2. Configuración de Variables de Entorno (Interactivo)
echo -e "\n${YELLOW}[2/4] Configuración del Entorno (.env)${NC}"
if [ -f .env ]; then
    echo -e "Se ha detectado un archivo .env existente."
    read -p "¿Deseas sobrescribirlo y reconfigurar? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Omitiendo configuración del entorno."
        skip_env=true
    fi
fi

if [ "$skip_env" != true ]; then
    echo -e "\nPor favor, responde las siguientes preguntas para configurar el sistema:"
    
    read -p "1. Ingresa tu nombre de dominio (ej. scv.midominio.com): " DOMAIN
    while [[ -z "$DOMAIN" ]]; do
        echo -e "${RED}El dominio no puede estar vacío.${NC}"
        read -p "1. Ingresa tu nombre de dominio (ej. scv.midominio.com): " DOMAIN
    done

    read -p "2. Ingresa tu correo electrónico (para avisos de Let's Encrypt / SSL): " CERTBOT_EMAIL
    while [[ -z "$CERTBOT_EMAIL" ]]; do
        echo -e "${RED}El correo no puede estar vacío.${NC}"
        read -p "2. Ingresa tu correo electrónico (para avisos de Let's Encrypt / SSL): " CERTBOT_EMAIL
    done

    # Generación de secretos
    echo -e "Generando contraseña segura para PostgreSQL..."
    POSTGRES_PASSWORD=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9!@#%^&*' | fold -w 24 | head -n 1)
    
    echo -e "Generando clave secreta (JWT) para la API..."
    SECRET_KEY=$(openssl rand -hex 32)

    # Crear el archivo .env
    cat <<EOF > .env
# Configuración generada automáticamente por setup_vps.sh

DOMAIN=${DOMAIN}
CERTBOT_EMAIL=${CERTBOT_EMAIL}

# Credenciales de Base de Datos
POSTGRES_DB=scv_database_prod
POSTGRES_USER=scv_admin_prod
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# Backend API
SECRET_KEY=${SECRET_KEY}
ENVIRONMENT=production
ENABLE_API_DOCS=False
EOF

    echo -e "${GREEN}Archivo .env generado correctamente con secretos fuertes.${NC}"
fi

# 3. Generación de Certificados SSL (HTTPS)
echo -e "\n${YELLOW}[3/4] Configuración de Certificados SSL (HTTPS)...${NC}"
echo "Es indispensable que el dominio ($DOMAIN) ya esté apuntando a la IP pública de este servidor en tu proveedor de DNS."
read -p "¿El dominio ya apunta a esta IP? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    chmod +x init-letsencrypt.sh
    # Ejecutamos el script existente que orquesta Nginx y Certbot
    sudo ./init-letsencrypt.sh
else
    echo -e "${RED}ADVERTENCIA: Saltando la configuración SSL.${NC}"
    echo "Por favor, apunta tu DNS a esta IP y luego ejecuta manualmente: ./init-letsencrypt.sh"
    echo "De lo contrario, Nginx podría fallar al iniciar."
fi

# 4. Despliegue de los contenedores
echo -e "\n${YELLOW}[4/4] Levantando los servicios del Sistema...${NC}"
sudo docker compose -f docker-compose.prod.yml up -d --build

echo -e "\n${BLUE}===================================================================${NC}"
echo -e "${GREEN}   ¡Despliegue Finalizado con Éxito!${NC}"
echo -e "${BLUE}===================================================================${NC}"
echo -e "Tu sistema SCV debería estar accesible pronto en: https://$DOMAIN"
echo -e "Para ver los logs en tiempo real, usa: sudo docker compose -f docker-compose.prod.yml logs -f"
echo -e "==================================================================="
