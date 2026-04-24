# SCV Deployment Workspace

Repositorio operativo para despliegue de SCV en hosting con dominio.

## Componentes

- `scv-frontend/` aplicación web PWA
- `scv-backend/` API FastAPI
- `deploy/` plantillas de despliegue (Nginx y systemd)
- `infra/gateway/` gateway centralizada para VPS en Docker
- `scripts/` utilidades locales y empaquetado

## Despliegue recomendado (producción)

1. API FastAPI en servidor Linux (systemd + uvicorn).
2. Nginx con TLS (Let's Encrypt):
   - sirve frontend estático
   - proxy `/api/` hacia `127.0.0.1:9000`
3. Dominio ejemplo:
   - `app.tudominio.com` (frontend)
   - opcional `api.tudominio.com` (si separas API)

Ver guía completa en `deploy/README.md`.

## Despliegue recomendado (Docker + gateway centralizada)

1. Crear red compartida: `docker network create vps-gateway`
2. Levantar gateway: `docker compose -f docker-compose.gateway.vps.yml up -d`
3. Levantar app SCV: `docker compose -f docker-compose.app.yml up -d --build`

Detalles y enrutamiento multi-subdominio en `infra/gateway/README.md`.
