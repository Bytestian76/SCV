from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, ConfigDict
from app.schemas.vehiculo import VehiculoResponse
from app.schemas.usuario import UsuarioResponse


class MovimientoBase(BaseModel):
    tipo: str = "salida"  # entrada, salida
    vehiculo_id: int  # NOT NULL (Obligatorio)
    usuario_id: int   # NOT NULL (Conductor Obligatorio)
    auxiliar: Optional[str] = None
    proveedor: Optional[str] = None
    kilometraje: Optional[int] = None
    bascula_peso: Optional[Decimal] = None
    cantidad_sacas: Optional[int] = None
    estado_cajon: Optional[str] = None  # bueno, regular, sucio, dañado
    observaciones: Optional[str] = None


class MovimientoCreate(MovimientoBase):
    pass


class MovimientoUpdate(BaseModel):
    tipo: Optional[str] = None
    vehiculo_id: Optional[int] = None
    usuario_id: Optional[int] = None
    auxiliar: Optional[str] = None
    proveedor: Optional[str] = None
    kilometraje: Optional[int] = None
    bascula_peso: Optional[Decimal] = None
    cantidad_sacas: Optional[int] = None
    estado_cajon: Optional[str] = None
    observaciones: Optional[str] = None


class MovimientoResponse(MovimientoBase):
    id: int
    fecha_registro: datetime
    vehiculo: Optional[VehiculoResponse] = None
    usuario: Optional[UsuarioResponse] = None

    model_config = ConfigDict(from_attributes=True)
