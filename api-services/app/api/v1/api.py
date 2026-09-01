from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    dashboard,
    vehiculos,
    usuarios,
    movimientos,
    chequeos,
    mantenimiento,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(vehiculos.router, prefix="/vehiculos", tags=["Vehículos"])
api_router.include_router(usuarios.router, prefix="/usuarios", tags=["Usuarios"])
api_router.include_router(movimientos.router, prefix="/movimientos", tags=["Movimientos"])
api_router.include_router(chequeos.router, prefix="/chequeos", tags=["Chequeos"])
api_router.include_router(mantenimiento.router, prefix="/mantenimiento", tags=["Mantenimiento"])
