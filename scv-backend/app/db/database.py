"""
Configuración de la base de datos
"""

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.schemas.falla import CATEGORIAS_FALLA

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
        if "falla_origen_id" not in columnas_mant:
            alter_statements.append("ALTER TABLE mantenimientos ADD COLUMN falla_origen_id INTEGER REFERENCES fallas_reportadas(id)")

    if "fallas_reportadas" not in tablas:
        alter_statements.append("""
            CREATE TABLE fallas_reportadas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehiculo_id INTEGER NOT NULL REFERENCES vehiculos(id),
                conductor_id INTEGER REFERENCES conductores(id),
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
                categoria VARCHAR(50) NOT NULL,
                descripcion TEXT NOT NULL,
                prioridad VARCHAR(20) NOT NULL DEFAULT 'media',
                estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
                fotos TEXT,
                fecha_reporte DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME
            )
        """)

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
