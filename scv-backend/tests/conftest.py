from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import get_password_hash
from app.db.database import Base, get_db
from app.models.models import Conductor, Movimiento, Usuario, Vehiculo
from main import app


API_PREFIX = "/api/v1"

TEST_ENGINE = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=TEST_ENGINE)


@pytest.fixture
def db_session():
    Base.metadata.drop_all(bind=TEST_ENGINE)
    Base.metadata.create_all(bind=TEST_ENGINE)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def seeded_data(db_session):
    admin = Usuario(
        nombre="Admin SCV",
        email="admin@scvqa.com",
        password_hash=get_password_hash("admin123"),
        rol="admin",
        activo=True,
    )
    operario_mov_1 = Usuario(
        nombre="Operario Mov 1",
        email="mov1@scvqa.com",
        password_hash=get_password_hash("mov123"),
        rol="operario_movimientos",
        activo=True,
    )
    operario_mov_2 = Usuario(
        nombre="Operario Mov 2",
        email="mov2@scvqa.com",
        password_hash=get_password_hash("mov234"),
        rol="operario_movimientos",
        activo=True,
    )
    operario_chq = Usuario(
        nombre="Operario Chq",
        email="chequeo@scvqa.com",
        password_hash=get_password_hash("chk123"),
        rol="operario_chequeo",
        activo=True,
    )

    vehiculo = Vehiculo(
        placa="TST123",
        marca="Chevrolet",
        modelo="NHR",
        año=2022,
        empresa="Normetales",
        kilometraje=150,
        activo=True,
    )
    conductor = Conductor(
        nombre="Conductor Prueba",
        cedula="1234567890",
        licencia="LIC-778899",
        categoria="C2",
        activo=True,
    )

    db_session.add_all([admin, operario_mov_1, operario_mov_2, operario_chq, vehiculo, conductor])
    db_session.commit()

    movimiento_1 = Movimiento(
        tipo="entrada",
        vehiculo_id=vehiculo.id,
        conductor_id=conductor.id,
        usuario_id=operario_mov_1.id,
        kilometraje=100,
        auxiliar="Aux 1",
        proveedor="Proveedor 1",
        bascula="si",
        fecha_hora=datetime.utcnow() - timedelta(hours=2),
    )
    movimiento_2 = Movimiento(
        tipo="salida",
        vehiculo_id=vehiculo.id,
        conductor_id=conductor.id,
        usuario_id=operario_mov_2.id,
        kilometraje=150,
        auxiliar="Aux 2",
        proveedor="Proveedor 2",
        bascula="no",
        fecha_hora=datetime.utcnow() - timedelta(hours=1),
    )

    db_session.add_all([movimiento_1, movimiento_2])
    db_session.commit()

    return {
        "vehiculo_id": vehiculo.id,
        "conductor_id": conductor.id,
        "movement_ids": {
            "mov_1": movimiento_1.id,
            "mov_2": movimiento_2.id,
        },
        "credentials": {
            "admin": {"email": admin.email, "password": "admin123"},
            "mov_1": {"email": operario_mov_1.email, "password": "mov123"},
            "mov_2": {"email": operario_mov_2.email, "password": "mov234"},
            "chq": {"email": operario_chq.email, "password": "chk123"},
        },
    }


@pytest.fixture
def login(client):
    def _login(email: str, password: str):
        response = client.post(
            f"{API_PREFIX}/auth/login",
            json={"email": email, "password": password},
        )
        assert response.status_code == 200
        data = response.json()
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        return token, headers, data

    return _login
