"""
Endpoints de Vehículos - CRUD completo
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import Vehiculo
from app.schemas.vehiculo import (
    VehiculoCreate, 
    VehiculoUpdate, 
    VehiculoResponse
)
from app.core.dependencies import get_current_user, require_role

router = APIRouter(prefix="/vehiculos", tags=["Vehículos"])


@router.get("/", response_model=List[VehiculoResponse])
def listar_vehiculos(
    skip: int = 0,
    limit: int = 100,
    activo: bool = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin"]))
):
    """Listar todos los vehículos (solo admin)"""
    query = db.query(Vehiculo)
    
    if activo is not None:
        query = query.filter(Vehiculo.activo == activo)
    
    return query.offset(skip).limit(limit).all()


@router.get("/{vehiculo_id}", response_model=VehiculoResponse)
def obtener_vehiculo(
    vehiculo_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin"]))
):
    """Obtener un vehículo por ID (solo admin)"""
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == vehiculo_id).first()
    
    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehículo no encontrado"
        )
    
    return vehiculo


@router.post("/", response_model=VehiculoResponse, status_code=status.HTTP_201_CREATED)
def crear_vehiculo(
    vehiculo: VehiculoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin"]))
):
    """Crear nuevo vehículo (solo admin)"""
    if vehiculo.kilometraje < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El kilometraje no puede ser negativo"
        )

    # Verificar que la placa no exista
    existente = db.query(Vehiculo).filter(Vehiculo.placa == vehiculo.placa).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La placa ya existe"
        )
    
    db_vehiculo = Vehiculo(**vehiculo.model_dump())
    db.add(db_vehiculo)
    db.commit()
    db.refresh(db_vehiculo)
    
    return db_vehiculo


@router.put("/{vehiculo_id}", response_model=VehiculoResponse)
def actualizar_vehiculo(
    vehiculo_id: int,
    vehiculo_update: VehiculoUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin"]))
):
    """Actualizar vehículo (solo admin)"""
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == vehiculo_id).first()
    
    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehículo no encontrado"
        )
    
    # Si cambia la placa, verificar que no exista
    if vehiculo_update.placa and vehiculo_update.placa != vehiculo.placa:
        existente = db.query(Vehiculo).filter(
            Vehiculo.placa == vehiculo_update.placa
        ).first()
        if existente:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="La placa ya existe"
            )

    if vehiculo_update.kilometraje is not None and vehiculo_update.kilometraje < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El kilometraje no puede ser negativo"
        )
    
    # Actualizar campos
    for key, value in vehiculo_update.model_dump(exclude_unset=True).items():
        setattr(vehiculo, key, value)
    
    db.commit()
    db.refresh(vehiculo)
    
    return vehiculo


@router.delete("/{vehiculo_id}")
def eliminar_vehiculo(
    vehiculo_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin"]))
):
    """Desactivar vehículo (soft delete) (solo admin)"""
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == vehiculo_id).first()
    
    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehículo no encontrado"
        )
    
    vehiculo.activo = False
    db.commit()
    
    return {"message": "Vehículo desactivado correctamente"}
