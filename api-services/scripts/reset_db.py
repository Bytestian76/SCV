"""Script para vaciar la base de datos por completo y dejar solo el usuario Administrador inicial."""
import os
import sys

sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.usuario import Usuario
from app.core.security import get_password_hash


def reset_database(create_admin: bool = True):
    print("[1/2] Eliminando y recreando todas las tablas en la base de datos...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    if create_admin:
        print("[2/2] Creando usuario administrador inicial...")
        db = SessionLocal()
        try:
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
            print("[OK] Base de datos vaciada con exito. Solo usuarios administradores habilitados.")
        except Exception as e:
            db.rollback()
            print(f"[ERROR] Error al crear admin: {e}")
        finally:
            db.close()
    else:
        print("[OK] Base de datos vaciada al 100% sin ningún registro.")


if __name__ == "__main__":
    reset_database(create_admin=True)
