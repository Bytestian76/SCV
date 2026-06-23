from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import Usuario
from app.core.dependencies import require_role
from app.schemas.usuario import UsuarioResponse

router = APIRouter(prefix="/mecanicos", tags=["Mecánicos"])


@router.get("/", response_model=List[UsuarioResponse])
def listar_mecanicos(
    db: Session = Depends(get_db),
    current_user = Depends(require_role(["admin", "jefe_mecanicos"]))
):
    return db.query(Usuario).filter(Usuario.rol == "mecanico", Usuario.activo == True).all()
