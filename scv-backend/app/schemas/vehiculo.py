"""Schemas Pydantic - Vehiculos"""

from datetime import date
from pydantic import BaseModel
from typing import Optional


class VehiculoBase(BaseModel):
    placa: str
    marca: str
    modelo: str
    año: Optional[int] = None
    empresa: Optional[str] = None
    kilometraje: int = 0
    fecha_venc_soat: Optional[date] = None
    fecha_venc_rtm: Optional[date] = None
    especificaciones: Optional[str] = None
    tipo_vehiculo: Optional[str] = None
    capacidad_carga_kg: Optional[int] = None
    chasis: Optional[str] = None
    comentarios: Optional[str] = None
    estado: Optional[str] = None


class VehiculoCreate(VehiculoBase):
    pass


class VehiculoUpdate(BaseModel):
    placa: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    año: Optional[int] = None
    empresa: Optional[str] = None
    kilometraje: Optional[int] = None
    fecha_venc_soat: Optional[date] = None
    fecha_venc_rtm: Optional[date] = None
    activo: Optional[bool] = None


class VehiculoResponse(VehiculoBase):
    id: int
    activo: bool
    
    class Config:
        from_attributes = True
