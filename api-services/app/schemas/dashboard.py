from typing import List, Optional
from pydantic import BaseModel


class DashboardKpis(BaseModel):
    vehiculos_activos: int
    vehiculos_activos_delta: float
    conductores_en_linea: int
    conductores_delta: float
    chequeos_hoy: int
    chequeos_delta: float
    movimientos_hoy: int
    movimientos_delta: float
    hallazgos_pendientes: int = 0
    ordenes_abiertas: int = 0
    mecanicos_activos: int = 0


class HourlyMovement(BaseModel):
    hora: str
    movimientos: int


class VehicleStatusBreakdown(BaseModel):
    total: int
    activos: int
    activos_pct: float
    en_mantenimiento: int
    en_mantenimiento_pct: float
    inactivos: int
    inactivos_pct: float
    fuera_de_servicio: int
    fuera_de_servicio_pct: float


class ActiveAlertItem(BaseModel):
    id: str
    tipo: str  # mantenimiento_vencido, chequeo_pendiente, conductor_disponible, hallazgo_critico
    titulo: str
    descripcion: str
    tiempo_relativo: str
    severidad: str  # critica, advertencia, info


class RecentMovementItem(BaseModel):
    id: int
    placa: str
    ruta: str
    estado: str  # En movimiento, Completado
    hora: str


class UpcomingMaintenanceItem(BaseModel):
    id: int
    placa: str
    tarea: str
    dias_restantes: str
    fecha: str


class DashboardSummaryResponse(BaseModel):
    kpis: DashboardKpis
    movimientos_por_hora: List[HourlyMovement]
    vehiculos_por_estado: VehicleStatusBreakdown
    alertas_activas: List[ActiveAlertItem]
    ultimos_movimientos: List[RecentMovementItem]
    mantenimientos_proximos: List[UpcomingMaintenanceItem]
