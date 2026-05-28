"""
Endpoints de Conductores - CRUD completo
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import Conductor
from app.core.dependencies import require_role
from app.schemas.conductor import ConductorCreate, ConductorUpdate, ConductorResponse

router = APIRouter(prefix="/conductores", tags=["Conductores"])


@router.get("/", response_model=List[ConductorResponse])
def listar_conductores(
    skip: int = 0,
    limit: int = 100,
    activo: bool = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin"]))
):
    """Listar todos los conductores (solo admin)"""
    query = db.query(Conductor)
    
    if activo is not None:
        query = query.filter(Conductor.activo == activo)
    
    return query.offset(skip).limit(limit).all()


@router.get("/{conductor_id}", response_model=ConductorResponse)
def obtener_conductor(
    conductor_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin"]))
):
    """Obtener un conductor por ID (solo admin)"""
    conductor = db.query(Conductor).filter(Conductor.id == conductor_id).first()
    
    if not conductor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conductor no encontrado"
        )
    
    return conductor


@router.post("/", response_model=ConductorResponse, status_code=status.HTTP_201_CREATED)
def crear_conductor(
    conductor: ConductorCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin"]))
):
    """Crear nuevo conductor (solo admin)"""
    existente = db.query(Conductor).filter(Conductor.cedula == conductor.cedula).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La cédula ya existe"
        )
    
    db_conductor = Conductor(**conductor.model_dump())
    db.add(db_conductor)
    db.commit()
    db.refresh(db_conductor)
    
    return db_conductor


@router.put("/{conductor_id}", response_model=ConductorResponse)
def actualizar_conductor(
    conductor_id: int,
    conductor_update: ConductorUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin"]))
):
    """Actualizar conductor (solo admin)"""
    conductor = db.query(Conductor).filter(Conductor.id == conductor_id).first()
    
    if not conductor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conductor no encontrado"
        )
    
    if conductor_update.cedula and conductor_update.cedula != conductor.cedula:
        existente = db.query(Conductor).filter(
            Conductor.cedula == conductor_update.cedula
        ).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="La cédula ya existe"
            )
    
    for key, value in conductor_update.model_dump(exclude_unset=True).items():
        setattr(conductor, key, value)
    
    db.commit()
    db.refresh(conductor)
    
    return conductor


@router.delete("/{conductor_id}")
def eliminar_conductor(
    conductor_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin"]))
):
    """Desactivar conductor (soft delete) (solo admin)"""
    conductor = db.query(Conductor).filter(Conductor.id == conductor_id).first()
    
    if not conductor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conductor no encontrado"
        )
    
    conductor.activo = False
    db.commit()
    
    return {"message": "Conductor desactivado correctamente"}