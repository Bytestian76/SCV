"""
Modelos de la base de datos - SCV
Basado en el Modelo ER v2.0
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class Usuario(Base):
    """Usuarios que tienen acceso al sistema"""
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(50), nullable=False)  # admin, operario_movimientos, operario_chequeo, mecanico
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    movimientos = relationship("Movimiento", back_populates="usuario")
    chequeos = relationship("Chequeo", back_populates="usuario")
    mantenimientos = relationship("Mantenimiento", back_populates="creador", foreign_keys="Mantenimiento.creado_por")
    notificaciones = relationship("Notificacion", back_populates="usuario")
    fallas = relationship("FallaReportada", back_populates="usuario", foreign_keys="FallaReportada.usuario_id")


class Vehiculo(Base):
    """Catálogo de vehículos"""
    __tablename__ = "vehiculos"

    id = Column(Integer, primary_key=True, index=True)
    placa = Column(String(20), unique=True, nullable=False, index=True)
    marca = Column(String(100), nullable=False)
    modelo = Column(String(100), nullable=False)
    año = Column(Integer, nullable=False)
    empresa = Column(String(255), nullable=True)
    kilometraje = Column(Integer, nullable=False, default=0)
    fecha_venc_soat = Column(Date, nullable=True)
    fecha_venc_rtm = Column(Date, nullable=True)
    activo = Column(Boolean, default=True)

    # Relaciones
    movimientos = relationship("Movimiento", back_populates="vehiculo")
    chequeos = relationship("Chequeo", back_populates="vehiculo")
    mantenimientos = relationship("Mantenimiento", back_populates="vehiculo")
    fallas = relationship("FallaReportada", back_populates="vehiculo", foreign_keys="FallaReportada.vehiculo_id")


class Conductor(Base):
    """Catálogo de conductores"""
    __tablename__ = "conductores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    cedula = Column(String(50), unique=True, nullable=False, index=True)
    licencia = Column(String(50), nullable=False)
    fecha_venc_licencia = Column(Date, nullable=True)
    categoria = Column(String(10), nullable=False)  # C1, C2, C3
    activo = Column(Boolean, default=True)

    # Relaciones
    movimientos = relationship("Movimiento", back_populates="conductor")
    chequeos = relationship("Chequeo", back_populates="conductor")
    fallas = relationship("FallaReportada", back_populates="conductor", foreign_keys="FallaReportada.conductor_id")


class Movimiento(Base):
    """Registro de entradas y salidas de vehículos"""
    __tablename__ = "movimientos"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(20), nullable=False)  # salida, entrada
    vehiculo_id = Column(Integer, ForeignKey("vehiculos.id"), nullable=False)
    conductor_id = Column(Integer, ForeignKey("conductores.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    auxiliar = Column(String(255), nullable=True)
    proveedor = Column(String(255), nullable=True)
    kilometraje = Column(Integer, nullable=False)
    bascula = Column(String(20), nullable=True)
    sacas = Column(Integer, nullable=True)
    cajon = Column(Text, nullable=True)
    observaciones = Column(Text, nullable=True)
    fecha_hora = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    vehiculo = relationship("Vehiculo", back_populates="movimientos")
    conductor = relationship("Conductor", back_populates="movimientos")
    usuario = relationship("Usuario", back_populates="movimientos")


class Chequeo(Base):
    """Cabecera del chequeo preoperacional"""
    __tablename__ = "chequeos"

    id = Column(Integer, primary_key=True, index=True)
    vehiculo_id = Column(Integer, ForeignKey("vehiculos.id"), nullable=False)
    conductor_id = Column(Integer, ForeignKey("conductores.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    kilometraje = Column(Integer, nullable=False)
    fecha_venc_soat = Column(Date, nullable=True)
    fecha_venc_rtm = Column(Date, nullable=True)
    fecha_venc_extintor = Column(Date, nullable=True)
    obs_generales = Column(Text, nullable=True)
    fecha_hora = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    vehiculo = relationship("Vehiculo", back_populates="chequeos")
    conductor = relationship("Conductor", back_populates="chequeos")
    usuario = relationship("Usuario", back_populates="chequeos")
    items = relationship("ChequeoItem", back_populates="chequeo", cascade="all, delete-orphan")


class ChequeoItem(Base):
    """Cada ítem del chequeo preoperacional"""
    __tablename__ = "chequeo_items"

    id = Column(Integer, primary_key=True, index=True)
    chequeo_id = Column(Integer, ForeignKey("chequeos.id"), nullable=False)
    seccion = Column(String(50), nullable=False)  # frenos, luces, cabina, etc.
    item = Column(String(100), nullable=False)
    valor = Column(String(50), nullable=False)  # conforme, no_conforme, etc.
    observacion = Column(Text, nullable=True)
    marcar_mantenimiento = Column(Boolean, default=False)
    mantenimiento_id = Column(Integer, ForeignKey("mantenimientos.id"), nullable=True)

    # Relaciones
    chequeo = relationship("Chequeo", back_populates="items")
    mantenimiento = relationship("Mantenimiento", back_populates="items_origen", foreign_keys=[mantenimiento_id])


class Mantenimiento(Base):
    """Orden de mantenimiento de vehículo"""
    __tablename__ = "mantenimientos"

    id = Column(Integer, primary_key=True, index=True)
    vehiculo_id = Column(Integer, ForeignKey("vehiculos.id"), nullable=False)
    tipo = Column(String(20), nullable=False)  # preventivo, correctivo
    descripcion = Column(Text, nullable=True)
    kilometraje = Column(Integer, nullable=True)
    prioridad = Column(String(20), nullable=True)  # baja, media, alta, critica
    estado = Column(String(30), nullable=False, default="pendiente")  # pendiente, en_progreso, esperando_repuesto, completado, cancelado
    creado_por = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    chequeo_origen_id = Column(Integer, ForeignKey("chequeos.id"), nullable=True)
    falla_origen_id = Column(Integer, ForeignKey("fallas_reportadas.id"), nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, nullable=True)

    # Relaciones
    vehiculo = relationship("Vehiculo", back_populates="mantenimientos")
    creador = relationship("Usuario", back_populates="mantenimientos", foreign_keys=[creado_por])
    items_origen = relationship("ChequeoItem", back_populates="mantenimiento", foreign_keys="ChequeoItem.mantenimiento_id")
    items = relationship("MantenimientoItem", back_populates="mantenimiento", cascade="all, delete-orphan")
    falla_origen = relationship("FallaReportada", foreign_keys=[falla_origen_id])


class MantenimientoItem(Base):
    """Items asociados a un mantenimiento"""
    __tablename__ = "mantenimiento_items"

    id = Column(Integer, primary_key=True, index=True)
    mantenimiento_id = Column(Integer, ForeignKey("mantenimientos.id"), nullable=False)
    chequeo_item_id = Column(Integer, ForeignKey("chequeo_items.id"), nullable=True)
    seccion = Column(String(50), nullable=True)
    item = Column(String(100), nullable=True)
    observacion = Column(Text, nullable=True)
    realizado = Column(Boolean, default=False)

    # Relaciones
    mantenimiento = relationship("Mantenimiento", back_populates="items")


class Notificacion(Base):
    """Notificaciones por usuario"""
    __tablename__ = "notificaciones"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    tipo = Column(String(30), nullable=False)  # nuevo_mantenimiento, cambio_estado, recordatorio
    titulo = Column(String(255), nullable=False)
    mensaje = Column(Text, nullable=True)
    referencia_tipo = Column(String(50), nullable=True)
    referencia_id = Column(Integer, nullable=True)
    leida = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_leida = Column(DateTime, nullable=True)

    # Relaciones
    usuario = relationship("Usuario", back_populates="notificaciones")


class FallaReportada(Base):
    """Fallas reportadas por conductores y chequeos"""
    __tablename__ = "fallas_reportadas"

    id = Column(Integer, primary_key=True, index=True)
    vehiculo_id = Column(Integer, ForeignKey("vehiculos.id"), nullable=False)
    conductor_id = Column(Integer, ForeignKey("conductores.id"), nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    categoria = Column(String(50), nullable=False)
    descripcion = Column(Text, nullable=False)
    prioridad = Column(String(20), nullable=False, default="media")
    estado = Column(String(30), nullable=False, default="pendiente")
    fotos = Column(Text, nullable=True)
    fecha_reporte = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)

    vehiculo = relationship("Vehiculo")
    conductor = relationship("Conductor")
    usuario = relationship("Usuario", foreign_keys=[usuario_id])


class PushSubscription(Base):
    """Suscripciones a Web Push por usuario"""
    __tablename__ = "push_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    endpoint = Column(String(512), nullable=False)
    auth = Column(String(256), nullable=False)
    p256dh = Column(String(256), nullable=False)
    user_agent = Column(String(255), nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, nullable=True)

    usuario = relationship("Usuario")


class TokenRevocado(Base):
    """Tokens revocados por logout para invalidar sesiones activas"""
    __tablename__ = "tokens_revocados"

    id = Column(Integer, primary_key=True, index=True)
    jti = Column(String(64), unique=True, nullable=False, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    token_exp = Column(DateTime, nullable=False)
    fecha_revocacion = Column(DateTime, default=datetime.utcnow)
