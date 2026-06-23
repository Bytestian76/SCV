"""
Funciones de seguridad - JWT y Password
"""

from datetime import datetime, timedelta
from typing import Optional
from uuid import uuid4
from jose import JWTError, jwt
from passlib.hash import bcrypt

from app.core.config import settings


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Crear token JWT
    
    Args:
        data: Datos a incluir en el token (payload)
        expires_delta: Tiempo de expiración opcional
    
    Returns:
        Token JWT codificado como string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    to_encode.setdefault("jti", uuid4().hex)
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """
    Decodificar y verificar un token JWT
    
    Args:
        token: Token JWT a decodificar
    
    Returns:
        Payload del token o None si es inválido
    """
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verificar una contraseña contra su hash
    
    Args:
        plain_password: Contraseña en texto plano
        hashed_password: Hash de la contraseña almacenado
    
    Returns:
        True si coincide, False si no
    """
    return bcrypt.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Crear hash de una contraseña
    
    Args:
        password: Contraseña en texto plano
    
    Returns:
        Hash de la contraseña
    """
    return bcrypt.hash(password)


# Roles válidos en el sistema
ROLES_VALIDOS = ["admin", "operario_movimientos", "operario_chequeo", "mecanico", "jefe_mecanicos"]
