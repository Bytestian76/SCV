"""Schemas Pydantic - Usuarios"""

from pydantic import BaseModel
from typing import Optional


class UsuarioBase(BaseModel):
    nombre: str
    email: str
    rol: str


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    rol: Optional[str] = None
    activo: Optional[bool] = None


class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    email: str
    rol: str
    activo: bool
    
    class Config:
        from_attributes = True
