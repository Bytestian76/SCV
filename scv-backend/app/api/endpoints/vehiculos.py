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
    current_user = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"]))
):
    """Listar todos los vehículos"""
    query = db.query(Vehiculo)
    
    if activo is not None:
        query = query.filter(Vehiculo.activo == activo)
    
    return query.offset(skip).limit(limit).all()


@router.get("/{vehiculo_id}", response_model=VehiculoResponse)
def obtener_vehiculo(
    vehiculo_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"]))
):
    """Obtener un vehículo por ID"""
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


@router.get("/{vehiculo_id}/historial-mantenimientos")
def obtener_historial_mantenimientos(
    vehiculo_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"]))
):
    """Obtener historial unificado de mantenimientos y actividades realizadas para un vehículo"""
    from app.models.models import NuevaOrdenActividad, OrdenTrabajo
    from datetime import datetime

    # 1. Buscar actividades completadas asociadas al vehículo
    actividades = (
        db.query(NuevaOrdenActividad)
        .join(OrdenTrabajo)
        .filter(
            OrdenTrabajo.vehiculo_id == vehiculo_id,
            NuevaOrdenActividad.estado == "completada"
        )
        .order_by(NuevaOrdenActividad.fecha_fin.desc())
        .all()
    )
    
    # 2. Buscar órdenes completadas para el vehículo
    ordenes = (
        db.query(OrdenTrabajo)
        .filter(
            OrdenTrabajo.vehiculo_id == vehiculo_id,
            OrdenTrabajo.estado == "completada"
        )
        .order_by(OrdenTrabajo.fecha_cierre.desc())
        .all()
    )

    eventos = []
    for act in actividades:
        eventos.append({
            "tipo": "actividad",
            "titulo": act.titulo,
            "descripcion": act.descripcion or "",
            "fecha": act.fecha_fin,
            "orden_id": act.orden_id,
            "responsable": act.responsable.nombre if act.responsable else "No asignado"
        })

    for ord in ordenes:
        eventos.append({
            "tipo": "orden",
            "titulo": f"Orden #{ord.id} Finalizada",
            "descripcion": ord.descripcion or "Mantenimiento general",
            "fecha": ord.fecha_cierre,
            "orden_id": ord.id,
            "responsable": ord.responsable.nombre if ord.responsable else "No asignado"
        })

    # Ordenar cronológicamente descendente
    eventos.sort(key=lambda x: x["fecha"] if x["fecha"] else datetime.min, reverse=True)

    # Formatear fechas para la respuesta JSON
    for ev in eventos:
        if ev["fecha"]:
            ev["fecha"] = ev["fecha"].strftime("%Y-%m-%d %H:%M:%S")

    return eventos


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
