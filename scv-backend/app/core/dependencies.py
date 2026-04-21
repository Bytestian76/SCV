"""
Dependencias para autorización por roles
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import Usuario, TokenRevocado
from app.core.security import decode_token

security = HTTPBearer()


def is_token_revoked(db: Session, jti: str | None) -> bool:
    """Verificar si un token JWT ya fue revocado"""
    if not jti:
        return False
    revocado = db.query(TokenRevocado).filter(TokenRevocado.jti == jti).first()
    return revocado is not None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Obtener usuario actual desde el token JWT
    
    Uso: AgregaDepends(get_current_user) a cualquier endpoint
    """
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    
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

    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario or not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o inactivo"
        )
    
    return usuario


def require_role(roles: List[str]):
    """
    Dependencia factory para verificar rol
    
    Uso:
        @app.get("/admin")
        def admin_route(user: Usuario = Depends(require_role(["admin"]))):
    
    Args:
        roles: Lista de roles permitidos
    
    Returns:
        Función dependencia
    """
    def role_checker(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db)
    ) -> Usuario:
        token = credentials.credentials
        payload = decode_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        user_rol = payload.get("rol")
        if user_rol not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Roles permitidos: {', '.join(roles)}"
            )
        
        if is_token_revoked(db, payload.get("jti")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token revocado"
            )

        user_id = payload.get("user_id")
        usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
        
        if not usuario or not usuario.activo:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario inactivo"
            )
        
        return usuario
    
    return role_checker


# Roles válidos del sistema
ROLES = {
    "admin": ["admin"],
    "operario_movimientos": ["admin", "operario_movimientos"],
    "operario_chequeo": ["admin", "operario_chequeo"],
    "todos": ["admin", "operario_movimientos", "operario_chequeo"]
}
