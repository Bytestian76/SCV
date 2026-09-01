from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class VehiculoBase(BaseModel):
    placa: str
    marca: str
    modelo: str
    año: Optional[int] = None
    kilometraje: int = 0
    fecha_venc_soat: Optional[date] = None
    fecha_venc_rtm: Optional[date] = None
    estado: str = "activo"  # activo, en_taller, inactivo, baja
    observaciones: Optional[str] = None


class VehiculoCreate(VehiculoBase):
    pass


class VehiculoUpdate(BaseModel):
    marca: Optional[str] = None
    modelo: Optional[str] = None
    año: Optional[int] = None
    kilometraje: Optional[int] = None
    fecha_venc_soat: Optional[date] = None
    fecha_venc_rtm: Optional[date] = None
    estado: Optional[str] = None
    observaciones: Optional[str] = None


class VehiculoResponse(VehiculoBase):
    id: int
    fecha_creacion: datetime

    model_config = ConfigDict(from_attributes=True)
