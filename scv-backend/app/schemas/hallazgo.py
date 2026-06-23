from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime

ORIGENES_HALLAZGO = ["chequeo", "movimiento", "manual"]
CRITICIDADES_HALLAZGO = ["baja", "media", "alta", "critica"]
ESTADOS_HALLAZGO = ["abierto", "evaluado", "convertido_orden", "descartado"]


class HallazgoBase(BaseModel):
    vehiculo_id: int
    chequeo_id: Optional[int] = None
    origen: str = "manual"
    descripcion: str
    criticidad: str = "media"
    tipo: str = "operacion"
    categoria: Optional[str] = None
    observaciones: Optional[str] = None

    @field_validator("origen")
    @classmethod
    def validar_origen(cls, v):
        if v not in ORIGENES_HALLAZGO:
            raise ValueError(f"Origen inválido: {v}. Opciones: {ORIGENES_HALLAZGO}")
        return v

    @field_validator("criticidad")
    @classmethod
    def validar_criticidad(cls, v):
        if v.lower() not in CRITICIDADES_HALLAZGO:
            raise ValueError(f"Criticidad inválida: {v}. Opciones: {CRITICIDADES_HALLAZGO}")
        return v.lower()


class HallazgoCreate(HallazgoBase):
    pass


class HallazgoUpdate(BaseModel):
    descripcion: Optional[str] = None
    criticidad: Optional[str] = None
    tipo: Optional[str] = None
    categoria: Optional[str] = None
    observaciones: Optional[str] = None

    @field_validator("criticidad")
    @classmethod
    def validar_criticidad(cls, v):
        if v is not None and v.lower() not in CRITICIDADES_HALLAZGO:
            raise ValueError(f"Criticidad inválida: {v}")
        return v.lower() if v else v


class HallazgoEvaluar(BaseModel):
    estado: str
    observaciones: Optional[str] = None

    @field_validator("estado")
    @classmethod
    def validar_estado(cls, v):
        if v not in ("evaluado", "descartado", "convertido_orden"):
            raise ValueError(f"Estado inválido: {v}. Debe ser evaluado, descartado o convertido_orden")
        return v


class HallazgoResponse(HallazgoBase):
    id: int
    usuario_reporta_id: int
    estado: str
    fecha_creacion: Optional[datetime] = None
    vehiculo: Optional[dict] = None
    usuario_reporta: Optional[dict] = None
    orden_trabajo_id: Optional[int] = None

    class Config:
        from_attributes = True
