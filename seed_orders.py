from app.db.database import SessionLocal
from app.models.models import OrdenTrabajo, Vehiculo, Usuario
from datetime import datetime

db = SessionLocal()
vehiculo = db.query(Vehiculo).first()
responsable = db.query(Usuario).filter(Usuario.rol == "mecanico").first()
admin = db.query(Usuario).filter(Usuario.rol == "admin").first()

v_id = vehiculo.id if vehiculo else 1
r_id = responsable.id if responsable else (admin.id if admin else 1)

for i in range(3):
    orden = OrdenTrabajo(
        vehiculo_id=v_id,
        responsable_id=r_id,
        descripcion=f"Orden activa de prueba {i+1} para testing",
        prioridad="media",
        estado="en_progreso",
        fecha_creacion=datetime.utcnow()
    )
    db.add(orden)
    
db.commit()
print("Órdenes creadas con éxito")
