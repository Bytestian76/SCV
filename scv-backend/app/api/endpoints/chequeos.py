"""Endpoints de Chequeos preoperacionales"""

from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.dependencies import require_role
from app.db.database import get_db
from app.models.models import Chequeo, ChequeoItem, Conductor, Mantenimiento, MantenimientoItem, Notificacion, Usuario, Vehiculo, Movimiento
from app.schemas.chequeo import (
    ChequeoCreate,
    ChequeoDetailResponse,
    ChequeoItemsCreate,
    ChequeoItemsResponse,
    ChequeoListResponse,
    ChequeoItemResponse,
    ChequeoResponse,
)

router = APIRouter(prefix="/chequeos", tags=["Chequeos"])


CHEQUEO_FORMULARIO = [
    {
        "nombre": "frenos_direccion",
        "label": "Frenos y direccion",
        "items": [
            {
                "item": "freno_servicio",
                "label": "Freno de servicio",
                "options": ["ajustado", "largo", "genera_ruido"],
            },
            {
                "item": "freno_estacionamiento",
                "label": "Freno de estacionamiento",
                "options": ["ajustado", "largo", "genera_ruido"],
            },
            {
                "item": "pedal_freno",
                "label": "Pedal de freno",
                "options": ["ajustado", "largo", "genera_ruido"],
            },
            {
                "item": "lineas_aire_frenos",
                "label": "Lineas de aire y mangueras de freno",
                "options": ["ajustado", "largo", "genera_ruido"],
            },
            {
                "item": "direccion_alineacion",
                "label": "Alineacion de direccion",
                "options": ["conforme", "vibra", "tira_lado"],
            },
            {
                "item": "volante_juego",
                "label": "Juego del volante",
                "options": ["conforme", "vibra", "tira_lado"],
            },
            {
                "item": "caja_direccion",
                "label": "Caja de direccion",
                "options": ["conforme", "vibra", "tira_lado"],
            },
            {
                "item": "suspension_delantera",
                "label": "Suspension delantera",
                "options": ["conforme", "vibra", "tira_lado"],
            },
        ],
    },
    {
        "nombre": "luces_cabina",
        "label": "Luces y cabina",
        "items": [
            {"item": "luces_bajas", "label": "Luces bajas", "options": ["conforme", "no_conforme"]},
            {"item": "luces_altas", "label": "Luces altas", "options": ["conforme", "no_conforme"]},
            {"item": "direccional_izquierda", "label": "Direccional izquierda", "options": ["conforme", "no_conforme"]},
            {"item": "direccional_derecha", "label": "Direccional derecha", "options": ["conforme", "no_conforme"]},
            {"item": "luces_freno", "label": "Luces de freno", "options": ["conforme", "no_conforme"]},
            {"item": "luz_reversa", "label": "Luz de reversa", "options": ["conforme", "no_conforme"]},
            {"item": "exploradoras", "label": "Exploradoras", "options": ["conforme", "no_conforme"]},
            {"item": "tablero_alertas", "label": "Tablero de alertas", "options": ["conforme", "no_conforme"]},
            {"item": "pito", "label": "Pito", "options": ["conforme", "no_conforme"]},
            {"item": "espejos", "label": "Espejos", "options": ["conforme", "no_conforme"]},
            {"item": "cinturon_seguridad", "label": "Cinturon de seguridad", "options": ["conforme", "no_conforme"]},
            {"item": "silleteria", "label": "Silleteria", "options": ["conforme", "no_conforme"]},
            {"item": "limpiabrisas", "label": "Limpiabrisas", "options": ["conforme", "no_conforme"]},
            {"item": "vidrios", "label": "Vidrios", "options": ["conforme", "no_conforme"]},
            {"item": "puertas", "label": "Puertas", "options": ["conforme", "no_conforme"]},
        ],
    },
    {
        "nombre": "niveles_estado_general",
        "label": "Niveles y estado general",
        "items": [
            {
                "item": "aceite_motor",
                "label": "Nivel de aceite de motor",
                "options": ["full", "medio", "bajo", "presenta_fugas", "no_aplica"],
            },
            {
                "item": "refrigerante",
                "label": "Nivel de refrigerante",
                "options": ["full", "medio", "bajo", "presenta_fugas", "no_aplica"],
            },
            {
                "item": "liquido_frenos",
                "label": "Liquido de frenos",
                "options": ["full", "medio", "bajo", "presenta_fugas", "no_aplica"],
            },
            {
                "item": "hidraulico_direccion",
                "label": "Liquido hidraulico direccion",
                "options": ["full", "medio", "bajo", "presenta_fugas", "no_aplica"],
            },
            {
                "item": "combustible",
                "label": "Nivel de combustible",
                "options": ["full", "medio", "bajo", "presenta_fugas", "no_aplica"],
            },
            {
                "item": "estado_llantas",
                "label": "Estado general de llantas",
                "options": ["full", "medio", "bajo", "presenta_fugas", "no_aplica"],
            },
        ],
    },
    {
        "nombre": "equipo_carreteras_extintor",
        "label": "Equipo de carreteras y extintor",
        "items": [
            {
                "item": "gato_hidraulico",
                "label": "Gato hidraulico",
                "options": ["tiene", "no_tiene", "mal_estado"],
            },
            {
                "item": "senales_reflectivas",
                "label": "Senales reflectivas",
                "options": ["tiene", "no_tiene", "mal_estado"],
            },
            {
                "item": "linterna",
                "label": "Linterna",
                "options": ["tiene", "no_tiene", "mal_estado"],
            },
            {
                "item": "botiquin",
                "label": "Botiquin",
                "options": ["tiene", "no_tiene", "mal_estado"],
            },
            {
                "item": "extintor_estado",
                "label": "Extintor (estado)",
                "options": ["conforme", "no_conforme"],
            },
            {
                "item": "extintor_presion",
                "label": "Extintor (presion)",
                "options": ["conforme", "no_conforme"],
            },
            {
                "item": "extintor_sello",
                "label": "Extintor (sello)",
                "options": ["conforme", "no_conforme"],
            },
            {
                "item": "extintor_acceso",
                "label": "Extintor (facil acceso)",
                "options": ["conforme", "no_conforme"],
            },
        ],
    },
    {
        "nombre": "kit_herramientas_verificaciones",
        "label": "Kit de herramientas y verificaciones",
        "items": [
            {
                "item": "llave_cruceta",
                "label": "Llave de cruceta",
                "options": ["tiene", "no_tiene", "incompleto"],
            },
            {
                "item": "llaves_fijas",
                "label": "Juego de llaves fijas",
                "options": ["tiene", "no_tiene", "incompleto"],
            },
            {
                "item": "destornilladores",
                "label": "Destornilladores",
                "options": ["tiene", "no_tiene", "incompleto"],
            },
            {
                "item": "alicate",
                "label": "Alicate",
                "options": ["tiene", "no_tiene", "incompleto"],
            },
            {
                "item": "estado_bateria",
                "label": "Estado de bateria",
                "options": ["conforme", "no_conforme", "no_aplica"],
            },
            {
                "item": "fugas_visibles",
                "label": "Fugas visibles",
                "options": ["conforme", "no_conforme", "no_aplica"],
            },
            {
                "item": "sonido_motor",
                "label": "Sonido de motor",
                "options": ["conforme", "no_conforme", "no_aplica"],
            },
            {
                "item": "fijacion_carga",
                "label": "Fijacion de carga",
                "options": ["conforme", "no_conforme", "no_aplica"],
            },
        ],
    },
]


