from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from datetime import datetime

from app.db.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.models import NuevaOrdenEvidencia, OrdenTrabajo, Usuario
from app.schemas.orden_evidencia import (
    OrdenEvidenciaCreate, OrdenEvidenciaUpdate, OrdenEvidenciaResponse
)

router = APIRouter(prefix="/ordenes-evidencias", tags=["Evidencias"])


@router.get("/", response_model=List[OrdenEvidenciaResponse])
def listar_evidencias(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    orden_id: Optional[int] = None,
    actividad_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    query = db.query(NuevaOrdenEvidencia).options(
        joinedload(NuevaOrdenEvidencia.usuario),
    )
    if orden_id:
        query = query.filter(NuevaOrdenEvidencia.orden_id == orden_id)
    if actividad_id:
        query = query.filter(NuevaOrdenEvidencia.actividad_id == actividad_id)
    query = query.order_by(NuevaOrdenEvidencia.fecha_subida.desc())
    query = query.offset(skip).limit(limit)
    return query.all()


@router.get("/{evidencia_id}", response_model=OrdenEvidenciaResponse)
def obtener_evidencia(
    evidencia_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    e = db.query(NuevaOrdenEvidencia).options(
        joinedload(NuevaOrdenEvidencia.usuario),
    ).filter(NuevaOrdenEvidencia.id == evidencia_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Evidencia no encontrada")
    return e


@router.post("/", response_model=OrdenEvidenciaResponse, status_code=status.HTTP_201_CREATED)
def crear_evidencia(
    data: OrdenEvidenciaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    if not data.orden_id and not data.actividad_id:
        raise HTTPException(status_code=400, detail="Debe asociar la evidencia a una orden o actividad")

    e = NuevaOrdenEvidencia(
        orden_id=data.orden_id,
        actividad_id=data.actividad_id,
        usuario_id=current_user.id,
        tipo=data.tipo,
        ruta_archivo=data.ruta_archivo,
        nombre_original=data.nombre_original,
        descripcion=data.descripcion,
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    e = db.query(NuevaOrdenEvidencia).options(
        joinedload(NuevaOrdenEvidencia.usuario),
    ).filter(NuevaOrdenEvidencia.id == e.id).first()
    return e


@router.put("/{evidencia_id}", response_model=OrdenEvidenciaResponse)
def actualizar_evidencia(
    evidencia_id: int,
    data: OrdenEvidenciaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    e = db.query(NuevaOrdenEvidencia).filter(NuevaOrdenEvidencia.id == evidencia_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Evidencia no encontrada")
    if data.descripcion is not None:
        e.descripcion = data.descripcion
    if data.tipo is not None:
        e.tipo = data.tipo
    db.commit()
    db.refresh(e)
    return e


@router.delete("/{evidencia_id}")
def eliminar_evidencia(
    evidencia_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos"])),
):
    e = db.query(NuevaOrdenEvidencia).filter(NuevaOrdenEvidencia.id == evidencia_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Evidencia no encontrada")
    db.delete(e)
    db.commit()
    return {"message": "Evidencia eliminada"}
