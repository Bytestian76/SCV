"""
SCV - Sistema de Control Vehicular
Backend API REST con FastAPI
"""

import logging

# Configuración básica de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine, apply_schema_updates
from app.models import models
from app.api.endpoints import auth, vehiculos, conductores, usuarios, mecanicos, selectores, movimientos, chequeos, dashboard, notificaciones, push
from app.api.endpoints import hallazgos, ordenes_trabajo, ordenes_actividades, ordenes_costos, ordenes_evidencias, ordenes_historial
from app.api.endpoints import debug
from app.core.config import settings


def _parse_cors_origins(raw_origins: str):
    if not raw_origins:
        return ["*"]

    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    return origins or ["*"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicializar base de datos al iniciar"""
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        pass  # Ignorar si otro worker ya creó las tablas
    apply_schema_updates()
    yield


app = FastAPI(
    title="SCV API",
    description="Sistema de Control Vehicular - API REST",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.ENABLE_API_DOCS else None,
    redoc_url="/redoc" if settings.ENABLE_API_DOCS else None,
    openapi_url="/openapi.json" if settings.ENABLE_API_DOCS else None,
)

# Prefijo API v1
API_V1 = "/api/v1"

# Registrar routers (endpoints) con prefijo API v1
app.include_router(auth.router, prefix=API_V1)
app.include_router(vehiculos.router, prefix=API_V1)
app.include_router(conductores.router, prefix=API_V1)
app.include_router(usuarios.router, prefix=API_V1)
app.include_router(mecanicos.router, prefix=API_V1)
app.include_router(selectores.router, prefix=API_V1)
app.include_router(movimientos.router, prefix=API_V1)
app.include_router(chequeos.router, prefix=API_V1)
app.include_router(notificaciones.router, prefix=API_V1)
app.include_router(push.router, prefix=API_V1)
app.include_router(dashboard.router, prefix=API_V1)
app.include_router(hallazgos.router, prefix=API_V1)
app.include_router(ordenes_trabajo.router, prefix=API_V1)
app.include_router(ordenes_actividades.router, prefix=API_V1)
app.include_router(ordenes_costos.router, prefix=API_V1)
app.include_router(ordenes_evidencias.router, prefix=API_V1)
app.include_router(ordenes_historial.router, prefix=API_V1)

from app.core.waf import WAFMiddleware

# CORS - Permite que el frontend acceda desde cualquier origen
# En producción, restrictingías los orígenes permitidos
app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_cors_origins(settings.CORS_ALLOWED_ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar Firewall a Nivel de Aplicación (WAF)
app.add_middleware(WAFMiddleware)


@app.get("/")
def root():
    """Endpoint de bienvenida"""
    return {"message": "SCV API - Sistema de Control Vehicular"}


@app.get("/ping")
def ping():
    """Endpoint de prueba para verificar que el servidor funciona"""
    return {"status": "ok", "message": "El servidor está funcionando"}


# Agregar endpoints de debug solo en modo desarrollo o si se habilita explícitamente
if settings.ENV == "development" or settings.ENABLE_TEST_DB_ENDPOINT:
    app.include_router(debug.router, prefix=API_V1)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
