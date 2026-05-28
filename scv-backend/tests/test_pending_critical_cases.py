from pathlib import Path

from app.api.endpoints.chequeos import CHEQUEO_FORMULARIO
from app.core.security import verify_password
from app.models.models import Chequeo, Movimiento, Usuario, Vehiculo


API_PREFIX = "/api/v1"


def _build_full_chequeo_items():
    items = []
    for seccion in CHEQUEO_FORMULARIO:
        seccion_nombre = seccion["nombre"]
        for item in seccion["items"]:
            items.append(
                {
                    "seccion": seccion_nombre,
                    "item": item["item"],
                    "valor": item["options"][0],
                    "observacion": "ok",
                }
            )
    return items


def _auth_headers(client, email, password):
    response = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_auth_005_login_with_nonexistent_user_fails(client):
    response = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "noexiste@scvqa.com", "password": "whatever"},
    )
    assert response.status_code == 401


def test_auth_006_inactive_user_cannot_login(client, seeded_data, db_session):
    email = seeded_data["credentials"]["mov_1"]["email"]
    user = db_session.query(Usuario).filter(Usuario.email == email).first()
    user.activo = False
    db_session.commit()

    response = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": email, "password": seeded_data["credentials"]["mov_1"]["password"]},
    )

    assert response.status_code in (401, 403)


def test_auth_011_remember_session_keys_exist_in_frontend_source():
    app_js = Path(__file__).resolve().parents[2] / "scv-frontend" / "js" / "app.js"
    config_js = Path(__file__).resolve().parents[2] / "scv-frontend" / "js" / "config.js"

    app_source = app_js.read_text(encoding="utf-8")
    config_source = config_js.read_text(encoding="utf-8")

    assert "CONFIG.REMEMBER_KEY" in app_source
    assert "localStorage.setItem(CONFIG.REMEMBER_KEY" in app_source
    assert "REMEMBER_KEY" in config_source


def test_role_001_operario_movimientos_cannot_post_chequeos(client, seeded_data, login):
    creds = seeded_data["credentials"]["mov_1"]
    _, headers, _ = login(creds["email"], creds["password"])

    response = client.post(
        f"{API_PREFIX}/chequeos/",
        headers=headers,
        json={
            "vehiculo_id": seeded_data["vehiculo_id"],
            "conductor_id": seeded_data["conductor_id"],
            "kilometraje": 250,
        },
    )

    assert response.status_code == 403


def test_role_001_operario_movimientos_cannot_get_chequeos(client, seeded_data, login):
    creds = seeded_data["credentials"]["mov_1"]
    _, headers, _ = login(creds["email"], creds["password"])

    response = client.get(f"{API_PREFIX}/chequeos/", headers=headers)
    assert response.status_code == 403


def test_role_002_operario_chequeo_cannot_post_movimientos(client, seeded_data, login):
    creds = seeded_data["credentials"]["chq"]
    _, headers, _ = login(creds["email"], creds["password"])

    response = client.post(
        f"{API_PREFIX}/movimientos/",
        headers=headers,
        json={
            "tipo": "entrada",
            "vehiculo_id": seeded_data["vehiculo_id"],
            "conductor_id": seeded_data["conductor_id"],
            "kilometraje": 210,
        },
    )
    assert response.status_code == 403


def test_role_003_non_admin_cannot_access_vehiculos_crud(client, seeded_data, login):
    creds = seeded_data["credentials"]["mov_1"]
    _, headers, _ = login(creds["email"], creds["password"])

    list_response = client.get(f"{API_PREFIX}/vehiculos/", headers=headers)
    create_response = client.post(
        f"{API_PREFIX}/vehiculos/",
        headers=headers,
        json={"placa": "ABC999", "marca": "Mazda", "modelo": "BT50", "año": 2024},
    )

    assert list_response.status_code == 403
    assert create_response.status_code == 403


def test_role_004_non_admin_cannot_access_conductores_crud(client, seeded_data, login):
    creds = seeded_data["credentials"]["mov_1"]
    _, headers, _ = login(creds["email"], creds["password"])

    list_response = client.get(f"{API_PREFIX}/conductores/", headers=headers)
    create_response = client.post(
        f"{API_PREFIX}/conductores/",
        headers=headers,
        json={
            "nombre": "Conductor X",
            "cedula": "999123",
            "licencia": "LIC-X",
            "categoria": "C2",
        },
    )

    assert list_response.status_code == 403
    assert create_response.status_code == 403


