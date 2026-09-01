from datetime import datetime
from typing import Optional, TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import String, Integer, Numeric, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.vehiculo import Vehiculo
    from app.models.usuario import Usuario


class Movimiento(Base):
    __tablename__ = "movimientos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    tipo: Mapped[str] = mapped_column(String(20), default="salida", nullable=False)  # entrada, salida
    vehiculo_id: Mapped[int] = mapped_column(ForeignKey("vehiculos.id", ondelete="RESTRICT"), index=True, nullable=False)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="RESTRICT"), index=True, nullable=False)
    
    auxiliar: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    proveedor: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    kilometraje: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    bascula_peso: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    cantidad_sacas: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    estado_cajon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    observaciones: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    fecha_registro: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True, nullable=False
    )

    # Relaciones
    vehiculo: Mapped["Vehiculo"] = relationship("Vehiculo", back_populates="movimientos")
    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="movimientos")
