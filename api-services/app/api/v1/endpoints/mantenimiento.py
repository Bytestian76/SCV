from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.usuario import Usuario
from app.models.vehiculo import Vehiculo
from app.models.hallazgo import Hallazgo
from app.models.orden_trabajo import (
    OrdenTrabajo,
    OrdenActividad,
    OrdenCosto,
    OrdenEvidencia,
    OrdenHistorial,
)
from app.schemas.hallazgo import HallazgoCreate, HallazgoUpdate, HallazgoResponse, ConvertirOTRequest
from app.schemas.orden_trabajo import (
    OrdenTrabajoCreate,
    OrdenTrabajoUpdate,
    OrdenTrabajoResponse,
    OrdenActividadCreate,
    OrdenActividadResponse,
    OrdenCostoCreate,
    OrdenCostoResponse,
    OrdenEvidenciaCreate,
    OrdenEvidenciaResponse,
)

router = APIRouter()


# --- HALLAZGOS ---

@router.get("/hallazgos", response_model=List[HallazgoResponse], summary="Listar Hallazgos / Anomalías")
def get_hallazgos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    estado: Optional[str] = Query(None, description="Filtrar por estado (abierto, en_orden, resuelto)"),
    criticidad: Optional[str] = Query(None, description="Filtrar por criticidad"),
    vehiculo_id: Optional[int] = Query(None, description="Filtrar por vehículo"),
    skip: int = 0,
    limit: int = 50,
):
    query = db.query(Hallazgo).join(Vehiculo)
    if estado:
        query = query.filter(Hallazgo.estado == estado)
    if criticidad:
        query = query.filter(Hallazgo.criticidad == criticidad)
    if vehiculo_id:
        query = query.filter(Hallazgo.vehiculo_id == vehiculo_id)

    return query.order_by(desc(Hallazgo.fecha_registro)).offset(skip).limit(limit).all()


@router.post("/hallazgos", response_model=HallazgoResponse, status_code=status.HTTP_201_CREATED, summary="Reportar Hallazgo Manual")
def create_hallazgo(
    hallazgo_in: HallazgoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == hallazgo_in.vehiculo_id).first()
    if not vehiculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehículo no encontrado")

    hallazgo = Hallazgo(
        vehiculo_id=hallazgo_in.vehiculo_id,
        usuario_reporta_id=current_user.id,
        chequeo_item_id=hallazgo_in.chequeo_item_id,
        origen=hallazgo_in.origen,
        descripcion=hallazgo_in.descripcion,
        criticidad=hallazgo_in.criticidad,
        estado=hallazgo_in.estado,
    )
    db.add(hallazgo)
    db.commit()
    db.refresh(hallazgo)
    return hallazgo


# --- ÓRDENES DE TRABAJO ---

@router.get("/ordenes", response_model=List[OrdenTrabajoResponse], summary="Listar Órdenes de Trabajo")
def get_ordenes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    prioridad: Optional[str] = Query(None, description="Filtrar por prioridad"),
    responsable_id: Optional[int] = Query(None, description="Filtrar por mecánico asignado"),
    skip: int = 0,
    limit: int = 50,
):
    query = db.query(OrdenTrabajo).join(Vehiculo)
    if estado:
        query = query.filter(OrdenTrabajo.estado == estado)
    if prioridad:
        query = query.filter(OrdenTrabajo.prioridad == prioridad)
    if responsable_id:
        query = query.filter(OrdenTrabajo.responsable_id == responsable_id)

    return query.order_by(desc(OrdenTrabajo.fecha_creacion)).offset(skip).limit(limit).all()


