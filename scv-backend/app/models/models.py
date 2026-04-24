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
    rol = Column(String(50), nullable=False)  # admin, operario_movimientos, operario_chequeo
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    # Relaciones
    movimientos = relationship("Movimiento", back_populates="usuario")
    chequeos = relationship("Chequeo", back_populates="usuario")


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

    # Relaciones
    chequeo = relationship("Chequeo", back_populates="items")


class TokenRevocado(Base):
    """Tokens revocados por logout para invalidar sesiones activas"""
    __tablename__ = "tokens_revocados"

    id = Column(Integer, primary_key=True, index=True)
    jti = Column(String(64), unique=True, nullable=False, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    token_exp = Column(DateTime, nullable=False)
    fecha_revocacion = Column(DateTime, default=datetime.utcnow)
