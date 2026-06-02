"""Schemas Pydantic - Mantenimientos"""

from datetime import date, datetime
from pydantic import BaseModel
from typing import List, Optional


class MantenimientoBase(BaseModel):
    vehiculo_id: int
    tipo: str  # preventivo, correctivo
    descripcion: Optional[str] = None
    kilometraje: Optional[int] = None
    estado: Optional[str] = "pendiente"


class MantenimientoCreate(MantenimientoBase):
    pass


class MantenimientoUpdate(BaseModel):
    tipo: Optional[str] = None
    descripcion: Optional[str] = None
    kilometraje: Optional[int] = None
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


class MantenimientoResponse(MantenimientoBase):
    id: int
    creado_por: int
    chequeo_origen_id: Optional[int] = None
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None
    items: List[MantenimientoItemResponse] = []
    vehiculo: Optional[dict] = None
    creador: Optional[dict] = None

    class Config:
        from_attributes = True


class MantenimientoListResponse(BaseModel):
    id: int
    vehiculo_id: int
    tipo: str
    descripcion: Optional[str] = None
    kilometraje: Optional[int] = None
    estado: str
    creado_por: int
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None
    items_count: int = 0
    vehiculo: Optional[dict] = None
    creador: Optional[dict] = None

    class Config:
        from_attributes = True
