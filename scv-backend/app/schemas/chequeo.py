"""Schemas Pydantic - Chequeos preoperacionales"""

from datetime import date, datetime
from pydantic import BaseModel
from typing import List, Optional


class ChequeoBase(BaseModel):
    vehiculo_id: int
    conductor_id: int
    kilometraje: int
    fecha_venc_soat: Optional[date] = None
    fecha_venc_rtm: Optional[date] = None
    fecha_venc_extintor: Optional[date] = None
    obs_generales: Optional[str] = None


class ChequeoCreate(ChequeoBase):
    pass


class ChequeoResponse(ChequeoBase):
    id: int
    usuario_id: int
    fecha_hora: datetime
    total_items: int = 0

    class Config:
        from_attributes = True


class ChequeoItemCreate(BaseModel):
    seccion: str
    item: str
    valor: str
    observacion: Optional[str] = None
    marcar_mantenimiento: Optional[bool] = False


class ChequeoItemsCreate(BaseModel):
    items: List[ChequeoItemCreate]


class ChequeoItemsResponse(BaseModel):
    chequeo_id: int
    guardados: int
    message: str


class ChequeoListResponse(BaseModel):
    id: int
    vehiculo_id: int
    conductor_id: int
    usuario_id: int
    kilometraje: int
    fecha_venc_soat: Optional[date]
    fecha_venc_rtm: Optional[date]
    fecha_venc_extintor: Optional[date]
    obs_generales: Optional[str]
    fecha_hora: datetime
    total_items: int
    vehiculo: Optional[dict] = None
    conductor: Optional[dict] = None
    usuario: Optional[dict] = None


class ChequeoItemResponse(BaseModel):
    id: int
    seccion: str
    item: str
    valor: str
    observacion: Optional[str] = None
    marcar_mantenimiento: Optional[bool] = False
    mantenimiento_id: Optional[int] = None

    class Config:
        from_attributes = True


class ChequeoDetailResponse(BaseModel):
    id: int
    vehiculo_id: int
    conductor_id: int
    usuario_id: int
    kilometraje: int
    fecha_venc_soat: Optional[date]
    fecha_venc_rtm: Optional[date]
    fecha_venc_extintor: Optional[date]
    obs_generales: Optional[str]
    fecha_hora: datetime
    vehiculo: Optional[dict] = None
    conductor: Optional[dict] = None
    usuario: Optional[dict] = None
    items: List[ChequeoItemResponse]
