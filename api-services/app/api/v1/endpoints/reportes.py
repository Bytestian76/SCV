"""
reportes.py — Endpoints para descarga de reportes en XLSX y PDF.
Todos los reportes usan el estilo visual corporativo de Normetales Movilidad.
"""
from datetime import datetime, date
from typing import Optional, Literal

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import Response, StreamingResponse
from sqlalchemy import desc, extract
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.usuario import Usuario
from app.models.movimiento import Movimiento
from app.models.vehiculo import Vehiculo
from app.models.chequeo import Chequeo
from app.models.hallazgo import Hallazgo
from app.models.orden_trabajo import OrdenTrabajo, OrdenCosto, OrdenHistorial
from app.core.report_builder import build_xlsx, build_pdf

router = APIRouter()

FormatoParam = Literal["xlsx", "pdf"]


# ═══════════════════════════════════════════════════════════════════════════
#  Helpers
# ═══════════════════════════════════════════════════════════════════════════

def _media_type(fmt: str) -> str:
    return (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        if fmt == "xlsx"
        else "application/pdf"
    )


def _ext(fmt: str) -> str:
    return "xlsx" if fmt == "xlsx" else "pdf"


def _make_response(data: bytes, filename: str, fmt: str) -> Response:
    return Response(
        content=data,
        media_type=_media_type(fmt),
        headers={
            "Content-Disposition": f'attachment; filename="{filename}.{_ext(fmt)}"',
            "Content-Length": str(len(data)),
        },
    )


def _fmt_dt(dt) -> str:
    if dt is None:
        return ""
    return dt.strftime("%d/%m/%Y %H:%M") if hasattr(dt, "hour") else str(dt)


def _fmt_d(d) -> str:
    if d is None:
        return ""
    return d.strftime("%d/%m/%Y") if hasattr(d, "strftime") else str(d)


# ═══════════════════════════════════════════════════════════════════════════
#  1. Reporte de Despacho y Báscula  (Movimientos)
# ═══════════════════════════════════════════════════════════════════════════

