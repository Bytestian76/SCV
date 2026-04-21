"""Endpoints de Dashboard"""

from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.dependencies import require_role
from app.db.database import get_db
from app.models.models import Chequeo, Conductor, Movimiento, Vehiculo

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def obtener_dashboard(
    dias: int = Query(7, ge=7, le=60, description="Rango de analitica en dias"),
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin"])),
):
    """Resumen general para dashboard administrativo"""
    dias = max(7, min(dias, 60))
    inicio_hoy = datetime.combine(date.today(), datetime.min.time())
    fin_hoy = datetime.combine(date.today(), datetime.max.time())
    inicio_rango_dia = date.today() - timedelta(days=dias - 1)
    inicio_rango = datetime.combine(inicio_rango_dia, datetime.min.time())

    movimientos_por_dia_raw = (
        db.query(
            func.date(Movimiento.fecha_hora).label("dia"),
            func.count(Movimiento.id).label("total"),
        )
        .filter(Movimiento.fecha_hora >= inicio_rango, Movimiento.fecha_hora <= fin_hoy)
        .group_by(func.date(Movimiento.fecha_hora))
        .all()
    )
    chequeos_por_dia_raw = (
        db.query(
            func.date(Chequeo.fecha_hora).label("dia"),
            func.count(Chequeo.id).label("total"),
        )
        .filter(Chequeo.fecha_hora >= inicio_rango, Chequeo.fecha_hora <= fin_hoy)
        .group_by(func.date(Chequeo.fecha_hora))
        .all()
    )

    movimientos_por_dia = {str(row.dia): int(row.total) for row in movimientos_por_dia_raw}
    chequeos_por_dia = {str(row.dia): int(row.total) for row in chequeos_por_dia_raw}

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