@router.post("/ordenes", response_model=OrdenTrabajoResponse, status_code=status.HTTP_201_CREATED, summary="Crear Orden de Trabajo")
def create_orden_trabajo(
    orden_in: OrdenTrabajoCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == orden_in.vehiculo_id).first()
    if not vehiculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehículo no encontrado")

    # Si se asocia a un hallazgo, actualizar estado del hallazgo a 'en_orden'
    if orden_in.hallazgo_id:
        hallazgo = db.query(Hallazgo).filter(Hallazgo.id == orden_in.hallazgo_id).first()
        if hallazgo:
            hallazgo.estado = "en_orden"

    # Marcar vehículo como 'en_taller'
    vehiculo.estado = "en_taller"

    orden = OrdenTrabajo(
        codigo=orden_in.codigo,
        vehiculo_id=orden_in.vehiculo_id,
        hallazgo_id=orden_in.hallazgo_id,
        creado_por_id=current_user.id,
        responsable_id=orden_in.responsable_id,
        prioridad=orden_in.prioridad,
        estado=orden_in.estado,
        descripcion=orden_in.descripcion,
    )
    db.add(orden)
    db.flush()

    # Registrar en Auditoría Inmutable
    historial = OrdenHistorial(
        orden_id=orden.id,
        usuario_id=current_user.id,
        accion="creacion_orden",
        campo_modificado="estado",
        valor_anterior=None,
        valor_nuevo=orden.estado,
        ip_usuario=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(historial)
    db.commit()
    db.refresh(orden)
    return orden


@router.get("/ordenes/{id}", response_model=OrdenTrabajoResponse, summary="Detalle de Orden de Trabajo")
def get_orden_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    orden = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == id).first()
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden de trabajo no encontrada")
    return orden


@router.put("/ordenes/{id}", response_model=OrdenTrabajoResponse, summary="Actualizar Estado o Detalles de Orden")
def update_orden_trabajo(
    id: int,
    orden_in: OrdenTrabajoUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    orden = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == id).first()
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden de trabajo no encontrada")

    update_data = orden_in.model_dump(exclude_unset=True)
    
    # Registro de auditoría para cada campo modificado
    for field, new_val in update_data.items():
        old_val = getattr(orden, field)
        if str(old_val) != str(new_val):
            historial = OrdenHistorial(
                orden_id=orden.id,
                usuario_id=current_user.id,
                accion=f"cambio_{field}",
                campo_modificado=field,
                valor_anterior=str(old_val),
                valor_nuevo=str(new_val),
                ip_usuario=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
            )
            db.add(historial)
            setattr(orden, field, new_val)

    # Si se completa, cerrar fecha y regresar vehículo a activo
    if orden_in.estado == "completada":
        orden.fecha_cierre = datetime.now(timezone.utc)
        if orden.vehiculo:
            orden.vehiculo.estado = "activo"
        if orden.hallazgo:
            orden.hallazgo.estado = "resuelto"

    db.commit()
    db.refresh(orden)
    return orden


@router.delete("/ordenes/{id}", summary="Eliminar Orden de Trabajo")
def delete_orden(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    orden = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == id).first()
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden de trabajo no encontrada")

    # Restaurar vehículo a activo si no tiene otras órdenes abiertas
    if orden.vehiculo:
        orden.vehiculo.estado = "activo"

    # Eliminar actividades y costos asociados
    db.query(OrdenActividad).filter(OrdenActividad.orden_id == id).delete()
    db.query(OrdenCosto).filter(OrdenCosto.orden_id == id).delete()
    db.query(OrdenHistorial).filter(OrdenHistorial.orden_id == id).delete()
    db.delete(orden)
    db.commit()
    return {"message": "Orden de trabajo eliminada correctamente"}



# --- ACTIVIDADES & COSTOS ---

@router.post("/ordenes/{id}/actividades", response_model=OrdenActividadResponse, summary="Agregar Actividad a Orden")
def add_actividad(
    id: int,
    actividad_in: OrdenActividadCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    orden = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == id).first()
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden de trabajo no encontrada")

    actividad = OrdenActividad(
        orden_id=id,
        titulo=actividad_in.titulo,
        descripcion=actividad_in.descripcion,
        estado=actividad_in.estado,
    )
    db.add(actividad)
    db.commit()
    db.refresh(actividad)
    return actividad


