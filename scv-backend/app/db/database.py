"""
Configuración de la base de datos
"""

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# URL de la base de datos SQLite
DATABASE_URL = "sqlite:///./scv.db"

# Crear motor de base de datos
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Necesario para SQLite
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

        if "fecha_venc_soat" not in columnas_vehiculos:
            alter_statements.append("ALTER TABLE vehiculos ADD COLUMN fecha_venc_soat DATE")

        if "fecha_venc_rtm" not in columnas_vehiculos:
            alter_statements.append("ALTER TABLE vehiculos ADD COLUMN fecha_venc_rtm DATE")

    if "conductores" in tablas:
        columnas_conductores = {column["name"] for column in inspector.get_columns("conductores")}

        if "fecha_venc_licencia" not in columnas_conductores:
            alter_statements.append("ALTER TABLE conductores ADD COLUMN fecha_venc_licencia DATE")

    if not alter_statements:
        return

    with engine.begin() as connection:
        for statement in alter_statements:
            connection.execute(text(statement))
