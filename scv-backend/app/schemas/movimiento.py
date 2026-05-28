"""Schemas Pydantic - Movimientos"""

from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class MovimientoBase(BaseModel):
    tipo: str  # entrada, salida
    vehiculo_id: int
    conductor_id: int
    kilometraje: int
    auxiliar: Optional[str] = None
    proveedor: Optional[str] = None
    bascula: Optional[str] = None
    sacas: Optional[int] = None
    cajon: Optional[str] = None
    observaciones: Optional[str] = None

    @field_validator("sacas", mode="before")
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v


class MovimientoCreate(MovimientoBase):
    pass


class MovimientoResponse(MovimientoBase):
    id: int
    usuario_id: int
    fecha_hora: datetime
    
    class Config:
        from_attributes = True


class MovimientoListResponse(BaseModel):
    id: int
    tipo: str
    vehiculo_id: int
    conductor_id: int
    auxiliar: Optional[str]
    proveedor: Optional[str]
    kilometraje: int
    bascula: Optional[str]
    sacas: Optional[int]
    cajon: Optional[str]
    observaciones: Optional[str]
    usuario_id: int
    fecha_hora: datetime
    vehiculo: Optional[dict] = None
    conductor: Optional[dict] = None
    usuario: Optional[dict] = None


class MovimientoDetailResponse(BaseModel):
    id: int
    tipo: str
    vehiculo_id: int
    conductor_id: int
    auxiliar: Optional[str]
    proveedor: Optional[str]
    kilometraje: int
    bascula: Optional[str]
    sacas: Optional[int]
    cajon: Optional[str]
    observaciones: Optional[str]
    usuario_id: int
    fecha_hora: datetime
    vehiculo: Optional[dict] = None
    conductor: Optional[dict] = None
    usuario: Optional[dict] = None
    
    class Config:
        from_attributes = True
