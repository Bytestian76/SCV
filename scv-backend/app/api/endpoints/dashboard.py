"""Endpoints de Dashboard"""

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.dependencies import require_role, get_current_user
from app.db.database import get_db
from app.models.models import Chequeo, Conductor, Mantenimiento, Movimiento, Vehiculo, OrdenCosto

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

    costo_total = db.query(func.coalesce(func.sum(OrdenCosto.total), 0)).scalar() or 0
    costo_mes = db.query(func.coalesce(func.sum(OrdenCosto.total), 0)).filter(
        OrdenCosto.created_at >= inicio_rango
    ).scalar() or 0

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
        "costos": {
            "total_general": int(costo_total),
            "ultimos_dias": int(costo_mes),
        },
    }


@router.get("/mecanico")
def obtener_dashboard_mecanico(
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    pendientes = db.query(Mantenimiento).filter(Mantenimiento.estado == "pendiente").count()
    en_progreso = db.query(Mantenimiento).filter(Mantenimiento.estado == "en_progreso").count()
    esperando_repuesto = db.query(Mantenimiento).filter(Mantenimiento.estado == "esperando_repuesto").count()
    completados = db.query(Mantenimiento).filter(Mantenimiento.estado == "completado").count()

    pendientes_lista = (
        db.query(Mantenimiento)
        .filter(Mantenimiento.estado.in_(["pendiente", "en_progreso", "esperando_repuesto"]))
        .order_by(Mantenimiento.fecha_creacion.asc())
        .limit(10)
        .all()
    )

    return {
        "totales": {
            "pendientes": pendientes,
            "en_progreso": en_progreso,
            "esperando_repuesto": esperando_repuesto,
            "completados": completados,
        },
        "pendientes": [
            {
                "id": m.id,
                "vehiculo_id": m.vehiculo_id,
                "tipo": m.tipo,
                "descripcion": m.descripcion,
                "kilometraje": m.kilometraje,
                "fecha_creacion": m.fecha_creacion.isoformat() if m.fecha_creacion else None,
                "vehiculo": {
                    "id": m.vehiculo.id,
                    "placa": m.vehiculo.placa,
                    "marca": m.vehiculo.marca,
                    "modelo": m.vehiculo.modelo,
                } if m.vehiculo else None,
            }
            for m in pendientes_lista
        ],
    }


@router.get("/estadisticas-mantenimiento")
def obtener_estadisticas_mantenimiento(
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "jefe_mecanicos"])),
):
    """Estadísticas avanzadas de mantenimiento para gráficos y analíticas"""
    from app.models.models import OrdenTrabajo, NuevaOrdenCosto, Vehiculo
    from collections import defaultdict

    # 1. Costo Total Acumulado
    costo_total = db.query(func.coalesce(func.sum(NuevaOrdenCosto.valor_total), 0)).scalar() or 0

    # 2. Costos por Vehículo
    costos_vehiculo_raw = (
        db.query(
            Vehiculo.placa,
            Vehiculo.marca,
            Vehiculo.modelo,
            func.sum(NuevaOrdenCosto.valor_total).label("total_gasto")
        )
        .join(OrdenTrabajo, OrdenTrabajo.vehiculo_id == Vehiculo.id)
        .join(NuevaOrdenCosto, NuevaOrdenCosto.orden_id == OrdenTrabajo.id)
        .group_by(Vehiculo.id)
        .order_by(func.sum(NuevaOrdenCosto.valor_total).desc())
        .all()
    )
    costos_por_vehiculo = [
        {
            "placa": row.placa,
            "marca": row.marca,
            "modelo": row.modelo,
            "total_gasto": int(row.total_gasto)
        }
        for row in costos_vehiculo_raw
    ]

    # 3. Costos Mensuales (Últimos 12 meses)
    costos_mes_raw = (
        db.query(
            func.strftime("%Y-%m", NuevaOrdenCosto.fecha).label("mes"),
            func.sum(NuevaOrdenCosto.valor_total).label("total_gasto")
        )
        .group_by(func.strftime("%Y-%m", NuevaOrdenCosto.fecha))
        .order_by(func.strftime("%Y-%m", NuevaOrdenCosto.fecha).asc())
        .limit(12)
        .all()
    )
    costos_por_mes = [
        {
            "mes": row.mes,
            "total_gasto": int(row.total_gasto)
        }
        for row in costos_mes_raw
    ]

    # 4. Órdenes por Estado
    estado_raw = (
        db.query(OrdenTrabajo.estado, func.count(OrdenTrabajo.id))
        .group_by(OrdenTrabajo.estado)
        .all()
    )
    ordenes_por_estado = {str(row[0]): int(row[1]) for row in estado_raw}

    # 5. Órdenes por Prioridad
    prioridad_raw = (
        db.query(OrdenTrabajo.prioridad, func.count(OrdenTrabajo.id))
        .group_by(OrdenTrabajo.prioridad)
        .all()
    )
    ordenes_por_prioridad = {str(row[0]): int(row[1]) for row in prioridad_raw}

    # 6. Tiempo promedio entre mantenimientos (MTBM)
    orders = (
        db.query(OrdenTrabajo.vehiculo_id, OrdenTrabajo.fecha_creacion, OrdenTrabajo.fecha_cierre)
        .filter(OrdenTrabajo.estado == "completada")
        .order_by(OrdenTrabajo.vehiculo_id, OrdenTrabajo.fecha_creacion.asc())
        .all()
    )

    vehicle_orders = defaultdict(list)
    for o in orders:
        if o.fecha_creacion and o.fecha_cierre:
            vehicle_orders[o.vehiculo_id].append(o)

    intervals = []
    vehicle_intervals = {}
    for veh_id, ords in vehicle_orders.items():
        veh_intervals = []
        ords_sorted = sorted(ords, key=lambda x: x.fecha_cierre)
        for i in range(len(ords_sorted) - 1):
            closure = ords_sorted[i].fecha_cierre
            next_creation = ords_sorted[i+1].fecha_creacion
            if next_creation > closure:
                diff_hours = (next_creation - closure).total_seconds() / 3600.0
                intervals.append(diff_hours)
                veh_intervals.append(diff_hours)
        if veh_intervals:
            vehicle_intervals[veh_id] = sum(veh_intervals) / len(veh_intervals)

    vehiculos_info = {}
    if vehicle_intervals:
        vehiculos_db = db.query(Vehiculo).filter(Vehiculo.id.in_(list(vehicle_intervals.keys()))).all()
        for v in vehiculos_db:
            avg_hours = vehicle_intervals[v.id]
            vehiculos_info[v.id] = {
                "placa": v.placa,
                "marca": v.marca,
                "modelo": v.modelo,
                "promedio_horas": round(avg_hours, 1),
                "promedio_dias": round(avg_hours / 24.0, 1)
            }

    promedio_global_horas = sum(intervals) / len(intervals) if intervals else 0.0
    promedio_global_dias = promedio_global_horas / 24.0

    tiempo_entre_mantenimiento = {
        "promedio_global_dias": round(promedio_global_dias, 1),
        "promedio_global_horas": round(promedio_global_horas, 1),
        "vehiculos": sorted(list(vehiculos_info.values()), key=lambda x: x["promedio_dias"])
    }

    # 7. Costos por Tipo de Gasto
    costos_tipo_raw = (
        db.query(
            NuevaOrdenCosto.tipo_gasto,
            func.sum(NuevaOrdenCosto.valor_total).label("total_gasto")
        )
        .group_by(NuevaOrdenCosto.tipo_gasto)
        .all()
    )
    costos_por_tipo = {str(row.tipo_gasto): int(row.total_gasto) for row in costos_tipo_raw}

    # 8. Tiempo promedio de resolución de órdenes (en horas)
    resolucion_raw = (
        db.query(OrdenTrabajo.fecha_creacion, OrdenTrabajo.fecha_cierre)
        .filter(OrdenTrabajo.estado == "completada")
        .all()
    )
    tiempos_resolucion = []
    for o in resolucion_raw:
        if o.fecha_creacion and o.fecha_cierre and o.fecha_cierre > o.fecha_creacion:
            tiempos_resolucion.append((o.fecha_cierre - o.fecha_creacion).total_seconds() / 3600.0)
    avg_resolucion_horas = sum(tiempos_resolucion) / len(tiempos_resolucion) if tiempos_resolucion else 0.0

    # 9. Órdenes completadas por mecánico
    from app.models.models import Usuario
    mecanicos_raw = (
        db.query(
            Usuario.nombre,
            func.count(OrdenTrabajo.id).label("total_completadas")
        )
        .join(OrdenTrabajo, OrdenTrabajo.responsable_id == Usuario.id)
        .filter(OrdenTrabajo.estado == "completada")
        .group_by(Usuario.id)
        .all()
    )
    ordenes_por_mecanico = [
        {
            "nombre": row.nombre,
            "total_completadas": int(row.total_completadas)
        }
        for row in mecanicos_raw
    ]

    return {
        "costo_total": int(costo_total),
        "costos_por_vehiculo": costos_por_vehiculo,
        "costos_por_mes": costos_por_mes,
        "ordenes_por_estado": ordenes_por_estado,
        "ordenes_por_prioridad": ordenes_por_prioridad,
        "tiempo_entre_mantenimiento": tiempo_entre_mantenimiento,
        "costos_por_tipo": costos_por_tipo,
        "resolucion_promedio_horas": round(avg_resolucion_horas, 1),
        "ordenes_por_mecanico": ordenes_por_mecanico
    }


