"""Endpoints de Web Push - suscripción"""

from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.models import PushSubscription, Usuario
from app.schemas.push import PushSubscriptionCreate, PushSubscriptionResponse

router = APIRouter(prefix="/push", tags=["Push"])


@router.post("/subscribe", response_model=PushSubscriptionResponse)
def subscribe(
    payload: PushSubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    existing = db.query(PushSubscription).filter(
        PushSubscription.usuario_id == current_user.id,
        PushSubscription.endpoint == payload.endpoint,
    ).first()

    if existing:
        existing.auth = payload.auth
        existing.p256dh = payload.p256dh
        existing.user_agent = payload.user_agent
        existing.fecha_actualizacion = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    sub = PushSubscription(
        usuario_id=current_user.id,
        endpoint=payload.endpoint,
        auth=payload.auth,
        p256dh=payload.p256dh,
        user_agent=payload.user_agent,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.delete("/unsubscribe")
def unsubscribe(
    endpoint: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    existing = db.query(PushSubscription).filter(
        PushSubscription.usuario_id == current_user.id,
        PushSubscription.endpoint == endpoint,
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
    return {"message": "Suscripción eliminada"}
