from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from datetime import datetime

from app.db.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.models import NuevaOrdenActividad, OrdenTrabajo, Usuario
from app.schemas.orden_actividad import (
    OrdenActividadCreate, OrdenActividadUpdate, OrdenActividadResponse
)

router = APIRouter(prefix="/ordenes-actividades", tags=["Actividades"])


@router.get("/", response_model=List[OrdenActividadResponse])
def listar_actividades(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    orden_id: Optional[int] = None,
    estado: Optional[str] = None,
    responsable_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    query = db.query(NuevaOrdenActividad).options(
        joinedload(NuevaOrdenActividad.responsable),
        joinedload(NuevaOrdenActividad.evidencias),
    )
    if orden_id:
        query = query.filter(NuevaOrdenActividad.orden_id == orden_id)
    if estado:
        query = query.filter(NuevaOrdenActividad.estado == estado)
    if responsable_id:
        query = query.filter(NuevaOrdenActividad.responsable_id == responsable_id)
    if current_user.rol == "mecanico":
        query = query.filter(NuevaOrdenActividad.responsable_id == current_user.id)
    query = query.order_by(NuevaOrdenActividad.fecha_creacion.asc())
    query = query.offset(skip).limit(limit)
    return query.all()


@router.get("/{actividad_id}", response_model=OrdenActividadResponse)
def obtener_actividad(
    actividad_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    a = db.query(NuevaOrdenActividad).options(
        joinedload(NuevaOrdenActividad.responsable),
        joinedload(NuevaOrdenActividad.evidencias),
    ).filter(NuevaOrdenActividad.id == actividad_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    return a


@router.post("/", response_model=OrdenActividadResponse, status_code=status.HTTP_201_CREATED)
def crear_actividad(
    data: OrdenActividadCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos"])),
):
    orden = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == data.orden_id).first()
    if not orden:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")

    a = NuevaOrdenActividad(
        orden_id=data.orden_id,
        responsable_id=data.responsable_id or current_user.id,
        titulo=data.titulo,
        descripcion=data.descripcion,
    )
    if orden.estado == "pendiente":
        orden.estado = "asignada"
    db.add(a)
    db.commit()
    db.refresh(a)
    a = db.query(NuevaOrdenActividad).options(
        joinedload(NuevaOrdenActividad.responsable),
        joinedload(NuevaOrdenActividad.evidencias),
    ).filter(NuevaOrdenActividad.id == a.id).first()
    return a


@router.put("/{actividad_id}", response_model=OrdenActividadResponse)
def actualizar_actividad(
    actividad_id: int,
    data: OrdenActividadUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    a = db.query(NuevaOrdenActividad).filter(NuevaOrdenActividad.id == actividad_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    if current_user.rol == "mecanico" and a.responsable_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta actividad")

    if data.titulo is not None:
        a.titulo = data.titulo
    if data.descripcion is not None:
        a.descripcion = data.descripcion
    if data.responsable_id is not None:
        a.responsable_id = data.responsable_id
    if data.estado is not None:
        a.estado = data.estado
        if data.estado == "en_progreso" and not a.fecha_inicio:
            a.fecha_inicio = datetime.utcnow()
        if data.estado == "completada":
            a.fecha_fin = datetime.utcnow()
    if data.fecha_inicio is not None:
        a.fecha_inicio = data.fecha_inicio
    if data.fecha_fin is not None:
        a.fecha_fin = data.fecha_fin

    db.commit()
    db.refresh(a)
    a = db.query(NuevaOrdenActividad).options(
        joinedload(NuevaOrdenActividad.responsable),
        joinedload(NuevaOrdenActividad.evidencias),
    ).filter(NuevaOrdenActividad.id == a.id).first()
    return a


@router.delete("/{actividad_id}")
def eliminar_actividad(
    actividad_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos"])),
):
    a = db.query(NuevaOrdenActividad).filter(NuevaOrdenActividad.id == actividad_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    db.delete(a)
    db.commit()
    return {"message": "Actividad eliminada"}
