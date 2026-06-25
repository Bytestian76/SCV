from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from datetime import datetime

from app.db.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.models import OrdenTrabajo, Hallazgo, Usuario
from app.schemas.orden_trabajo import (
    OrdenTrabajoCreate, OrdenTrabajoUpdate, OrdenTrabajoResponse,
    ESTADOS_ORDEN
)

router = APIRouter(prefix="/ordenes-trabajo", tags=["Órdenes de Trabajo"])


def _build_orden_response(o: OrdenTrabajo) -> dict:
    return {
        "id": o.id,
        "hallazgo_id": o.hallazgo_id,
        "vehiculo_id": o.vehiculo_id,
        "responsable_id": o.responsable_id,
        "responsable_externo": o.responsable_externo,
        "prioridad": o.prioridad,
        "estado": o.estado,
        "descripcion": o.descripcion,
        "fecha_creacion": o.fecha_creacion,
        "fecha_inicio": o.fecha_inicio,
        "fecha_cierre": o.fecha_cierre,
        "hora_inicio": o.hora_inicio,
        "hora_fin": o.hora_fin,
        "hallazgo": {"id": o.hallazgo.id, "descripcion": o.hallazgo.descripcion} if o.hallazgo else None,
        "vehiculo": {"id": o.vehiculo.id, "placa": o.vehiculo.placa} if o.vehiculo else None,
        "responsable": {"id": o.responsable.id, "nombre": o.responsable.nombre} if o.responsable else None,
        "actividades": [{"id": a.id, "titulo": a.titulo, "estado": a.estado} for a in o.actividades] if o.actividades else [],
        "costos": [{"id": c.id, "tipo_gasto": c.tipo_gasto, "valor_total": c.valor_total} for c in o.costos] if o.costos else [],
        "evidencias": [{"id": e.id, "tipo": e.tipo, "nombre_original": e.nombre_original} for e in o.evidencias] if o.evidencias else [],
    }


@router.get("/", response_model=List[OrdenTrabajoResponse])
def listar_ordenes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    estado: Optional[str] = None,
    prioridad: Optional[str] = None,
    vehiculo_id: Optional[int] = None,
    responsable_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    query = db.query(OrdenTrabajo).options(
        joinedload(OrdenTrabajo.hallazgo),
        joinedload(OrdenTrabajo.vehiculo),
        joinedload(OrdenTrabajo.responsable),
        joinedload(OrdenTrabajo.actividades),
        joinedload(OrdenTrabajo.costos),
        joinedload(OrdenTrabajo.evidencias),
    )
    if estado:
        query = query.filter(OrdenTrabajo.estado == estado)
    if prioridad:
        query = query.filter(OrdenTrabajo.prioridad == prioridad)
    if vehiculo_id:
        query = query.filter(OrdenTrabajo.vehiculo_id == vehiculo_id)
    if responsable_id:
        query = query.filter(OrdenTrabajo.responsable_id == responsable_id)
    if current_user.rol == "mecanico":
        query = query.filter(OrdenTrabajo.responsable_id == current_user.id)
    if search:
        from app.models.models import Vehiculo
        search_term = f"%{search}%"
        query = query.join(OrdenTrabajo.vehiculo).filter(
            (OrdenTrabajo.descripcion.ilike(search_term)) |
            (Vehiculo.placa.ilike(search_term))
        )
    query = query.order_by(OrdenTrabajo.fecha_creacion.desc())
    query = query.offset(skip).limit(limit)
    return [_build_orden_response(o) for o in query.all()]


