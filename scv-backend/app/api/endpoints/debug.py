from fastapi import APIRouter
from app.db.database import engine, SessionLocal
from app.models import models
from sqlalchemy import inspect

router = APIRouter(tags=["debug"])

@router.get("/test-db")
def test_db():
    """Verificar conexión a la base de datos"""
    inspector = inspect(engine)
    tablas = inspector.get_table_names()

    db = SessionLocal()
    try:
        return {
            "status": "ok",
            "database": "connected",
            "tables": tablas,
            "counts": {
                "usuarios": db.query(models.Usuario).count(),
                "vehiculos": db.query(models.Vehiculo).count(),
                "conductores": db.query(models.Conductor).count(),
            }
        }
    finally:
        db.close()
