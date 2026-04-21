"""
Endpoints de Selectores - Datos para dropdowns
Accesibles por cualquier usuario autenticado
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import Vehiculo, Conductor
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/selectores", tags=["Selectores"])


@router.get("/vehiculos")
def selector_vehiculos(
    search: str = Query("", description="Buscar por placa"),
    limit: int = Query(100, ge=1, le=300, description="Cantidad maxima de resultados"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listar vehículos para selector (todos los roles)"""
    query = db.query(Vehiculo).filter(Vehiculo.activo == True)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Vehiculo.placa.ilike(search_term))
            | (Vehiculo.marca.ilike(search_term))
            | (Vehiculo.modelo.ilike(search_term))
        )

    vehiculos = query.order_by(Vehiculo.placa.asc()).limit(limit).all()
    
    return [
        {
            "id": v.id,
            "placa": v.placa,
            "marca": v.marca,
            "modelo": v.modelo,
            "fecha_venc_soat": v.fecha_venc_soat,
            "fecha_venc_rtm": v.fecha_venc_rtm,
        }
        for v in vehiculos
    ]


@router.get("/conductores")
def selector_conductores(
    search: str = Query("", description="Buscar por nombre"),
    limit: int = Query(100, ge=1, le=300, description="Cantidad maxima de resultados"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Listar conductores para selector (todos los roles)"""
    query = db.query(Conductor).filter(Conductor.activo == True)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Conductor.nombre.ilike(search_term))
            | (Conductor.cedula.ilike(search_term))
            | (Conductor.licencia.ilike(search_term))
        )

    conductores = query.order_by(Conductor.nombre.asc()).limit(limit).all()
    
    return [
        {
            "id": c.id,
            "nombre": c.nombre,
            "cedula": c.cedula,
            "fecha_venc_licencia": c.fecha_venc_licencia,
        }
        for c in conductores
    ]
