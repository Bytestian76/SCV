# SCV - Ejecucion de Test Cases Pendientes (2026-04-21)

## Alcance

Ejecucion y registro de resultados para todos los casos pendientes del catalogo `docs/testing/critical-test-cases.md`.

## Evidencia de ejecucion

- Suite automatizada: `PYTHONPATH=. ./venv/bin/pytest --junitxml docs/testing/test-results.xml`
- Resultado suite: `52` pruebas ejecutadas, `52` aprobadas, `0` fallidas.
- Archivo de resultados: `docs/testing/test-results.xml`
- Verificacion de exposicion de docs/debug:
  - `docs 404`, `redoc 404`, `openapi 404`, `test-db 404`
- Verificacion PWA estatica:
  - `manifest.json` existe.
  - No se encontraron referencias a `serviceWorker` ni `beforeinstallprompt`.
  - En `scv-frontend/images` no existen `icon-192.png` ni `icon-512.png`.

## Resumen global

- Aprobados: `53`
- Fallidos: `1`
- Bloqueados: `5`

## Resultado por test case

| ID | Estado | Resultado obtenido | Evidencia |
| --- | --- | --- | --- |
| AUTH-001 | Aprobado | Login admin y `/auth/me` correctos | `tests/test_security_and_api.py::test_login_and_me_returns_authenticated_user` |
| AUTH-002 | Aprobado | Login operario_movimientos exitoso | `tests/test_pending_critical_cases.py::test_role_001_operario_movimientos_cannot_post_chequeos` |
| AUTH-003 | Aprobado | Login operario_chequeo exitoso | `tests/test_pending_critical_cases.py::test_role_002_operario_chequeo_cannot_post_movimientos` |
| AUTH-004 | Aprobado | Credenciales incorrectas rechazadas | `tests/test_security_and_api.py::test_login_with_invalid_credentials_fails` |
| AUTH-005 | Aprobado | Usuario inexistente rechazado | `tests/test_pending_critical_cases.py::test_auth_005_login_with_nonexistent_user_fails` |
| AUTH-006 | Aprobado | Usuario inactivo no autentica | `tests/test_pending_critical_cases.py::test_auth_006_inactive_user_cannot_login` |
| AUTH-007 | Aprobado | JWT malformado devuelve 401 | `tests/test_security_and_api.py::test_malformed_jwt_is_rejected` |
| AUTH-008 | Aprobado | JWT manipulado devuelve 401 | `tests/test_security_and_api.py::test_corrupted_jwt_is_rejected` |
| AUTH-009 | Aprobado | JWT expirado devuelve 401 | `tests/test_security_and_api.py::test_expired_jwt_is_rejected` |
| AUTH-010 | Aprobado | Logout revoca token | `tests/test_security_and_api.py::test_logout_revokes_token` |
| AUTH-011 | Aprobado | Llaves de recordar sesion presentes en frontend | `tests/test_pending_critical_cases.py::test_auth_011_remember_session_keys_exist_in_frontend_source` |
| ROLE-001 | Aprobado | Operario movimientos bloqueado en GET/POST chequeos | `tests/test_pending_critical_cases.py::test_role_001_operario_movimientos_cannot_get_chequeos`; `tests/test_pending_critical_cases.py::test_role_001_operario_movimientos_cannot_post_chequeos` |
| ROLE-002 | Aprobado | Operario chequeo bloqueado en GET/POST movimientos | `tests/test_security_and_api.py::test_operario_chequeo_cannot_access_movimientos`; `tests/test_pending_critical_cases.py::test_role_002_operario_chequeo_cannot_post_movimientos` |
| ROLE-003 | Aprobado | No admin bloqueado en vehiculos | `tests/test_pending_critical_cases.py::test_role_003_non_admin_cannot_access_vehiculos_crud` |
| ROLE-004 | Aprobado | No admin bloqueado en conductores | `tests/test_pending_critical_cases.py::test_role_004_non_admin_cannot_access_conductores_crud` |
| ROLE-005 | Aprobado | No admin bloqueado en usuarios | `tests/test_pending_critical_cases.py::test_role_005_non_admin_cannot_access_usuarios_crud` |
| ROLE-006 | Aprobado | No admin bloqueado en dashboard/admin routes | `tests/test_security_and_api.py::test_role_restriction_non_admin_cannot_access_admin_routes` |
| ROLE-007 | Aprobado | Restriccion efectiva por rol para datos de exportacion admin | `tests/test_pending_critical_cases.py::test_role_003_non_admin_cannot_access_vehiculos_crud`; `tests/test_pending_critical_cases.py::test_role_004_non_admin_cannot_access_conductores_crud`; `tests/test_pending_critical_cases.py::test_role_005_non_admin_cannot_access_usuarios_crud` |
| ROLE-008 | Aprobado | Admin accede a rutas habilitadas | `tests/test_security_and_api.py::test_admin_can_access_dashboard_and_users` |
| MOV-001 | Aprobado | Registro y consulta de movimiento valido | `tests/test_security_and_api.py::test_can_create_and_fetch_movimiento_with_valid_jwt` |
| MOV-002 | Aprobado | Payload incompleto rechazado | `tests/test_pending_critical_cases.py::test_mov_002_required_fields_validation` |
| MOV-003 | Aprobado | Vehiculo inexistente rechazado | `tests/test_pending_critical_cases.py::test_mov_003_invalid_vehiculo_rejected` |
| MOV-004 | Aprobado | Registro de entrada valida exitoso | `tests/test_security_and_api.py::test_can_create_and_fetch_movimiento_with_valid_jwt` |
| MOV-005 | Aprobado | Regla kilometraje minimo aplicada | `tests/test_pending_critical_cases.py::test_mov_005_km_cannot_go_below_last_record` |
| MOV-006 | Aprobado | Historial filtrado por tipo funciona | `tests/test_pending_critical_cases.py::test_mov_006_history_filters_by_tipo` |
| CHK-001 | Aprobado | Creacion de cabecera de chequeo exitosa | `tests/test_pending_critical_cases.py::test_chk_001_can_create_chequeo_header` |
| CHK-002 | Aprobado | Chequeo completo con todos los items guardado | `tests/test_pending_critical_cases.py::test_chk_002_can_create_complete_chequeo_items` |
| CHK-003 | Aprobado | Chequeo incompleto rechazado | `tests/test_pending_critical_cases.py::test_chk_003_rejects_incomplete_chequeo_items` |
| CHK-004 | Aprobado | Historial de chequeos con filtro responde correcto | `tests/test_pending_critical_cases.py::test_chk_004_list_chequeos_with_filters` |
| CAT-001 | Aprobado | CRUD vehiculos, unicidad placa y soft delete ok | `tests/test_pending_critical_cases.py::test_cat_001_admin_vehiculos_crud_and_uniqueness` |
| CAT-002 | Aprobado | CRUD conductores, unicidad cedula y soft delete ok | `tests/test_pending_critical_cases.py::test_cat_002_admin_conductores_crud_and_uniqueness` |
| CAT-003 | Aprobado | Actualizacion de password de usuario aplica hash correcto | `tests/test_pending_critical_cases.py::test_cat_003_admin_usuarios_crud_uniqueness_and_password_hash` |
| REP-001 | Aprobado | Exportacion de movimientos usa dataset filtrado | `tests/test_pending_critical_cases.py::test_rep_001_and_rep_002_exports_use_filtered_data_in_frontend_source` |
| REP-002 | Aprobado | Exportacion de chequeos usa dataset filtrado | `tests/test_pending_critical_cases.py::test_rep_001_and_rep_002_exports_use_filtered_data_in_frontend_source` |
| DATA-001 | Aprobado | Conductor no autentica como usuario | `tests/test_pending_critical_cases.py::test_data_001_conductor_cannot_authenticate_as_user` |
| DATA-002 | Aprobado | Movimientos y chequeos se mantienen independientes | `tests/test_pending_critical_cases.py::test_data_002_movimientos_y_chequeos_are_independent` |
| DATA-003 | Aprobado | Soft delete no rompe historial | `tests/test_pending_critical_cases.py::test_data_003_soft_delete_preserves_movimiento_history` |
| SEC-001 | Aprobado | Endpoints protegidos bloquean sin token | `tests/test_security_and_api.py::test_protected_routes_require_authentication` |
| SEC-002 | Aprobado | Token de rol no autorizado recibe 403 | `tests/test_security_and_api.py::test_role_restriction_non_admin_cannot_access_admin_routes` |
| SEC-003 | Aprobado | Payload SQLi en login no hace bypass | `tests/test_security_and_api.py::test_login_with_invalid_credentials_fails` |
| SEC-004 | Aprobado | Payload SQLi en filtros no rompe API | `tests/test_security_and_api.py::test_sql_injection_payload_in_search_does_not_break_selectores` |
| SEC-005 | Bloqueado | Validado solo almacenamiento de payload; falta validacion UI runtime de no ejecucion | `tests/test_pending_critical_cases.py::test_sec_005_xss_payload_is_stored_as_plain_text_in_api` |
| SEC-006 | Aprobado | Manipulacion de ID bloqueada por ownership | `tests/test_pending_critical_cases.py::test_sec_006_id_tampering_is_denied_for_other_owners` |
| SEC-007 | Aprobado | Token previo de usuario inactivado denegado | `tests/test_pending_critical_cases.py::test_sec_007_inactivated_user_token_is_denied` |
| SEC-008 | Aprobado | Rate limit de login activo tras multiples intentos fallidos | `tests/test_pending_critical_cases.py::test_sec_008_rate_limit_blocks_repeated_failed_logins` |
| SEC-009 | Aprobado | `/docs`, `/redoc`, `/openapi.json` y `/test-db` no expuestos por defecto | `tests/test_pending_critical_cases.py::test_sec_009_docs_and_debug_routes_are_not_exposed`; comando `PYTHONPATH=. ./venv/bin/python -c ...` |
| SEC-010 | Aprobado | Archivo SQLite no servido por HTTP | `tests/test_pending_critical_cases.py::test_sec_010_sqlite_file_is_not_served_over_http` |
| SEC-011 | Aprobado | Logica de redireccion a login existe sin sesion | `tests/test_pending_critical_cases.py::test_sec_011_frontend_redirect_logic_without_session_exists` |
| SEC-012 | Aprobado | Error de validacion no expone traceback/path | `tests/test_pending_critical_cases.py::test_sec_012_validation_error_does_not_expose_traceback` |
| PERF-001 | Aprobado | 10 logins dentro de presupuesto de tiempo local | `tests/test_pending_critical_cases.py::test_perf_001_ten_logins_under_global_time_budget` |
| PERF-002 | Aprobado | Registro de salida/entrada bajo 2s en entorno local | `tests/test_pending_critical_cases.py::test_perf_002_single_movimiento_create_is_fast` |
| PERF-003 | Aprobado | Registro de chequeo completo bajo 2s local | `tests/test_pending_critical_cases.py::test_perf_003_full_chequeo_registration_is_fast` |
| PERF-004 | Aprobado | Consulta de historial filtrado bajo 3s local | `tests/test_pending_critical_cases.py::test_perf_004_filtered_history_query_is_fast` |
| PERF-005 | Bloqueado | No hay dispositivo movil real en esta ejecucion CLI | N/A en entorno local de pruebas |
| PERF-006 | Aprobado | 1 transaccion/segundo sostenida sin perdida | `tests/test_pending_critical_cases.py::test_perf_006_one_tx_per_second_without_data_loss` |
| PWA-001 | Fallido | PWA incompleta: no service worker y faltan iconos declarados | `scv-frontend/manifest.json`; grep sin `serviceWorker`; `ls scv-frontend/images` |
| PWA-002 | Bloqueado | Requiere ejecucion en Android fisico | N/A en entorno local de pruebas |
| PWA-003 | Bloqueado | Requiere red local empresarial de despliegue | N/A en entorno local de pruebas |
| PWA-004 | Bloqueado | Requiere validacion UX en dispositivo movil real | N/A en entorno local de pruebas |

## Defectos detectados

1. `PWA-001` fallido: faltan artefactos minimos para instalacion PWA robusta.
