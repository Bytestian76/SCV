"""Endpoints de Mantenimientos"""

import base64
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.dependencies import require_role
from app.db.database import get_db
from app.models.models import Mantenimiento, MantenimientoItem, OrdenActividad, OrdenEvidencia, OrdenCosto, AuditoriaMantenimiento, Notificacion, Usuario, Vehiculo, FallaReportada
from app.services.push_service import send_push_to_mecanicos
from app.schemas.mantenimiento import (
    ESTADOS_MANTENIMIENTO,
    ActividadCreate,
    ActividadResponse,
    ActividadUpdate,
    AuditoriaResponse,
    CostoCreate,
    CostoResponse,
    EvidenciaCreate,
    EvidenciaResponse,
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
    estado: Optional[str] = None,
    vehiculo_id: Optional[int] = None,
    tipo: Optional[str] = None,
    prioridad: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    query = db.query(Mantenimiento)

    if estado:
        estados = [e.strip() for e in estado.split(",")]
        query = query.filter(Mantenimiento.estado.in_(estados))
    if vehiculo_id:
        query = query.filter(Mantenimiento.vehiculo_id == vehiculo_id)
    if tipo:
        query = query.filter(Mantenimiento.tipo == tipo)
    if prioridad:
        query = query.filter(Mantenimiento.prioridad == prioridad)

    mantenimientos = query.order_by(Mantenimiento.fecha_creacion.desc()).offset(skip).limit(limit).all()

    return [
        MantenimientoListResponse(
            id=m.id,
            vehiculo_id=m.vehiculo_id,
            tipo=m.tipo,
            descripcion=m.descripcion,
            kilometraje=m.kilometraje,
            prioridad=m.prioridad,
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
            falla_origen_id=m.falla_origen_id,
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

    falla_data = None
    if m.falla_origen_id:
        falla = db.query(FallaReportada).filter(FallaReportada.id == m.falla_origen_id).first()
        if falla:
            falla_data = {
                "id": falla.id,
                "categoria": falla.categoria,
                "descripcion": falla.descripcion,
                "prioridad": falla.prioridad,
            }

    actividades = db.query(OrdenActividad).filter(OrdenActividad.mantenimiento_id == mantenimiento_id).order_by(OrdenActividad.created_at.asc()).all()

    return MantenimientoResponse(
        id=m.id,
        vehiculo_id=m.vehiculo_id,
        tipo=m.tipo,
        descripcion=m.descripcion,
        kilometraje=m.kilometraje,
        prioridad=m.prioridad,
        estado=m.estado,
        creado_por=m.creado_por,
        chequeo_origen_id=m.chequeo_origen_id,
        falla_origen_id=m.falla_origen_id,
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
        actividades=[
            ActividadResponse(
                id=a.id,
                mantenimiento_id=a.mantenimiento_id,
                descripcion=a.descripcion,
                responsable=a.responsable,
                fecha_inicio=a.fecha_inicio,
                fecha_fin=a.fecha_fin,
                estado=a.estado,
                created_at=a.created_at,
                updated_at=a.updated_at,
                evidencias=[
                    EvidenciaResponse(
                        id=e.id,
                        actividad_id=e.actividad_id,
                        tipo=e.tipo,
                        archivo_url=e.archivo_url,
                        descripcion=e.descripcion,
                        uploaded_at=e.uploaded_at,
                    )
                    for e in a.evidencias
                ],
            )
            for a in actividades
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
        falla_origen=falla_data,
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

    if payload.falla_origen_id:
        falla = db.query(FallaReportada).filter(FallaReportada.id == payload.falla_origen_id).first()
        if not falla:
            raise HTTPException(status_code=404, detail="Falla de origen no encontrada")
        if falla.estado == "convertida_a_orden":
            raise HTTPException(status_code=400, detail="Esta falla ya fue convertida a una orden de mantenimiento")

    db_m = Mantenimiento(
        vehiculo_id=payload.vehiculo_id,
        tipo=payload.tipo,
        descripcion=payload.descripcion,
        kilometraje=payload.kilometraje,
        prioridad=payload.prioridad,
        estado=payload.estado or "pendiente",
        creado_por=current_user.id,
        falla_origen_id=payload.falla_origen_id,
    )
    db.add(db_m)
    db.flush()

    if payload.falla_origen_id:
        falla = db.query(FallaReportada).filter(FallaReportada.id == payload.falla_origen_id).first()
        falla.estado = "convertida_a_orden"
        falla.updated_at = datetime.utcnow()
        db.flush()

    _crear_notificaciones_mecanicos(
        db,
        titulo=f"Nuevo mantenimiento {db_m.tipo}",
        mensaje=f"Vehículo {vehiculo.placa}: {db_m.descripcion or 'Sin descripción'}",
        ref_tipo="mantenimiento",
        ref_id=db_m.id,
    )

    db.add(AuditoriaMantenimiento(
        mantenimiento_id=db_m.id,
        usuario_id=current_user.id,
        accion="creacion",
        estado_nuevo=db_m.estado,
    ))

    db.commit()
    db.refresh(db_m)

    try:
        placa = vehiculo.placa
        send_push_to_mecanicos(
            db,
            titulo=f"Nuevo mantenimiento {db_m.tipo}",
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
    if payload.estado not in ESTADOS_MANTENIMIENTO:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Válidos: {', '.join(ESTADOS_MANTENIMIENTO)}")

    m = db.query(Mantenimiento).filter(Mantenimiento.id == mantenimiento_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")

    old_estado = m.estado
    m.estado = payload.estado
    m.fecha_actualizacion = datetime.utcnow()

    db.add(AuditoriaMantenimiento(
        mantenimiento_id=mantenimiento_id,
        usuario_id=current_user.id,
        accion="cambio_estado",
        estado_anterior=old_estado,
        estado_nuevo=payload.estado,
    ))

    db.commit()
    db.refresh(m)

    if old_estado != payload.estado:
        try:
            placa = m.vehiculo.placa if m.vehiculo else "Desconocido"
            send_push_to_mecanicos(
                db,
                titulo=f"Orden {payload.estado}",
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


@router.get("/kanban/board", response_model=dict)
def obtener_tablero_kanban(
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    columnas = {
        "pendiente": [],
        "en_progreso": [],
        "esperando_repuesto": [],
        "completado": [],
        "cancelado": [],
    }

    mantenimientos = db.query(Mantenimiento).order_by(Mantenimiento.fecha_creacion.desc()).limit(100).all()

    for m in mantenimientos:
        col = m.estado if m.estado in columnas else "pendiente"
        columnas[col].append({
            "id": m.id,
            "vehiculo_id": m.vehiculo_id,
            "tipo": m.tipo,
            "descripcion": m.descripcion,
            "prioridad": m.prioridad,
            "estado": m.estado,
            "kilometraje": m.kilometraje,
            "fecha_creacion": m.fecha_creacion.isoformat() if m.fecha_creacion else None,
            "items_count": len(m.items),
            "vehiculo": {
                "placa": m.vehiculo.placa,
                "marca": m.vehiculo.marca,
                "modelo": m.vehiculo.modelo,
            } if m.vehiculo else None,
        })

    return {
        "columnas": columnas,
        "totales": {k: len(v) for k, v in columnas.items()},
    }


# ─── FASE 3: Actividades ──────────────────────────────────────

@router.get("/{mantenimiento_id}/actividades", response_model=List[ActividadResponse])
def listar_actividades(
    mantenimiento_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    m = db.query(Mantenimiento).filter(Mantenimiento.id == mantenimiento_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")
    actividades = db.query(OrdenActividad).filter(OrdenActividad.mantenimiento_id == mantenimiento_id).order_by(OrdenActividad.created_at.asc()).all()
    return actividades


@router.post("/{mantenimiento_id}/actividades", response_model=ActividadResponse, status_code=201)
def crear_actividad(
    mantenimiento_id: int,
    payload: ActividadCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    m = db.query(Mantenimiento).filter(Mantenimiento.id == mantenimiento_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")
    act = OrdenActividad(
        mantenimiento_id=mantenimiento_id,
        descripcion=payload.descripcion,
        responsable=payload.responsable,
        estado="pendiente",
    )
    db.add(act)
    db.flush()
    m.fecha_actualizacion = datetime.utcnow()
    db.commit()
    db.refresh(act)
    return act


@router.put("/actividades/{actividad_id}", response_model=ActividadResponse)
def actualizar_actividad(
    actividad_id: int,
    payload: ActividadUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    act = db.query(OrdenActividad).filter(OrdenActividad.id == actividad_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(act, key, value)
    act.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(act)
    return act


@router.delete("/actividades/{actividad_id}", status_code=204)
def eliminar_actividad(
    actividad_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    act = db.query(OrdenActividad).filter(OrdenActividad.id == actividad_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    db.delete(act)
    db.commit()


# ─── FASE 3: Evidencias ───────────────────────────────────────

@router.post("/actividades/{actividad_id}/evidencias", response_model=EvidenciaResponse, status_code=201)
def agregar_evidencia(
    actividad_id: int,
    payload: EvidenciaCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    act = db.query(OrdenActividad).filter(OrdenActividad.id == actividad_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    ev = OrdenEvidencia(
        actividad_id=actividad_id,
        tipo=payload.tipo or "foto",
        archivo_url=payload.archivo_url,
        descripcion=payload.descripcion,
    )
    db.add(ev)
    db.flush()
    act.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ev)
    return ev


@router.get("/actividades/{actividad_id}/evidencias", response_model=List[EvidenciaResponse])
def listar_evidencias(
    actividad_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    act = db.query(OrdenActividad).filter(OrdenActividad.id == actividad_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    return act.evidencias


@router.delete("/evidencias/{evidencia_id}", status_code=204)
def eliminar_evidencia(
    evidencia_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin"])),
):
    ev = db.query(OrdenEvidencia).filter(OrdenEvidencia.id == evidencia_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidencia no encontrada")
    db.delete(ev)
    db.commit()


# ─── FASE 4: Costos ───────────────────────────────────────────

@router.get("/{mantenimiento_id}/costos", response_model=List[CostoResponse])
def listar_costos(
    mantenimiento_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    m = db.query(Mantenimiento).filter(Mantenimiento.id == mantenimiento_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")
    return db.query(OrdenCosto).filter(OrdenCosto.mantenimiento_id == mantenimiento_id).order_by(OrdenCosto.created_at.desc()).all()


@router.post("/{mantenimiento_id}/costos", response_model=CostoResponse, status_code=201)
def crear_costo(
    mantenimiento_id: int,
    payload: CostoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    m = db.query(Mantenimiento).filter(Mantenimiento.id == mantenimiento_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")
    costo = OrdenCosto(
        mantenimiento_id=mantenimiento_id,
        tipo=payload.tipo,
        descripcion=payload.descripcion,
        cantidad=payload.cantidad,
        valor_unitario=payload.valor_unitario,
        total=payload.cantidad * payload.valor_unitario,
        proveedor=payload.proveedor,
    )
    db.add(costo)
    db.commit()
    db.refresh(costo)
    return costo


@router.delete("/costos/{costo_id}", status_code=204)
def eliminar_costo(
    costo_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin"])),
):
    c = db.query(OrdenCosto).filter(OrdenCosto.id == costo_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Costo no encontrado")
    db.delete(c)
    db.commit()


# ─── FASE 4: Auditoría ────────────────────────────────────────

@router.get("/{mantenimiento_id}/auditoria", response_model=List[AuditoriaResponse])
def listar_auditoria(
    mantenimiento_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "mecanico"])),
):
    m = db.query(Mantenimiento).filter(Mantenimiento.id == mantenimiento_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")
    registros = db.query(AuditoriaMantenimiento).filter(AuditoriaMantenimiento.mantenimiento_id == mantenimiento_id).order_by(AuditoriaMantenimiento.created_at.desc()).all()
    result = []
    for r in registros:
        usuario = db.query(Usuario).filter(Usuario.id == r.usuario_id).first()
        result.append(AuditoriaResponse(
            id=r.id,
            mantenimiento_id=r.mantenimiento_id,
            usuario_id=r.usuario_id,
            accion=r.accion,
            estado_anterior=r.estado_anterior,
            estado_nuevo=r.estado_nuevo,
            created_at=r.created_at,
            usuario_nombre=usuario.nombre if usuario else None,
        ))
    return result