from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.vehiculo import Vehiculo
    from app.models.usuario import Usuario
    from app.models.chequeo import ChequeoItem
    from app.models.orden_trabajo import OrdenTrabajo


class Hallazgo(Base):
    __tablename__ = "hallazgos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    vehiculo_id: Mapped[int] = mapped_column(ForeignKey("vehiculos.id", ondelete="RESTRICT"), index=True, nullable=False)
    usuario_reporta_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="RESTRICT"), index=True, nullable=False)
    chequeo_item_id: Mapped[Optional[int]] = mapped_column(ForeignKey("chequeo_items.id", ondelete="SET NULL"), nullable=True)
    
    origen: Mapped[str] = mapped_column(String(30), nullable=False)  # chequeo, movimiento, manual
    categoria: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # mecanica, electrica, frenos, neumaticos, fluidos, carroceria, seguridad
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    criticidad: Mapped[str] = mapped_column(String(20), default="media", index=True, nullable=False)  # baja, media, alta, critica
    estado: Mapped[str] = mapped_column(String(30), default="abierto", index=True, nullable=False)  # abierto, en_orden, resuelto, descartado
    
    fecha_registro: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relaciones
    vehiculo: Mapped["Vehiculo"] = relationship("Vehiculo", back_populates="hallazgos")
    usuario_reporta: Mapped["Usuario"] = relationship("Usuario", back_populates="hallazgos_reportados")
    chequeo_item: Mapped[Optional["ChequeoItem"]] = relationship("ChequeoItem", back_populates="hallazgos")
    ordenes_trabajo: Mapped[List["OrdenTrabajo"]] = relationship("OrdenTrabajo", back_populates="hallazgo")
