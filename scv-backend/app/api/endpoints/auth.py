"""
Endpoints de Autenticación
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi import Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import time

from app.db.database import get_db
from app.models.models import Usuario, TokenRevocado
from app.schemas.auth import (
    LoginRequest, 
    LoginResponse, 
    TokenResponse,
    UsuarioResponse,
    LogoutResponse,
)
from app.core.security import (
    verify_password, 
    create_access_token,
    decode_token,
    ROLES_VALIDOS
)
from app.core.config import settings
from app.core.dependencies import is_token_revoked

router = APIRouter(prefix="/auth", tags=["Autenticación"])
security = HTTPBearer()

logger = logging.getLogger("scv.auth")

_FAILED_LOGIN_ATTEMPTS: dict[str, list[float]] = {}


def _rate_limit_key(request: Request, email: str) -> str:
    host = request.client.host if request.client else "unknown"
    return f"{host}:{email.strip().lower()}"


def _cleanup_attempts(key: str, now: float) -> list[float]:
    window = settings.LOGIN_RATE_LIMIT_WINDOW_SECONDS
    attempts = [ts for ts in _FAILED_LOGIN_ATTEMPTS.get(key, []) if now - ts <= window]
    _FAILED_LOGIN_ATTEMPTS[key] = attempts
    return attempts


def _register_failed_attempt(key: str) -> None:
    now = time.time()
    attempts = _cleanup_attempts(key, now)
    attempts.append(now)
    _FAILED_LOGIN_ATTEMPTS[key] = attempts


def _clear_failed_attempts(key: str) -> None:
    _FAILED_LOGIN_ATTEMPTS.pop(key, None)


def _assert_not_rate_limited(key: str) -> None:
    now = time.time()
    attempts = _cleanup_attempts(key, now)
    if len(attempts) >= settings.LOGIN_RATE_LIMIT_MAX_ATTEMPTS:
        logger.warning(f"Inicio de sesión bloqueado por exceso de intentos (Rate Limit): Clave '{key}'")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Demasiados intentos de login. Intenta nuevamente en un minuto.",
        )


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, http_request: Request, db: Session = Depends(get_db)):
    """
    Endpoint de login
    
    Valida credenciales y retorna token JWT con los datos del usuario
    """
    login_id = request.email.strip()
    key = _rate_limit_key(http_request, login_id)
    _assert_not_rate_limited(key)
    client_ip = http_request.client.host if http_request.client else "unknown"

    # Buscar usuario por email
    usuario = db.query(Usuario).filter(Usuario.email == login_id).first()
    
    # Verificar que existe y está activo
    if not usuario:
        _register_failed_attempt(key)
        logger.warning(f"Intento de inicio de sesión fallido: Usuario '{login_id}' no encontrado desde la IP {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    
    if not usuario.activo:
        _register_failed_attempt(key)
        logger.warning(f"Intento de inicio de sesión rechazado: Usuario '{login_id}' inactivo desde la IP {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    # Verificar contraseña
    if not verify_password(request.password, usuario.password_hash):
        _register_failed_attempt(key)
        logger.warning(f"Intento de inicio de sesión fallido: Contraseña incorrecta para el usuario '{login_id}' desde la IP {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )

    _clear_failed_attempts(key)
    logger.info(f"Inicio de sesión exitoso: Usuario '{login_id}' (Rol: {usuario.rol}) desde la IP {client_ip}")
    
    # Crear token JWT
    token_data = {
        "user_id": usuario.id,
        "email": usuario.email,
        "rol": usuario.rol
    }
    
    access_token = create_access_token(token_data)
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UsuarioResponse(
            id=usuario.id,
            nombre=usuario.nombre,
            email=usuario.email,
            rol=usuario.rol,
            activo=usuario.activo
        )
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Dependencia para obtener el usuario actual desde el token JWT
    
    Args:
        credentials: Token JWT del header Authorization
        db: Sesión de base de datos
    
    Returns:
        Usuario autenticado
    
    Raises:
        HTTPException: Si el token es inválido o el usuario no existe
    """
    token = credentials.credentials
    
    # Decodificar token
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Obtener datos del token
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    
    if is_token_revoked(db, payload.get("jti")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token revocado"
        )

    # Buscar usuario en BD
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    return usuario


@router.get("/me", response_model=UsuarioResponse)
def me(current_user: Usuario = Depends(get_current_user)):
    """
    Obtener información del usuario actual
    
    Requiere token JWT válido
    """
    return current_user


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(current_user: Usuario = Depends(get_current_user)):
    """
    Renovar token JWT
    
    Genera un nuevo token para el usuario actual sin necesidad de login
    """
    token_data = {
        "user_id": current_user.id,
        "email": current_user.email,
        "rol": current_user.rol
    }
    
    access_token = create_access_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/logout", response_model=LogoutResponse)
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revocar el token actual para cerrar sesion de forma segura"""
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

    jti = payload.get("jti")
    exp = payload.get("exp")
    if not jti or not exp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido para logout"
        )

    ya_revocado = db.query(TokenRevocado).filter(TokenRevocado.jti == jti).first()
    if not ya_revocado:
        exp_dt = datetime.fromtimestamp(exp, tz=timezone.utc).replace(tzinfo=None)
        db.add(
            TokenRevocado(
                jti=jti,
                usuario_id=current_user.id,
                token_exp=exp_dt,
            )
        )
        db.commit()

    logger.info(f"Cierre de sesión exitoso: Usuario ID '{current_user.id}' (Email: '{current_user.email}')")
    return LogoutResponse(message="Sesión cerrada correctamente")