@router.get(
    "/despacho",
    summary="Reporte de Despacho y Báscula",
    description="Descarga el consolidado de movimientos (entradas/salidas) con báscula, "
                "kilómetros y sacas. Soporta filtros de fecha y formato XLSX o PDF.",
)
def reporte_despacho(
    formato: FormatoParam = Query("xlsx", description="Formato de descarga: xlsx o pdf"),
    fecha_inicio: Optional[date] = Query(None, description="Fecha de inicio del rango"),
    fecha_fin: Optional[date] = Query(None, description="Fecha de fin del rango"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo: entrada, salida"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = db.query(Movimiento).join(Vehiculo).join(Usuario)
    if fecha_inicio:
        query = query.filter(Movimiento.fecha_registro >= fecha_inicio)
    if fecha_fin:
        # Incluir todo el día fin
        from datetime import timedelta
        query = query.filter(Movimiento.fecha_registro < (datetime.combine(fecha_fin, datetime.max.time())))
    if tipo:
        query = query.filter(Movimiento.tipo == tipo.lower())

    movimientos = query.order_by(desc(Movimiento.fecha_registro)).all()

    total = len(movimientos)
    entradas = sum(1 for m in movimientos if m.tipo == "entrada")
    salidas = total - entradas

    # Metadata
    fi_str = _fmt_d(fecha_inicio) if fecha_inicio else "Sin límite"
    ff_str = _fmt_d(fecha_fin) if fecha_fin else "Sin límite"
    subtitulos = [
        f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}",
        f"Filtros: Fecha inicio: {fi_str} | Fecha fin: {ff_str}",
        f"Total movimientos: {total} | Entradas: {entradas} | Salidas: {salidas}",
    ]

    columnas = [
        "Fecha", "Tipo", "Placa", "Conductor", "Auxiliar",
        "Kilometraje", "Báscula (kg)", "Sacas", "Estado Cajón",
        "Proveedor/Destino", "Observaciones",
    ]

    filas = []
    for m in movimientos:
        bascula = str(m.bascula_peso) if m.bascula_peso is not None else "No registrado"
        filas.append([
            _fmt_dt(m.fecha_registro),
            m.tipo.capitalize() if m.tipo else "",
            m.vehiculo.placa if m.vehiculo else "",
            m.usuario.nombre if m.usuario else "",
            m.auxiliar or "",
            m.kilometraje if m.kilometraje is not None else 0,
            bascula,
            m.cantidad_sacas if m.cantidad_sacas is not None else 0,
            m.estado_cajon or "",
            m.proveedor or "",
            m.observaciones or "",
        ])

    if formato == "xlsx":
        data = build_xlsx("Reporte de Despacho y Báscula", subtitulos,
                          columnas, filas, tipo_col_idx=1)
    else:
        data = build_pdf("Reporte de Despacho y Báscula", subtitulos,
                         columnas, filas, tipo_col_idx=1)

    ts = datetime.now().strftime("%Y%m%d_%H%M")
    return _make_response(data, f"SCV_Despacho_{ts}", formato)


# ═══════════════════════════════════════════════════════════════════════════
#  2. Bitácora de Inspecciones Preoperacionales  (Chequeos)
# ═══════════════════════════════════════════════════════════════════════════

@router.get(
    "/inspecciones",
    summary="Bitácora de Inspecciones Preoperacionales",
    description="Descarga el historial de chequeos preoperacionales con ítems no conformes "
                "y hallazgos generados. Formato XLSX o PDF.",
)
def reporte_inspecciones(
    formato: FormatoParam = Query("xlsx"),
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin: Optional[date] = Query(None),
    aprobado: Optional[bool] = Query(None, description="True=aprobados, False=con novedad"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = db.query(Chequeo).join(Vehiculo).join(Usuario)
    if fecha_inicio:
        query = query.filter(Chequeo.fecha_registro >= fecha_inicio)
    if fecha_fin:
        query = query.filter(Chequeo.fecha_registro < datetime.combine(fecha_fin, datetime.max.time()))
    if aprobado is not None:
        query = query.filter(Chequeo.aprobado == aprobado)

    chequeos = query.order_by(desc(Chequeo.fecha_registro)).all()

    total = len(chequeos)
    aprobados = sum(1 for c in chequeos if c.aprobado)
    con_novedad = total - aprobados

    fi_str = _fmt_d(fecha_inicio) if fecha_inicio else "Sin límite"
    ff_str = _fmt_d(fecha_fin) if fecha_fin else "Sin límite"
    subtitulos = [
        f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}",
        f"Filtros: Fecha inicio: {fi_str} | Fecha fin: {ff_str}",
        f"Total inspecciones: {total} | Aprobadas: {aprobados} | Con novedad: {con_novedad}",
    ]

    columnas = [
        "Fecha", "Placa", "Inspector", "Kilometraje",
        "Estado", "Venc. SOAT", "Venc. RTM", "Venc. Extintor",
        "No conformes", "Hallazgos generados", "Observaciones",
    ]

    filas = []
    for c in chequeos:
        no_conformes = sum(1 for it in c.items if it.valor == "no_conforme")
        hallazgos_n = sum(1 for it in c.items for h in it.hallazgos)
        estado = "Aprobada" if c.aprobado else "Con novedad"
        filas.append([
            _fmt_dt(c.fecha_registro),
            c.vehiculo.placa if c.vehiculo else "",
            c.usuario.nombre if c.usuario else "",
            c.kilometraje,
            estado,
            _fmt_d(c.fecha_venc_soat),
            _fmt_d(c.fecha_venc_rtm),
            _fmt_d(c.fecha_venc_extintor),
            no_conformes,
            hallazgos_n,
            c.observaciones_generales or "",
        ])

    if formato == "xlsx":
        data = build_xlsx("Bitácora de Inspecciones", subtitulos, columnas, filas)
    else:
        data = build_pdf("Bitácora de Inspecciones", subtitulos, columnas, filas)

    ts = datetime.now().strftime("%Y%m%d_%H%M")
    return _make_response(data, f"SCV_Inspecciones_{ts}", formato)


# ═══════════════════════════════════════════════════════════════════════════
#  3. Informe Financiero de Taller  (Costos de Órdenes de Trabajo)
# ═══════════════════════════════════════════════════════════════════════════

@router.get(
    "/financiero",
    summary="Informe Financiero de Taller y Mantenimiento",
    description="Descarga el resumen de costos de repuestos, mano de obra y servicios "
                "por rango de fechas. Formato XLSX o PDF.",
)
def reporte_financiero(
    formato: FormatoParam = Query("xlsx"),
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin: Optional[date] = Query(None),
    mes: Optional[int] = Query(None, ge=1, le=12),
    anio: Optional[int] = Query(None, ge=2020, le=2100),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = db.query(OrdenCosto).join(OrdenTrabajo).join(Vehiculo)
    if fecha_inicio:
        query = query.filter(OrdenCosto.fecha_registro >= fecha_inicio)
    if fecha_fin:
        query = query.filter(OrdenCosto.fecha_registro < datetime.combine(fecha_fin, datetime.max.time()))
    if anio:
        query = query.filter(extract("year", OrdenCosto.fecha_registro) == anio)
    if mes:
        query = query.filter(extract("month", OrdenCosto.fecha_registro) == mes)

    costos = query.order_by(desc(OrdenCosto.fecha_registro)).all()

    total_gastos = sum(float(c.total_calculado) for c in costos)
    total_repuestos = sum(float(c.total_calculado) for c in costos if c.tipo_gasto == "repuesto")
    total_mano_obra = sum(float(c.total_calculado) for c in costos if c.tipo_gasto == "mano_obra")

    fi_str = _fmt_d(fecha_inicio) if fecha_inicio else "Sin límite"
    ff_str = _fmt_d(fecha_fin) if fecha_fin else "Sin límite"
    subtitulos = [
        f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}",
        f"Filtros: {fi_str} → {ff_str}",
        (
            f"Total gastos: ${total_gastos:,.0f} | "
            f"Repuestos: ${total_repuestos:,.0f} | "
            f"Mano de obra: ${total_mano_obra:,.0f}"
        ),
    ]

    columnas = [
        "Fecha", "OT Código", "Placa", "Tipo Gasto",
        "Descripción", "Cantidad", "Valor Unitario", "Total",
    ]

    filas = []
    for c in costos:
        filas.append([
            _fmt_dt(c.fecha_registro),
            c.orden.codigo if c.orden else "",
            c.orden.vehiculo.placa if c.orden and c.orden.vehiculo else "",
            c.tipo_gasto.replace("_", " ").title(),
            c.descripcion or "",
            float(c.cantidad),
            f"${float(c.valor_unitario):,.0f}",
            f"${float(c.total_calculado):,.0f}",
        ])

    if formato == "xlsx":
        data = build_xlsx("Informe Financiero de Taller", subtitulos, columnas, filas)
    else:
        data = build_pdf("Informe Financiero de Taller", subtitulos, columnas, filas)

    ts = datetime.now().strftime("%Y%m%d_%H%M")
    return _make_response(data, f"SCV_Financiero_{ts}", formato)


# ═══════════════════════════════════════════════════════════════════════════
#  4. Trazabilidad y Auditoría de Flota  (Historial de Órdenes)
# ═══════════════════════════════════════════════════════════════════════════

@router.get(
    "/auditoria",
    summary="Trazabilidad y Auditoría de Flota",
    description="Descarga el registro inmutable de cambios en órdenes de trabajo: "
                "usuario, IP, campo modificado y valores. Formato XLSX o PDF.",
)
def reporte_auditoria(
    formato: FormatoParam = Query("xlsx"),
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = db.query(OrdenHistorial).join(OrdenTrabajo)
    if fecha_inicio:
        query = query.filter(OrdenHistorial.fecha_registro >= fecha_inicio)
    if fecha_fin:
        query = query.filter(OrdenHistorial.fecha_registro < datetime.combine(fecha_fin, datetime.max.time()))

    registros = query.order_by(desc(OrdenHistorial.fecha_registro)).all()

    fi_str = _fmt_d(fecha_inicio) if fecha_inicio else "Sin límite"
    ff_str = _fmt_d(fecha_fin) if fecha_fin else "Sin límite"
    subtitulos = [
        f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}",
        f"Filtros: {fi_str} → {ff_str}",
        f"Total registros de auditoría: {len(registros)}",
    ]

    columnas = [
        "Fecha/Hora", "OT Código", "Usuario", "Acción",
        "Campo Modificado", "Valor Anterior", "Valor Nuevo",
        "IP Usuario",
    ]

    filas = []
    for r in registros:
        usuario_nombre = r.orden.creador.nombre if r.orden and r.orden.creador else "Sistema"
        filas.append([
            _fmt_dt(r.fecha_registro),
            r.orden.codigo if r.orden else "",
            usuario_nombre,
            r.accion or "",
            r.campo_modificado or "",
            r.valor_anterior or "",
            r.valor_nuevo or "",
            r.ip_usuario or "",
        ])

    if formato == "xlsx":
        data = build_xlsx("Auditoría de Flota", subtitulos, columnas, filas)
    else:
        data = build_pdf("Auditoría de Flota", subtitulos, columnas, filas)

    ts = datetime.now().strftime("%Y%m%d_%H%M")
    return _make_response(data, f"SCV_Auditoria_{ts}", formato)