def _template_lookup() -> dict[tuple[str, str], set[str]]:
    lookup: dict[tuple[str, str], set[str]] = {}
    for seccion in CHEQUEO_FORMULARIO:
        seccion_nombre = seccion["nombre"]
        for item in seccion["items"]:
            lookup[(seccion_nombre, item["item"])] = set(item["options"])
    return lookup


TEMPLATE_LOOKUP = _template_lookup()


def _get_vehiculo_kilometraje_referencia(db: Session, vehiculo_id: int, vehiculo_km: int) -> int:
    ultimo_chequeo = (
        db.query(Chequeo)
        .filter(Chequeo.vehiculo_id == vehiculo_id)
        .order_by(Chequeo.fecha_hora.desc())
        .first()
    )
    ultimo_mov = (
        db.query(Movimiento)
        .filter(Movimiento.vehiculo_id == vehiculo_id)
        .order_by(Movimiento.fecha_hora.desc())
        .first()
    )

    return max(
        vehiculo_km or 0,
        ultimo_chequeo.kilometraje if ultimo_chequeo else 0,
        ultimo_mov.kilometraje if ultimo_mov else 0,
    )


@router.get("/formulario")
def obtener_formulario_chequeo(
    current_user=Depends(require_role(["admin", "operario_chequeo"])),
):
    """Definicion de secciones e items del formulario"""
    total_items = sum(len(seccion["items"]) for seccion in CHEQUEO_FORMULARIO)
    return {
        "secciones": CHEQUEO_FORMULARIO,
        "total_items": total_items,
    }