def test_role_005_non_admin_cannot_access_usuarios_crud(client, seeded_data, login):
    creds = seeded_data["credentials"]["mov_1"]
    _, headers, _ = login(creds["email"], creds["password"])

    list_response = client.get(f"{API_PREFIX}/usuarios/", headers=headers)
    create_response = client.post(
        f"{API_PREFIX}/usuarios/",
        headers=headers,
        json={
            "nombre": "Usuario X",
            "email": "ux@scvqa.com",
            "rol": "operario_movimientos",
            "password": "secret123",
        },
    )

    assert list_response.status_code == 403
    assert create_response.status_code == 403


def test_mov_002_required_fields_validation(client, seeded_data, login):
    creds = seeded_data["credentials"]["mov_1"]
    _, headers, _ = login(creds["email"], creds["password"])

    response = client.post(
        f"{API_PREFIX}/movimientos/",
        headers=headers,
        json={
            "tipo": "salida",
            "vehiculo_id": seeded_data["vehiculo_id"],
            "conductor_id": seeded_data["conductor_id"],
        },
    )

    assert response.status_code == 422


def test_mov_003_invalid_vehiculo_rejected(client, seeded_data, login):
    creds = seeded_data["credentials"]["mov_1"]
    _, headers, _ = login(creds["email"], creds["password"])

    response = client.post(
        f"{API_PREFIX}/movimientos/",
        headers=headers,
        json={
            "tipo": "salida",
            "vehiculo_id": 99999,
            "conductor_id": seeded_data["conductor_id"],
            "kilometraje": 300,
        },
    )

    assert response.status_code == 404


def test_mov_005_km_cannot_go_below_last_record(client, seeded_data, login):
    creds = seeded_data["credentials"]["mov_1"]
    _, headers, _ = login(creds["email"], creds["password"])

    response = client.post(
        f"{API_PREFIX}/movimientos/",
        headers=headers,
        json={
            "tipo": "entrada",
            "vehiculo_id": seeded_data["vehiculo_id"],
            "conductor_id": seeded_data["conductor_id"],
            "kilometraje": 10,
        },
    )

    assert response.status_code == 400
    assert "kilometraje" in response.json()["detail"].lower()


