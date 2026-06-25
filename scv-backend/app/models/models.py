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
    hallazgos_reportados = relationship("Hallazgo", back_populates="usuario_reporta", foreign_keys="Hallazgo.usuario_reporta_id")
    ordenes_responsable = relationship("OrdenTrabajo", back_populates="responsable", foreign_keys="OrdenTrabajo.responsable_id")
    actividades_responsable = relationship("NuevaOrdenActividad", back_populates="responsable", foreign_keys="NuevaOrdenActividad.responsable_id")
    evidencias_subidas = relationship("NuevaOrdenEvidencia", back_populates="usuario", foreign_keys="NuevaOrdenEvidencia.usuario_id")
    historial_acciones = relationship("OrdenHistorial", back_populates="usuario", foreign_keys="OrdenHistorial.usuario_id")


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
    especificaciones = Column(Text, nullable=True) # JSON string: {"tipo_aceite": "...", "medida_llantas": "...", "bateria": "..."}
    activo = Column(Boolean, default=True)

    # Relaciones
    movimientos = relationship("Movimiento", back_populates="vehiculo")
    chequeos = relationship("Chequeo", back_populates="vehiculo")
    mantenimientos = relationship("Mantenimiento", back_populates="vehiculo")
    hallazgos = relationship("Hallazgo", back_populates="vehiculo", foreign_keys="Hallazgo.vehiculo_id")
    ordenes_trabajo = relationship("OrdenTrabajo", back_populates="vehiculo", foreign_keys="OrdenTrabajo.vehiculo_id")


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
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, nullable=True)

    # Relaciones
    vehiculo = relationship("Vehiculo", back_populates="mantenimientos")
    creador = relationship("Usuario", back_populates="mantenimientos", foreign_keys=[creado_por])
    items_origen = relationship("ChequeoItem", back_populates="mantenimiento", foreign_keys="ChequeoItem.mantenimiento_id")
    items = relationship("MantenimientoItem", back_populates="mantenimiento", cascade="all, delete-orphan")


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


class OrdenActividad(Base):
    """Actividades detalladas dentro de una orden de mantenimiento"""
    __tablename__ = "orden_actividades"

    id = Column(Integer, primary_key=True, index=True)
    mantenimiento_id = Column(Integer, ForeignKey("mantenimientos.id"), nullable=False)
    descripcion = Column(Text, nullable=False)
    responsable = Column(String(140), nullable=True)
    fecha_inicio = Column(DateTime, nullable=True)
    fecha_fin = Column(DateTime, nullable=True)
    estado = Column(String(30), nullable=False, default="pendiente")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)

    mantenimiento = relationship("Mantenimiento")
    evidencias = relationship("OrdenEvidencia", back_populates="actividad", cascade="all, delete-orphan")


class OrdenEvidencia(Base):
    """Evidencias (fotos/documentos) por actividad"""
    __tablename__ = "orden_evidencias"

    id = Column(Integer, primary_key=True, index=True)
    actividad_id = Column(Integer, ForeignKey("orden_actividades.id"), nullable=False)
    tipo = Column(String(20), nullable=False)  # foto, documento
    archivo_url = Column(Text, nullable=True)
    descripcion = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    actividad = relationship("OrdenActividad", back_populates="evidencias")


