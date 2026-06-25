"""
Configuración de la base de datos
"""

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# URL de base de datos desde configuracion (.env)
DATABASE_URL = settings.DATABASE_URL

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    # Necesario para SQLite (incluye rutas de archivo locales o en volumen)
    connect_args = {"check_same_thread": False}

# Crear motor de base de datos
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
)

# Sesión factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()


def get_db():
    """Obtener sesión de base de datos"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Inicializar la base de datos (crear tablas)"""
    Base.metadata.create_all(bind=engine)


def apply_schema_updates():
    """Aplica cambios de esquema incrementales para SQLite existente."""
    inspector = inspect(engine)
    tablas = set(inspector.get_table_names())
    if not tablas:
        return

    alter_statements = []

    if "vehiculos" in tablas:
        columnas_vehiculos = {column["name"] for column in inspector.get_columns("vehiculos")}

        if "kilometraje" not in columnas_vehiculos:
            alter_statements.append("ALTER TABLE vehiculos ADD COLUMN kilometraje INTEGER NOT NULL DEFAULT 0")

        if "fecha_venc_soat" not in columnas_vehiculos:
            alter_statements.append("ALTER TABLE vehiculos ADD COLUMN fecha_venc_soat DATE")

        if "fecha_venc_rtm" not in columnas_vehiculos:
            alter_statements.append("ALTER TABLE vehiculos ADD COLUMN fecha_venc_rtm DATE")

        if "especificaciones" not in columnas_vehiculos:
            alter_statements.append("ALTER TABLE vehiculos ADD COLUMN especificaciones TEXT")

    if "conductores" in tablas:
        columnas_conductores = {column["name"] for column in inspector.get_columns("conductores")}

        if "fecha_venc_licencia" not in columnas_conductores:
            alter_statements.append("ALTER TABLE conductores ADD COLUMN fecha_venc_licencia DATE")

    if "chequeo_items" in tablas:
        columnas_ci = {column["name"] for column in inspector.get_columns("chequeo_items")}
        if "marcar_mantenimiento" not in columnas_ci:
            alter_statements.append("ALTER TABLE chequeo_items ADD COLUMN marcar_mantenimiento BOOLEAN DEFAULT 0")
        if "mantenimiento_id" not in columnas_ci:
            alter_statements.append("ALTER TABLE chequeo_items ADD COLUMN mantenimiento_id INTEGER REFERENCES mantenimientos(id)")

    if "mantenimientos" in tablas:
        columnas_mant = {column["name"] for column in inspector.get_columns("mantenimientos")}
        if "prioridad" not in columnas_mant:
            alter_statements.append("ALTER TABLE mantenimientos ADD COLUMN prioridad VARCHAR(20)")
    if "orden_actividades" not in tablas:
        alter_statements.append("""
            CREATE TABLE orden_actividades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mantenimiento_id INTEGER NOT NULL REFERENCES mantenimientos(id),
                descripcion TEXT NOT NULL,
                responsable VARCHAR(140),
                fecha_inicio DATETIME,
                fecha_fin DATETIME,
                estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME
            )
        """)

    if "orden_evidencias" not in tablas:
        alter_statements.append("""
            CREATE TABLE orden_evidencias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                actividad_id INTEGER NOT NULL REFERENCES orden_actividades(id),
                tipo VARCHAR(20) NOT NULL DEFAULT 'foto',
                archivo_url TEXT,
                descripcion TEXT,
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

    if "hallazgos" not in tablas:
        alter_statements.append("""
            CREATE TABLE hallazgos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehiculo_id INTEGER NOT NULL REFERENCES vehiculos(id),
                chequeo_id INTEGER REFERENCES chequeos(id),
                usuario_reporta_id INTEGER NOT NULL REFERENCES usuarios(id),
                origen VARCHAR(20) NOT NULL DEFAULT 'manual',
                descripcion TEXT NOT NULL,
                criticidad VARCHAR(20) NOT NULL DEFAULT 'media',
                tipo VARCHAR(20) NOT NULL DEFAULT 'operacion',
                categoria VARCHAR(50),
                estado VARCHAR(30) NOT NULL DEFAULT 'abierto',
                observaciones TEXT,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

    if "hallazgos" in tablas:
        columnas_hallazgos = {column["name"] for column in inspector.get_columns("hallazgos")}
        if "tipo" not in columnas_hallazgos:
            alter_statements.append("ALTER TABLE hallazgos ADD COLUMN tipo VARCHAR(20) NOT NULL DEFAULT 'operacion'")
        if "categoria" not in columnas_hallazgos:
            alter_statements.append("ALTER TABLE hallazgos ADD COLUMN categoria VARCHAR(50)")

    if "ordenes_trabajo" not in tablas:
        alter_statements.append("""
            CREATE TABLE ordenes_trabajo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hallazgo_id INTEGER NOT NULL UNIQUE REFERENCES hallazgos(id),
                vehiculo_id INTEGER NOT NULL REFERENCES vehiculos(id),
                responsable_id INTEGER REFERENCES usuarios(id),
                prioridad VARCHAR(20) NOT NULL DEFAULT 'media',
                estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
                descripcion TEXT,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                fecha_inicio DATETIME,
                fecha_cierre DATETIME,
                hora_inicio VARCHAR(10),
                hora_fin VARCHAR(10)
            )
        """)
    else:
        columnas_ot = {column["name"] for column in inspector.get_columns("ordenes_trabajo")}
        if "hora_inicio" not in columnas_ot:
            alter_statements.append("ALTER TABLE ordenes_trabajo ADD COLUMN hora_inicio VARCHAR(10)")
        if "hora_fin" not in columnas_ot:
            alter_statements.append("ALTER TABLE ordenes_trabajo ADD COLUMN hora_fin VARCHAR(10)")

    if "ordenes_actividades" not in tablas:
        alter_statements.append("""
            CREATE TABLE ordenes_actividades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orden_id INTEGER NOT NULL REFERENCES ordenes_trabajo(id),
                responsable_id INTEGER REFERENCES usuarios(id),
                titulo VARCHAR(255) NOT NULL,
                descripcion TEXT,
                estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                fecha_inicio DATETIME,
                fecha_fin DATETIME
            )
        """)

    if "ordenes_costos" not in tablas:
        alter_statements.append("""
            CREATE TABLE ordenes_costos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orden_id INTEGER NOT NULL REFERENCES ordenes_trabajo(id),
                tipo_gasto VARCHAR(30) NOT NULL DEFAULT 'otro',
                proveedor VARCHAR(255),
                numero_factura VARCHAR(100),
                descripcion TEXT NOT NULL,
                cantidad INTEGER NOT NULL DEFAULT 1,
                valor_unitario INTEGER NOT NULL DEFAULT 0,
                valor_total INTEGER NOT NULL DEFAULT 0,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

    if "ordenes_evidencias" not in tablas:
        alter_statements.append("""
            CREATE TABLE ordenes_evidencias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orden_id INTEGER REFERENCES ordenes_trabajo(id),
                actividad_id INTEGER REFERENCES ordenes_actividades(id),
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
                tipo VARCHAR(20) NOT NULL DEFAULT 'foto',
                ruta_archivo TEXT,
                nombre_original VARCHAR(255),
                descripcion TEXT,
                fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

    if "ordenes_historial" not in tablas:
        alter_statements.append("""
            CREATE TABLE ordenes_historial (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orden_id INTEGER NOT NULL REFERENCES ordenes_trabajo(id),
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
                accion VARCHAR(50) NOT NULL,
                tabla VARCHAR(50),
                campo VARCHAR(50),
                valor_anterior TEXT,
                valor_nuevo TEXT,
                fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
                ip_usuario VARCHAR(50),
                user_agent VARCHAR(255)
            )
        """)

    if "orden_costos" not in tablas:
        alter_statements.append("""
            CREATE TABLE orden_costos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mantenimiento_id INTEGER NOT NULL REFERENCES mantenimientos(id),
                tipo VARCHAR(20) NOT NULL DEFAULT 'repuesto',
                descripcion TEXT NOT NULL,
                cantidad INTEGER NOT NULL DEFAULT 1,
                valor_unitario INTEGER NOT NULL DEFAULT 0,
                total INTEGER NOT NULL DEFAULT 0,
                proveedor VARCHAR(140),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

    if "auditoria_mantenimiento" not in tablas:
        alter_statements.append("""
            CREATE TABLE auditoria_mantenimiento (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mantenimiento_id INTEGER NOT NULL REFERENCES mantenimientos(id),
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
                accion VARCHAR(30) NOT NULL,
                estado_anterior VARCHAR(30),
                estado_nuevo VARCHAR(30),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

    if not alter_statements:
        return

    with engine.begin() as connection:
        for statement in alter_statements:
            connection.execute(text(statement))

        if "vehiculos" in tablas:
            columnas_vehiculos = {column["name"] for column in inspector.get_columns("vehiculos")}
            if "kilometraje" in columnas_vehiculos or any("kilometraje" in stmt for stmt in alter_statements):
                connection.execute(text("""
                    UPDATE vehiculos
                    SET kilometraje = COALESCE((
                        SELECT MAX(km) FROM (
                            SELECT kilometraje AS km FROM movimientos WHERE vehiculo_id = vehiculos.id
                            UNION ALL
                            SELECT kilometraje AS km FROM chequeos WHERE vehiculo_id = vehiculos.id
                        )
                    ), 0)
                    WHERE kilometraje = 0
                """))
