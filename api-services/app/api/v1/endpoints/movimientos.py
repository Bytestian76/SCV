from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.movimiento import Movimiento
from app.models.vehiculo import Vehiculo
from app.models.usuario import Usuario
from app.schemas.movimiento import MovimientoCreate, MovimientoResponse

router = APIRouter()


@router.get("/", response_model=List[MovimientoResponse], summary="Listar Movimientos de Despacho")
def get_movimientos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    tipo: Optional[str] = Query(None, description="Filtrar por entrada o salida"),
    vehiculo_id: Optional[int] = Query(None, description="Filtrar por vehículo"),
    fecha: Optional[date] = Query(None, description="Filtrar por fecha específica"),
    skip: int = 0,
    limit: int = 50,
):
    query = db.query(Movimiento).join(Vehiculo).join(Usuario)
    if tipo:
        query = query.filter(Movimiento.tipo == tipo)
    if vehiculo_id:
        query = query.filter(Movimiento.vehiculo_id == vehiculo_id)
    if fecha:
        query = query.filter(Movimiento.fecha_registro >= fecha)

    return query.order_by(desc(Movimiento.fecha_registro)).offset(skip).limit(limit).all()


@router.post("/", response_model=MovimientoResponse, status_code=status.HTTP_201_CREATED, summary="Registrar Entrada o Salida")
def create_movimiento(
    movimiento_in: MovimientoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id == movimiento_in.vehiculo_id).first()
    if not vehiculo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehículo no encontrado")

    # Actualizar kilometraje si el nuevo valor es mayor y fue proporcionado
    if movimiento_in.kilometraje is not None and vehiculo.kilometraje is not None:
        if movimiento_in.kilometraje > vehiculo.kilometraje:
            vehiculo.kilometraje = movimiento_in.kilometraje
    elif movimiento_in.kilometraje is not None:
        vehiculo.kilometraje = movimiento_in.kilometraje

    movimiento = Movimiento(
        tipo=movimiento_in.tipo or "salida",
        vehiculo_id=movimiento_in.vehiculo_id,
        usuario_id=movimiento_in.usuario_id or current_user.id,
        auxiliar=movimiento_in.auxiliar,
        proveedor=movimiento_in.proveedor,
        kilometraje=movimiento_in.kilometraje,
        bascula_peso=movimiento_in.bascula_peso,
        cantidad_sacas=movimiento_in.cantidad_sacas,
        estado_cajon=movimiento_in.estado_cajon,
        observaciones=movimiento_in.observaciones,
    )
    db.add(movimiento)
    db.commit()
    db.refresh(movimiento)
    return movimiento


@router.get("/export/csv", summary="Exportar Movimientos a CSV/Excel")
def export_movimientos_csv(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    tipo: Optional[str] = Query(None, description="Filtrar por entrada o salida"),
    vehiculo_id: Optional[int] = Query(None, description="Filtrar por vehículo"),
    fecha_inicio: Optional[date] = Query(None, description="Fecha inicial"),
    fecha_fin: Optional[date] = Query(None, description="Fecha final"),
):
    import io
    import csv
    from fastapi.responses import Response

    query = db.query(Movimiento).join(Vehiculo).join(Usuario)
    if tipo:
        query = query.filter(Movimiento.tipo == tipo)
    if vehiculo_id:
        query = query.filter(Movimiento.vehiculo_id == vehiculo_id)
    if fecha_inicio:
        query = query.filter(Movimiento.fecha_registro >= fecha_inicio)
    if fecha_fin:
        query = query.filter(Movimiento.fecha_registro <= fecha_fin)

    movimientos = query.order_by(desc(Movimiento.fecha_registro)).all()
    
    output = io.StringIO()
    # Write BOM for UTF-8 Excel compatibility
    output.write('\ufeff')
    writer = csv.writer(output, delimiter=';')
    writer.writerow(["ID", "FECHA_HORA", "TIPO", "PLACA", "CONDUCTOR", "AUXILIAR", "PROVEEDOR", "KILOMETRAJE", "PESO_BASCULA_KG", "CANT_SACAS", "ESTADO_CAJON", "OBSERVACIONES"])
    
    for m in movimientos:
        writer.writerow([
            m.id,
            m.fecha_registro.strftime("%Y-%m-%d %H:%M:%S") if m.fecha_registro else "",
            m.tipo.upper() if m.tipo else "",
            m.vehiculo.placa if m.vehiculo else "",
            m.usuario.nombre if m.usuario else "",
            m.auxiliar or "",
            m.proveedor or "",
            m.kilometraje if m.kilometraje is not None else "",
            m.bascula_peso if m.bascula_peso is not None else "",
            m.cantidad_sacas if m.cantidad_sacas is not None else "",
            m.estado_cajon or "",
            m.observaciones or ""
        ])
    
    csv_data = output.getvalue().encode('utf-8')
    return Response(
        content=csv_data,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=reporte_movimientos_normetales.csv"}
    )


@router.get("/{id}", response_model=MovimientoResponse, summary="Obtener Movimiento por ID")
def get_movimiento(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    movimiento = db.query(Movimiento).filter(Movimiento.id == id).first()
    if not movimiento:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movimiento no encontrado")
    return movimiento


@router.put("/{id}", response_model=MovimientoResponse, summary="Actualizar Movimiento de Despacho")
def update_movimiento(
    id: int,
    movimiento_in: MovimientoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    movimiento = db.query(Movimiento).filter(Movimiento.id == id).first()
    if not movimiento:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movimiento no encontrado")

    movimiento.tipo = movimiento_in.tipo or movimiento.tipo
    movimiento.vehiculo_id = movimiento_in.vehiculo_id
    if movimiento_in.usuario_id:
        movimiento.usuario_id = movimiento_in.usuario_id
    movimiento.auxiliar = movimiento_in.auxiliar
    movimiento.proveedor = movimiento_in.proveedor
    movimiento.kilometraje = movimiento_in.kilometraje
    movimiento.bascula_peso = movimiento_in.bascula_peso
    movimiento.cantidad_sacas = movimiento_in.cantidad_sacas
    movimiento.estado_cajon = movimiento_in.estado_cajon
    movimiento.observaciones = movimiento_in.observaciones

    db.commit()
    db.refresh(movimiento)
    return movimiento


@router.delete("/{id}", summary="Eliminar Registro de Movimiento")
def delete_movimiento(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    movimiento = db.query(Movimiento).filter(Movimiento.id == id).first()
    if not movimiento:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movimiento no encontrado")

    db.delete(movimiento)
    db.commit()
    return {"message": "Movimiento eliminado correctamente"}