class OrdenCosto(Base):
    """Costos asociados a una orden de mantenimiento"""
    __tablename__ = "orden_costos"

    id = Column(Integer, primary_key=True, index=True)
    mantenimiento_id = Column(Integer, ForeignKey("mantenimientos.id"), nullable=False)
    tipo = Column(String(20), nullable=False)  # repuesto, otro
    descripcion = Column(Text, nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    valor_unitario = Column(Integer, nullable=False, default=0)
    total = Column(Integer, nullable=False, default=0)
    proveedor = Column(String(140), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    mantenimiento = relationship("Mantenimiento")


class AuditoriaMantenimiento(Base):
    """Registro de auditoria para cambios en ordenes de mantenimiento"""
    __tablename__ = "auditoria_mantenimiento"

    id = Column(Integer, primary_key=True, index=True)
    mantenimiento_id = Column(Integer, ForeignKey("mantenimientos.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    accion = Column(String(30), nullable=False)  # creacion, cambio_estado, update
    estado_anterior = Column(String(30), nullable=True)
    estado_nuevo = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    mantenimiento = relationship("Mantenimiento")
    usuario = relationship("Usuario")


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


class Hallazgo(Base):
    """Hallazgo: anomalía, falla o condición detectada en un vehículo"""
    __tablename__ = "hallazgos"

    id = Column(Integer, primary_key=True, index=True)
    vehiculo_id = Column(Integer, ForeignKey("vehiculos.id"), nullable=False)
    chequeo_id = Column(Integer, ForeignKey("chequeos.id"), nullable=True)
    usuario_reporta_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    origen = Column(String(20), nullable=False, default="manual")  # chequeo, movimiento, manual
    descripcion = Column(Text, nullable=False)
    criticidad = Column(String(20), nullable=False, default="media")  # baja, media, alta, critica
    tipo = Column(String(20), nullable=False, default="operacion")  # operacion
    categoria = Column(String(50), nullable=True)
    estado = Column(String(30), nullable=False, default="abierto")  # abierto, evaluado, convertido_orden, descartado
    observaciones = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    vehiculo = relationship("Vehiculo")
    chequeo = relationship("Chequeo")
    usuario_reporta = relationship("Usuario", foreign_keys=[usuario_reporta_id])
    orden_trabajo = relationship("OrdenTrabajo", back_populates="hallazgo", uselist=False)


class OrdenTrabajo(Base):
    """Orden de trabajo generada a partir de un hallazgo evaluado"""
    __tablename__ = "ordenes_trabajo"

    id = Column(Integer, primary_key=True, index=True)
    hallazgo_id = Column(Integer, ForeignKey("hallazgos.id"), nullable=True, unique=True)
    vehiculo_id = Column(Integer, ForeignKey("vehiculos.id"), nullable=False)
    responsable_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    responsable_externo = Column(String(255), nullable=True)
    prioridad = Column(String(20), nullable=False, default="media")  # urgente, alta, media, baja
    estado = Column(String(30), nullable=False, default="pendiente")  # pendiente, asignada, en_progreso, pausada, completada, cancelada
    descripcion = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_inicio = Column(DateTime, nullable=True)
    fecha_cierre = Column(DateTime, nullable=True)
    hora_inicio = Column(String(10), nullable=True)
    hora_fin = Column(String(10), nullable=True)

    hallazgo = relationship("Hallazgo", back_populates="orden_trabajo")
    vehiculo = relationship("Vehiculo")
    responsable = relationship("Usuario", foreign_keys=[responsable_id])
    actividades = relationship("NuevaOrdenActividad", back_populates="orden", cascade="all, delete-orphan")
    costos = relationship("NuevaOrdenCosto", back_populates="orden", cascade="all, delete-orphan")
    evidencias = relationship("NuevaOrdenEvidencia", back_populates="orden", cascade="all, delete-orphan")
    historial = relationship("OrdenHistorial", back_populates="orden", cascade="all, delete-orphan")


class NuevaOrdenActividad(Base):
    """Actividades / subtareas para completar una orden de trabajo"""
    __tablename__ = "ordenes_actividades"

    id = Column(Integer, primary_key=True, index=True)
    orden_id = Column(Integer, ForeignKey("ordenes_trabajo.id"), nullable=False)
    responsable_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    estado = Column(String(30), nullable=False, default="pendiente")  # pendiente, en_progreso, completada, cancelada
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_inicio = Column(DateTime, nullable=True)
    fecha_fin = Column(DateTime, nullable=True)

    orden = relationship("OrdenTrabajo", back_populates="actividades")
    responsable = relationship("Usuario", foreign_keys=[responsable_id])
    evidencias = relationship("NuevaOrdenEvidencia", back_populates="actividad", cascade="all, delete-orphan")


class NuevaOrdenCosto(Base):
    """Registro de gastos asociados a una orden de trabajo"""
    __tablename__ = "ordenes_costos"

    id = Column(Integer, primary_key=True, index=True)
    orden_id = Column(Integer, ForeignKey("ordenes_trabajo.id"), nullable=False)
    tipo_gasto = Column(String(30), nullable=False, default="otro")  # repuesto, mano_obra, herramienta, consumible, otro
    proveedor = Column(String(255), nullable=True)
    numero_factura = Column(String(100), nullable=True)
    descripcion = Column(Text, nullable=False)
    cantidad = Column(Integer, nullable=False, default=1)
    valor_unitario = Column(Integer, nullable=False, default=0)
    valor_total = Column(Integer, nullable=False, default=0)
    fecha = Column(DateTime, default=datetime.utcnow)

    orden = relationship("OrdenTrabajo", back_populates="costos")


class NuevaOrdenEvidencia(Base):
    """Archivos asociados a órdenes de trabajo o actividades"""
    __tablename__ = "ordenes_evidencias"

    id = Column(Integer, primary_key=True, index=True)
    orden_id = Column(Integer, ForeignKey("ordenes_trabajo.id"), nullable=True)
    actividad_id = Column(Integer, ForeignKey("ordenes_actividades.id"), nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    tipo = Column(String(20), nullable=False, default="foto")  # foto, documento, video, nota
    ruta_archivo = Column(Text, nullable=True)
    nombre_original = Column(String(255), nullable=True)
    descripcion = Column(Text, nullable=True)
    fecha_subida = Column(DateTime, default=datetime.utcnow)

    orden = relationship("OrdenTrabajo", back_populates="evidencias")
    actividad = relationship("NuevaOrdenActividad", back_populates="evidencias")
    usuario = relationship("Usuario", foreign_keys=[usuario_id])


class OrdenHistorial(Base):
    """Auditoría completa e inmutable de órdenes de trabajo"""
    __tablename__ = "ordenes_historial"

    id = Column(Integer, primary_key=True, index=True)
    orden_id = Column(Integer, ForeignKey("ordenes_trabajo.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    accion = Column(String(50), nullable=False)
    tabla = Column(String(50), nullable=True)
    campo = Column(String(50), nullable=True)
    valor_anterior = Column(Text, nullable=True)
    valor_nuevo = Column(Text, nullable=True)
    fecha_hora = Column(DateTime, default=datetime.utcnow)
    ip_usuario = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)

    orden = relationship("OrdenTrabajo", back_populates="historial")
    usuario = relationship("Usuario", foreign_keys=[usuario_id])
