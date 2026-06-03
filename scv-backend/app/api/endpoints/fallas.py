"""Endpoints de Fallas Reportadas"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.dependencies import require_role
from app.db.database import get_db
from app.models.models import FallaReportada, Vehiculo, Conductor, Usuario
from app.schemas.falla import (
    CATEGORIAS_FALLA,
    ESTADOS_FALLA,
    PRIORIDADES_FALLA,
    FallaCreate,
    FallaEstadoUpdate,
    FallaListResponse,
    FallaResponse,
    FallaUpdate,
)

router = APIRouter(prefix="/fallas", tags=["Fallas"])


@router.get("/", response_model=List[FallaListResponse])
def listar_fallas(
    skip: int = 0,
    limit: int = 50,
    estado: Optional[str] = None,
    prioridad: Optional[str] = None,
    categoria: Optional[str] = None,
    vehiculo_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    query = db.query(FallaReportada)

    if estado:
        query = query.filter(FallaReportada.estado == estado)
    if prioridad:
        query = query.filter(FallaReportada.prioridad == prioridad)
    if categoria:
        query = query.filter(FallaReportada.categoria == categoria)
    if vehiculo_id:
        query = query.filter(FallaReportada.vehiculo_id == vehiculo_id)

    fallas = query.order_by(FallaReportada.fecha_reporte.desc()).offset(skip).limit(limit).all()

    return [
        FallaListResponse(
            id=f.id,
            vehiculo_id=f.vehiculo_id,
            conductor_id=f.conductor_id,
            categoria=f.categoria,
            descripcion=f.descripcion,
            prioridad=f.prioridad,
            estado=f.estado,
            fecha_reporte=f.fecha_reporte,
            created_at=f.created_at,
            vehiculo={
                "id": f.vehiculo.id,
                "placa": f.vehiculo.placa,
                "marca": f.vehiculo.marca,
                "modelo": f.vehiculo.modelo,
            } if f.vehiculo else None,
            conductor={
                "id": f.conductor.id,
                "nombre": f.conductor.nombre,
            } if f.conductor else None,
            usuario={
                "id": f.usuario.id,
                "nombre": f.usuario.nombre,
            } if f.usuario else None,
        )
        for f in fallas
    ]


@router.get("/{falla_id}", response_model=FallaResponse)
def obtener_falla(
    falla_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    f = db.query(FallaReportada).filter(FallaReportada.id == falla_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Falla no encontrada")

    return FallaResponse(
        id=f.id,
        vehiculo_id=f.vehiculo_id,
        conductor_id=f.conductor_id,
        usuario_id=f.usuario_id,
        categoria=f.categoria,
        descripcion=f.descripcion,
        prioridad=f.prioridad,
        estado=f.estado,
        fotos=f.fotos,
        fecha_reporte=f.fecha_reporte,
        created_at=f.created_at,
        updated_at=f.updated_at,
        vehiculo={
            "id": f.vehiculo.id,
            "placa": f.vehiculo.placa,
            "marca": f.vehiculo.marca,
            "modelo": f.vehiculo.modelo,
        } if f.vehiculo else None,
        conductor={
            "id": f.conductor.id,
            "nombre": f.conductor.nombre,
        } if f.conductor else None,
        usuario={
            "id": f.usuario.id,
            "nombre": f.usuario.nombre,
        } if f.usuario else None,
    )


@router.post("/", response_model=FallaResponse, status_code=status.HTTP_201_CREATED)
def crear_falla(
    payload: FallaCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == payload.vehiculo_id, Vehiculo.activo.is_(True)).first()
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado o inactivo")

    if payload.categoria not in CATEGORIAS_FALLA:
        raise HTTPException(status_code=400, detail=f"Categoría inválida. Válidas: {', '.join(CATEGORIAS_FALLA)}")
    if payload.prioridad not in PRIORIDADES_FALLA:
        raise HTTPException(status_code=400, detail=f"Prioridad inválida. Válidas: {', '.join(PRIORIDADES_FALLA)}")

    if payload.conductor_id:
        conductor = db.query(Conductor).filter(Conductor.id == payload.conductor_id).first()
        if not conductor:
            raise HTTPException(status_code=404, detail="Conductor no encontrado")

    db_f = FallaReportada(
        vehiculo_id=payload.vehiculo_id,
        conductor_id=payload.conductor_id,
        usuario_id=current_user.id,
        categoria=payload.categoria,
        descripcion=payload.descripcion,
        prioridad=payload.prioridad,
        fotos=payload.fotos,
    )
    db.add(db_f)
    db.commit()
    db.refresh(db_f)

    return obtener_falla(falla_id=db_f.id, db=db, current_user=current_user)


@router.put("/{falla_id}", response_model=FallaResponse)
def actualizar_falla(
    falla_id: int,
    payload: FallaUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    f = db.query(FallaReportada).filter(FallaReportada.id == falla_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Falla no encontrada")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(f, key, value)
    f.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(f)

    return obtener_falla(falla_id=f.id, db=db, current_user=current_user)


@router.put("/{falla_id}/estado", response_model=FallaResponse)
def actualizar_estado_falla(
    falla_id: int,
    payload: FallaEstadoUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    if payload.estado not in ESTADOS_FALLA:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Válidos: {', '.join(ESTADOS_FALLA)}")

    f = db.query(FallaReportada).filter(FallaReportada.id == falla_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Falla no encontrada")

    f.estado = payload.estado
    f.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(f)

    return obtener_falla(falla_id=f.id, db=db, current_user=current_user)


@router.delete("/{falla_id}", status_code=204)
def eliminar_falla(
    falla_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin"])),
):
    f = db.query(FallaReportada).filter(FallaReportada.id == falla_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Falla no encontrada")

    db.delete(f)
    db.commit()
