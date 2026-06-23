from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime

PRIORIDADES_ORDEN = ["urgente", "alta", "media", "baja"]
ESTADOS_ORDEN = ["pendiente", "asignada", "en_progreso", "pausada", "completada", "cancelada"]


class OrdenTrabajoBase(BaseModel):
    hallazgo_id: int
    vehiculo_id: int
    responsable_id: Optional[int] = None
    prioridad: str = "media"
    descripcion: Optional[str] = None

    @field_validator("prioridad")
    @classmethod
    def validar_prioridad(cls, v):
        if v.lower() not in PRIORIDADES_ORDEN:
            raise ValueError(f"Prioridad inválida: {v}")
        return v.lower()


class OrdenTrabajoCreate(OrdenTrabajoBase):
    pass


class OrdenTrabajoUpdate(BaseModel):
    responsable_id: Optional[int] = None
    prioridad: Optional[str] = None
    estado: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_inicio: Optional[datetime] = None

    @field_validator("prioridad")
    @classmethod
    def validar_prioridad(cls, v):
        if v is not None and v.lower() not in PRIORIDADES_ORDEN:
            raise ValueError(f"Prioridad inválida: {v}")
        return v.lower() if v else v

    @field_validator("estado")
    @classmethod
    def validar_estado(cls, v):
        if v is not None and v not in ESTADOS_ORDEN:
            raise ValueError(f"Estado inválido: {v}")
        return v


class OrdenTrabajoResponse(OrdenTrabajoBase):
    id: int
    estado: str
    fecha_creacion: Optional[datetime] = None
    fecha_inicio: Optional[datetime] = None
    fecha_cierre: Optional[datetime] = None
    hallazgo: Optional[dict] = None
    vehiculo: Optional[dict] = None
    responsable: Optional[dict] = None
    actividades: Optional[List[dict]] = None
    costos: Optional[List[dict]] = None
    evidencias: Optional[List[dict]] = None

    class Config:
        from_attributes = True
