from datetime import timedelta

from app.core.security import create_access_token


API_PREFIX = "/api/v1"


def test_public_health_endpoints(client, seeded_data):
    root_response = client.get("/")
    ping_response = client.get("/ping")

    assert root_response.status_code == 200
    assert ping_response.status_code == 200
    assert ping_response.json()["status"] == "ok"


def test_unknown_route_returns_404(client, seeded_data):
    response = client.get(f"{API_PREFIX}/ruta-inexistente-seguridad")
    assert response.status_code == 404


def test_protected_routes_require_authentication(client, seeded_data):
    for path in [
        f"{API_PREFIX}/auth/me",
        f"{API_PREFIX}/usuarios/",
        f"{API_PREFIX}/dashboard/",
        f"{API_PREFIX}/vehiculos/",
    ]:
        response = client.get(path)
        assert response.status_code in (401, 403)


def test_login_and_me_returns_authenticated_user(client, seeded_data, login):
    creds = seeded_data["credentials"]["admin"]
    _, headers, login_data = login(creds["email"], creds["password"])

    me_response = client.get(f"{API_PREFIX}/auth/me", headers=headers)

    assert login_data["token_type"] == "bearer"
    assert me_response.status_code == 200
    assert me_response.json()["email"] == creds["email"]


def test_login_with_invalid_credentials_fails(client, seeded_data):
    creds = seeded_data["credentials"]["admin"]
    response = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": creds["email"], "password": "clave_incorrecta"},
    )

    assert response.status_code == 401


def test_corrupted_jwt_is_rejected(client, seeded_data, login):
    creds = seeded_data["credentials"]["admin"]
    token, _, _ = login(creds["email"], creds["password"])
    corrupted = f"{token[:-1]}{'a' if token[-1] != 'a' else 'b'}"

    response = client.get(
        f"{API_PREFIX}/auth/me",
        headers={"Authorization": f"Bearer {corrupted}"},
    )

    assert response.status_code == 401


def test_malformed_jwt_is_rejected(client, seeded_data):
    response = client.get(
        f"{API_PREFIX}/auth/me",
        headers={"Authorization": "Bearer token.malformado"},
    )

    assert response.status_code == 401


def test_expired_jwt_is_rejected(client, seeded_data):
    expired_token = create_access_token(
        {
            "user_id": 1,
            "email": seeded_data["credentials"]["admin"]["email"],
            "rol": "admin",
        },
        expires_delta=timedelta(minutes=-1),
    )

    response = client.get(
        f"{API_PREFIX}/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )

    assert response.status_code == 401


def test_logout_revokes_token(client, seeded_data, login):
    creds = seeded_data["credentials"]["admin"]
    _, headers, _ = login(creds["email"], creds["password"])

    logout_response = client.post(f"{API_PREFIX}/auth/logout", headers=headers)
    me_after_logout = client.get(f"{API_PREFIX}/auth/me", headers=headers)

    assert logout_response.status_code == 200
    assert me_after_logout.status_code == 401
    assert me_after_logout.json()["detail"] == "Token revocado"


def test_role_restriction_non_admin_cannot_access_admin_routes(client, seeded_data, login):
    mov_creds = seeded_data["credentials"]["mov_1"]
    _, mov_headers, _ = login(mov_creds["email"], mov_creds["password"])

    users_response = client.get(f"{API_PREFIX}/usuarios/", headers=mov_headers)
    dashboard_response = client.get(f"{API_PREFIX}/dashboard/", headers=mov_headers)

    assert users_response.status_code == 403
    assert dashboard_response.status_code == 403


def test_admin_can_access_dashboard_and_users(client, seeded_data, login):
    creds = seeded_data["credentials"]["admin"]
    _, headers, _ = login(creds["email"], creds["password"])

    users_response = client.get(f"{API_PREFIX}/usuarios/", headers=headers)
    dashboard_response = client.get(f"{API_PREFIX}/dashboard/", headers=headers)

    assert users_response.status_code == 200
    assert dashboard_response.status_code == 200
    assert "totales" in dashboard_response.json()


def test_operario_chequeo_cannot_access_movimientos(client, seeded_data, login):
    creds = seeded_data["credentials"]["chq"]
    _, headers, _ = login(creds["email"], creds["password"])

    response = client.get(f"{API_PREFIX}/movimientos/", headers=headers)
    assert response.status_code == 403


def test_operario_movimientos_only_sees_own_history(client, seeded_data, login):
    admin_creds = seeded_data["credentials"]["admin"]
    mov1_creds = seeded_data["credentials"]["mov_1"]

    _, admin_headers, _ = login(admin_creds["email"], admin_creds["password"])
    _, mov1_headers, _ = login(mov1_creds["email"], mov1_creds["password"])

    admin_response = client.get(f"{API_PREFIX}/movimientos/?limit=100", headers=admin_headers)
    mov1_response = client.get(f"{API_PREFIX}/movimientos/?limit=100", headers=mov1_headers)

    assert admin_response.status_code == 200
    assert mov1_response.status_code == 200

    admin_data = admin_response.json()
    mov1_data = mov1_response.json()

    admin_items = admin_data["items"] if isinstance(admin_data, dict) and "items" in admin_data else admin_data
    mov1_items = mov1_data["items"] if isinstance(mov1_data, dict) and "items" in mov1_data else mov1_data

    assert len(admin_items) >= 2
    assert len(mov1_items) == 1
    assert all(item["usuario"]["email"] == mov1_creds["email"] for item in mov1_items)


def test_can_create_and_fetch_movimiento_with_valid_jwt(client, seeded_data, login):
    mov1_creds = seeded_data["credentials"]["mov_1"]
    _, headers, _ = login(mov1_creds["email"], mov1_creds["password"])

    payload = {
        "tipo": "entrada",
        "vehiculo_id": seeded_data["vehiculo_id"],
        "conductor_id": seeded_data["conductor_id"],
        "kilometraje": 180,
        "auxiliar": "Aux nuevo",
        "proveedor": "Proveedor nuevo",
        "bascula": "si",
        "sacas": 10,
        "cajon": "Cajon 1",
        "observaciones": "registro de prueba",
    }

    create_response = client.post(f"{API_PREFIX}/movimientos/", json=payload, headers=headers)
    assert create_response.status_code == 201

    created = create_response.json()
    detail_response = client.get(f"{API_PREFIX}/movimientos/{created['id']}", headers=headers)
    assert detail_response.status_code == 200
    assert detail_response.json()["id"] == created["id"]


def test_sql_injection_payload_in_search_does_not_break_selectores(client, seeded_data, login):
    creds = seeded_data["credentials"]["admin"]
    _, headers, _ = login(creds["email"], creds["password"])

    response = client.get(
        f"{API_PREFIX}/selectores/vehiculos?search=%27%20OR%201%3D1%20--&limit=20",
        headers=headers,
    )

    assert response.status_code in (200, 403)
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 20
