"""Script para inicializar tablas de la base de datos sin sobreescribir ni sembrar datos falsos."""
import os
import sys

sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.usuario import Usuario
from app.core.security import get_password_hash


def init_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin_count = db.query(Usuario).filter(Usuario.rol == "admin").count()
        if admin_count == 0:
            admin = Usuario(
                nombre="Administrador Principal",
                email="admin@normetales.com",
                password_hash=get_password_hash("admin123"),
                rol="admin",
                estado_activo=True,
                cedula="1000000001",
            )
            sebas = Usuario(
                nombre="Sebastian Ureña",
                email="sebas.urenasilva@gmail.com",
                password_hash=get_password_hash("admin123"),
                rol="admin",
                estado_activo=True,
                cedula="1000000000",
            )
            db.add_all([admin, sebas])
            db.commit()
            print("[OK] Tablas listas y usuario administrador inicial configurado.")
        else:
            print("[OK] Tablas listas y base de datos operativa.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error al inicializar DB: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
