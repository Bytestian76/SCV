from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.usuario import UsuarioResponse


class OrdenHistorialResponse(BaseModel):
    id: int
    orden_id: int
    usuario_id: int
    accion: str
    tabla: Optional[str] = None
    campo: Optional[str] = None
    valor_anterior: Optional[str] = None
    valor_nuevo: Optional[str] = None
    fecha_hora: Optional[datetime] = None
    ip_usuario: Optional[str] = None
    user_agent: Optional[str] = None
    usuario: Optional[UsuarioResponse] = None

    class Config:
        from_attributes = True
