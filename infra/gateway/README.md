# SCV API Gateway

Gateway reverso para SCV usando Nginx en Docker.

## Puertos

- Gateway: `http://localhost:8000`
- Backend FastAPI (upstream): `http://localhost:9000`

## Arranque

1. Levanta backend en puerto 9000.
2. Desde la raiz del repo, ejecuta:

```bash
docker compose -f docker-compose.gateway.yml up -d
```

Tambien puedes usar el comando global del proyecto:

```bash
normetales start
```

Esto inicia backend + gateway + frontend en conjunto.

Para manejar solo el gateway:

```bash
normetales start-gateway
normetales stop-gateway
```

## Verificacion

```bash
curl -i http://localhost:8000/gateway-health
curl -i http://localhost:8000/api/v1/ping
curl -i http://localhost:8000/docs
```

Esperado:

- `gateway-health`: `200`
- `api/v1/ping`: `200`
- `docs`: `404`

## Endurecimiento aplicado

- Bloqueo de `/docs`, `/redoc`, `/openapi.json`, `/test-db`.
- Rate limiting en `/api/v1/auth/login`.
