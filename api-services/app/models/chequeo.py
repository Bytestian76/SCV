from datetime import datetime, date
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Date, Boolean, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.vehiculo import Vehiculo
    from app.models.usuario import Usuario
    from app.models.hallazgo import Hallazgo


class Chequeo(Base):
    __tablename__ = "chequeos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    vehiculo_id: Mapped[int] = mapped_column(ForeignKey("vehiculos.id", ondelete="RESTRICT"), index=True, nullable=False)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="RESTRICT"), index=True, nullable=False)
    
    kilometraje: Mapped[int] = mapped_column(Integer, nullable=False)
    fecha_venc_soat: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    fecha_venc_rtm: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    fecha_venc_extintor: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    aprobado: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    observaciones_generales: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    fecha_registro: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True, nullable=False
    )

    # Relaciones
    vehiculo: Mapped["Vehiculo"] = relationship("Vehiculo", back_populates="chequeos")
    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="chequeos")
    items: Mapped[List["ChequeoItem"]] = relationship("ChequeoItem", back_populates="chequeo", cascade="all, delete-orphan")


class ChequeoItem(Base):
    __tablename__ = "chequeo_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    chequeo_id: Mapped[int] = mapped_column(ForeignKey("chequeos.id", ondelete="CASCADE"), index=True, nullable=False)
    seccion: Mapped[str] = mapped_column(String(60), nullable=False)  # luces, frenos, llantas, fluidos, cabina, etc.
    item: Mapped[str] = mapped_column(String(100), nullable=False)
    valor: Mapped[str] = mapped_column(String(30), nullable=False)  # conforme, no_conforme, no_aplica
    observacion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relaciones
    chequeo: Mapped["Chequeo"] = relationship("Chequeo", back_populates="items")
    hallazgos: Mapped[List["Hallazgo"]] = relationship("Hallazgo", back_populates="chequeo_item")
