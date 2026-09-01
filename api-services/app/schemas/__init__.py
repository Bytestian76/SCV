from app.schemas.token import Token, TokenPayload
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse, LoginRequest
from app.schemas.vehiculo import VehiculoCreate, VehiculoUpdate, VehiculoResponse
from app.schemas.movimiento import MovimientoCreate, MovimientoResponse
from app.schemas.chequeo import ChequeoCreate, ChequeoResponse, ChequeoItemCreate, ChequeoItemResponse
from app.schemas.hallazgo import HallazgoCreate, HallazgoUpdate, HallazgoResponse
from app.schemas.orden_trabajo import (
    OrdenTrabajoCreate,
    OrdenTrabajoUpdate,
    OrdenTrabajoResponse,
    OrdenActividadCreate,
    OrdenActividadResponse,
    OrdenCostoCreate,
    OrdenCostoResponse,
    OrdenEvidenciaCreate,
    OrdenEvidenciaResponse,
    OrdenHistorialResponse,
)
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    DashboardKpis,
    HourlyMovement,
    VehicleStatusBreakdown,
    ActiveAlertItem,
    RecentMovementItem,
    UpcomingMaintenanceItem,
)

__all__ = [
    "Token",
    "TokenPayload",
    "UsuarioCreate",
    "UsuarioUpdate",
    "UsuarioResponse",
    "LoginRequest",
    "VehiculoCreate",
    "VehiculoUpdate",
    "VehiculoResponse",
    "MovimientoCreate",
    "MovimientoResponse",
    "ChequeoCreate",
    "ChequeoResponse",
    "ChequeoItemCreate",
    "ChequeoItemResponse",
    "HallazgoCreate",
    "HallazgoUpdate",
    "HallazgoResponse",
    "OrdenTrabajoCreate",
    "OrdenTrabajoUpdate",
    "OrdenTrabajoResponse",
    "OrdenActividadCreate",
    "OrdenActividadResponse",
    "OrdenCostoCreate",
    "OrdenCostoResponse",
    "OrdenEvidenciaCreate",
    "OrdenEvidenciaResponse",
    "OrdenHistorialResponse",
    "DashboardSummaryResponse",
    "DashboardKpis",
    "HourlyMovement",
    "VehicleStatusBreakdown",
    "ActiveAlertItem",
    "RecentMovementItem",
    "UpcomingMaintenanceItem",
]