def test_mov_006_history_filters_by_tipo(client, seeded_data, login):
    admin_creds = seeded_data["credentials"]["admin"]
    _, headers, _ = login(admin_creds["email"], admin_creds["password"])

    response = client.get(f"{API_PREFIX}/movimientos/?tipo=entrada&limit=100", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all(item["tipo"] == "entrada" for item in data)


def test_chk_001_can_create_chequeo_header(client, seeded_data, login):
    creds = seeded_data["credentials"]["chq"]
    _, headers, _ = login(creds["email"], creds["password"])

    response = client.post(
        f"{API_PREFIX}/chequeos/",
        headers=headers,
        json={
            "vehiculo_id": seeded_data["vehiculo_id"],
            "conductor_id": seeded_data["conductor_id"],
            "kilometraje": 300,
        },
    )

    assert response.status_code == 201
    assert response.json()["total_items"] == 0


def test_chk_002_can_create_complete_chequeo_items(client, seeded_data, login):
    creds = seeded_data["credentials"]["chq"]
    _, headers, _ = login(creds["email"], creds["password"])

    header_response = client.post(
        f"{API_PREFIX}/chequeos/",
        headers=headers,
        json={
            "vehiculo_id": seeded_data["vehiculo_id"],
            "conductor_id": seeded_data["conductor_id"],
            "kilometraje": 300,
        },
    )
    assert header_response.status_code == 201
    chequeo_id = header_response.json()["id"]

    full_items = _build_full_chequeo_items()
    items_response = client.post(
        f"{API_PREFIX}/chequeos/{chequeo_id}/items",
        headers=headers,
        json={"items": full_items},
    )

    assert items_response.status_code == 200
    assert items_response.json()["guardados"] == len(full_items)

    detail_response = client.get(f"{API_PREFIX}/chequeos/{chequeo_id}", headers=headers)
    assert detail_response.status_code == 200
    assert len(detail_response.json()["items"]) == len(full_items)


def test_chk_003_rejects_incomplete_chequeo_items(client, seeded_data, login):
    creds = seeded_data["credentials"]["chq"]
    _, headers, _ = login(creds["email"], creds["password"])

    header_response = client.post(
        f"{API_PREFIX}/chequeos/",
        headers=headers,
        json={
            "vehiculo_id": seeded_data["vehiculo_id"],
            "conductor_id": seeded_data["conductor_id"],
            "kilometraje": 310,
        },
    )
    chequeo_id = header_response.json()["id"]

    full_items = _build_full_chequeo_items()
    incomplete = full_items[:-1]

    response = client.post(
        f"{API_PREFIX}/chequeos/{chequeo_id}/items",
        headers=headers,
        json={"items": incomplete},
    )

    assert response.status_code == 400
    assert "faltan items" in response.json()["detail"].lower()


def test_chk_004_list_chequeos_with_filters(client, seeded_data, login):
    admin_creds = seeded_data["credentials"]["admin"]
    chq_creds = seeded_data["credentials"]["chq"]
    _, admin_headers, _ = login(admin_creds["email"], admin_creds["password"])
    _, chq_headers, _ = login(chq_creds["email"], chq_creds["password"])

    create_response = client.post(
        f"{API_PREFIX}/chequeos/",
        headers=chq_headers,
        json={
            "vehiculo_id": seeded_data["vehiculo_id"],
            "conductor_id": seeded_data["conductor_id"],
            "kilometraje": 320,
            "obs_generales": "inspeccion nocturna",
        },
    )
    assert create_response.status_code == 201

    response = client.get(
        f"{API_PREFIX}/chequeos/?vehiculo_id={seeded_data['vehiculo_id']}&limit=50",
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_cat_001_admin_vehiculos_crud_and_uniqueness(client, seeded_data, login):
    admin_creds = seeded_data["credentials"]["admin"]
    _, headers, _ = login(admin_creds["email"], admin_creds["password"])

    create_response = client.post(
        f"{API_PREFIX}/vehiculos/",
        headers=headers,
        json={
            "placa": "NUE456",
            "marca": "Hino",
            "modelo": "300",
            "año": 2023,
            "empresa": "Normetales",
        },
    )
    assert create_response.status_code == 201
    vehiculo_id = create_response.json()["id"]

    duplicate_response = client.post(
        f"{API_PREFIX}/vehiculos/",
        headers=headers,
        json={"placa": "NUE456", "marca": "JAC", "modelo": "X", "año": 2022},
    )
    assert duplicate_response.status_code == 422

    update_response = client.put(
        f"{API_PREFIX}/vehiculos/{vehiculo_id}",
        headers=headers,
        json={"modelo": "500"},
    )
    assert update_response.status_code == 200

    delete_response = client.delete(f"{API_PREFIX}/vehiculos/{vehiculo_id}", headers=headers)
    assert delete_response.status_code == 200

    detail_response = client.get(f"{API_PREFIX}/vehiculos/{vehiculo_id}", headers=headers)
    assert detail_response.status_code == 200
    assert detail_response.json()["activo"] is False


def test_cat_002_admin_conductores_crud_and_uniqueness(client, seeded_data, login):
    admin_creds = seeded_data["credentials"]["admin"]
    _, headers, _ = login(admin_creds["email"], admin_creds["password"])

    create_response = client.post(
        f"{API_PREFIX}/conductores/",
        headers=headers,
        json={
            "nombre": "Conductor Nuevo",
            "cedula": "90112233",
            "licencia": "LIC-NEW",
            "categoria": "C2",
        },
    )
    assert create_response.status_code == 201
    conductor_id = create_response.json()["id"]

    duplicate_response = client.post(
        f"{API_PREFIX}/conductores/",
        headers=headers,
        json={
            "nombre": "Conductor Dup",
            "cedula": "90112233",
            "licencia": "LIC-DUP",
            "categoria": "C2",
        },
    )
    assert duplicate_response.status_code == 422

    update_response = client.put(
        f"{API_PREFIX}/conductores/{conductor_id}",
        headers=headers,
        json={"categoria": "C3"},
    )
    assert update_response.status_code == 200

    delete_response = client.delete(f"{API_PREFIX}/conductores/{conductor_id}", headers=headers)
    assert delete_response.status_code == 200

    detail_response = client.get(f"{API_PREFIX}/conductores/{conductor_id}", headers=headers)
    assert detail_response.status_code == 200
    assert detail_response.json()["activo"] is False


def test_cat_003_admin_usuarios_crud_uniqueness_and_password_hash(client, seeded_data, login, db_session):
    admin_creds = seeded_data["credentials"]["admin"]
    _, headers, _ = login(admin_creds["email"], admin_creds["password"])

    create_response = client.post(
        f"{API_PREFIX}/usuarios/",
        headers=headers,
        json={
            "nombre": "Operario Nuevo",
            "email": "nuevo.operario@scvqa.com",
            "rol": "operario_movimientos",
            "password": "temporal123",
        },
    )
    assert create_response.status_code == 201
    user_id = create_response.json()["id"]

    duplicate_response = client.post(
        f"{API_PREFIX}/usuarios/",
        headers=headers,
        json={
            "nombre": "Duplicado",
            "email": "nuevo.operario@scvqa.com",
            "rol": "operario_chequeo",
            "password": "temporal123",
        },
    )
    assert duplicate_response.status_code == 422

    db_user = db_session.query(Usuario).filter(Usuario.id == user_id).first()
    assert db_user.password_hash != "temporal123"
    assert verify_password("temporal123", db_user.password_hash)

    update_response = client.put(
        f"{API_PREFIX}/usuarios/{user_id}",
        headers=headers,
        json={"rol": "operario_chequeo", "password": "nuevoPass456"},
    )
    assert update_response.status_code == 200

    db_session.refresh(db_user)
    assert verify_password("nuevoPass456", db_user.password_hash)

    delete_response = client.delete(f"{API_PREFIX}/usuarios/{user_id}", headers=headers)
    assert delete_response.status_code == 200

    detail_response = client.get(f"{API_PREFIX}/usuarios/{user_id}", headers=headers)
    assert detail_response.status_code == 200
    assert detail_response.json()["activo"] is False


def test_data_001_conductor_cannot_authenticate_as_user(client):
    response = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "1234567890", "password": "any"},
    )
    assert response.status_code == 422


