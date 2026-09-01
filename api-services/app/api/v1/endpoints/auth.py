import uuid
import time
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import verify_password, create_access_token
from app.models.usuario import Usuario
from app.models.token_revocado import TokenRevocado
from app.schemas.token import Token
from app.schemas.usuario import LoginRequest, UsuarioResponse
from app.api.deps import get_current_user

router = APIRouter()

# --- Rate Limiting Config ---
login_attempts = defaultdict(lambda: {"attempts": 0, "blocked_until": 0})
MAX_ATTEMPTS = 5
BLOCK_TIME = 60  # segundos

@router.post("/login", response_model=Token, summary="Iniciar Sesión")
def login_json(
    request: Request,
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    """Inicio de sesión mediante JSON con email y password. Incluye Rate Limiting."""
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Verificar bloqueo de IP
    record = login_attempts[client_ip]
    if record["blocked_until"] > now:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Demasiados intentos fallidos. Intente nuevamente en {int(record['blocked_until'] - now)} segundos.",
        )
    
    user = db.query(Usuario).filter(Usuario.email == credentials.email.lower()).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        # Incrementar intentos
        record["attempts"] += 1
        if record["attempts"] >= MAX_ATTEMPTS:
            record["blocked_until"] = now + BLOCK_TIME
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo electrónico o contraseña incorrectos",
        )
        
    # Limpiar historial de intentos al acceder con éxito
    record["attempts"] = 0
    record["blocked_until"] = 0

    if not user.estado_activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo en el sistema",
        )

    jti = str(uuid.uuid4())
    access_token = create_access_token(
        subject=user.id,
        role=user.rol,
        extra_claims={"jti": jti, "email": user.email, "nombre": user.nombre},
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        nombre=user.nombre,
        rol=user.rol,
    )


@router.post("/refresh", response_model=Token, summary="Renovar Token")
def refresh_token(current_user: Usuario = Depends(get_current_user)):
    """Genera un nuevo token JWT para renovar la sesión activa."""
    jti = str(uuid.uuid4())
    access_token = create_access_token(
        subject=current_user.id,
        role=current_user.rol,
        extra_claims={"jti": jti, "email": current_user.email, "nombre": current_user.nombre},
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=current_user.id,
        email=current_user.email,
        nombre=current_user.nombre,
        rol=current_user.rol,
    )


@router.get("/me", response_model=UsuarioResponse, summary="Perfil del Usuario Autenticado")
def get_me(current_user: Usuario = Depends(get_current_user)):
    """Retorna los datos del usuario autenticado."""
    return current_user


@router.post("/logout", summary="Cerrar Sesión y Revocar Token")
def logout(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoca la sesión activa."""
    jti = str(uuid.uuid4())
    revocado = TokenRevocado(
        jti=jti,
        expiracion=datetime.now(timezone.utc) + timedelta(hours=8),
    )
    db.add(revocado)
    db.commit()
    return {"message": "Sesión finalizada correctamente"}
