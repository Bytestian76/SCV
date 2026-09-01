from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, ConfigDict
from app.schemas.vehiculo import VehiculoResponse
from app.schemas.usuario import UsuarioResponse
from app.schemas.hallazgo import HallazgoResponse


class OrdenActividadBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    estado: str = "pendiente"  # pendiente, en_progreso, completada


class OrdenActividadCreate(OrdenActividadBase):
    pass


class OrdenActividadResponse(OrdenActividadBase):
    id: int
    orden_id: int
    completado_por_id: Optional[int] = None
    fecha_completado: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class OrdenCostoBase(BaseModel):
    tipo_gasto: str  # repuesto, mano_obra, servicio_externo, herramienta, otro
    descripcion: str
    cantidad: Decimal = Decimal("1.0")
    valor_unitario: Decimal
    total_calculado: Decimal


class OrdenCostoCreate(OrdenCostoBase):
    pass


class OrdenCostoResponse(OrdenCostoBase):
    id: int
    orden_id: int
    registrado_por_id: Optional[int] = None
    fecha_registro: datetime

    model_config = ConfigDict(from_attributes=True)


class OrdenEvidenciaBase(BaseModel):
    tipo: str  # foto_antes, foto_durante, foto_despues, factura, documento, otro
    ruta_archivo: str
    descripcion: Optional[str] = None


class OrdenEvidenciaCreate(OrdenEvidenciaBase):
    pass


class OrdenEvidenciaResponse(OrdenEvidenciaBase):
    id: int
    orden_id: int
    subido_por_id: Optional[int] = None
    fecha_registro: datetime

    model_config = ConfigDict(from_attributes=True)


class OrdenHistorialResponse(BaseModel):
    id: int
    orden_id: int
    usuario_id: Optional[int] = None
    accion: str
    campo_modificado: Optional[str] = None
    valor_anterior: Optional[str] = None
    valor_nuevo: Optional[str] = None
    ip_usuario: Optional[str] = None
    user_agent: Optional[str] = None
    fecha_registro: datetime

    model_config = ConfigDict(from_attributes=True)


class OrdenTrabajoBase(BaseModel):
    codigo: str
    vehiculo_id: int
    hallazgo_id: Optional[int] = None
    responsable_id: Optional[int] = None
    prioridad: str = "media"  # baja, media, alta, urgente
    estado: str = "pendiente"  # pendiente, en_progreso, completada, cancelada
    descripcion: str


class OrdenTrabajoCreate(OrdenTrabajoBase):
    pass


class OrdenTrabajoUpdate(BaseModel):
    responsable_id: Optional[int] = None
    prioridad: Optional[str] = None
    estado: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_cierre: Optional[datetime] = None


class OrdenTrabajoResponse(OrdenTrabajoBase):
    id: int
    creado_por_id: int
    fecha_inicio: Optional[datetime] = None
    fecha_cierre: Optional[datetime] = None
    fecha_creacion: datetime
    vehiculo: Optional[VehiculoResponse] = None
    hallazgo: Optional[HallazgoResponse] = None
    creador: Optional[UsuarioResponse] = None
    responsable: Optional[UsuarioResponse] = None
    actividades: List[OrdenActividadResponse] = []
    costos: List[OrdenCostoResponse] = []
    evidencias: List[OrdenEvidenciaResponse] = []
    historial: List[OrdenHistorialResponse] = []

    model_config = ConfigDict(from_attributes=True)