def test_data_002_movimientos_y_chequeos_are_independent(client, seeded_data, login, db_session):
    chq_creds = seeded_data["credentials"]["chq"]
    _, headers, _ = login(chq_creds["email"], chq_creds["password"])

    movimiento_count_before = db_session.query(Movimiento).count()
    chequeo_count_before = db_session.query(Chequeo).count()

    response = client.post(
        f"{API_PREFIX}/chequeos/",
        headers=headers,
        json={
            "vehiculo_id": seeded_data["vehiculo_id"],
            "conductor_id": seeded_data["conductor_id"],
            "kilometraje": 330,
        },
    )
    assert response.status_code == 201

    assert db_session.query(Movimiento).count() == movimiento_count_before
    assert db_session.query(Chequeo).count() == chequeo_count_before + 1


def test_data_004_movimiento_updates_vehiculo_kilometraje(client, seeded_data, login, db_session):
    creds = seeded_data["credentials"]["mov_1"]
    _, headers, _ = login(creds["email"], creds["password"])

    response = client.post(
        f"{API_PREFIX}/movimientos/",
        headers=headers,
        json={
            "tipo": "entrada",
            "vehiculo_id": seeded_data["vehiculo_id"],
            "conductor_id": seeded_data["conductor_id"],
            "kilometraje": 185,
        },
    )
    assert response.status_code == 201

    vehiculo = db_session.query(Vehiculo).filter(Vehiculo.id == seeded_data["vehiculo_id"]).first()
    assert vehiculo.kilometraje == 185


def test_data_005_chequeo_updates_vehiculo_kilometraje(client, seeded_data, login, db_session):
    creds = seeded_data["credentials"]["chq"]
    _, headers, _ = login(creds["email"], creds["password"])

    response = client.post(
        f"{API_PREFIX}/chequeos/",
        headers=headers,
        json={
            "vehiculo_id": seeded_data["vehiculo_id"],
            "conductor_id": seeded_data["conductor_id"],
            "kilometraje": 205,
        },
    )
    assert response.status_code == 201

    vehiculo = db_session.query(Vehiculo).filter(Vehiculo.id == seeded_data["vehiculo_id"]).first()
    assert vehiculo.kilometraje == 205


