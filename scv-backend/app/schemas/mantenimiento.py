"""Schemas Pydantic - Mantenimientos"""

from datetime import date, datetime
from pydantic import BaseModel
from typing import List, Optional


ESTADOS_MANTENIMIENTO = ["pendiente", "en_progreso", "esperando_repuesto", "completado", "cancelado"]
PRIORIDADES_MANTENIMIENTO = ["baja", "media", "alta", "critica"]


class MantenimientoBase(BaseModel):
    vehiculo_id: int
    tipo: str
    descripcion: Optional[str] = None
    kilometraje: Optional[int] = None
    prioridad: Optional[str] = None
    estado: Optional[str] = "pendiente"


class MantenimientoCreate(MantenimientoBase):
    falla_origen_id: Optional[int] = None


class MantenimientoUpdate(BaseModel):
    tipo: Optional[str] = None
    descripcion: Optional[str] = None
    kilometraje: Optional[int] = None
    prioridad: Optional[str] = None
    estado: Optional[str] = None
    vehiculo_id: Optional[int] = None


class MantenimientoEstadoUpdate(BaseModel):
    estado: str


class MantenimientoItemCreate(BaseModel):
    seccion: Optional[str] = None
    item: Optional[str] = None
    observacion: Optional[str] = None
    realizado: Optional[bool] = False


class MantenimientoItemResponse(BaseModel):
    id: int
    mantenimiento_id: int
    chequeo_item_id: Optional[int] = None
    seccion: Optional[str] = None
    item: Optional[str] = None
    observacion: Optional[str] = None
    realizado: bool

    class Config:
        from_attributes = True


class EvidenciaCreate(BaseModel):
    tipo: str = "foto"
    archivo_url: Optional[str] = None
    descripcion: Optional[str] = None


class EvidenciaResponse(BaseModel):
    id: int
    actividad_id: int
    tipo: str
    archivo_url: Optional[str] = None
    descripcion: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True


class ActividadCreate(BaseModel):
    descripcion: str
    responsable: Optional[str] = None


class ActividadUpdate(BaseModel):
    descripcion: Optional[str] = None
    responsable: Optional[str] = None
    estado: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None


class ActividadResponse(BaseModel):
    id: int
    mantenimiento_id: int
    descripcion: str
    responsable: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    estado: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    evidencias: List[EvidenciaResponse] = []

    class Config:
        from_attributes = True


class MantenimientoResponse(MantenimientoBase):
    id: int
    creado_por: int
    chequeo_origen_id: Optional[int] = None
    falla_origen_id: Optional[int] = None
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None
    items: List[MantenimientoItemResponse] = []
    actividades: List[ActividadResponse] = []
    vehiculo: Optional[dict] = None
    creador: Optional[dict] = None
    falla_origen: Optional[dict] = None

    class Config:
        from_attributes = True


class MantenimientoListResponse(BaseModel):
    id: int
    vehiculo_id: int
    tipo: str
    descripcion: Optional[str] = None
    kilometraje: Optional[int] = None
    prioridad: Optional[str] = None
    estado: str
    creado_por: int
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None
    items_count: int = 0
    vehiculo: Optional[dict] = None
    creador: Optional[dict] = None
    falla_origen_id: Optional[int] = None

    class Config:
        from_attributes = True


class CostoCreate(BaseModel):
    tipo: str = "repuesto"
    descripcion: str
    cantidad: int = 1
    valor_unitario: int = 0
    proveedor: Optional[str] = None


class CostoResponse(BaseModel):
    id: int
    mantenimiento_id: int
    tipo: str
    descripcion: str
    cantidad: int
    valor_unitario: int
    total: int
    proveedor: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AuditoriaResponse(BaseModel):
    id: int
    mantenimiento_id: int
    usuario_id: int
    accion: str
    estado_anterior: Optional[str] = None
    estado_nuevo: Optional[str] = None
    created_at: datetime
    usuario_nombre: Optional[str] = None

    class Config:
        from_attributes = True