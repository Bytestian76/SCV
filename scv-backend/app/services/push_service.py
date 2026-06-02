"""Servicio de Web Push (notificaciones push nativas)"""

from sqlalchemy.orm import Session
from pywebpush import webpush, WebPushException
from app.core.config import settings
from app.models.models import PushSubscription, Usuario


def _send_to_subscription(sub: PushSubscription, titulo: str, mensaje: str, url: str = "/"):
    payload = {
        "titulo": titulo,
        "mensaje": mensaje,
        "icono": "/images/icon-1024.png",
        "badge": "/images/icon-1024.png",
        "tag": f"scv-{sub.usuario_id}",
        "url": url,
    }
    try:
        webpush(
            subscription_info={
                "endpoint": sub.endpoint,
                "keys": {"auth": sub.auth, "p256dh": sub.p256dh},
            },
            data=payload,
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={
                "sub": f"mailto:{settings.VAPID_CLAIM_EMAIL}",
            },
        )
        return True
    except WebPushException as ex:
        if ex.response and ex.response.status_code in (404, 410):
            return "expired"
        return False


def send_push_to_user(db: Session, usuario_id: int, titulo: str, mensaje: str, url: str = "/"):
    subs = db.query(PushSubscription).filter(
        PushSubscription.usuario_id == usuario_id,
    ).all()

    expired = []
    for sub in subs:
        result = _send_to_subscription(sub, titulo, mensaje, url)
        if result == "expired":
            expired.append(sub)

    for sub in expired:
        db.delete(sub)
    if expired:
        db.commit()


def send_push_to_mecanicos(db: Session, titulo: str, mensaje: str, url: str = "/"):
    mecanicos = db.query(Usuario).filter(Usuario.rol == "mecanico", Usuario.activo.is_(True)).all()
    for m in mecanicos:
        send_push_to_user(db, m.id, titulo, mensaje, url)


def send_push_to_all_users(db: Session, titulo: str, mensaje: str, url: str = "/"):
    subs = db.query(PushSubscription).all()
    expired = []
    for sub in subs:
        result = _send_to_subscription(sub, titulo, mensaje, url)
        if result == "expired":
            expired.append(sub)

    for sub in expired:
        db.delete(sub)
    if expired:
        db.commit()
