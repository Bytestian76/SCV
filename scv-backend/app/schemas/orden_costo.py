from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

TIPOS_GASTO = ["repuesto", "mano_obra", "herramienta", "consumible", "otro"]


class OrdenCostoBase(BaseModel):
    orden_id: int
    tipo_gasto: str = "otro"
    proveedor: Optional[str] = None
    numero_factura: Optional[str] = None
    descripcion: str
    cantidad: int = 1
    valor_unitario: int = 0
    valor_total: int = 0

    @field_validator("tipo_gasto")
    @classmethod
    def validar_tipo(cls, v):
        if v not in TIPOS_GASTO:
            raise ValueError(f"Tipo de gasto inválido: {v}")
        return v


class OrdenCostoCreate(OrdenCostoBase):
    pass


class OrdenCostoUpdate(BaseModel):
    tipo_gasto: Optional[str] = None
    proveedor: Optional[str] = None
    numero_factura: Optional[str] = None
    descripcion: Optional[str] = None
    cantidad: Optional[int] = None
    valor_unitario: Optional[int] = None
    valor_total: Optional[int] = None

    @field_validator("tipo_gasto")
    @classmethod
    def validar_tipo(cls, v):
        if v is not None and v not in TIPOS_GASTO:
            raise ValueError(f"Tipo de gasto inválido: {v}")
        return v


class OrdenCostoResponse(OrdenCostoBase):
    id: int
    fecha: Optional[datetime] = None

    class Config:
        from_attributes = True
