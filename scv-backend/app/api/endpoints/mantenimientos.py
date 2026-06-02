"""Endpoints de Mantenimientos"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.dependencies import require_role
from app.db.database import get_db
from app.models.models import Mantenimiento, MantenimientoItem, Notificacion, Usuario, Vehiculo
from app.services.push_service import send_push_to_mecanicos
from app.schemas.mantenimiento import (
    MantenimientoCreate,
    MantenimientoEstadoUpdate,
    MantenimientoItemCreate,
    MantenimientoItemResponse,
    MantenimientoListResponse,
    MantenimientoResponse,
    MantenimientoUpdate,
)

router = APIRouter(prefix="/mantenimientos", tags=["Mantenimientos"])


def _crear_notificaciones_mecanicos(db: Session, titulo: str, mensaje: str, ref_tipo: str, ref_id: int):
    mecanicos = db.query(Usuario).filter(Usuario.rol == "mecanico", Usuario.activo.is_(True)).all()
    for m in mecanicos:
        db.add(Notificacion(
            usuario_id=m.id,
            tipo="nuevo_mantenimiento",
            titulo=titulo,
            mensaje=mensaje,
            referencia_tipo=ref_tipo,
            referencia_id=ref_id,
        ))
    db.flush()


@router.get("/", response_model=List[MantenimientoListResponse])
def listar_mantenimientos(
    skip: int = 0,
    limit: int = 50,
    estado: str = None,
    vehiculo_id: int = None,
    tipo: str = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    query = db.query(Mantenimiento)

    if current_user.rol == "mecanico":
        pass  # mecanico ve todos los mantenimientos

    if estado:
        query = query.filter(Mantenimiento.estado == estado)
    if vehiculo_id:
        query = query.filter(Mantenimiento.vehiculo_id == vehiculo_id)
    if tipo:
        query = query.filter(Mantenimiento.tipo == tipo)

    mantenimientos = query.order_by(Mantenimiento.fecha_creacion.desc()).offset(skip).limit(limit).all()

    return [
        MantenimientoListResponse(
            id=m.id,
            vehiculo_id=m.vehiculo_id,
            tipo=m.tipo,
            descripcion=m.descripcion,
            kilometraje=m.kilometraje,
            estado=m.estado,
            creado_por=m.creado_por,
            fecha_creacion=m.fecha_creacion,
            fecha_actualizacion=m.fecha_actualizacion,
            items_count=len(m.items),
            vehiculo={
                "id": m.vehiculo.id,
                "placa": m.vehiculo.placa,
                "marca": m.vehiculo.marca,
                "modelo": m.vehiculo.modelo,
            } if m.vehiculo else None,
            creador={
                "id": m.creador.id,
                "nombre": m.creador.nombre,
            } if m.creador else None,
        )
        for m in mantenimientos
    ]


@router.get("/{mantenimiento_id}", response_model=MantenimientoResponse)
def obtener_mantenimiento(
    mantenimiento_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    m = db.query(Mantenimiento).filter(Mantenimiento.id == mantenimiento_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")

    return MantenimientoResponse(
        id=m.id,
        vehiculo_id=m.vehiculo_id,
        tipo=m.tipo,
        descripcion=m.descripcion,
        kilometraje=m.kilometraje,
        estado=m.estado,
        creado_por=m.creado_por,
        chequeo_origen_id=m.chequeo_origen_id,
        fecha_creacion=m.fecha_creacion,
        fecha_actualizacion=m.fecha_actualizacion,
        items=[
            MantenimientoItemResponse(
                id=i.id,
                mantenimiento_id=i.mantenimiento_id,
                chequeo_item_id=i.chequeo_item_id,
                seccion=i.seccion,
                item=i.item,
                observacion=i.observacion,
                realizado=i.realizado,
            )
            for i in m.items
        ],
        vehiculo={
            "id": m.vehiculo.id,
            "placa": m.vehiculo.placa,
            "marca": m.vehiculo.marca,
            "modelo": m.vehiculo.modelo,
        } if m.vehiculo else None,
        creador={
            "id": m.creador.id,
            "nombre": m.creador.nombre,
        } if m.creador else None,
    )


@router.post("/", response_model=MantenimientoResponse, status_code=status.HTTP_201_CREATED)
def crear_mantenimiento(
    payload: MantenimientoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == payload.vehiculo_id, Vehiculo.activo.is_(True)).first()
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado o inactivo")

    db_m = Mantenimiento(
        vehiculo_id=payload.vehiculo_id,
        tipo=payload.tipo,
        descripcion=payload.descripcion,
        kilometraje=payload.kilometraje,
        estado=payload.estado or "pendiente",
        creado_por=current_user.id,
    )
    db.add(db_m)
    db.flush()

    _crear_notificaciones_mecanicos(
        db,
        titulo=f"Nuevo mantenimiento {db_m.tipo}",
        mensaje=f"Vehículo {vehiculo.placa}: {db_m.descripcion or 'Sin descripción'}",
        ref_tipo="mantenimiento",
        ref_id=db_m.id,
    )

    db.commit()
    db.refresh(db_m)

    try:
        placa = vehiculo.placa
        send_push_to_mecanicos(
            db,
            titulo=f"🛠️ Nuevo mantenimiento {db_m.tipo}",
            mensaje=f"{placa}: {db_m.descripcion or 'Sin descripción'}",
            url=f"/?screen=admin-mantenimientos&id={db_m.id}",
        )
    except Exception:
        pass

    return obtener_mantenimiento(mantenimiento_id=db_m.id, db=db, current_user=current_user)


@router.put("/{mantenimiento_id}", response_model=MantenimientoResponse)
def actualizar_mantenimiento(
    mantenimiento_id: int,
    payload: MantenimientoUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    m = db.query(Mantenimiento).filter(Mantenimiento.id == mantenimiento_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(m, key, value)
    m.fecha_actualizacion = datetime.utcnow()
    db.commit()
    db.refresh(m)

    return obtener_mantenimiento(mantenimiento_id=m.id, db=db, current_user=current_user)


@router.put("/{mantenimiento_id}/estado", response_model=MantenimientoResponse)
def actualizar_estado_mantenimiento(
    mantenimiento_id: int,
    payload: MantenimientoEstadoUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    estados_validos = {"pendiente", "en_progreso", "completado", "cancelado"}
    if payload.estado not in estados_validos:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Válidos: {', '.join(sorted(estados_validos))}")

    m = db.query(Mantenimiento).filter(Mantenimiento.id == mantenimiento_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")

    old_estado = m.estado
    m.estado = payload.estado
    m.fecha_actualizacion = datetime.utcnow()
    db.commit()
    db.refresh(m)

    if old_estado != payload.estado:
        try:
            placa = m.vehiculo.placa if m.vehiculo else "Desconocido"
            send_push_to_mecanicos(
                db,
                titulo=f"📋 Mantenimiento {payload.estado}",
                mensaje=f"{placa}: cambió de '{old_estado}' a '{payload.estado}'",
                url=f"/?screen=admin-mantenimientos&id={m.id}",
            )
        except Exception:
            pass

    return obtener_mantenimiento(mantenimiento_id=m.id, db=db, current_user=current_user)


@router.delete("/{mantenimiento_id}", status_code=204)
def eliminar_mantenimiento(
    mantenimiento_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin"])),
):
    m = db.query(Mantenimiento).filter(Mantenimiento.id == mantenimiento_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")

    db.delete(m)
    db.commit()


@router.post("/{mantenimiento_id}/items", response_model=List[MantenimientoItemResponse])
def agregar_items_mantenimiento(
    mantenimiento_id: int,
    items: List[MantenimientoItemCreate],
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    m = db.query(Mantenimiento).filter(Mantenimiento.id == mantenimiento_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")

    nuevos = []
    for item_data in items:
        nuevo = MantenimientoItem(
            mantenimiento_id=mantenimiento_id,
            seccion=item_data.seccion,
            item=item_data.item,
            observacion=item_data.observacion,
            realizado=item_data.realizado or False,
        )
        db.add(nuevo)
        nuevos.append(nuevo)
    db.flush()

    m.fecha_actualizacion = datetime.utcnow()
    db.commit()

    return [
        MantenimientoItemResponse(
            id=n.id,
            mantenimiento_id=n.mantenimiento_id,
            chequeo_item_id=n.chequeo_item_id,
            seccion=n.seccion,
            item=n.item,
            observacion=n.observacion,
            realizado=n.realizado,
        )
        for n in nuevos
    ]
