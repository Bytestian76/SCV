"""Schemas Pydantic - Notificaciones"""

from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional


class NotificacionResponse(BaseModel):
    id: int
    usuario_id: int
    tipo: str
    titulo: str
    mensaje: Optional[str] = None
    referencia_tipo: Optional[str] = None
    referencia_id: Optional[int] = None
    leida: bool
    fecha_creacion: datetime
    fecha_leida: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificacionListResponse(BaseModel):
    notificaciones: List[NotificacionResponse]
    total_no_leidas: int
