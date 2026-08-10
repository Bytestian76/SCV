"""
Endpoints de Movimientos - Registro de entradas y salidas
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from app.db.database import get_db
from app.models.models import Movimiento, Vehiculo, Conductor, Chequeo
from app.core.dependencies import require_role
from app.schemas.movimiento import (
    MovimientoCreate,
    MovimientoDetailResponse,
    MovimientoResponse,
    MovimientoListResponse,
)
from app.schemas.pagination import PaginatedResponse

router = APIRouter(prefix="/movimientos", tags=["Movimientos"])


TIPOS_MOVIMIENTO = {"entrada", "salida"}
BASCULA_VALUES = {"si", "no"}


def _normalize_bascula_value(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None

    normalized = value.strip().lower().replace("í", "i")
    if not normalized:
        return None
    if normalized not in BASCULA_VALUES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El campo bascula solo permite 'si' o 'no'.",
        )

    return normalized


def _build_movimiento_payload(movimiento: Movimiento) -> dict:
    return {
        "id": movimiento.id,
        "tipo": movimiento.tipo,
        "vehiculo_id": movimiento.vehiculo_id,
        "conductor_id": movimiento.conductor_id,
        "auxiliar": movimiento.auxiliar,
        "proveedor": movimiento.proveedor,
        "kilometraje": movimiento.kilometraje,
        "bascula": movimiento.bascula,
        "sacas": movimiento.sacas,
        "cajon": movimiento.cajon,
        "observaciones": movimiento.observaciones,
        "usuario_id": movimiento.usuario_id,
        "fecha_hora": movimiento.fecha_hora,
        "vehiculo": {
            "id": movimiento.vehiculo.id,
            "placa": movimiento.vehiculo.placa,
            "marca": movimiento.vehiculo.marca,
            "modelo": movimiento.vehiculo.modelo,
        }
        if movimiento.vehiculo
        else None,
        "conductor": {
            "id": movimiento.conductor.id,
            "nombre": movimiento.conductor.nombre,
            "cedula": movimiento.conductor.cedula,
        }
        if movimiento.conductor
        else None,
        "usuario": {
            "id": movimiento.usuario.id,
            "nombre": movimiento.usuario.nombre,
            "email": movimiento.usuario.email,
        }
        if movimiento.usuario
        else None,
    }


def _get_vehiculo_kilometraje_referencia(db: Session, vehiculo_id: int, vehiculo_km: int) -> int:
    ultimo_mov = db.query(Movimiento).filter(
        Movimiento.vehiculo_id == vehiculo_id
    ).order_by(Movimiento.fecha_hora.desc()).first()

    ultimo_chequeo = db.query(Chequeo).filter(
        Chequeo.vehiculo_id == vehiculo_id
    ).order_by(Chequeo.fecha_hora.desc()).first()

    return max(
        vehiculo_km or 0,
        ultimo_mov.kilometraje if ultimo_mov else 0,
        ultimo_chequeo.kilometraje if ultimo_chequeo else 0,
    )


@router.get("/", response_model=PaginatedResponse[MovimientoListResponse])
def listar_movimientos(
    skip: int = 0,
    limit: int = 50,
    tipo: str = None,
    vehiculo_id: int = None,
    conductor_id: int = None,
    fecha_inicio: date = None,
    fecha_fin: date = None,
    usuario_id: int = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "operario_movimientos"])),
):
    """Listar movimientos con filtros (admin y operario_movimientos)"""
    if tipo and tipo not in TIPOS_MOVIMIENTO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de movimiento inválido. Usa 'entrada' o 'salida'."
        )

    query = db.query(Movimiento)

    if current_user.rol == "operario_movimientos":
        query = query.filter(Movimiento.usuario_id == current_user.id)
    
    if tipo:
        query = query.filter(Movimiento.tipo == tipo)
    if vehiculo_id:
        query = query.filter(Movimiento.vehiculo_id == vehiculo_id)
    if conductor_id:
        query = query.filter(Movimiento.conductor_id == conductor_id)
    if usuario_id and current_user.rol == "admin":
        query = query.filter(Movimiento.usuario_id == usuario_id)
    if fecha_inicio:
        query = query.filter(Movimiento.fecha_hora >= datetime.combine(fecha_inicio, datetime.min.time()))
    if fecha_fin:
        query = query.filter(Movimiento.fecha_hora <= datetime.combine(fecha_fin, datetime.max.time()))
    if search:
        search_term = f"%{search}%"
        query = query.join(Movimiento.vehiculo, isouter=True).join(Movimiento.conductor, isouter=True).filter(
            (Vehiculo.placa.ilike(search_term)) |
            (Conductor.nombre.ilike(search_term)) |
            (Movimiento.proveedor.ilike(search_term))
        )

    from sqlalchemy.orm import joinedload
    
    total = query.count()
    movimientos = query.options(
        joinedload(Movimiento.vehiculo),
        joinedload(Movimiento.conductor),
        joinedload(Movimiento.usuario)
    ).order_by(Movimiento.fecha_hora.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "items": [MovimientoListResponse(**_build_movimiento_payload(m)) for m in movimientos]
    }


@router.get("/{movimiento_id}", response_model=MovimientoDetailResponse)
def obtener_movimiento(
    movimiento_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "operario_movimientos"])),
):
    """Obtener detalle de un movimiento"""
    movimiento = db.query(Movimiento).filter(Movimiento.id == movimiento_id).first()
    
    if not movimiento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movimiento no encontrado"
        )

    if current_user.rol == "operario_movimientos" and movimiento.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver este movimiento"
        )
    
    return MovimientoDetailResponse(**_build_movimiento_payload(movimiento))


@router.post("/", response_model=MovimientoResponse, status_code=status.HTTP_201_CREATED)
def crear_movimiento(
    movimiento: MovimientoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "operario_movimientos"]))
):
    """Registrar entrada o salida de vehículo"""
    if movimiento.tipo not in TIPOS_MOVIMIENTO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de movimiento inválido. Usa 'entrada' o 'salida'."
        )

    bascula_value = _normalize_bascula_value(movimiento.bascula)

    # Validar vehículo existe y está activo
    vehiculo = db.query(Vehiculo).filter(
        Vehiculo.id == movimiento.vehiculo_id,
        Vehiculo.activo == True
    ).first()
    
    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehículo no encontrado o inactivo"
        )
    
    # Validar conductor existe y está activo
    conductor = db.query(Conductor).filter(
        Conductor.id == movimiento.conductor_id,
        Conductor.activo == True
    ).first()
    
    if not conductor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conductor no encontrado o inactivo"
        )
    
    kilometraje_referencia = _get_vehiculo_kilometraje_referencia(
        db,
        movimiento.vehiculo_id,
        vehiculo.kilometraje,
    )

    if movimiento.kilometraje < kilometraje_referencia:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El kilometraje debe ser mayor o igual al último registrado ({kilometraje_referencia} km)"
        )
    
    # Crear movimiento
    db_movimiento = Movimiento(
        tipo=movimiento.tipo,
        vehiculo_id=movimiento.vehiculo_id,
        conductor_id=movimiento.conductor_id,
        auxiliar=movimiento.auxiliar,
        proveedor=movimiento.proveedor,
        kilometraje=movimiento.kilometraje,
        bascula=bascula_value,
        sacas=movimiento.sacas,
        cajon=movimiento.cajon,
        observaciones=movimiento.observaciones,
        usuario_id=current_user.id
    )
    
    db.add(db_movimiento)
    vehiculo.kilometraje = movimiento.kilometraje
    db.commit()
    db.refresh(db_movimiento)
    
    return db_movimiento
