from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from app.db.session import get_db
from app.models.vehiculo import Vehiculo
from app.models.hallazgo import Hallazgo
from app.schemas.dashboard import ActiveAlertItem

router = APIRouter()

@router.get("/", response_model=List[ActiveAlertItem], summary="Obtener alertas realtime")
def get_alertas(
    db: Session = Depends(get_db)
):
    today = date.today()
    limite_vencimiento = today + timedelta(days=30)
    alerts_list = []
    
    vencidos = db.query(Vehiculo).filter(
        (Vehiculo.fecha_venc_soat <= limite_vencimiento) | (Vehiculo.fecha_venc_rtm <= limite_vencimiento)
    ).all()
    
    for v in vencidos:
        doc = "SOAT" if (v.fecha_venc_soat and v.fecha_venc_soat <= limite_vencimiento) else "RTM"
        alerts_list.append(
            ActiveAlertItem(
                id=f"venc-{v.id}",
                tipo="mantenimiento_vencido",
                titulo=f"Vehículo {v.placa}",
                descripcion=f"Documento {doc} próximo a vencer o vencido",
                tiempo_relativo="Actual",
                severidad="critica",
            )
        )
        
    hallazgos_criticos = db.query(Hallazgo).join(Vehiculo).filter(
        Hallazgo.estado == "abierto",
        Hallazgo.criticidad.in_(["alta", "critica"])
    ).all()
    
    for h in hallazgos_criticos:
        alerts_list.append(
            ActiveAlertItem(
                id=f"hallazgo-{h.id}",
                tipo="hallazgo_critico",
                titulo=f"Vehículo {h.vehiculo.placa}",
                descripcion=h.descripcion[:60],
                tiempo_relativo="Actual",
                severidad="critica" if h.criticidad == "critica" else "advertencia",
            )
        )
        
    return alerts_list