@router.post("/", response_model=ChequeoResponse, status_code=status.HTTP_201_CREATED)
def crear_chequeo_cabecera(
    chequeo: ChequeoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "operario_chequeo"])),
):
    """Crear cabecera de chequeo (S5-01)"""
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == chequeo.vehiculo_id, Vehiculo.activo.is_(True)).first()
    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehiculo no encontrado o inactivo",
        )

    conductor = db.query(Conductor).filter(Conductor.id == chequeo.conductor_id, Conductor.activo.is_(True)).first()
    if not conductor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conductor no encontrado o inactivo",
        )

    kilometraje_referencia = _get_vehiculo_kilometraje_referencia(
        db,
        chequeo.vehiculo_id,
        vehiculo.kilometraje,
    )
    if chequeo.kilometraje < kilometraje_referencia:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El kilometraje debe ser mayor o igual al ultimo registrado ({kilometraje_referencia} km)",
        )

    db_chequeo = Chequeo(**chequeo.model_dump(), usuario_id=current_user.id)
    db.add(db_chequeo)
    vehiculo.kilometraje = chequeo.kilometraje
    db.commit()
    db.refresh(db_chequeo)

    return ChequeoResponse(
        id=db_chequeo.id,
        vehiculo_id=db_chequeo.vehiculo_id,
        conductor_id=db_chequeo.conductor_id,
        usuario_id=db_chequeo.usuario_id,
        kilometraje=db_chequeo.kilometraje,
        fecha_venc_soat=db_chequeo.fecha_venc_soat,
        fecha_venc_rtm=db_chequeo.fecha_venc_rtm,
        fecha_venc_extintor=db_chequeo.fecha_venc_extintor,
        obs_generales=db_chequeo.obs_generales,
        fecha_hora=db_chequeo.fecha_hora,
        total_items=0,
    )


