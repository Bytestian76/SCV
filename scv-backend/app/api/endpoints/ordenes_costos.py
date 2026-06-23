from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.models import NuevaOrdenCosto, OrdenTrabajo, Usuario
from app.schemas.orden_costo import (
    OrdenCostoCreate, OrdenCostoUpdate, OrdenCostoResponse
)

router = APIRouter(prefix="/ordenes-costos", tags=["Costos"])


@router.get("/", response_model=List[OrdenCostoResponse])
def listar_costos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    orden_id: Optional[int] = None,
    tipo_gasto: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    query = db.query(NuevaOrdenCosto)
    if orden_id:
        query = query.filter(NuevaOrdenCosto.orden_id == orden_id)
    if tipo_gasto:
        query = query.filter(NuevaOrdenCosto.tipo_gasto == tipo_gasto)
    if current_user.rol == "mecanico":
        query = query.join(OrdenTrabajo).filter(OrdenTrabajo.responsable_id == current_user.id)
    query = query.order_by(NuevaOrdenCosto.fecha.desc())
    query = query.offset(skip).limit(limit)
    return query.all()


@router.get("/{costo_id}", response_model=OrdenCostoResponse)
def obtener_costo(
    costo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    c = db.query(NuevaOrdenCosto).filter(NuevaOrdenCosto.id == costo_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Costo no encontrado")
    return c


@router.post("/", response_model=OrdenCostoResponse, status_code=status.HTTP_201_CREATED)
def crear_costo(
    data: OrdenCostoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    orden = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == data.orden_id).first()
    if not orden:
        raise HTTPException(status_code=404, detail="Orden de trabajo no encontrada")
    if current_user.rol == "mecanico" and orden.responsable_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta orden")

    if data.valor_total == 0 and data.valor_unitario > 0:
        valor_total = data.valor_unitario * data.cantidad
    else:
        valor_total = data.valor_total

    c = NuevaOrdenCosto(
        orden_id=data.orden_id,
        tipo_gasto=data.tipo_gasto,
        proveedor=data.proveedor,
        numero_factura=data.numero_factura,
        descripcion=data.descripcion,
        cantidad=data.cantidad,
        valor_unitario=data.valor_unitario,
        valor_total=valor_total,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.put("/{costo_id}", response_model=OrdenCostoResponse)
def actualizar_costo(
    costo_id: int,
    data: OrdenCostoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos"])),
):
    c = db.query(NuevaOrdenCosto).filter(NuevaOrdenCosto.id == costo_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Costo no encontrado")

    if data.tipo_gasto is not None:
        c.tipo_gasto = data.tipo_gasto
    if data.proveedor is not None:
        c.proveedor = data.proveedor
    if data.numero_factura is not None:
        c.numero_factura = data.numero_factura
    if data.descripcion is not None:
        c.descripcion = data.descripcion
    if data.cantidad is not None:
        c.cantidad = data.cantidad
    if data.valor_unitario is not None:
        c.valor_unitario = data.valor_unitario
    if data.valor_total is not None:
        c.valor_total = data.valor_total
    elif data.valor_unitario is not None and data.cantidad is not None:
        c.valor_total = data.valor_unitario * data.cantidad

    db.commit()
    db.refresh(c)
    return c


@router.delete("/{costo_id}")
def eliminar_costo(
    costo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos"])),
):
    c = db.query(NuevaOrdenCosto).filter(NuevaOrdenCosto.id == costo_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Costo no encontrado")
    db.delete(c)
    db.commit()
    return {"message": "Costo eliminado"}
