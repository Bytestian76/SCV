from datetime import datetime, date
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Date, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.movimiento import Movimiento
    from app.models.chequeo import Chequeo
    from app.models.hallazgo import Hallazgo
    from app.models.orden_trabajo import OrdenTrabajo


class Vehiculo(Base):
    __tablename__ = "vehiculos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    placa: Mapped[str] = mapped_column(String(10), unique=True, index=True, nullable=False)
    marca: Mapped[str] = mapped_column(String(60), nullable=False)
    modelo: Mapped[str] = mapped_column(String(60), nullable=False)
    año: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    kilometraje: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    fecha_venc_soat: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    fecha_venc_rtm: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    estado: Mapped[str] = mapped_column(String(30), default="activo", index=True, nullable=False)  # activo, en_taller, inactivo, baja
    observaciones: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relaciones
    movimientos: Mapped[List["Movimiento"]] = relationship("Movimiento", back_populates="vehiculo")
    chequeos: Mapped[List["Chequeo"]] = relationship("Chequeo", back_populates="vehiculo")
    hallazgos: Mapped[List["Hallazgo"]] = relationship("Hallazgo", back_populates="vehiculo")
    ordenes_trabajo: Mapped[List["OrdenTrabajo"]] = relationship("OrdenTrabajo", back_populates="vehiculo")
