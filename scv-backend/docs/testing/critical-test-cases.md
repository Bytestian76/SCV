# SCV - Bateria Minima Critica de Test Cases

Documento operativo con casos de prueba criticos de seguridad, autorizacion y flujos core del negocio.

## Convenciones

- Tipo: `Seguridad`, `Funcional`, `Integracion`, `Rendimiento`, `PWA`.
- Prioridad: `P1` (bloqueante), `P2` (alta), `P3` (media).
- Estado inicial sugerido para ejecucion: `Pendiente`.
- Referencia de API: prefijo esperado `/api/v1`.

## Orden de ejecucion recomendado

1. `AUTH` y `SEC` (acceso y sesion)
2. `ROLE` (autorizacion)
3. `MOV`, `CHK`, `CAT`, `REP` (negocio)
4. `DATA` (integridad)
5. `PERF` y `PWA` (operacion real)

## Casos criticos

| ID | Modulo | Tipo | Prioridad | Precondiciones | Pasos | Resultado esperado |
| --- | --- | --- | --- | --- | --- | --- |
| AUTH-001 | Auth | Seguridad | P1 | Usuario admin activo | Login con credenciales validas; consultar `/auth/me` | 200; token bearer valido; usuario correcto |
| AUTH-002 | Auth | Seguridad | P1 | Usuario `operario_movimientos` activo | Login y acceso a su dashboard | 200; token emitido; modulo correcto |
| AUTH-003 | Auth | Seguridad | P1 | Usuario `operario_chequeo` activo | Login y acceso a su dashboard | 200; token emitido; modulo correcto |
| AUTH-004 | Auth | Seguridad | P1 | Usuario valido existente | Login con contrasena incorrecta | 401; mensaje controlado |
| AUTH-005 | Auth | Seguridad | P1 | Ninguna | Login con usuario inexistente | 401; sin filtrar si existe cuenta |
| AUTH-006 | Auth | Seguridad | P1 | Usuario inactivo | Login con credenciales correctas | Acceso denegado |
| AUTH-007 | Auth | Seguridad | P1 | Endpoint protegido disponible | Consumir endpoint con JWT malformado | 401 |
| AUTH-008 | Auth | Seguridad | P1 | JWT valido previamente emitido | Alterar token y usarlo en endpoint protegido | 401 |
| AUTH-009 | Auth | Seguridad | P1 | Token con expiracion vencida | Usar token expirado en endpoint protegido | 401 |
| AUTH-010 | Auth | Seguridad | P2 | Sesion activa con token valido | Ejecutar `/auth/logout`; reusar token | Logout exitoso; token revocado/no valido |
| AUTH-011 | Auth | Seguridad | P3 | Funcionalidad recordar sesion habilitada | Activar recordar sesion y reabrir app | Persistencia segun politica, no indefinida |
| ROLE-001 | Roles | Seguridad | P1 | Usuario `operario_movimientos` autenticado | Intentar `POST /chequeos` y `GET /chequeos` | 403 en ambos |
| ROLE-002 | Roles | Seguridad | P1 | Usuario `operario_chequeo` autenticado | Intentar `POST /movimientos` y `GET /movimientos` | 403 en ambos |
| ROLE-003 | Roles | Seguridad | P1 | Usuario no admin autenticado | Intentar CRUD de vehiculos | 403 |
| ROLE-004 | Roles | Seguridad | P1 | Usuario no admin autenticado | Intentar CRUD de conductores | 403 |
| ROLE-005 | Roles | Seguridad | P1 | Usuario no admin autenticado | Intentar CRUD de usuarios | 403 |
| ROLE-006 | Roles | Seguridad | P1 | Usuario no admin autenticado | Intentar acceso a dashboard/reportes admin | 403 |
| ROLE-007 | Roles | Seguridad | P1 | Usuario no admin autenticado | Intentar exportacion Excel/PDF | 403 |
| ROLE-008 | Roles | Integracion | P1 | Usuario admin autenticado | Ejecutar smoke de endpoints admin y operativos | 200 en rutas permitidas |
| MOV-001 | Movimientos | Funcional | P1 | Operario movimientos autenticado; catalogos activos | Registrar salida valida | 201; datos persistidos; `usuario_id` correcto |
| MOV-002 | Movimientos | Funcional | P1 | Operario movimientos autenticado | Registrar salida con campos obligatorios faltantes | 4xx validacion |
| MOV-003 | Movimientos | Funcional | P1 | Operario movimientos autenticado | Registrar salida con `vehiculo_id` inexistente | 4xx controlado |
| MOV-004 | Movimientos | Funcional | P1 | Existe salida previa o caso permitido | Registrar entrada valida | 201; retorno registrado |
| MOV-005 | Movimientos | Funcional | P1 | Operario movimientos autenticado | Registrar entrada con `km_final < km_inicial` | Rechazo de negocio |
| MOV-006 | Movimientos | Integracion | P2 | Datos de movimientos existentes | Consultar historial filtrado por fecha/vehiculo/conductor | 200; filtro consistente |
| CHK-001 | Chequeos | Funcional | P1 | Operario chequeo autenticado; catalogos activos | Registrar cabecera de chequeo valida | 201; cabecera persistida |
| CHK-002 | Chequeos | Funcional | P1 | Operario chequeo autenticado | Registrar chequeo completo con items | 201; cabecera + items guardados |
| CHK-003 | Chequeos | Funcional | P1 | Operario chequeo autenticado | Enviar chequeo con items faltantes | 4xx validacion |
| CHK-004 | Chequeos | Integracion | P2 | Datos de chequeos existentes | Consultar historial con filtros | 200; filtro consistente |
| CAT-001 | Vehiculos | Funcional | P1 | Admin autenticado | Crear/editar/desactivar vehiculo; repetir placa | Unicidad de placa y baja logica |
| CAT-002 | Conductores | Funcional | P1 | Admin autenticado | Crear/editar/desactivar conductor; repetir cedula | Unicidad de cedula y baja logica |
| CAT-003 | Usuarios | Funcional | P1 | Admin autenticado | Crear/editar/desactivar usuario; repetir email | Unicidad de email; hash de contrasena |
| REP-001 | Reportes | Integracion | P2 | Admin autenticado; datos existentes | Exportar movimientos a Excel con filtros aplicados | Archivo generado y consistente con filtros |
| REP-002 | Reportes | Integracion | P2 | Admin autenticado; datos existentes | Exportar chequeos a Excel/PDF con filtros aplicados | Archivo generado y consistente con filtros |
| DATA-001 | Integridad | Integracion | P1 | Conductor y usuario de prueba creados | Intentar autenticar conductor como usuario | Acceso denegado; entidades separadas |
| DATA-002 | Integridad | Integracion | P2 | Datos de movimientos y chequeos existentes | Validar independencia entre modelos | Sin FK artificial; cruce por IDs de dominio |
| DATA-003 | Integridad | Funcional | P1 | Registros activos existentes | Desactivar registros y consultar historial | `activo=false`; historial intacto |
| SEC-001 | Seguridad API | Seguridad | P1 | Endpoint protegido | Llamar sin header Authorization | 401/403 segun politica |
| SEC-002 | Seguridad API | Seguridad | P1 | Token de rol no autorizado | Consumir endpoint de admin con token operario | 403 |
| SEC-003 | Seguridad API | Seguridad | P1 | Endpoint login disponible | Enviar payload SQLi en login | Sin bypass; sin error SQL expuesto |
| SEC-004 | Seguridad API | Seguridad | P1 | Endpoint de filtros disponible | Enviar SQLi en query params/filtros | Respuesta controlada, API estable |
| SEC-005 | Seguridad API | Seguridad | P1 | Campo texto persistible (observaciones) | Guardar `<script>alert(1)</script>` y visualizar | Script no ejecuta (XSS mitigado) |
| SEC-006 | Seguridad API | Seguridad | P1 | Recursos con IDs existentes | Cambiar ID en URL para acceso no permitido | Denegado por rol/ownership |
| SEC-007 | Seguridad API | Seguridad | P1 | Usuario inactivado con token previo | Reutilizar token luego de inactivacion | Acceso denegado |
| SEC-008 | Seguridad API | Seguridad | P2 | Mecanismo anti abuso habilitado | Reintentos masivos de login | Rate limit/bloqueo aplicado |
| SEC-009 | Seguridad API | Seguridad | P2 | Entorno de produccion | Acceder a `/docs` y `/redoc` | Bloqueado o protegido |
| SEC-010 | Seguridad API | Seguridad | P1 | Entorno desplegado | Intentar acceder archivo SQLite via HTTP | Inaccesible |
| SEC-011 | Frontend | Seguridad | P1 | Frontend desplegado | Abrir ruta privada sin sesion | Redireccion a login |
| SEC-012 | Seguridad API | Seguridad | P1 | Endpoint para forzar error controlado | Generar error interno | Sin stack trace ni secretos en respuesta |
| PERF-001 | Rendimiento | Rendimiento | P2 | Ambiente de prueba en red local | Ejecutar 10 logins concurrentes | Tiempo y tasa de exito dentro de meta |
| PERF-002 | Rendimiento | Rendimiento | P2 | Operario autenticado | Medir tiempo de registro de salida | <= 2 s en 95% de casos |
| PERF-003 | Rendimiento | Rendimiento | P2 | Operario autenticado | Medir tiempo de registro de chequeo | <= 2 s en 95% de casos |
| PERF-004 | Rendimiento | Rendimiento | P2 | Datos historicos cargados | Medir historial con filtros | <= 3 s en 95% de casos |
| PERF-005 | Rendimiento | Rendimiento | P2 | Dispositivo movil real | Medir carga de pantallas principales | <= 3 s |
| PERF-006 | Rendimiento | Rendimiento | P3 | Script de carga basica | Simular 1 transaccion/segundo sostenida | Sin perdida de datos |
| PWA-001 | PWA | PWA | P2 | Android disponible | Instalar app desde navegador compatible | Instalacion exitosa |
| PWA-002 | PWA | PWA | P1 | Android instalado y backend en red local | Ejecutar login + salida + chequeo en movil | Flujo completo operativo |
| PWA-003 | PWA | PWA | P1 | Red local empresarial habilitada | Acceder SCV desde movil y escritorio | Conectividad estable |
| PWA-004 | PWA | PWA | P3 | Flujos UI habilitados | Validar maximo 3 pasos en tareas frecuentes | Usabilidad cumple criterio mobile-first |

## Cobertura automatizada actual (referencia rapida)

Casos ya cubiertos total o parcialmente por `tests/test_security_and_api.py`:

- `AUTH-001`, `AUTH-004`, `AUTH-007`, `AUTH-008`, `AUTH-009`, `AUTH-010`
- `ROLE-001` (parcial), `ROLE-002`, `ROLE-006`, `ROLE-008` (parcial)
- `MOV-006` (parcial, historial por rol)
- `SEC-001`, `SEC-002`, `SEC-003`, `SEC-004`

## Hallazgos abiertos tras la ejecucion

1. `PWA-001`: faltan artefactos minimos para instalacion PWA robusta.
2. `SEC-005`: falta validacion UI runtime para confirmar mitigacion XSS.
3. `PERF-005`, `PWA-002`, `PWA-003`, `PWA-004`: requieren entorno/dispositivo real.

## Reporte de ejecucion

- Ejecucion completa de pendientes: `docs/testing/critical-test-execution-report-2026-04-21.md`
- Evidencia automatizada (JUnit): `docs/testing/test-results.xml`