@router.get("/hallazgos/{id}", response_model=HallazgoResponse, summary="Detalle de Hallazgo")
def get_hallazgo_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    hallazgo = db.query(Hallazgo).filter(Hallazgo.id == id).first()
    if not hallazgo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hallazgo no encontrado")
    return hallazgo


@router.post("/hallazgos/{id}/evaluar-y-convertir-ot", response_model=OrdenTrabajoResponse, summary="Evaluar Hallazgo y Convertir en Orden de Trabajo")
def evaluar_y_convertir_ot(
    id: int,
    eval_in: ConvertirOTRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    hallazgo = db.query(Hallazgo).filter(Hallazgo.id == id).first()
    if not hallazgo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hallazgo no encontrado")

    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == hallazgo.vehiculo_id).first()
    if not vehiculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehículo asociado no encontrado")

    # Actualizar clasificación del hallazgo
    hallazgo.categoria = eval_in.categoria or "mecanica"
    hallazgo.criticidad = eval_in.prioridad or "alta"
    hallazgo.estado = "en_orden"

    # Generar código correlativo de OT (ej. OT-2026-0001)
    año_actual = datetime.now().year
    total_ots_año = db.query(OrdenTrabajo).filter(OrdenTrabajo.codigo.like(f"OT-{año_actual}-%")).count()
    codigo_ot = f"OT-{año_actual}-{total_ots_año + 1:04d}"

    # Poner vehículo en taller
    vehiculo.estado = "en_taller"

    descripcion_ot = eval_in.descripcion_trabajo if eval_in.descripcion_trabajo else f"Reparación por hallazgo en {hallazgo.categoria.upper()}: {hallazgo.descripcion}"

    orden = OrdenTrabajo(
        codigo=codigo_ot,
        vehiculo_id=vehiculo.id,
        hallazgo_id=hallazgo.id,
        creado_por_id=current_user.id,
        responsable_id=eval_in.responsable_id,
        prioridad=eval_in.prioridad,
        estado="en_progreso",
        descripcion=descripcion_ot,
        fecha_inicio=datetime.now(timezone.utc),
    )
    db.add(orden)
    db.flush()

    # Historial de Auditoría Inmutable
    historial = OrdenHistorial(
        orden_id=orden.id,
        usuario_id=current_user.id,
        accion="conversion_desde_hallazgo",
        campo_modificado="estado",
        valor_anterior="hallazgo_abierto",
        valor_nuevo="en_progreso",
        ip_usuario=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(historial)
    db.commit()
    db.refresh(orden)
    return orden


@router.put("/ordenes/{id}/completar", response_model=OrdenTrabajoResponse, summary="Completar y Cerrar Orden de Trabajo con Auditoría")
def completar_orden_trabajo(
    id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    orden = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == id).first()
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden de trabajo no encontrada")

    orden.estado = "completada"
    orden.fecha_cierre = datetime.now(timezone.utc)

    # Si provenía de un hallazgo, resolverlo
    if orden.hallazgo_id:
        hallazgo = db.query(Hallazgo).filter(Hallazgo.id == orden.hallazgo_id).first()
        if hallazgo:
            hallazgo.estado = "resuelto"

    # Validar si el vehículo tiene otras órdenes abiertas en taller
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == orden.vehiculo_id).first()
    if vehiculo:
        otras_abiertas = db.query(OrdenTrabajo).filter(
            OrdenTrabajo.vehiculo_id == vehiculo.id,
            OrdenTrabajo.id != orden.id,
            OrdenTrabajo.estado.in_(["pendiente", "en_progreso"])
        ).count()
        if otras_abiertas == 0:
            vehiculo.estado = "activo"

    historial = OrdenHistorial(
        orden_id=orden.id,
        usuario_id=current_user.id,
        accion="cierre_orden",
        campo_modificado="estado",
        valor_anterior="en_progreso",
        valor_nuevo="completada",
        ip_usuario=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(historial)
    db.commit()
    db.refresh(orden)
    return orden


@router.get("/vehiculos/{id}/hoja-de-vida", summary="Consultar Hoja de Vida y Trazabilidad de Mantenimiento Inmutable")
def get_hoja_de_vida_vehiculo(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == id).first()
    if not vehiculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehículo no encontrado")

    ordenes = db.query(OrdenTrabajo).filter(OrdenTrabajo.vehiculo_id == id).order_by(desc(OrdenTrabajo.fecha_creacion)).all()
    hallazgos = db.query(Hallazgo).filter(Hallazgo.vehiculo_id == id).order_by(desc(Hallazgo.fecha_registro)).all()

    # Importar Chequeo localmente para evitar circular imports si existiesen
    from app.models.chequeo import Chequeo
    chequeos = db.query(Chequeo).filter(Chequeo.vehiculo_id == id).order_by(desc(Chequeo.fecha_registro)).limit(30).all()

    # Calcular costo total acumulado en mantenimientos
    from sqlalchemy import func
    total_costos = db.query(func.sum(OrdenCosto.total_calculado)).join(OrdenTrabajo).filter(
        OrdenTrabajo.vehiculo_id == id
    ).scalar() or 0

    return {
        "vehiculo": {
            "id": vehiculo.id,
            "placa": vehiculo.placa,
            "marca": vehiculo.marca,
            "modelo": vehiculo.modelo,
            "año": vehiculo.año,
            "kilometraje": vehiculo.kilometraje,
            "estado": vehiculo.estado,
            "fecha_venc_soat": str(vehiculo.fecha_venc_soat) if vehiculo.fecha_venc_soat else None,
            "fecha_venc_rtm": str(vehiculo.fecha_venc_rtm) if vehiculo.fecha_venc_rtm else None,
        },
        "resumen": {
            "total_ordenes": len(ordenes),
            "ordenes_completadas": sum(1 for o in ordenes if o.estado == "completada"),
            "ordenes_en_progreso": sum(1 for o in ordenes if o.estado in ["pendiente", "en_progreso"]),
            "total_hallazgos": len(hallazgos),
            "total_chequeos": len(chequeos),
            "inversion_mantenimiento_total": float(total_costos),
        },
        "ordenes_trabajo": [
            {
                "id": o.id,
                "codigo": o.codigo,
                "prioridad": o.prioridad,
                "estado": o.estado,
                "descripcion": o.descripcion,
                "mecanico": o.responsable.nombre if o.responsable else "Sin asignar",
                "fecha_creacion": o.fecha_creacion.isoformat() if o.fecha_creacion else None,
                "fecha_inicio": o.fecha_inicio.isoformat() if o.fecha_inicio else None,
                "fecha_cierre": o.fecha_cierre.isoformat() if o.fecha_cierre else None,
                "actividades": [{"id": a.id, "titulo": a.titulo, "estado": a.estado} for a in o.actividades],
                "costos": [{"id": c.id, "descripcion": c.descripcion, "total": float(c.total_calculado)} for c in o.costos],
                "costo_total": float(sum(c.total_calculado for c in o.costos)),
            }
            for o in ordenes
        ],
        "hallazgos": [
            {
                "id": h.id,
                "origen": h.origen,
                "categoria": h.categoria,
                "descripcion": h.descripcion,
                "criticidad": h.criticidad,
                "estado": h.estado,
                "fecha": h.fecha_registro.isoformat() if h.fecha_registro else None,
                "reportado_por": h.usuario_reporta.nombre if h.usuario_reporta else "Inspector",
            }
            for h in hallazgos
        ],
        "chequeos_recientes": [
            {
                "id": ch.id,
                "fecha": ch.fecha_registro.isoformat() if ch.fecha_registro else None,
                "kilometraje": ch.kilometraje,
                "aprobado": ch.aprobado,
                "inspector": ch.usuario.nombre if ch.usuario else "Conductor",
                "observaciones": ch.observaciones_generales,
            }
            for ch in chequeos
        ]
    }