@router.get("/{orden_id}", response_model=OrdenTrabajoResponse)
def obtener_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    o = db.query(OrdenTrabajo).options(
        joinedload(OrdenTrabajo.hallazgo),
        joinedload(OrdenTrabajo.vehiculo),
        joinedload(OrdenTrabajo.responsable),
        joinedload(OrdenTrabajo.actividades),
        joinedload(OrdenTrabajo.costos),
        joinedload(OrdenTrabajo.evidencias),
    ).filter(OrdenTrabajo.id == orden_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    if current_user.rol == "mecanico" and o.responsable_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta orden")
    return _build_orden_response(o)


@router.post("/", response_model=OrdenTrabajoResponse, status_code=status.HTTP_201_CREATED)
def crear_orden(
    data: OrdenTrabajoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos"])),
):
    hallazgo = None
    if data.hallazgo_id is not None:
        hallazgo = db.query(Hallazgo).filter(Hallazgo.id == data.hallazgo_id).first()
        if not hallazgo:
            raise HTTPException(status_code=404, detail="Hallazgo no encontrado")
        if hallazgo.estado != "evaluado":
            raise HTTPException(status_code=400, detail="El hallazgo debe estar evaluado antes de crear una orden")

    o = OrdenTrabajo(
        hallazgo_id=data.hallazgo_id,
        vehiculo_id=data.vehiculo_id,
        responsable_id=data.responsable_id,
        responsable_externo=data.responsable_externo,
        prioridad=data.prioridad,
        descripcion=data.descripcion,
        hora_inicio=data.hora_inicio,
        hora_fin=data.hora_fin,
    )
    if hallazgo:
        hallazgo.estado = "convertido_orden"
    db.add(o)
    db.commit()
    db.refresh(o)

    # Log creation in order history
    from app.models.models import OrdenHistorial
    hist = OrdenHistorial(
        orden_id=o.id,
        usuario_id=current_user.id,
        accion="Creación de la orden de trabajo",
        tabla="ordenes_trabajo",
        campo="id",
        valor_anterior=None,
        valor_nuevo=str(o.id)
    )
    db.add(hist)
    db.commit()
    o = db.query(OrdenTrabajo).options(
        joinedload(OrdenTrabajo.hallazgo),
        joinedload(OrdenTrabajo.vehiculo),
        joinedload(OrdenTrabajo.responsable),
        joinedload(OrdenTrabajo.actividades),
        joinedload(OrdenTrabajo.costos),
        joinedload(OrdenTrabajo.evidencias),
    ).filter(OrdenTrabajo.id == o.id).first()
    return _build_orden_response(o)


@router.put("/{orden_id}", response_model=OrdenTrabajoResponse)
def actualizar_orden(
    orden_id: int,
    data: OrdenTrabajoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos"])),
):
    o = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == orden_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    if data.responsable_id is not None:
        o.responsable_id = data.responsable_id
        if data.responsable_id is not None and o.estado == "pendiente":
            o.estado = "asignada"
    if data.responsable_externo is not None:
        o.responsable_externo = data.responsable_externo
        if data.responsable_externo != "" and o.estado == "pendiente":
            o.estado = "asignada"
    if data.prioridad is not None:
        o.prioridad = data.prioridad
    if data.estado is not None:
        if data.estado == "completada" and not o.fecha_cierre:
            o.fecha_cierre = datetime.utcnow()
        o.estado = data.estado
    if data.descripcion is not None:
        o.descripcion = data.descripcion
    if data.fecha_inicio is not None:
        o.fecha_inicio = data.fecha_inicio
    if data.hora_inicio is not None:
        o.hora_inicio = data.hora_inicio
    if data.hora_fin is not None:
        o.hora_fin = data.hora_fin
    db.commit()
    db.refresh(o)
    o = db.query(OrdenTrabajo).options(
        joinedload(OrdenTrabajo.hallazgo),
        joinedload(OrdenTrabajo.vehiculo),
        joinedload(OrdenTrabajo.responsable),
        joinedload(OrdenTrabajo.actividades),
        joinedload(OrdenTrabajo.costos),
        joinedload(OrdenTrabajo.evidencias),
    ).filter(OrdenTrabajo.id == o.id).first()
    return _build_orden_response(o)
@router.put("/{orden_id}/estado", response_model=OrdenTrabajoResponse)
def cambiar_estado_orden(
    orden_id: int,
    data: OrdenTrabajoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    o = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == orden_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    
    # Mecanicos can only change state of their assigned orders
    if current_user.rol == "mecanico" and o.responsable_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar esta orden")

    if data.estado is not None:
        estado_anterior = o.estado
        o.estado = data.estado
        if data.estado == "completada" and not o.fecha_cierre:
            o.fecha_cierre = datetime.utcnow()
        elif data.estado == "en_progreso" and not o.fecha_inicio:
            o.fecha_inicio = datetime.utcnow()

        # Log change in order history
        from app.models.models import OrdenHistorial
        hist = OrdenHistorial(
            orden_id=orden_id,
            usuario_id=current_user.id,
            accion=f"Cambió el estado de '{estado_anterior}' a '{data.estado}'",
            tabla="ordenes_trabajo",
            campo="estado",
            valor_anterior=estado_anterior,
            valor_nuevo=data.estado
        )
        db.add(hist)

    db.commit()
    db.refresh(o)
    
    o = db.query(OrdenTrabajo).options(
        joinedload(OrdenTrabajo.hallazgo),
        joinedload(OrdenTrabajo.vehiculo),
        joinedload(OrdenTrabajo.responsable),
        joinedload(OrdenTrabajo.actividades),
        joinedload(OrdenTrabajo.costos),
        joinedload(OrdenTrabajo.evidencias),
    ).filter(OrdenTrabajo.id == o.id).first()
    return _build_orden_response(o)
