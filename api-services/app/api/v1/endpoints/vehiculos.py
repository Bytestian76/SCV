from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.vehiculo import Vehiculo
from app.models.usuario import Usuario
from app.schemas.vehiculo import VehiculoCreate, VehiculoUpdate, VehiculoResponse

router = APIRouter()


@router.get("/", response_model=List[VehiculoResponse], summary="Listar Vehículos")
def get_vehiculos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    search: Optional[str] = Query(None, description="Búsqueda por placa, marca o modelo"),
    skip: int = 0,
    limit: int = 100,
):
    query = db.query(Vehiculo)
    if estado:
        query = query.filter(Vehiculo.estado == estado)
    if search:
        term = f"%{search.strip().upper()}%"
        query = query.filter((Vehiculo.placa.ilike(term)) | (Vehiculo.marca.ilike(term)) | (Vehiculo.modelo.ilike(term)))
    
    return query.order_by(Vehiculo.placa).offset(skip).limit(limit).all()


@router.post("/", response_model=VehiculoResponse, status_code=status.HTTP_201_CREATED, summary="Registrar Vehículo")
def create_vehiculo(
    vehiculo_in: VehiculoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    existente = db.query(Vehiculo).filter(Vehiculo.placa == vehiculo_in.placa.strip().upper()).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un vehículo registrado con la placa {vehiculo_in.placa}",
        )
    
    vehiculo = Vehiculo(
        placa=vehiculo_in.placa.strip().upper(),
        marca=vehiculo_in.marca,
        modelo=vehiculo_in.modelo,
        año=vehiculo_in.año,
        kilometraje=vehiculo_in.kilometraje,
        fecha_venc_soat=vehiculo_in.fecha_venc_soat,
        fecha_venc_rtm=vehiculo_in.fecha_venc_rtm,
        estado=vehiculo_in.estado,
        observaciones=vehiculo_in.observaciones,
    )
    db.add(vehiculo)
    db.commit()
    db.refresh(vehiculo)
    return vehiculo


@router.get("/{id}", response_model=VehiculoResponse, summary="Detalle de Vehículo")
def get_vehiculo_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == id).first()
    if not vehiculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehículo no encontrado")
    return vehiculo


@router.put("/{id}", response_model=VehiculoResponse, summary="Actualizar Vehículo")
def update_vehiculo(
    id: int,
    vehiculo_in: VehiculoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == id).first()
    if not vehiculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehículo no encontrado")

    update_data = vehiculo_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vehiculo, field, value)

    db.commit()
    db.refresh(vehiculo)
    return vehiculo


@router.delete("/{id}", summary="Eliminar Vehículo")
def delete_vehiculo(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == id).first()
    if not vehiculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehículo no encontrado")
    
    # Limpiar registros asociados (cascada segura)
    from app.models.movimiento import Movimiento
    from app.models.chequeo import Chequeo, ChequeoItem
    from app.models.hallazgo import Hallazgo
    from app.models.orden_trabajo import OrdenTrabajo, OrdenActividad, OrdenCosto, OrdenEvidencia, OrdenHistorial

    # Órdenes y submódulos
    ordenes_ids = [o.id for o in db.query(OrdenTrabajo).filter(OrdenTrabajo.vehiculo_id == id).all()]
    if ordenes_ids:
        db.query(OrdenHistorial).filter(OrdenHistorial.orden_id.in_(ordenes_ids)).delete(synchronize_session=False)
        db.query(OrdenEvidencia).filter(OrdenEvidencia.orden_id.in_(ordenes_ids)).delete(synchronize_session=False)
        db.query(OrdenCosto).filter(OrdenCosto.orden_id.in_(ordenes_ids)).delete(synchronize_session=False)
        db.query(OrdenActividad).filter(OrdenActividad.orden_id.in_(ordenes_ids)).delete(synchronize_session=False)
        db.query(OrdenTrabajo).filter(OrdenTrabajo.vehiculo_id == id).delete(synchronize_session=False)

    # Hallazgos
    db.query(Hallazgo).filter(Hallazgo.vehiculo_id == id).delete(synchronize_session=False)

    # Chequeos
    chequeos_ids = [ch.id for ch in db.query(Chequeo).filter(Chequeo.vehiculo_id == id).all()]
    if chequeos_ids:
        db.query(ChequeoItem).filter(ChequeoItem.chequeo_id.in_(chequeos_ids)).delete(synchronize_session=False)
        db.query(Chequeo).filter(Chequeo.vehiculo_id == id).delete(synchronize_session=False)

    # Movimientos
    db.query(Movimiento).filter(Movimiento.vehiculo_id == id).delete(synchronize_session=False)

    db.delete(vehiculo)
    db.commit()
    return {"message": "Vehículo y trazabilidad eliminados correctamente"}