@router.post("/{chequeo_id}/items", response_model=ChequeoItemsResponse)
def crear_chequeo_items(
    chequeo_id: int,
    payload: ChequeoItemsCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "operario_chequeo"])),
):
    """Guardar items del chequeo en lote (S5-02)"""
    chequeo = db.query(Chequeo).filter(Chequeo.id == chequeo_id).first()
    if not chequeo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chequeo no encontrado",
        )

    if current_user.rol == "operario_chequeo" and chequeo.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes modificar items de un chequeo de otro usuario",
        )

    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes enviar al menos un item de chequeo",
        )

    recibidos = set()
    for item in payload.items:
        key = (item.seccion, item.item)
        if key not in TEMPLATE_LOOKUP:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Item no valido: {item.seccion}.{item.item}",
            )

        if item.valor not in TEMPLATE_LOOKUP[key]:
            opciones = ", ".join(sorted(TEMPLATE_LOOKUP[key]))
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Valor no valido para {item.seccion}.{item.item}. Opciones permitidas: {opciones}",
            )

        recibidos.add(key)

    faltantes = [
        f"{seccion}.{item}" for (seccion, item) in TEMPLATE_LOOKUP.keys() if (seccion, item) not in recibidos
    ]
    if faltantes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Faltan items por responder ({len(faltantes)} pendientes)",
        )

    db.query(ChequeoItem).filter(ChequeoItem.chequeo_id == chequeo_id).delete(synchronize_session=False)

    VALORES_MANTENIMIENTO = {"no_conforme", "mal_estado", "largo", "genera_ruido", "vibra", "tira_lado", "bajo", "presenta_fugas", "no_tiene", "incompleto"}

    secciones_con_obs = {item.seccion for item in payload.items if item.observacion}

    items_con_mantenimiento = []
    for item in payload.items:
        db_item = ChequeoItem(
            chequeo_id=chequeo_id,
            seccion=item.seccion,
            item=item.item,
            valor=item.valor,
            observacion=item.observacion,
            marcar_mantenimiento=item.marcar_mantenimiento or False,
        )
        db.add(db_item)
        db.flush()

        requiere_mante = (
            item.marcar_mantenimiento or
            (item.valor in VALORES_MANTENIMIENTO and (item.observacion or item.seccion in secciones_con_obs))
        )
        if requiere_mante:
            items_con_mantenimiento.append(db_item)

    if items_con_mantenimiento:
        vehiculo = chequeo.vehiculo
        descripcion = f"Desde chequeo #{chequeo_id}: "
        descripcion += "; ".join(
            f"{i.seccion}/{i.item}: {i.observacion or 'Sin observación'}"
            for i in items_con_mantenimiento
        )

        db_mante = Mantenimiento(
            vehiculo_id=chequeo.vehiculo_id,
            tipo="correctivo",
            descripcion=descripcion[:500],
            kilometraje=chequeo.kilometraje,
            estado="pendiente",
            creado_por=current_user.id,
            chequeo_origen_id=chequeo_id,
        )
        db.add(db_mante)
        db.flush()

        for ci in items_con_mantenimiento:
            ci.mantenimiento_id = db_mante.id
            db.add(MantenimientoItem(
                mantenimiento_id=db_mante.id,
                chequeo_item_id=ci.id,
                seccion=ci.seccion,
                item=ci.item,
                observacion=ci.observacion,
            ))

        mecanicos = db.query(Usuario).filter(Usuario.rol == "mecanico", Usuario.activo.is_(True)).all()
        for mec in mecanicos:
            db.add(Notificacion(
                usuario_id=mec.id,
                tipo="nuevo_mantenimiento",
                titulo=f"Nuevo mantenimiento - {vehiculo.placa}",
                mensaje=f"Desde chequeo #{chequeo_id}: {len(items_con_mantenimiento)} ítem(es) requieren atención",
                referencia_tipo="mantenimiento",
                referencia_id=db_mante.id,
            ))

        db.flush()

    db.commit()

    mensaje = "Items de chequeo guardados correctamente"
    if items_con_mantenimiento:
        mensaje += f" y se crearon {len(items_con_mantenimiento)} tarea(s) de mantenimiento"

    return ChequeoItemsResponse(
        chequeo_id=chequeo_id,
        guardados=len(payload.items),
        message=mensaje,
    )


