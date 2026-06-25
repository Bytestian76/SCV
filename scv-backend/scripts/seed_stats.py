import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Conexión local a la base de datos dentro del contenedor
DATABASE_URL = "sqlite:////app/data/scv.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

from app.models.models import Vehiculo, OrdenTrabajo, NuevaOrdenCosto, NuevaOrdenActividad, Usuario

print("Iniciando inserción de datos de prueba para estadísticas...")

# Obtener o crear un mecánico por defecto
mecanico = db.query(Usuario).filter(Usuario.rol == "mecanico").first()
if not mecanico:
    mecanico = Usuario(
        nombre="Juan Mecánico",
        usuario="juan_mecanico",
        contrasena_hash="pbkdf2:sha256:260000$dummy_hash",
        rol="mecanico",
        activo=True
    )
    db.add(mecanico)
    db.commit()
    db.refresh(mecanico)

# Crear 3 vehículos de prueba con placas conocidas
vehicles_data = [
    {"placa": "XYZ-987", "marca": "Chevrolet", "modelo": "D-Max", "año": 2020, "empresa": "Transportes Test", "kilometraje": 50000, "activo": True},
    {"placa": "AAA-111", "marca": "Toyota", "modelo": "Hilux", "año": 2021, "empresa": "Transportes Test", "kilometraje": 75000, "activo": True},
    {"placa": "BBB-222", "marca": "Ford", "modelo": "Ranger", "año": 2019, "empresa": "Transportes Test", "kilometraje": 120000, "activo": True}
]

vehicles = []
for vd in vehicles_data:
    v = db.query(Vehiculo).filter(Vehiculo.placa == vd["placa"]).first()
    if not v:
        v = Vehiculo(**vd)
        db.add(v)
    vehicles.append(v)
db.commit()

for v in vehicles:
    db.refresh(v)

# Limpiar órdenes antiguas de estos vehículos específicos para evitar duplicados
for v in vehicles:
    db.query(OrdenTrabajo).filter(OrdenTrabajo.vehiculo_id == v.id).delete()
db.commit()

now = datetime.datetime.utcnow()

# Generar órdenes completadas con espaciado temporal para probar el MTBM
orders_data = [
    # Vehículo XYZ-987: MTBM promedio = 13 días
    {
        "vehiculo": vehicles[0],
        "created_days_ago": 35,
        "closed_days_ago": 30,
        "descripcion": "Mantenimiento preventivo 50k km",
        "prioridad": "media",
        "costos": [
            {"tipo_gasto": "repuesto", "descripcion": "Filtros y aceite sintético", "valor_total": 85000},
            {"tipo_gasto": "mano_obra", "descripcion": "Afinación de motor", "valor_total": 40000}
        ]
    },
    {
        "vehiculo": vehicles[0],
        "created_days_ago": 16,
        "closed_days_ago": 15,
        "descripcion": "Cambio de pastillas de freno delanteras",
        "prioridad": "alta",
        "costos": [
            {"tipo_gasto": "repuesto", "descripcion": "Pastillas de freno Bosch", "valor_total": 120000},
            {"tipo_gasto": "mano_obra", "descripcion": "Reemplazo de frenos", "valor_total": 30000}
        ]
    },
    {
        "vehiculo": vehicles[0],
        "created_days_ago": 3,
        "closed_days_ago": 2,
        "descripcion": "Alineación y balanceo preventivo",
        "prioridad": "baja",
        "costos": [
            {"tipo_gasto": "consumible", "descripcion": "Plomos de balanceo", "valor_total": 50000}
        ]
    },

    # Vehículo AAA-111: MTBM promedio = 28 días
    {
        "vehiculo": vehicles[1],
        "created_days_ago": 45,
        "closed_days_ago": 40,
        "descripcion": "Reparación de radiador y fugas",
        "prioridad": "urgente",
        "costos": [
            {"tipo_gasto": "repuesto", "descripcion": "Radiador de aluminio", "valor_total": 350000},
            {"tipo_gasto": "mano_obra", "descripcion": "Montaje e instalación de radiador", "valor_total": 90000}
        ]
    },
    {
        "vehiculo": vehicles[1],
        "created_days_ago": 12,
        "closed_days_ago": 10,
        "descripcion": "Cambio de bujías de encendido",
        "prioridad": "media",
        "costos": [
            {"tipo_gasto": "repuesto", "descripcion": "Bujías Iridium x4", "valor_total": 160000}
        ]
    },

    # Vehículo BBB-222: MTBM promedio = 18 días
    {
        "vehiculo": vehicles[2],
        "created_days_ago": 30,
        "closed_days_ago": 25,
        "descripcion": "Alineación y reparación de faros",
        "prioridad": "baja",
        "costos": [
            {"tipo_gasto": "consumible", "descripcion": "Bombillas halógenas", "valor_total": 15000}
        ]
    },
    {
        "vehiculo": vehicles[2],
        "created_days_ago": 7,
        "closed_days_ago": 5,
        "descripcion": "Reemplazo de kit de embrague",
        "prioridad": "alta",
        "costos": [
            {"tipo_gasto": "repuesto", "descripcion": "Kit de embrague Ford", "valor_total": 580000},
            {"tipo_gasto": "mano_obra", "descripcion": "Reemplazo de embrague", "valor_total": 180000}
        ]
    }
]

for od in orders_data:
    o = OrdenTrabajo(
        vehiculo_id=od["vehiculo"].id,
        responsable_id=mecanico.id,
        prioridad=od["prioridad"],
        estado="completada",
        descripcion=od["descripcion"],
        fecha_creacion=now - datetime.timedelta(days=od["created_days_ago"]),
        fecha_inicio=now - datetime.timedelta(days=od["created_days_ago"]),
        fecha_cierre=now - datetime.timedelta(days=od["closed_days_ago"]),
        hora_inicio="08:00",
        hora_fin="17:00"
    )
    db.add(o)
    db.commit()
    db.refresh(o)

    # Actividad
    act = NuevaOrdenActividad(
        orden_id=o.id,
        responsable_id=mecanico.id,
        titulo="Trabajo Realizado",
        descripcion=od["descripcion"],
        estado="completada",
        fecha_creacion=o.fecha_creacion,
        fecha_inicio=o.fecha_creacion,
        fecha_fin=o.fecha_cierre
    )
    db.add(act)

    # Costos
    for c in od["costos"]:
        cost = NuevaOrdenCosto(
            orden_id=o.id,
            tipo_gasto=c["tipo_gasto"],
            descripcion=c["descripcion"],
            valor_unitario=c["valor_total"],
            valor_total=c["valor_total"],
            cantidad=1,
            fecha=o.fecha_cierre
        )
        db.add(cost)
    db.commit()

# Órdenes activas (en progreso/pendientes)
active_orders = [
    {
        "vehiculo": vehicles[0],
        "estado": "en_progreso",
        "prioridad": "alta",
        "descripcion": "Diagnóstico de vibración en tren delantero"
    },
    {
        "vehiculo": vehicles[1],
        "estado": "pendiente",
        "prioridad": "media",
        "descripcion": "Cambio preventivo de correa de repartición"
    }
]

for ao in active_orders:
    o = OrdenTrabajo(
        vehiculo_id=ao["vehiculo"].id,
        responsable_id=mecanico.id,
        prioridad=ao["prioridad"],
        estado=ao["estado"],
        descripcion=ao["descripcion"],
        fecha_creacion=now - datetime.timedelta(days=1),
        hora_inicio="09:00"
    )
    db.add(o)
    db.commit()

print("¡Datos de prueba insertados con éxito!")
db.close()
