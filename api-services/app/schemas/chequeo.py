from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.vehiculo import VehiculoResponse
from app.schemas.usuario import UsuarioResponse


class ChequeoItemBase(BaseModel):
    seccion: str
    item: str
    valor: str  # conforme, no_conforme, no_aplica
    observacion: Optional[str] = None


class ChequeoItemCreate(ChequeoItemBase):
    pass


class ChequeoItemResponse(ChequeoItemBase):
    id: int
    chequeo_id: int

    model_config = ConfigDict(from_attributes=True)


class ChequeoBase(BaseModel):
    vehiculo_id: int
    usuario_id: Optional[int] = None
    kilometraje: int
    fecha_venc_soat: Optional[date] = None
    fecha_venc_rtm: Optional[date] = None
    fecha_venc_extintor: Optional[date] = None
    aprobado: bool = True
    observaciones_generales: Optional[str] = None


class ChequeoCreate(ChequeoBase):
    items: List[ChequeoItemCreate] = []


class ChequeoResponse(ChequeoBase):
    id: int
    fecha_registro: datetime
    vehiculo: Optional[VehiculoResponse] = None
    usuario: Optional[UsuarioResponse] = None
    items: List[ChequeoItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
