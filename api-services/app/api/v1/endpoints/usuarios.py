from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user, require_role
from app.models.usuario import Usuario
from app.core.security import get_password_hash
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse

router = APIRouter()


@router.get("/", response_model=List[UsuarioResponse], summary="Listar Usuarios")
def get_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    rol: Optional[str] = Query(None, description="Filtrar por rol"),
    search: Optional[str] = Query(None, description="Búsqueda por nombre, email o cédula"),
    skip: int = 0,
    limit: int = 100,
):
    query = db.query(Usuario)
    if rol:
        query = query.filter(Usuario.rol == rol)
    if search:
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            (Usuario.nombre.ilike(term)) | (Usuario.email.ilike(term)) | (Usuario.cedula.ilike(term))
        )
    return query.order_by(Usuario.nombre).offset(skip).limit(limit).all()


@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED, summary="Crear Usuario")
def create_usuario(
    usuario_in: UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    existente = db.query(Usuario).filter(Usuario.email == usuario_in.email.lower()).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario con este correo electrónico",
        )
    
    if usuario_in.cedula:
        ced_existente = db.query(Usuario).filter(Usuario.cedula == usuario_in.cedula).first()
        if ced_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un usuario con este número de cédula",
            )

    usuario = Usuario(
        nombre=usuario_in.nombre,
        email=usuario_in.email.lower(),
        password_hash=get_password_hash(usuario_in.password),
        rol=usuario_in.rol,
        estado_activo=usuario_in.estado_activo,
        cedula=usuario_in.cedula,
        licencia=usuario_in.licencia,
        categoria=usuario_in.categoria,
        fecha_venc_licencia=usuario_in.fecha_venc_licencia,
        telefono=usuario_in.telefono,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.get("/{id}", response_model=UsuarioResponse, summary="Detalle de Usuario")
def get_usuario_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return usuario


@router.put("/{id}", response_model=UsuarioResponse, summary="Actualizar Usuario")
def update_usuario(
    id: int,
    usuario_in: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    update_data = usuario_in.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        usuario.password_hash = get_password_hash(update_data.pop("password"))

    for field, value in update_data.items():
        setattr(usuario, field, value)

    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/{id}", summary="Desactivar o Eliminar Usuario")
def delete_usuario(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["admin"])),
):
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    
    # Desactivar en lugar de eliminar físicamente para conservar integridad de auditoría
    usuario.estado_activo = False
    db.commit()
    return {"message": "Usuario desactivado correctamente"}
