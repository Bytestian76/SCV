"""Schemas Pydantic - Conductores"""

from datetime import date
from pydantic import BaseModel
from typing import Optional


class ConductorBase(BaseModel):
    nombre: str
    cedula: str
    licencia: str
    fecha_venc_licencia: Optional[date] = None
    categoria: str


class ConductorCreate(ConductorBase):
    pass


class ConductorUpdate(BaseModel):
    nombre: Optional[str] = None
    cedula: Optional[str] = None
    licencia: Optional[str] = None
    fecha_venc_licencia: Optional[date] = None
    categoria: Optional[str] = None
    activo: Optional[bool] = None


class ConductorResponse(ConductorBase):
    id: int
    activo: bool
    
    class Config:
        from_attributes = True
