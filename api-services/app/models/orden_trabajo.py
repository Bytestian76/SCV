from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import String, Integer, Numeric, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.vehiculo import Vehiculo
    from app.models.usuario import Usuario
    from app.models.hallazgo import Hallazgo


class OrdenTrabajo(Base):
    __tablename__ = "ordenes_trabajo"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    codigo: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)  # OT-2026-0001
    vehiculo_id: Mapped[int] = mapped_column(ForeignKey("vehiculos.id", ondelete="RESTRICT"), index=True, nullable=False)
    hallazgo_id: Mapped[Optional[int]] = mapped_column(ForeignKey("hallazgos.id", ondelete="SET NULL"), nullable=True)
    creado_por_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False)
    responsable_id: Mapped[Optional[int]] = mapped_column(ForeignKey("usuarios.id", ondelete="SET NULL"), index=True, nullable=True)
    
    prioridad: Mapped[str] = mapped_column(String(20), default="media", nullable=False)  # baja, media, alta, urgente
    estado: Mapped[str] = mapped_column(String(30), default="pendiente", index=True, nullable=False)  # pendiente, en_progreso, completada, cancelada
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    
    fecha_inicio: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    fecha_cierre: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relaciones
    vehiculo: Mapped["Vehiculo"] = relationship("Vehiculo", back_populates="ordenes_trabajo")
    hallazgo: Mapped[Optional["Hallazgo"]] = relationship("Hallazgo", back_populates="ordenes_trabajo")
    creador: Mapped["Usuario"] = relationship("Usuario", foreign_keys=[creado_por_id], back_populates="ordenes_creadas")
    responsable: Mapped[Optional["Usuario"]] = relationship("Usuario", foreign_keys=[responsable_id], back_populates="ordenes_asignadas")
    
    actividades: Mapped[List["OrdenActividad"]] = relationship("OrdenActividad", back_populates="orden", cascade="all, delete-orphan")
    costos: Mapped[List["OrdenCosto"]] = relationship("OrdenCosto", back_populates="orden", cascade="all, delete-orphan")
    evidencias: Mapped[List["OrdenEvidencia"]] = relationship("OrdenEvidencia", back_populates="orden", cascade="all, delete-orphan")
    historial: Mapped[List["OrdenHistorial"]] = relationship("OrdenHistorial", back_populates="orden", cascade="all, delete-orphan")


class OrdenActividad(Base):
    __tablename__ = "ordenes_actividades"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(ForeignKey("ordenes_trabajo.id", ondelete="CASCADE"), index=True, nullable=False)
    titulo: Mapped[str] = mapped_column(String(150), nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    estado: Mapped[str] = mapped_column(String(30), default="pendiente", nullable=False)  # pendiente, en_progreso, completada
    completado_por_id: Mapped[Optional[int]] = mapped_column(ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    fecha_completado: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    orden: Mapped["OrdenTrabajo"] = relationship("OrdenTrabajo", back_populates="actividades")


class OrdenCosto(Base):
    __tablename__ = "ordenes_costos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(ForeignKey("ordenes_trabajo.id", ondelete="CASCADE"), index=True, nullable=False)
    tipo_gasto: Mapped[str] = mapped_column(String(50), nullable=False)  # repuesto, mano_obra, servicio_externo, herramienta, otro
    descripcion: Mapped[str] = mapped_column(String(200), nullable=False)
    cantidad: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("1.0"), nullable=False)
    valor_unitario: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    total_calculado: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    registrado_por_id: Mapped[Optional[int]] = mapped_column(ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    fecha_registro: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    orden: Mapped["OrdenTrabajo"] = relationship("OrdenTrabajo", back_populates="costos")


class OrdenEvidencia(Base):
    __tablename__ = "ordenes_evidencias"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(ForeignKey("ordenes_trabajo.id", ondelete="CASCADE"), index=True, nullable=False)
    tipo: Mapped[str] = mapped_column(String(50), nullable=False)  # foto_antes, foto_durante, foto_despues, factura, documento, otro
    ruta_archivo: Mapped[str] = mapped_column(String(500), nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    subido_por_id: Mapped[Optional[int]] = mapped_column(ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    fecha_registro: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    orden: Mapped["OrdenTrabajo"] = relationship("OrdenTrabajo", back_populates="evidencias")


class OrdenHistorial(Base):
    """Bitácora inmutable de auditoría para trazabilidad de mantenimiento."""
    __tablename__ = "ordenes_historial"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    orden_id: Mapped[int] = mapped_column(ForeignKey("ordenes_trabajo.id", ondelete="CASCADE"), index=True, nullable=False)
    usuario_id: Mapped[Optional[int]] = mapped_column(ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    accion: Mapped[str] = mapped_column(String(60), nullable=False)
    campo_modificado: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    valor_anterior: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    valor_nuevo: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_usuario: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    fecha_registro: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True, nullable=False
    )

    orden: Mapped["OrdenTrabajo"] = relationship("OrdenTrabajo", back_populates="historial")
