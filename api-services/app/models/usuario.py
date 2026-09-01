from datetime import datetime, date
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, Date, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.movimiento import Movimiento
    from app.models.chequeo import Chequeo
    from app.models.hallazgo import Hallazgo
    from app.models.orden_trabajo import OrdenTrabajo, OrdenHistorial


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # admin, operario_movimientos, operario_chequeo, mecanico, jefe_mecanicos
    estado_activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Perfil Operativo Integrado (Unificación de Conductores y Operarios)
    cedula: Mapped[Optional[str]] = mapped_column(String(30), unique=True, index=True, nullable=True)
    licencia: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    categoria: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # C1, C2, C3, B1, etc.
    fecha_venc_licencia: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    telefono: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)

    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    fecha_actualizacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relaciones
    movimientos: Mapped[List["Movimiento"]] = relationship("Movimiento", back_populates="usuario")
    chequeos: Mapped[List["Chequeo"]] = relationship("Chequeo", back_populates="usuario")
    hallazgos_reportados: Mapped[List["Hallazgo"]] = relationship("Hallazgo", back_populates="usuario_reporta")
    ordenes_creadas: Mapped[List["OrdenTrabajo"]] = relationship("OrdenTrabajo", foreign_keys="[OrdenTrabajo.creado_por_id]", back_populates="creador")
    ordenes_asignadas: Mapped[List["OrdenTrabajo"]] = relationship("OrdenTrabajo", foreign_keys="[OrdenTrabajo.responsable_id]", back_populates="responsable")
