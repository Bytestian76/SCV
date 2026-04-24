"""Endpoints de Dashboard"""

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.dependencies import require_role
from app.db.database import get_db
from app.models.models import Chequeo, Conductor, Movimiento, Vehiculo

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

UTC = ZoneInfo("UTC")
LOCAL_TZ = ZoneInfo("America/Bogota")


def _as_utc_naive(local_dt: datetime) -> datetime:
    return local_dt.astimezone(UTC).replace(tzinfo=None)


def _to_local_date(utc_naive_dt: datetime):
    if not utc_naive_dt:
        return None
    return utc_naive_dt.replace(tzinfo=UTC).astimezone(LOCAL_TZ).date()


@router.get("/")
def obtener_dashboard(
    dias: int = Query(7, ge=7, le=60, description="Rango de analitica en dias"),
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin"])),
):
    """Resumen general para dashboard administrativo"""
    dias = max(7, min(dias, 60))
    now_local = datetime.now(UTC).astimezone(LOCAL_TZ)
    today_local = now_local.date()
    inicio_rango_dia = today_local - timedelta(days=dias - 1)

    inicio_hoy = _as_utc_naive(datetime.combine(today_local, datetime.min.time(), tzinfo=LOCAL_TZ))
    fin_hoy = _as_utc_naive(datetime.combine(today_local, datetime.max.time(), tzinfo=LOCAL_TZ))
    inicio_rango = _as_utc_naive(datetime.combine(inicio_rango_dia, datetime.min.time(), tzinfo=LOCAL_TZ))

    movimientos_rango_raw = (
        db.query(Movimiento.fecha_hora)
        .filter(Movimiento.fecha_hora >= inicio_rango, Movimiento.fecha_hora <= fin_hoy)
        .all()
    )
    chequeos_rango_raw = (
        db.query(Chequeo.fecha_hora)
        .filter(Chequeo.fecha_hora >= inicio_rango, Chequeo.fecha_hora <= fin_hoy)
        .all()
    )

    movimientos_por_dia = {}
    chequeos_por_dia = {}

    for row in movimientos_rango_raw:
        local_day = _to_local_date(row.fecha_hora)
        if not local_day:
            continue
        key = local_day.isoformat()
        movimientos_por_dia[key] = movimientos_por_dia.get(key, 0) + 1

    for row in chequeos_rango_raw:
        local_day = _to_local_date(row.fecha_hora)
        if not local_day:
            continue
        key = local_day.isoformat()
        chequeos_por_dia[key] = chequeos_por_dia.get(key, 0) + 1

    etiquetas = []
    serie_movimientos = []
    serie_chequeos = []
    for offset in range(dias):
        current_date = inicio_rango_dia + timedelta(days=offset)
        key = current_date.isoformat()
        etiquetas.append(current_date.strftime("%d/%m"))
        serie_movimientos.append(movimientos_por_dia.get(key, 0))
        serie_chequeos.append(chequeos_por_dia.get(key, 0))

    movimientos_por_tipo_raw = (
        db.query(
            Movimiento.tipo,
            func.count(Movimiento.id).label("total"),
        )
        .filter(Movimiento.fecha_hora >= inicio_rango, Movimiento.fecha_hora <= fin_hoy)
        .group_by(Movimiento.tipo)
        .all()
    )
    movimientos_por_tipo = {str(row.tipo): int(row.total) for row in movimientos_por_tipo_raw}

    top_vehiculos_raw = (
        db.query(
            Vehiculo.id.label("vehiculo_id"),
            Vehiculo.placa.label("placa"),
            func.count(Movimiento.id).label("total"),
        )
        .join(Movimiento, Movimiento.vehiculo_id == Vehiculo.id)
        .filter(Movimiento.fecha_hora >= inicio_rango, Movimiento.fecha_hora <= fin_hoy)
        .group_by(Vehiculo.id, Vehiculo.placa)
        .order_by(func.count(Movimiento.id).desc())
        .limit(5)
        .all()
    )

    top_vehiculos = [
        {
            "vehiculo_id": int(row.vehiculo_id),
            "placa": row.placa,
            "total": int(row.total),
        }
        for row in top_vehiculos_raw
    ]

    return {
        "totales": {
            "vehiculos_activos": db.query(Vehiculo).filter(Vehiculo.activo.is_(True)).count(),
            "conductores_activos": db.query(Conductor).filter(Conductor.activo.is_(True)).count(),
            "movimientos_hoy": db.query(Movimiento)
            .filter(Movimiento.fecha_hora >= inicio_hoy, Movimiento.fecha_hora <= fin_hoy)
            .count(),
            "chequeos_hoy": db.query(Chequeo)
            .filter(Chequeo.fecha_hora >= inicio_hoy, Chequeo.fecha_hora <= fin_hoy)
            .count(),
        },
        "analitica": {
            "dias": dias,
            "series": {
                "labels": etiquetas,
                "movimientos": serie_movimientos,
                "chequeos": serie_chequeos,
            },
            "movimientos_tipo": {
                "entrada": movimientos_por_tipo.get("entrada", 0),
                "salida": movimientos_por_tipo.get("salida", 0),
            },
            "top_vehiculos": top_vehiculos,
        },
    }
