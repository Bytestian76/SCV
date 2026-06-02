"""Endpoints de Notificaciones"""

from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.dependencies import require_role, get_current_user
from app.db.database import get_db
from app.models.models import Notificacion, Usuario
from app.schemas.notificacion import NotificacionListResponse, NotificacionResponse

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])


@router.get("/", response_model=NotificacionListResponse)
def listar_notificaciones(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    notificaciones = (
        db.query(Notificacion)
        .filter(Notificacion.usuario_id == current_user.id)
        .order_by(Notificacion.fecha_creacion.desc())
        .limit(50)
        .all()
    )
    no_leidas = sum(1 for n in notificaciones if not n.leida)

    return NotificacionListResponse(
        notificaciones=[
            NotificacionResponse(
                id=n.id,
                usuario_id=n.usuario_id,
                tipo=n.tipo,
                titulo=n.titulo,
                mensaje=n.mensaje,
                referencia_tipo=n.referencia_tipo,
                referencia_id=n.referencia_id,
                leida=n.leida,
                fecha_creacion=n.fecha_creacion,
                fecha_leida=n.fecha_leida,
            )
            for n in notificaciones
        ],
        total_no_leidas=no_leidas,
    )


@router.put("/{notificacion_id}/leer", response_model=NotificacionResponse)
def marcar_notificacion_leida(
    notificacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    n = db.query(Notificacion).filter(
        Notificacion.id == notificacion_id,
        Notificacion.usuario_id == current_user.id,
    ).first()
    if not n:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Notificación no encontrada")

    n.leida = True
    n.fecha_leida = datetime.utcnow()
    db.commit()
    db.refresh(n)

    return NotificacionResponse(
        id=n.id,
        usuario_id=n.usuario_id,
        tipo=n.tipo,
        titulo=n.titulo,
        mensaje=n.mensaje,
        referencia_tipo=n.referencia_tipo,
        referencia_id=n.referencia_id,
        leida=n.leida,
        fecha_creacion=n.fecha_creacion,
        fecha_leida=n.fecha_leida,
    )


@router.put("/leer-todas")
def marcar_todas_leidas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    ahora = datetime.utcnow()
    db.query(Notificacion).filter(
        Notificacion.usuario_id == current_user.id,
        Notificacion.leida.is_(False),
    ).update({"leida": True, "fecha_leida": ahora})
    db.commit()
    return {"message": "Todas las notificaciones marcadas como leídas"}
