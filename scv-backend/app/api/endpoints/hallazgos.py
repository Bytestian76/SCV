from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from datetime import datetime

from app.db.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.models import Hallazgo, OrdenTrabajo, Usuario
from app.schemas.hallazgo import (
    HallazgoCreate, HallazgoUpdate, HallazgoEvaluar, HallazgoResponse,
    ESTADOS_HALLAZGO
)

router = APIRouter(prefix="/hallazgos", tags=["Hallazgos"])


def _build_hallazgo_response(h: Hallazgo) -> dict:
    ot_id = None
    if h.orden_trabajo:
        ot_id = h.orden_trabajo.id
    return {
        "id": h.id,
        "vehiculo_id": h.vehiculo_id,
        "chequeo_id": h.chequeo_id,
        "usuario_reporta_id": h.usuario_reporta_id,
        "origen": h.origen,
        "descripcion": h.descripcion,
        "criticidad": h.criticidad,
        "tipo": h.tipo,
        "categoria": h.categoria,
        "estado": h.estado,
        "observaciones": h.observaciones,
        "fecha_creacion": h.fecha_creacion,
        "vehiculo": {"id": h.vehiculo.id, "placa": h.vehiculo.placa} if h.vehiculo else None,
        "usuario_reporta": {"id": h.usuario_reporta.id, "nombre": h.usuario_reporta.nombre} if h.usuario_reporta else None,
        "orden_trabajo_id": ot_id,
    }


@router.get("/", response_model=List[HallazgoResponse])
def listar_hallazgos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    estado: Optional[str] = None,
    criticidad: Optional[str] = None,
    vehiculo_id: Optional[int] = None,
    origen: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    query = db.query(Hallazgo).options(
        joinedload(Hallazgo.vehiculo),
        joinedload(Hallazgo.usuario_reporta),
        joinedload(Hallazgo.orden_trabajo),
    )
    if estado:
        query = query.filter(Hallazgo.estado == estado)
    if criticidad:
        query = query.filter(Hallazgo.criticidad == criticidad)
    if vehiculo_id:
        query = query.filter(Hallazgo.vehiculo_id == vehiculo_id)
    if origen:
        query = query.filter(Hallazgo.origen == origen)
    query = query.order_by(Hallazgo.fecha_creacion.desc())
    query = query.offset(skip).limit(limit)
    return [_build_hallazgo_response(h) for h in query.all()]


@router.get("/{hallazgo_id}", response_model=HallazgoResponse)
def obtener_hallazgo(
    hallazgo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    h = db.query(Hallazgo).options(
        joinedload(Hallazgo.vehiculo),
        joinedload(Hallazgo.usuario_reporta),
        joinedload(Hallazgo.orden_trabajo),
    ).filter(Hallazgo.id == hallazgo_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hallazgo no encontrado")
    return _build_hallazgo_response(h)


@router.post("/", response_model=HallazgoResponse, status_code=status.HTTP_201_CREATED)
def crear_hallazgo(
    data: HallazgoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos"])),
):
    h = Hallazgo(
        vehiculo_id=data.vehiculo_id,
        chequeo_id=data.chequeo_id,
        usuario_reporta_id=current_user.id,
        origen=data.origen,
        descripcion=data.descripcion,
        criticidad=data.criticidad,
        tipo=data.tipo,
        categoria=data.categoria,
        observaciones=data.observaciones,
    )
    db.add(h)
    db.commit()
    db.refresh(h)
    # Recargar con relaciones
    h = db.query(Hallazgo).options(
        joinedload(Hallazgo.vehiculo),
        joinedload(Hallazgo.usuario_reporta),
        joinedload(Hallazgo.orden_trabajo),
    ).filter(Hallazgo.id == h.id).first()
    return _build_hallazgo_response(h)


@router.put("/{hallazgo_id}", response_model=HallazgoResponse)
def actualizar_hallazgo(
    hallazgo_id: int,
    data: HallazgoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos"])),
):
    h = db.query(Hallazgo).filter(Hallazgo.id == hallazgo_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hallazgo no encontrado")
    if data.descripcion is not None:
        h.descripcion = data.descripcion
    if data.criticidad is not None:
        h.criticidad = data.criticidad
    if data.tipo is not None:
        h.tipo = data.tipo
    if data.categoria is not None:
        h.categoria = data.categoria
    if data.observaciones is not None:
        h.observaciones = data.observaciones
    db.commit()
    db.refresh(h)
    h = db.query(Hallazgo).options(
        joinedload(Hallazgo.vehiculo),
        joinedload(Hallazgo.usuario_reporta),
        joinedload(Hallazgo.orden_trabajo),
    ).filter(Hallazgo.id == h.id).first()
    return _build_hallazgo_response(h)


@router.delete("/{hallazgo_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_hallazgo(
    hallazgo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos"])),
):
    h = db.query(Hallazgo).filter(Hallazgo.id == hallazgo_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hallazgo no encontrado")
    db.delete(h)
    db.commit()
    return None


@router.put("/{hallazgo_id}/evaluar", response_model=HallazgoResponse)
def evaluar_hallazgo(
    hallazgo_id: int,
    data: HallazgoEvaluar,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos"])),
):
    h = db.query(Hallazgo).filter(Hallazgo.id == hallazgo_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hallazgo no encontrado")
    if h.estado != "abierto":
        raise HTTPException(status_code=400, detail=f"El hallazgo ya fue {h.estado}")
    h.estado = data.estado
    if data.observaciones is not None:
        h.observaciones = data.observaciones

    if data.estado == "convertido_orden":
        existing = db.query(OrdenTrabajo).filter(OrdenTrabajo.hallazgo_id == h.id).first()
        if not existing:
            prioridad_map = {"baja": "baja", "media": "media", "alta": "alta", "critica": "urgente"}
            o = OrdenTrabajo(
                hallazgo_id=h.id,
                vehiculo_id=h.vehiculo_id,
                prioridad=prioridad_map.get(h.criticidad, "media"),
                descripcion=h.descripcion,
            )
            db.add(o)

    db.commit()
    db.refresh(h)
    h = db.query(Hallazgo).options(
        joinedload(Hallazgo.vehiculo),
        joinedload(Hallazgo.usuario_reporta),
        joinedload(Hallazgo.orden_trabajo),
    ).filter(Hallazgo.id == h.id).first()
    return _build_hallazgo_response(h)
