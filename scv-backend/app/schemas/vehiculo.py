"""Schemas Pydantic - Vehiculos"""

from datetime import date
from pydantic import BaseModel
from typing import Optional


class VehiculoBase(BaseModel):
    placa: str
    marca: str
    modelo: str
    año: int
    empresa: Optional[str] = None
    fecha_venc_soat: Optional[date] = None
    fecha_venc_rtm: Optional[date] = None


class VehiculoCreate(VehiculoBase):
    pass


class VehiculoUpdate(BaseModel):
    placa: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    año: Optional[int] = None
    empresa: Optional[str] = None
    fecha_venc_soat: Optional[date] = None
    fecha_venc_rtm: Optional[date] = None
    activo: Optional[bool] = None


class VehiculoResponse(VehiculoBase):
    id: int
    activo: bool
    
    class Config:
        from_attributes = True
