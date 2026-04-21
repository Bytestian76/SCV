# SCV Backend

API REST de SCV construida con FastAPI.

## Desarrollo local

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 9000
```

## Configuración

1. Copia `.env.example` a `.env`.
2. Cambia `SECRET_KEY`.
3. Configura `CORS_ALLOWED_ORIGINS` con tu dominio real.

Por defecto, para seguridad en producción:
- `DEBUG=False`
- `ENABLE_API_DOCS=False`
- `ENABLE_TEST_DB_ENDPOINT=False`

## Despliegue en servidor (sin Docker)

Ejemplo de comando de producción (systemd):

```bash
uvicorn main:app --host 127.0.0.1 --port 9000 --workers 2
```

La recomendación es exponer la API detrás de Nginx con HTTPS y proxy en `/api/`.

## Endpoints de salud

- `GET /ping`
- `GET /` (mensaje base)

## Roles de usuario

- `admin`
- `operario_movimientos`
- `operario_chequeo`
