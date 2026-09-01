from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.vehiculo import VehiculoResponse
from app.schemas.usuario import UsuarioResponse


class HallazgoBase(BaseModel):
    vehiculo_id: int
    chequeo_item_id: Optional[int] = None
    origen: str  # chequeo, movimiento, manual
    categoria: Optional[str] = None  # mecanica, electrica, frenos, neumaticos, fluidos, carroceria, seguridad
    descripcion: str
    criticidad: str = "media"  # baja, media, alta, critica
    estado: str = "abierto"  # abierto, en_orden, resuelto, descartado


class HallazgoCreate(HallazgoBase):
    pass


class HallazgoUpdate(BaseModel):
    categoria: Optional[str] = None
    descripcion: Optional[str] = None
    criticidad: Optional[str] = None
    estado: Optional[str] = None


class ConvertirOTRequest(BaseModel):
    categoria: Optional[str] = "mecanica"
    prioridad: str = "alta"  # baja, media, alta, urgente
    responsable_id: Optional[int] = None
    descripcion_trabajo: Optional[str] = None


class HallazgoResponse(HallazgoBase):
    id: int
    usuario_reporta_id: int
    fecha_registro: datetime
    vehiculo: Optional[VehiculoResponse] = None
    usuario_reporta: Optional[UsuarioResponse] = None

    model_config = ConfigDict(from_attributes=True)
