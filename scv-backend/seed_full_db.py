import sys
import os
import random
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.database import SessionLocal
from app.models.models import (
    Usuario, Vehiculo, Conductor, Movimiento, Chequeo, ChequeoItem, 
    Hallazgo, OrdenTrabajo, NuevaOrdenActividad, NuevaOrdenCosto
)
from app.core.security import get_password_hash

def seed_db():
    db = SessionLocal()
    
    # 1. Usuarios
    print("Creando usuarios...")
    roles = ["operario_movimientos", "operario_chequeo", "mecanico", "jefe_mecanicos"]
    usuarios = []
    
    for i in range(20):
        rol = random.choice(roles)
        u = Usuario(
            nombre=f"Usuario {rol.capitalize()} {i}",
            email=f"user{i}@{rol}.com",
            password_hash=get_password_hash("password123"),
            rol=rol,
            activo=True
        )
        db.add(u)
        usuarios.append(u)
    db.commit()
    
    admin = db.query(Usuario).filter(Usuario.rol == "admin").first()
    if admin:
        usuarios.append(admin)
        
    mecanicos = [u for u in usuarios if u.rol in ["mecanico", "jefe_mecanicos"]]
    
    # 2. Vehículos
    print("Creando vehículos...")
    vehiculos = []
    marcas = ["Hino", "Chevrolet", "Isuzu", "Foton", "Kenworth", "Mack"]
    for i in range(50):
        placa = f"{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}-{random.randint(100, 999)}"
        v = Vehiculo(
            placa=placa,
            marca=random.choice(marcas),
            modelo=str(random.randint(2010, 2025)),
            año=random.randint(2010, 2025),
            empresa="Normetales",
            kilometraje=random.randint(10000, 250000),
            fecha_venc_soat=datetime.utcnow().date() + timedelta(days=random.randint(-30, 300)),
            fecha_venc_rtm=datetime.utcnow().date() + timedelta(days=random.randint(-30, 300)),
            activo=True
        )
        db.add(v)
        vehiculos.append(v)
    db.commit()
    
    # 3. Conductores
    print("Creando conductores...")
    conductores = []
    nombres = ["Juan", "Pedro", "Carlos", "Luis", "Andres", "Diego", "Jose", "Miguel", "David", "Javier"]
    apellidos = ["Gomez", "Rodriguez", "Perez", "Sanchez", "Ramirez", "Torres", "Flores", "Rivera", "Gomez", "Diaz"]
    for i in range(40):
        c = Conductor(
            nombre=f"{random.choice(nombres)} {random.choice(apellidos)}",
            cedula=str(random.randint(10000000, 99999999)),
            licencia=str(random.randint(10000000, 99999999)),
            fecha_venc_licencia=datetime.utcnow().date() + timedelta(days=random.randint(10, 1000)),
            categoria=random.choice(["C1", "C2", "C3"]),
            activo=True
        )
        db.add(c)
        conductores.append(c)
    db.commit()
    
    # 4. Movimientos
    print("Creando movimientos...")
    for i in range(500):
        v = random.choice(vehiculos)
        c = random.choice(conductores)
        u = random.choice(usuarios)
        km = v.kilometraje + random.randint(1, 500)
        v.kilometraje = km  # update vehiculo km
        
        m = Movimiento(
            tipo=random.choice(["entrada", "salida"]),
            vehiculo_id=v.id,
            conductor_id=c.id,
            usuario_id=u.id,
            kilometraje=km,
            fecha_hora=datetime.utcnow() - timedelta(days=random.randint(0, 100), hours=random.randint(0, 23))
        )
        db.add(m)
    db.commit()
    
    # 5. Chequeos e Items
    print("Creando chequeos...")
    secciones = ["frenos", "luces", "llantas", "fluidos", "cabina"]
    for i in range(300):
        v = random.choice(vehiculos)
        c = random.choice(conductores)
        u = random.choice(usuarios)
        
        ch = Chequeo(
            vehiculo_id=v.id,
            conductor_id=c.id,
            usuario_id=u.id,
            kilometraje=v.kilometraje,
            fecha_hora=datetime.utcnow() - timedelta(days=random.randint(0, 60))
        )
        db.add(ch)
        db.commit() # To get ID
        
        for sec in secciones:
            val = random.choices(["conforme", "no_conforme", "no_aplica"], weights=[80, 15, 5])[0]
            item = ChequeoItem(
                chequeo_id=ch.id,
                seccion=sec,
                item=f"Revisión de {sec}",
                valor=val,
                observacion="Necesita atención" if val == "no_conforme" else ""
            )
            db.add(item)
    db.commit()

    # 6. Hallazgos
    print("Creando hallazgos...")
    hallazgos = []
    for i in range(150):
        v = random.choice(vehiculos)
        u = random.choice(usuarios)
        h = Hallazgo(
            vehiculo_id=v.id,
            usuario_reporta_id=u.id,
            origen=random.choice(["manual", "chequeo"]),
            descripcion=f"Falla detectada tipo {i}",
            criticidad=random.choice(["baja", "media", "alta", "critica"]),
            estado=random.choice(["abierto", "evaluado", "convertido_orden"]),
            fecha_creacion=datetime.utcnow() - timedelta(days=random.randint(0, 30))
        )
        db.add(h)
        hallazgos.append(h)
    db.commit()
    
    # 7. Órdenes de Trabajo, Actividades, Costos
    print("Creando órdenes de trabajo...")
    estados_orden = ["pendiente", "asignada", "en_progreso", "pausada", "completada", "cancelada"]
    if not mecanicos:
        mecanicos = usuarios
        
    for i in range(100):
        v = random.choice(vehiculos)
        r = random.choice(mecanicos)
        h = random.choice(hallazgos) if random.random() > 0.5 else None
        
        estado = random.choice(estados_orden)
        
        ot = OrdenTrabajo(
            hallazgo_id=h.id if (h and not h.orden_trabajo) else None,
            vehiculo_id=v.id,
            responsable_id=r.id,
            prioridad=random.choice(["baja", "media", "alta", "urgente"]),
            estado=estado,
            descripcion=f"Orden de trabajo de mantenimiento {i}",
            fecha_creacion=datetime.utcnow() - timedelta(days=random.randint(0, 30))
        )
        db.add(ot)
        db.commit()
        
        # Actividades
        for j in range(random.randint(1, 4)):
            act = NuevaOrdenActividad(
                orden_id=ot.id,
                responsable_id=r.id,
                titulo=f"Actividad {j} para orden {ot.id}",
                estado="completada" if estado == "completada" else random.choice(["pendiente", "en_progreso", "completada"])
            )
            db.add(act)
            
        # Costos
        for j in range(random.randint(0, 3)):
            cost = NuevaOrdenCosto(
                orden_id=ot.id,
                tipo_gasto=random.choice(["repuesto", "mano_obra", "consumible"]),
                descripcion=f"Costo {j} de la orden {ot.id}",
                valor_unitario=random.randint(5000, 150000),
                cantidad=random.randint(1, 5)
            )
            cost.valor_total = cost.valor_unitario * cost.cantidad
            db.add(cost)
            
    db.commit()
    
    print("✅ Base de datos poblada masivamente con éxito!")

if __name__ == "__main__":
    seed_db()
