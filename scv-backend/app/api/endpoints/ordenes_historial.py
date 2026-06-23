from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.models import OrdenHistorial, Usuario
from app.schemas.orden_historial import OrdenHistorialResponse

router = APIRouter(prefix="/ordenes-historial", tags=["Historial"])


@router.get("/", response_model=List[OrdenHistorialResponse])
def listar_historial(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    orden_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin", "jefe_mecanicos", "mecanico"])),
):
    query = db.query(OrdenHistorial).options(
        joinedload(OrdenHistorial.usuario),
    )
    if orden_id:
        query = query.filter(OrdenHistorial.orden_id == orden_id)
    query = query.order_by(OrdenHistorial.fecha_hora.desc())
    query = query.offset(skip).limit(limit)
    return query.all()
