from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime

ESTADOS_ACTIVIDAD = ["pendiente", "en_progreso", "completada", "cancelada"]


class OrdenActividadBase(BaseModel):
    orden_id: int
    responsable_id: Optional[int] = None
    titulo: str
    descripcion: Optional[str] = None


class OrdenActividadCreate(OrdenActividadBase):
    pass


class OrdenActividadUpdate(BaseModel):
    responsable_id: Optional[int] = None
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None

    @field_validator("estado")
    @classmethod
    def validar_estado(cls, v):
        if v is not None and v not in ESTADOS_ACTIVIDAD:
            raise ValueError(f"Estado inválido: {v}")
        return v


class OrdenActividadResponse(OrdenActividadBase):
    id: int
    estado: str
    fecha_creacion: Optional[datetime] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    responsable: Optional[dict] = None
    evidencias: Optional[List[dict]] = None

    class Config:
        from_attributes = True
