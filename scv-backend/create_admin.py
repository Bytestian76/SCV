import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.models import Usuario
from app.core.security import get_password_hash

db = SessionLocal()

# Check if admin exists
admin = db.query(Usuario).filter(Usuario.email == "admin@normetales.com").first()
if not admin:
    print("Creando usuario admin...")
    admin = Usuario(
        nombre="Administrador",
        email="admin@normetales.com",
        password_hash=get_password_hash("admin123"),
        rol="admin",
        activo=True
    )
    db.add(admin)
    db.commit()
    print("Admin creado con éxito: admin@normetales.com / admin123")
else:
    print("El usuario admin ya existe.")

db.close()
