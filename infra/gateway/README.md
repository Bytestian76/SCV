# VPS Gateway centralizada

Configuracion para una API Gateway general en el VPS que enruta por subdominio hacia servicios Docker internos.

## Objetivo

- Entrada unica para todo el trafico HTTP/HTTPS del VPS.
- Enrutamiento por `Host` (subdominio) hacia cada aplicacion.
- Servicios internos no expuestos por puertos publicos.

## Estructura de red

- Red Docker compartida: `vps-gateway`
- Gateway (Nginx): publica `80` y `443`
- App SCV:
  - `scv-frontend` (interno)
  - `scv-backend` (interno)

## Archivos clave

- `docker-compose.gateway.vps.yml`: gateway general del VPS.
- `docker-compose.app.yml`: stack de SCV, conectado a la red `vps-gateway`.
- `infra/gateway/conf.d/default.conf`: fallback para hosts no registrados.
- `infra/gateway/conf.d/scv.normetales.xyz.conf`: ruta activa HTTP para SCV.
- `infra/gateway/conf.d/scv.normetales.xyz.ssl.conf.example`: ejemplo listo para TLS.

## Arranque base

1) Crear red compartida (una sola vez):

```bash
docker network create vps-gateway
```

2) Levantar gateway:

```bash
docker compose -f docker-compose.gateway.vps.yml up -d
```

3) Levantar SCV:

```bash
cp scv-backend/.env.example scv-backend/.env
docker compose -f docker-compose.app.yml up -d --build
```

## DNS

Cada subdominio debe apuntar a la IP publica del VPS (registro tipo `A`). Ejemplo:

- `scv.normetales.xyz` -> `A` -> `IP_VPS`
- `contable.normetales.xyz` -> `A` -> `IP_VPS`
- `asistencia.normetales.xyz` -> `A` -> `IP_VPS`

## Alta de nuevas apps

Para cada nuevo sistema:

1) Desplegar servicio Docker en la red `vps-gateway`.
2) Crear un archivo de host en `infra/gateway/conf.d/`.
3) Recargar gateway:

```bash
docker exec vps-gateway nginx -s reload
```

## TLS / HTTPS

El archivo activo `scv.normetales.xyz.conf` se deja en HTTP para bootstrap inicial.

Cuando ya tengas certificado para `scv.normetales.xyz`:

1) Reemplaza `scv.normetales.xyz.conf` por el contenido de `scv.normetales.xyz.ssl.conf.example`.
2) Verifica y recarga Nginx dentro del contenedor.

```bash
docker exec vps-gateway nginx -t
docker exec vps-gateway nginx -s reload
```

## Seguridad aplicada en SCV

- Bloqueo de `/docs`, `/redoc`, `/openapi.json` y `/test-db` desde gateway.
- Backend con `ENABLE_API_DOCS=False` y `ENABLE_TEST_DB_ENDPOINT=False` en produccion.
