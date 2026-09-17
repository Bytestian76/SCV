# Preparación para Despliegue en la Nube Completada

He finalizado las configuraciones necesarias en el repositorio para que el proyecto SCV pueda ser desplegado de manera segura en un entorno de producción.

## Cambios Realizados

### 1. Variables de Entorno Seguras
- **`[NEW]` `.env.example`**: Archivo plantilla en la raíz del proyecto para definir variables críticas como contraseñas, secretos JWT y dominio. Al desplegar, se debe copiar como `.env`.

### 2. Configuración de Producción
- **`[NEW]` `docker-compose.prod.yml`**: Un archivo Docker Compose exclusivo para producción. Lee las variables del archivo `.env`, implementa reinicios automáticos (`restart: always`) e incluye un servicio adicional de Certbot para la gestión de certificados SSL.
- **`[NEW]` `nginx-gateway/conf.d/default.prod.conf`**: Configuración de Nginx optimizada para producción. Redirige el tráfico HTTP al puerto HTTPS (443) e incorpora encabezados de seguridad (HSTS, XSS, etc.).

### 3. Scripts de Automatización
- **`[NEW]` `init-letsencrypt.sh`**: Script para solucionar el problema del "huevo y la gallina" entre Nginx y Certbot. Genera certificados iniciales para que Nginx pueda arrancar con HTTPS.
- **`[NEW]` `backup-db.sh`**: Script para generar respaldos comprimidos de la base de datos PostgreSQL. Mantiene los últimos 7 días de respaldos de forma automática.

## Pasos Siguientes (Manual Verification)

Para llevar el proyecto a la nube, los pasos que deberás ejecutar en tu servidor son:

1. Clonar o copiar el repositorio al servidor.
2. Copiar `.env.example` a `.env` y llenar los datos reales (contraseñas fuertes, dominio).
3. Asegurarte de que el DNS de tu dominio ya apunte a la IP pública del servidor.
4. Ejecutar `./init-letsencrypt.sh` para obtener los certificados SSL.
5. Iniciar la aplicación con: `docker compose -f docker-compose.prod.yml up -d`
6. (Opcional) Agregar un cronjob (`crontab -e`) para ejecutar `./backup-db.sh` diariamente a la medianoche: `0 0 * * * /ruta/al/proyecto/backup-db.sh`