def test_data_003_soft_delete_preserves_movimiento_history(client, seeded_data, login):
    admin_creds = seeded_data["credentials"]["admin"]
    _, admin_headers, _ = login(admin_creds["email"], admin_creds["password"])

    list_before = client.get(f"{API_PREFIX}/movimientos/?limit=100", headers=admin_headers)
    assert list_before.status_code == 200
    count_before = len(list_before.json())

    delete_response = client.delete(f"{API_PREFIX}/vehiculos/{seeded_data['vehiculo_id']}", headers=admin_headers)
    assert delete_response.status_code == 200

    list_after = client.get(f"{API_PREFIX}/movimientos/?limit=100", headers=admin_headers)
    assert list_after.status_code == 200
    assert len(list_after.json()) == count_before


def test_sec_005_xss_payload_is_stored_as_plain_text_in_api(client, seeded_data, login):
    mov_creds = seeded_data["credentials"]["mov_1"]
    _, headers, _ = login(mov_creds["email"], mov_creds["password"])

    payload = {
        "tipo": "entrada",
        "vehiculo_id": seeded_data["vehiculo_id"],
        "conductor_id": seeded_data["conductor_id"],
        "kilometraje": 180,
        "auxiliar": "Aux",
        "proveedor": "Prov",
        "bascula": "si",
        "observaciones": "<script>alert(1)</script>",
    }
    create_response = client.post(f"{API_PREFIX}/movimientos/", json=payload, headers=headers)
    assert create_response.status_code == 201

    movement_id = create_response.json()["id"]
    detail = client.get(f"{API_PREFIX}/movimientos/{movement_id}", headers=headers)
    assert detail.status_code == 200
    assert detail.json()["observaciones"] == "<script>alert(1)</script>"


def test_sec_006_id_tampering_is_denied_for_other_owners(client, seeded_data, login):
    mov1_creds = seeded_data["credentials"]["mov_1"]
    _, mov1_headers, _ = login(mov1_creds["email"], mov1_creds["password"])

    response = client.get(
        f"{API_PREFIX}/movimientos/{seeded_data['movement_ids']['mov_2']}",
        headers=mov1_headers,
    )
    assert response.status_code == 403


def test_sec_007_inactivated_user_token_is_denied(client, seeded_data, db_session):
    creds = seeded_data["credentials"]["mov_1"]
    headers = _auth_headers(client, creds["email"], creds["password"])

    user = db_session.query(Usuario).filter(Usuario.email == creds["email"]).first()
    user.activo = False
    db_session.commit()

    response = client.get(f"{API_PREFIX}/movimientos/", headers=headers)
    assert response.status_code in (401, 403)


def test_sec_008_rate_limit_blocks_repeated_failed_logins(client):
    statuses = []
    for _ in range(7):
        response = client.post(
            f"{API_PREFIX}/auth/login",
            json={"email": "ratelimit@scvqa.com", "password": "clave_erronea"},
        )
        statuses.append(response.status_code)

    assert statuses[:5] == [401, 401, 401, 401, 401]
    assert statuses[5:] == [429, 429]


def test_sec_009_docs_and_debug_routes_are_not_exposed(client):
    assert client.get("/docs").status_code == 404
    assert client.get("/redoc").status_code == 404
    assert client.get("/openapi.json").status_code == 404
    assert client.get("/test-db").status_code == 404


def test_sec_010_sqlite_file_is_not_served_over_http(client):
    direct = client.get("/scv.db")
    traversal = client.get("/../scv.db")

    assert direct.status_code in (404, 405)
    assert traversal.status_code in (404, 405)


def test_sec_011_frontend_redirect_logic_without_session_exists():
    app_js = Path(__file__).resolve().parents[2] / "scv-frontend" / "js" / "app.js"
    source = app_js.read_text(encoding="utf-8")
    assert "function checkAuth()" in source
    assert "showScreen('login-screen')" in source


