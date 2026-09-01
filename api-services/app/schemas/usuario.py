from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: str  # admin, operario_movimientos, operario_chequeo, mecanico, jefe_mecanicos
    estado_activo: bool = True
    cedula: Optional[str] = None
    licencia: Optional[str] = None
    categoria: Optional[str] = None
    fecha_venc_licencia: Optional[date] = None
    telefono: Optional[str] = None


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    rol: Optional[str] = None
    estado_activo: Optional[bool] = None
    cedula: Optional[str] = None
    licencia: Optional[str] = None
    categoria: Optional[str] = None
    fecha_venc_licencia: Optional[date] = None
    telefono: Optional[str] = None


class UsuarioResponse(UsuarioBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
