"""Schemas Pydantic - Fallas Reportadas"""

from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional


CATEGORIAS_FALLA = [
    "motor", "frenos", "suspension", "direccion",
    "sistema_electrico", "llantas", "carroceria",
    "hidraulico", "otro",
]

PRIORIDADES_FALLA = ["baja", "media", "alta", "critica"]

ESTADOS_FALLA = ["pendiente", "evaluada", "aprobada", "rechazada", "convertida_a_orden"]


class FallaBase(BaseModel):
    vehiculo_id: int
    conductor_id: Optional[int] = None
    categoria: str
    descripcion: str
    prioridad: str = "media"
    fotos: Optional[str] = None


class FallaCreate(FallaBase):
    pass


class FallaUpdate(BaseModel):
    categoria: Optional[str] = None
    descripcion: Optional[str] = None
    prioridad: Optional[str] = None
    estado: Optional[str] = None
    fotos: Optional[str] = None


class FallaEstadoUpdate(BaseModel):
    estado: str


class FallaResponse(FallaBase):
    id: int
    usuario_id: int
    estado: str
    fecha_reporte: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    vehiculo: Optional[dict] = None
    conductor: Optional[dict] = None
    usuario: Optional[dict] = None

    class Config:
        from_attributes = True


class FallaListResponse(BaseModel):
    id: int
    vehiculo_id: int
    conductor_id: Optional[int] = None
    categoria: str
    descripcion: str
    prioridad: str
    estado: str
    fecha_reporte: datetime
    created_at: datetime
    vehiculo: Optional[dict] = None
    conductor: Optional[dict] = None
    usuario: Optional[dict] = None

    class Config:
        from_attributes = True