def test_sec_012_validation_error_does_not_expose_traceback(client, seeded_data, login):
    creds = seeded_data["credentials"]["mov_1"]
    _, headers, _ = login(creds["email"], creds["password"])

    response = client.get(f"{API_PREFIX}/movimientos/?tipo=invalido", headers=headers)
    assert response.status_code == 400
    body = response.text.lower()
    assert "traceback" not in body
    assert "file \"" not in body


def test_perf_001_ten_logins_under_global_time_budget(client, seeded_data):
    import time

    creds = seeded_data["credentials"]["admin"]
    start = time.perf_counter()
    for _ in range(10):
        response = client.post(
            f"{API_PREFIX}/auth/login",
            json={"email": creds["email"], "password": creds["password"]},
        )
        assert response.status_code == 200
    elapsed = time.perf_counter() - start
    assert elapsed < 20


def test_perf_002_single_movimiento_create_is_fast(client, seeded_data, login):
    import time

    creds = seeded_data["credentials"]["mov_1"]
    _, headers, _ = login(creds["email"], creds["password"])

    payload = {
        "tipo": "entrada",
        "vehiculo_id": seeded_data["vehiculo_id"],
        "conductor_id": seeded_data["conductor_id"],
        "kilometraje": 180,
    }

    start = time.perf_counter()
    response = client.post(f"{API_PREFIX}/movimientos/", json=payload, headers=headers)
    elapsed = time.perf_counter() - start

    assert response.status_code == 201
    assert elapsed < 2


def test_perf_003_full_chequeo_registration_is_fast(client, seeded_data, login):
    import time

    creds = seeded_data["credentials"]["chq"]
    _, headers, _ = login(creds["email"], creds["password"])

    start = time.perf_counter()
    header_response = client.post(
        f"{API_PREFIX}/chequeos/",
        headers=headers,
        json={
            "vehiculo_id": seeded_data["vehiculo_id"],
            "conductor_id": seeded_data["conductor_id"],
            "kilometraje": 360,
        },
    )
    assert header_response.status_code == 201
    chequeo_id = header_response.json()["id"]
    items_response = client.post(
        f"{API_PREFIX}/chequeos/{chequeo_id}/items",
        headers=headers,
        json={"items": _build_full_chequeo_items()},
    )
    elapsed = time.perf_counter() - start

    assert items_response.status_code == 200
    assert elapsed < 2


def test_perf_004_filtered_history_query_is_fast(client, seeded_data, login):
    import time

    creds = seeded_data["credentials"]["admin"]
    _, headers, _ = login(creds["email"], creds["password"])

    start = time.perf_counter()
    response = client.get(
        f"{API_PREFIX}/movimientos/?vehiculo_id={seeded_data['vehiculo_id']}&limit=100",
        headers=headers,
    )
    elapsed = time.perf_counter() - start

    assert response.status_code == 200
    assert elapsed < 3


def test_perf_006_one_tx_per_second_without_data_loss(client, seeded_data, login):
    import time

    creds = seeded_data["credentials"]["mov_1"]
    _, headers, _ = login(creds["email"], creds["password"])

    created_ids = []
    for idx in range(3):
        response = client.post(
            f"{API_PREFIX}/movimientos/",
            headers=headers,
            json={
                "tipo": "entrada",
                "vehiculo_id": seeded_data["vehiculo_id"],
                "conductor_id": seeded_data["conductor_id"],
                "kilometraje": 200 + idx,
            },
        )
        assert response.status_code == 201
        created_ids.append(response.json()["id"])
        time.sleep(1)

    list_response = client.get(f"{API_PREFIX}/movimientos/?limit=200", headers=headers)
    assert list_response.status_code == 200
    returned_ids = {item["id"] for item in list_response.json()}
    assert all(item_id in returned_ids for item_id in created_ids)


def test_rep_001_and_rep_002_exports_use_filtered_data_in_frontend_source():
    app_js = Path(__file__).resolve().parents[2] / "scv-frontend" / "js" / "app.js"
    source = app_js.read_text(encoding="utf-8")

    assert "const vehiculos = getFilteredVehiculos(APP.admin.vehiculos || []);" in source
    assert "const conductores = getFilteredConductores(APP.admin.conductores || []);" in source
    assert "const usuarios = getFilteredUsuarios(APP.admin.usuarios || []);" in source
    assert "const chequeos = getFilteredChequeos();" in source
    assert "const movimientos = getFilteredMovimientos();" in source