@router.get("/", response_model=List[ChequeoListResponse])
def listar_chequeos(
    skip: int = 0,
    limit: int = 50,
    vehiculo_id: int = None,
    conductor_id: int = None,
    usuario_id: int = None,
    fecha_inicio: date = None,
    fecha_fin: date = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "operario_chequeo"])),
):
    """Listar chequeos con filtros (S5-03)"""
    query = db.query(Chequeo)

    if current_user.rol == "operario_chequeo":
        query = query.filter(Chequeo.usuario_id == current_user.id)

    if vehiculo_id:
        query = query.filter(Chequeo.vehiculo_id == vehiculo_id)
    if conductor_id:
        query = query.filter(Chequeo.conductor_id == conductor_id)
    if usuario_id and current_user.rol == "admin":
        query = query.filter(Chequeo.usuario_id == usuario_id)
    if fecha_inicio:
        query = query.filter(Chequeo.fecha_hora >= datetime.combine(fecha_inicio, datetime.min.time()))
    if fecha_fin:
        query = query.filter(Chequeo.fecha_hora <= datetime.combine(fecha_fin, datetime.max.time()))

    chequeos = query.order_by(Chequeo.fecha_hora.desc()).offset(skip).limit(limit).all()

    return [
        ChequeoListResponse(
            id=c.id,
            vehiculo_id=c.vehiculo_id,
            conductor_id=c.conductor_id,
            usuario_id=c.usuario_id,
            kilometraje=c.kilometraje,
            fecha_venc_soat=c.fecha_venc_soat,
            fecha_venc_rtm=c.fecha_venc_rtm,
            fecha_venc_extintor=c.fecha_venc_extintor,
            obs_generales=c.obs_generales,
            fecha_hora=c.fecha_hora,
            total_items=len(c.items),
            vehiculo={
                "id": c.vehiculo.id,
                "placa": c.vehiculo.placa,
                "marca": c.vehiculo.marca,
                "modelo": c.vehiculo.modelo,
            }
            if c.vehiculo
            else None,
            conductor={
                "id": c.conductor.id,
                "nombre": c.conductor.nombre,
                "cedula": c.conductor.cedula,
            }
            if c.conductor
            else None,
            usuario={
                "id": c.usuario.id,
                "nombre": c.usuario.nombre,
                "email": c.usuario.email,
            }
            if c.usuario
            else None,
        )
        for c in chequeos
    ]


@router.get("/{chequeo_id}", response_model=ChequeoDetailResponse)
def obtener_chequeo_detalle(
    chequeo_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(["admin", "operario_chequeo"])),
):
    """Obtener detalle completo de un chequeo"""
    chequeo = db.query(Chequeo).filter(Chequeo.id == chequeo_id).first()
    if not chequeo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chequeo no encontrado",
        )

    if current_user.rol == "operario_chequeo" and chequeo.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver este chequeo",
        )

    return ChequeoDetailResponse(
        id=chequeo.id,
        vehiculo_id=chequeo.vehiculo_id,
        conductor_id=chequeo.conductor_id,
        usuario_id=chequeo.usuario_id,
        kilometraje=chequeo.kilometraje,
        fecha_venc_soat=chequeo.fecha_venc_soat,
        fecha_venc_rtm=chequeo.fecha_venc_rtm,
        fecha_venc_extintor=chequeo.fecha_venc_extintor,
        obs_generales=chequeo.obs_generales,
        fecha_hora=chequeo.fecha_hora,
        vehiculo={
            "id": chequeo.vehiculo.id,
            "placa": chequeo.vehiculo.placa,
            "marca": chequeo.vehiculo.marca,
            "modelo": chequeo.vehiculo.modelo,
        }
        if chequeo.vehiculo
        else None,
        conductor={
            "id": chequeo.conductor.id,
            "nombre": chequeo.conductor.nombre,
            "cedula": chequeo.conductor.cedula,
        }
        if chequeo.conductor
        else None,
        usuario={
            "id": chequeo.usuario.id,
            "nombre": chequeo.usuario.nombre,
            "email": chequeo.usuario.email,
        }
        if chequeo.usuario
        else None,
        items=[
            ChequeoItemResponse(
                id=item.id,
                seccion=item.seccion,
                item=item.item,
                valor=item.valor,
                observacion=item.observacion,
            )
            for item in chequeo.items
        ],
    )
