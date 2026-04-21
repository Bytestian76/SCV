"""
Schemas Pydantic - Autenticación
"""

from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    """Request para login"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Response con token JWT"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    """Datos contenidos en el token JWT"""
    user_id: int
    email: str
    rol: str


class UsuarioResponse(BaseModel):
    """Response de datos de usuario"""
    id: int
    nombre: str
    email: str
    rol: str
    activo: bool
    
    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    """Response completo de login"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UsuarioResponse


class LogoutResponse(BaseModel):
    """Response de cierre de sesion"""
    message: str
