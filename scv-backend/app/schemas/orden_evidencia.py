from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

TIPOS_EVIDENCIA = ["foto", "documento", "video", "nota"]


class OrdenEvidenciaBase(BaseModel):
    orden_id: Optional[int] = None
    actividad_id: Optional[int] = None
    tipo: str = "foto"
    ruta_archivo: Optional[str] = None
    nombre_original: Optional[str] = None
    descripcion: Optional[str] = None

    @field_validator("tipo")
    @classmethod
    def validar_tipo(cls, v):
        if v not in TIPOS_EVIDENCIA:
            raise ValueError(f"Tipo inválido: {v}")
        return v


class OrdenEvidenciaCreate(OrdenEvidenciaBase):
    pass


class OrdenEvidenciaUpdate(BaseModel):
    descripcion: Optional[str] = None
    tipo: Optional[str] = None

    @field_validator("tipo")
    @classmethod
    def validar_tipo(cls, v):
        if v is not None and v not in TIPOS_EVIDENCIA:
            raise ValueError(f"Tipo inválido: {v}")
        return v


class OrdenEvidenciaResponse(OrdenEvidenciaBase):
    id: int
    usuario_id: int
    fecha_subida: Optional[datetime] = None
    usuario: Optional[dict] = None

    class Config:
        from_attributes = True
