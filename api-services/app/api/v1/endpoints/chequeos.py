from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.chequeo import Chequeo, ChequeoItem
from app.models.vehiculo import Vehiculo
from app.models.hallazgo import Hallazgo
from app.models.usuario import Usuario
from app.schemas.chequeo import ChequeoCreate, ChequeoResponse

router = APIRouter()


@router.get("/", response_model=List[ChequeoResponse], summary="Listar Inspecciones Preoperacionales")
def get_chequeos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    vehiculo_id: Optional[int] = Query(None, description="Filtrar por vehículo"),
    aprobado: Optional[bool] = Query(None, description="Filtrar por estado de aprobación"),
    skip: int = 0,
    limit: int = 50,
):
    query = db.query(Chequeo).join(Vehiculo).join(Usuario)
    if vehiculo_id:
        query = query.filter(Chequeo.vehiculo_id == vehiculo_id)
    if aprobado is not None:
        query = query.filter(Chequeo.aprobado == aprobado)

    return query.order_by(desc(Chequeo.fecha_registro)).offset(skip).limit(limit).all()


@router.post("/", response_model=ChequeoResponse, status_code=status.HTTP_201_CREATED, summary="Registrar Chequeo Preoperacional")
def create_chequeo(
    chequeo_in: ChequeoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == chequeo_in.vehiculo_id).first()
    if not vehiculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehículo no encontrado")

    # Evaluar si todos los ítems están conformes
    tiene_no_conformes = any(item.valor == "no_conforme" for item in chequeo_in.items)
    aprobado_final = not tiene_no_conformes

    chequeo = Chequeo(
        vehiculo_id=chequeo_in.vehiculo_id,
        usuario_id=chequeo_in.usuario_id or current_user.id,
        kilometraje=chequeo_in.kilometraje,
        fecha_venc_soat=chequeo_in.fecha_venc_soat,
        fecha_venc_rtm=chequeo_in.fecha_venc_rtm,
        fecha_venc_extintor=chequeo_in.fecha_venc_extintor,
        aprobado=aprobado_final,
        observaciones_generales=chequeo_in.observaciones_generales,
    )
    db.add(chequeo)
    db.flush()  # Obtener ID para los items

    # Guardar ítems y generar hallazgos automáticos si hay no-conformidades
    for item_data in chequeo_in.items:
        item = ChequeoItem(
            chequeo_id=chequeo.id,
            seccion=item_data.seccion,
            item=item_data.item,
            valor=item_data.valor,
            observacion=item_data.observacion,
        )
        db.add(item)
        db.flush()

        if item_data.valor == "no_conforme":
            hallazgo = Hallazgo(
                vehiculo_id=vehiculo.id,
                usuario_reporta_id=current_user.id,
                chequeo_item_id=item.id,
                origen="chequeo",
                categoria=item_data.seccion,
                descripcion=f"Falla detectada en {item_data.seccion.upper()} - {item_data.item}: {item_data.observacion or 'No conforme'}",
                criticidad="alta" if item_data.seccion in ["frenos", "luces", "llantas"] else "media",
                estado="abierto",
            )
            db.add(hallazgo)

    db.commit()
    db.refresh(chequeo)
    return chequeo


@router.get("/export/csv", summary="Exportar Chequeos a CSV/Excel")
def export_chequeos_csv(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    vehiculo_id: Optional[int] = Query(None, description="Filtrar por vehículo"),
    aprobado: Optional[bool] = Query(None, description="Filtrar por estado de aprobación"),
    fecha_inicio: Optional[date] = Query(None, description="Fecha inicial"),
    fecha_fin: Optional[date] = Query(None, description="Fecha final"),
):
    import io
    import csv
    from fastapi.responses import Response

    query = db.query(Chequeo).join(Vehiculo).join(Usuario)
    if vehiculo_id:
        query = query.filter(Chequeo.vehiculo_id == vehiculo_id)
    if aprobado is not None:
        query = query.filter(Chequeo.aprobado == aprobado)
    if fecha_inicio:
        query = query.filter(Chequeo.fecha_registro >= fecha_inicio)
    if fecha_fin:
        query = query.filter(Chequeo.fecha_registro <= fecha_fin)

    chequeos = query.order_by(desc(Chequeo.fecha_registro)).all()
    
    output = io.StringIO()
    output.write('\ufeff')
    writer = csv.writer(output, delimiter=';')
    writer.writerow(["ID", "FECHA_HORA", "PLACA", "CONDUCTOR", "KILOMETRAJE", "APROBADO", "VENC_SOAT", "VENC_RTM", "VENC_EXTINTOR", "OBSERVACIONES"])
    
    for ch in chequeos:
        writer.writerow([
            ch.id,
            ch.fecha_registro.strftime("%Y-%m-%d %H:%M:%S") if ch.fecha_registro else "",
            ch.vehiculo.placa if ch.vehiculo else "",
            ch.usuario.nombre if ch.usuario else "",
            ch.kilometraje,
            "APROBADO" if ch.aprobado else "CON_NOVEDAD",
            str(ch.fecha_venc_soat) if ch.fecha_venc_soat else "",
            str(ch.fecha_venc_rtm) if ch.fecha_venc_rtm else "",
            str(ch.fecha_venc_extintor) if ch.fecha_venc_extintor else "",
            ch.observaciones_generales or ""
        ])
    
    csv_data = output.getvalue().encode('utf-8')
    return Response(
        content=csv_data,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=reporte_chequeos_normetales.csv"}
    )


@router.get("/{id}", response_model=ChequeoResponse, summary="Detalle de Chequeo")
def get_chequeo_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    chequeo = db.query(Chequeo).filter(Chequeo.id == id).first()
    if not chequeo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chequeo no encontrado")
    return chequeo


@router.put("/{id}", response_model=ChequeoResponse, summary="Actualizar Observaciones o Estado de Chequeo")
def update_chequeo(
    id: int,
    chequeo_in: ChequeoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    chequeo = db.query(Chequeo).filter(Chequeo.id == id).first()
    if not chequeo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chequeo no encontrado")

    chequeo.kilometraje = chequeo_in.kilometraje
    chequeo.observaciones_generales = chequeo_in.observaciones_generales
    
    # Recalcular aprobación
    tiene_no_conformes = any(item.valor == "no_conforme" for item in chequeo_in.items)
    chequeo.aprobado = not tiene_no_conformes

    db.commit()
    db.refresh(chequeo)
    return chequeo


@router.delete("/{id}", summary="Eliminar Registro de Chequeo")
def delete_chequeo(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    chequeo = db.query(Chequeo).filter(Chequeo.id == id).first()
    if not chequeo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chequeo no encontrado")

    # Eliminar ítems asociados
    db.query(ChequeoItem).filter(ChequeoItem.chequeo_id == id).delete()
    db.delete(chequeo)
    db.commit()
    return {"message": "Inspección eliminada correctamente"}


