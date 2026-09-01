"""Script para inicializar y sembrar datos en la base de datos (PostgreSQL o SQLite local)."""
import os
import sys
from datetime import datetime, date, timedelta

# Asegurar path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.usuario import Usuario
from app.models.vehiculo import Vehiculo
from app.models.movimiento import Movimiento
from app.models.chequeo import Chequeo, ChequeoItem
from app.models.hallazgo import Hallazgo
from app.models.orden_trabajo import OrdenTrabajo, OrdenActividad, OrdenCosto, OrdenHistorial
from app.core.security import get_password_hash


def seed_database():
    print("[1/4] Creando tablas en base de datos si no existen...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("[2/4] Sembrando usuarios y conductores...")
        # 1. Usuarios
        usuarios_data = [
            {"nombre": "Administrador Principal", "email": "admin@normetales.com", "rol": "admin", "cedula": "1000000001"},
            {"nombre": "Operario Despacho 1", "email": "despacho@normetales.com", "rol": "operario_movimientos", "cedula": "1000000002"},
            {"nombre": "Carlos Rodríguez", "email": "carlos.chofer@normetales.com", "rol": "operario_chequeo", "cedula": "1020304050", "licencia": "LIC-987654", "categoria": "C2"},
            {"nombre": "Andrés Morales", "email": "andres.chofer@normetales.com", "rol": "operario_chequeo", "cedula": "1098765432", "licencia": "LIC-554433", "categoria": "C3"},
            {"nombre": "Julián Gómez", "email": "julian.chofer@normetales.com", "rol": "operario_chequeo", "cedula": "1011223344", "licencia": "LIC-112233", "categoria": "C1"},
            {"nombre": "Juan Pérez", "email": "mecanico@normetales.com", "rol": "mecanico", "cedula": "1000000004"},
            {"nombre": "Jefe de Taller", "email": "jefe.taller@normetales.com", "rol": "jefe_mecanicos", "cedula": "1000000005"},
        ]

        usuarios_map = {}
        for u in usuarios_data:
            existente = db.query(Usuario).filter(Usuario.email == u["email"]).first()
            if not existente:
                nuevo = Usuario(
                    nombre=u["nombre"],
                    email=u["email"],
                    password_hash=get_password_hash("admin123"),
                    rol=u["rol"],
                    estado_activo=True,
                    cedula=u.get("cedula"),
                    licencia=u.get("licencia"),
                    categoria=u.get("categoria"),
                    fecha_venc_licencia=date(2028, 12, 31) if u.get("licencia") else None,
                )
                db.add(nuevo)
                db.flush()
                usuarios_map[u["email"]] = nuevo
            else:
                usuarios_map[u["email"]] = existente

        print("[3/4] Sembrando flota de vehiculos...")
        # 2. Vehículos
        vehiculos_data = [
            {"placa": "NRM-045", "marca": "Chevrolet", "modelo": "NPR Turbo", "año": 2022, "km": 45200, "soat": date(2027, 5, 15), "rtm": date(2027, 4, 10), "estado": "activo"},
            {"placa": "NRM-012", "marca": "Hino", "modelo": "Dutro 300", "año": 2023, "km": 28150, "soat": date(2027, 8, 20), "rtm": date(2027, 7, 15), "estado": "activo"},
            {"placa": "NRM-023", "marca": "Foton", "modelo": "Aumark S", "año": 2021, "km": 62400, "soat": date(2026, 9, 10), "rtm": date(2026, 8, 25), "estado": "en_taller"},
            {"placa": "NRM-017", "marca": "Chevrolet", "modelo": "FVR", "año": 2020, "km": 89300, "soat": date(2027, 1, 12), "rtm": date(2026, 12, 5), "estado": "activo"},
            {"placa": "NRM-031", "marca": "International", "modelo": "MV607", "año": 2022, "km": 38900, "soat": date(2027, 3, 22), "rtm": date(2027, 2, 18), "estado": "en_taller"},
        ]

        vehiculos_map = {}
        for v in vehiculos_data:
            existente = db.query(Vehiculo).filter(Vehiculo.placa == v["placa"]).first()
            if not existente:
                nuevo = Vehiculo(
                    placa=v["placa"],
                    marca=v["marca"],
                    modelo=v["modelo"],
                    año=v["año"],
                    kilometraje=v["km"],
                    fecha_venc_soat=v["soat"],
                    fecha_venc_rtm=v["rtm"],
                    estado=v["estado"],
                )
                db.add(nuevo)
                db.flush()
                vehiculos_map[v["placa"]] = nuevo
            else:
                vehiculos_map[v["placa"]] = existente

        print("[4/4] Sembrando movimientos, chequeos y ordenes de mantenimiento...")
        # 3. Movimientos
        if db.query(Movimiento).count() == 0:
            m1 = Movimiento(
                tipo="salida",
                vehiculo_id=vehiculos_map["NRM-045"].id,
                usuario_id=usuarios_map["carlos.chofer@normetales.com"].id,
                kilometraje=45200,
                bascula_peso=12450,
                cantidad_sacas=48,
                estado_cajon="bueno",
                observaciones="Centro Logístico → Planta Norte",
            )
            m2 = Movimiento(
                tipo="entrada",
                vehiculo_id=vehiculos_map["NRM-012"].id,
                usuario_id=usuarios_map["andres.chofer@normetales.com"].id,
                kilometraje=28150,
                bascula_peso=18200,
                cantidad_sacas=72,
                estado_cajon="bueno",
                observaciones="Planta Sur → Centro Logístico",
            )
            m3 = Movimiento(
                tipo="entrada",
                vehiculo_id=vehiculos_map["NRM-023"].id,
                usuario_id=usuarios_map["julian.chofer@normetales.com"].id,
                kilometraje=62400,
                bascula_peso=15100,
                cantidad_sacas=60,
                estado_cajon="regular",
                observaciones="Planta Norte → Planta Sur",
            )
            db.add_all([m1, m2, m3])

        # 4. Órdenes de Trabajo
        if db.query(OrdenTrabajo).count() == 0:
            ot1 = OrdenTrabajo(
                codigo="OT-2026-023",
                vehiculo_id=vehiculos_map["NRM-023"].id,
                creado_por_id=usuarios_map["admin@normetales.com"].id,
                responsable_id=usuarios_map["mecanico@normetales.com"].id,
                prioridad="alta",
                estado="en_progreso",
                descripcion="Cambio de aceite y filtros de motor",
                fecha_inicio=datetime.now() - timedelta(days=1),
            )
            ot2 = OrdenTrabajo(
                codigo="OT-2026-017",
                vehiculo_id=vehiculos_map["NRM-017"].id,
                creado_por_id=usuarios_map["admin@normetales.com"].id,
                responsable_id=usuarios_map["mecanico@normetales.com"].id,
                prioridad="media",
                estado="pendiente",
                descripcion="Revisión general y calibración de frenos",
            )
            db.add_all([ot1, ot2])

        db.commit()
        print("[OK] Base de datos sembrada con exito.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error al sembrar base de datos: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
