"""Seed y reseteo de datos de desarrollo."""

from datetime import date, datetime, timedelta
import random

from passlib.hash import bcrypt
from sqlalchemy import and_

from app.api.endpoints.chequeos import CHEQUEO_FORMULARIO
from app.db.database import SessionLocal
from app.models.models import Chequeo, ChequeoItem, Conductor, Movimiento, TokenRevocado, Usuario, Vehiculo


MAIN_USERS = [
    {
        "nombre": "Sebastian Administrador",
        "email": "admin@normetales.com",
        "password": "admin123",
        "rol": "admin",
    },
    {
        "nombre": "Juan Operario Movimientos",
        "email": "mov@normetales.com",
        "password": "operario123",
        "rol": "operario_movimientos",
    },
    {
        "nombre": "Pedro Operario Chequeo",
        "email": "cheq@normetales.com",
        "password": "operario123",
        "rol": "operario_chequeo",
    },
]


def _ensure_main_users(db):
    preserved_ids = []
    for user_data in MAIN_USERS:
        user = db.query(Usuario).filter(Usuario.email == user_data["email"]).first()
        if not user:
            user = Usuario(
                nombre=user_data["nombre"],
                email=user_data["email"],
                password_hash=bcrypt.hash(user_data["password"]),
                rol=user_data["rol"],
                activo=True,
            )
            db.add(user)
            db.flush()
        preserved_ids.append(user.id)

    return preserved_ids


def _clear_existing_data(db, preserved_user_ids):
    db.query(ChequeoItem).delete(synchronize_session=False)
    db.query(Chequeo).delete(synchronize_session=False)
    db.query(Movimiento).delete(synchronize_session=False)
    db.query(TokenRevocado).delete(synchronize_session=False)
    db.query(Vehiculo).delete(synchronize_session=False)
    db.query(Conductor).delete(synchronize_session=False)
    db.query(Usuario).filter(~Usuario.id.in_(preserved_user_ids)).delete(synchronize_session=False)


def _generate_vehicles(rng, total=25):
    marcas_modelos = [
        ("Chevrolet", "NHR"),
        ("Chevrolet", "FTR"),
        ("Hino", "300"),
        ("Hino", "500"),
        ("Isuzu", "NPR"),
        ("Isuzu", "FRR"),
        ("Kenworth", "T800"),
        ("International", "DuraStar"),
        ("Ford", "Cargo"),
        ("Volkswagen", "Constellation"),
    ]
    empresas = ["Normetales", "TransAndina", "Carga Segura", "Logistica Norte"]
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    vehiculos = []
    used_plates = set()
    while len(vehiculos) < total:
        placa = f"{rng.choice(letters)}{rng.choice(letters)}{rng.choice(letters)}-{rng.randint(100, 999)}"
        if placa in used_plates:
            continue

        used_plates.add(placa)
        marca, modelo = rng.choice(marcas_modelos)
        soat_days = rng.randint(30, 360)
        rtm_days = rng.randint(30, 360)
        vehiculos.append(
            Vehiculo(
                placa=placa,
                marca=marca,
                modelo=modelo,
                año=rng.randint(2014, 2025),
                empresa=rng.choice(empresas),
                fecha_venc_soat=date.today() + timedelta(days=soat_days),
                fecha_venc_rtm=date.today() + timedelta(days=rtm_days),
                activo=True,
            )
        )

    return vehiculos


def _generate_drivers(rng, total=25):
    nombres = [
        "Carlos", "Javier", "Luis", "Andres", "Diego", "Miguel", "Sergio", "Camilo", "Daniel", "Felipe",
        "Julian", "Nicolas", "Jose", "Mateo", "Rafael", "Orlando", "Wilmer", "Hector", "Oscar", "Ricardo",
    ]
    apellidos = [
        "Gomez", "Rodriguez", "Perez", "Martinez", "Torres", "Ramirez", "Lopez", "Castro", "Herrera", "Garcia",
        "Morales", "Vargas", "Diaz", "Suarez", "Mendoza", "Sanchez", "Rojas", "Pineda", "Ortiz", "Velez",
    ]
    categorias = ["C1", "C2", "C3"]

    conductores = []
    used_cedulas = set()
    for idx in range(total):
        cedula = str(10000000 + rng.randint(0, 89999999))
        while cedula in used_cedulas:
            cedula = str(10000000 + rng.randint(0, 89999999))
        used_cedulas.add(cedula)

        nombre = f"{rng.choice(nombres)} {rng.choice(apellidos)}"
        licencia_num = f"L-{rng.randint(100000, 999999)}"
        fecha_venc_lic = None if rng.random() < 0.2 else date.today() + timedelta(days=rng.randint(45, 540))

        conductores.append(
            Conductor(
                nombre=f"{nombre} {idx + 1}",
                cedula=cedula,
                licencia=licencia_num,
                fecha_venc_licencia=fecha_venc_lic,
                categoria=rng.choice(categorias),
                activo=True,
            )
        )

    return conductores


def _random_datetime_last_days(rng, days=90):
    now = datetime.utcnow()
    delta_days = rng.randint(0, days)
    delta_minutes = rng.randint(0, 23 * 60 + 59)
    return now - timedelta(days=delta_days, minutes=delta_minutes)


def _create_movimientos(db, rng, usuario_ids, vehiculos, conductores, total=500):
    movimientos = []
    kilometraje_por_vehiculo = {v.id: rng.randint(80000, 240000) for v in vehiculos}
    auxiliares = ["Auxiliar 1", "Auxiliar 2", "Auxiliar 3", "Sin auxiliar", None]
    proveedores = ["Acopio Central", "Proveedor Norte", "Proveedor Sur", "Minera Aliada", None]
    cajones = ["A1", "A2", "B1", "B2", "C1", None]

    for _ in range(total):
        vehiculo = rng.choice(vehiculos)
        conductor = rng.choice(conductores)
        tipo = rng.choice(["entrada", "salida"])

        incremento = rng.randint(5, 180)
        kilometraje_por_vehiculo[vehiculo.id] += incremento

        movimientos.append(
            Movimiento(
                tipo=tipo,
                vehiculo_id=vehiculo.id,
                conductor_id=conductor.id,
                usuario_id=rng.choice(usuario_ids),
                auxiliar=rng.choice(auxiliares),
                proveedor=rng.choice(proveedores),
                kilometraje=kilometraje_por_vehiculo[vehiculo.id],
                bascula=rng.choice(["si", "no"]),
                sacas=rng.randint(1, 160) if rng.random() < 0.7 else None,
                cajon=rng.choice(cajones),
                observaciones="Operacion registrada automaticamente" if rng.random() < 0.25 else None,
                fecha_hora=_random_datetime_last_days(rng, days=90),
            )
        )

    db.add_all(movimientos)
    db.flush()
    return kilometraje_por_vehiculo


def _create_chequeos(db, rng, usuario_ids, vehiculos, conductores, kilometraje_por_vehiculo, total=700):
    chequeos = []
    for _ in range(total):
        vehiculo = rng.choice(vehiculos)
        conductor = rng.choice(conductores)
        km_actual = kilometraje_por_vehiculo[vehiculo.id] + rng.randint(1, 40)
        kilometraje_por_vehiculo[vehiculo.id] = km_actual

        chequeos.append(
            Chequeo(
                vehiculo_id=vehiculo.id,
                conductor_id=conductor.id,
                usuario_id=rng.choice(usuario_ids),
                kilometraje=km_actual,
                fecha_venc_soat=vehiculo.fecha_venc_soat,
                fecha_venc_rtm=vehiculo.fecha_venc_rtm,
                fecha_venc_extintor=date.today() + timedelta(days=rng.randint(15, 240)),
                obs_generales="Chequeo realizado por lote de datos" if rng.random() < 0.2 else None,
                fecha_hora=_random_datetime_last_days(rng, days=90),
            )
        )

    db.add_all(chequeos)
    db.flush()

    chequeo_items = []
    for chequeo in chequeos:
        for seccion in CHEQUEO_FORMULARIO:
            seccion_nombre = seccion["nombre"]
            for item_def in seccion["items"]:
                valor = rng.choice(item_def["options"])
                observacion = None
                if valor in {"no_conforme", "mal_estado", "bajo", "presenta_fugas"}:
                    observacion = "Requiere revision en taller"

                chequeo_items.append(
                    ChequeoItem(
                        chequeo_id=chequeo.id,
                        seccion=seccion_nombre,
                        item=item_def["item"],
                        valor=valor,
                        observacion=observacion,
                    )
                )

    db.add_all(chequeo_items)


def reset_and_seed_data(
    vehiculos_total=25,
    conductores_total=25,
    movimientos_total=500,
    chequeos_total=700,
    random_seed=20260420,
):
    """Borra datos operativos, conserva 3 usuarios principales y repuebla la BD."""
    db = SessionLocal()
    rng = random.Random(random_seed)

    try:
        preserved_user_ids = _ensure_main_users(db)
        _clear_existing_data(db, preserved_user_ids)

        vehiculos = _generate_vehicles(rng, total=vehiculos_total)
        conductores = _generate_drivers(rng, total=conductores_total)
        db.add_all(vehiculos)
        db.add_all(conductores)
        db.flush()

        usuarios_mov = (
            db.query(Usuario.id)
            .filter(
                and_(
                    Usuario.id.in_(preserved_user_ids),
                    Usuario.rol.in_(["admin", "operario_movimientos"]),
                )
            )
            .all()
        )
        usuarios_cheq = (
            db.query(Usuario.id)
            .filter(
                and_(
                    Usuario.id.in_(preserved_user_ids),
                    Usuario.rol.in_(["admin", "operario_chequeo"]),
                )
            )
            .all()
        )

        usuarios_mov_ids = [row[0] for row in usuarios_mov] or preserved_user_ids
        usuarios_cheq_ids = [row[0] for row in usuarios_cheq] or preserved_user_ids

        kilometraje_por_vehiculo = _create_movimientos(
            db,
            rng,
            usuarios_mov_ids,
            vehiculos,
            conductores,
            total=movimientos_total,
        )
        _create_chequeos(
            db,
            rng,
            usuarios_cheq_ids,
            vehiculos,
            conductores,
            kilometraje_por_vehiculo,
            total=chequeos_total,
        )

        db.commit()

        print("Datos regenerados correctamente")
        print(f"  - usuarios preservados: {len(preserved_user_ids)}")
        print(f"  - vehiculos: {vehiculos_total}")
        print(f"  - conductores: {conductores_total}")
        print(f"  - movimientos: {movimientos_total}")
        print(f"  - chequeos: {chequeos_total}")
        print(f"  - chequeo_items: {chequeos_total * sum(len(s['items']) for s in CHEQUEO_FORMULARIO)}")
    except Exception as error:
        db.rollback()
        raise RuntimeError(f"No se pudo regenerar los datos: {error}") from error
    finally:
        db.close()


def create_seed_data():
    """Compatibilidad con script anterior."""
    reset_and_seed_data()


if __name__ == "__main__":
    reset_and_seed_data()
