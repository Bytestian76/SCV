# SCV - Checklist de Verificacion de Seguridad

Checklist tecnico para auditar que los controles de seguridad definidos para SCV esten implementados y operando.

## Como usar este checklist

- Estado permitido: `Pendiente`, `Aprobado`, `Fallido`, `N/A`.
- En `Evidencia` documenta referencia concreta: endpoint, test, log, captura o commit.
- Ejecuta primero los controles `Alta`, luego `Media`.

## Matriz de verificacion

| ID | Area | Prioridad | Control a verificar | Como verificar | Estado | Evidencia |
| --- | --- | --- | --- | --- | --- | --- |
| CHK-AUTH-001 | Auth | Alta | Las contrasenas no se guardan en texto plano | Revisar tabla `usuarios` y flujo de creacion | Pendiente | |
| CHK-AUTH-002 | Auth | Alta | Se usa bcrypt para hash de contrasenas | Revisar servicio de seguridad (`hash`, `verify`) | Pendiente | |
| CHK-AUTH-003 | Auth | Alta | Login valida hash y no texto plano | Probar login valido e invalido + revisar codigo | Pendiente | |
| CHK-AUTH-004 | Auth | Alta | Usuario inactivo no puede autenticarse | Desactivar usuario y ejecutar login | Pendiente | |
| CHK-AUTH-005 | Auth | Alta | Login usa email + contrasena | Validar contrato de `POST /auth/login` | Pendiente | |
| CHK-AUTH-006 | Auth | Media | Existe logout y revocacion/invalidacion de sesion | Probar `POST /auth/logout` y luego `GET /auth/me` | Pendiente | |
| CHK-AUTH-007 | Auth | Media | Recordar sesion (si aplica) tiene politica limitada | Revisar expiracion/token refresh y frontend | Pendiente | |
| CHK-JWT-001 | JWT | Alta | JWT incluye `user_id`, `email`, `rol`, `exp` | Decodificar token de pruebas | Pendiente | |
| CHK-JWT-002 | JWT | Alta | Expiracion de token se valida realmente | Probar token expirado | Pendiente | |
| CHK-JWT-003 | JWT | Alta | `SECRET_KEY` no esta hardcodeada en frontend | Buscar referencia de clave en frontend | Pendiente | |
| CHK-JWT-004 | JWT | Alta | `SECRET_KEY` proviene de entorno/config segura | Revisar settings de backend | Pendiente | |
| CHK-JWT-005 | JWT | Media | Algoritmo de firma definido explicitamente | Revisar configuracion JWT | Pendiente | |
| CHK-JWT-006 | JWT | Alta | Token manipulado responde `401` | Alterar firma/payload y llamar endpoint protegido | Pendiente | |
| CHK-JWT-007 | JWT | Alta | Token malformado responde `401` | Enviar formato invalido en `Authorization` | Pendiente | |
| CHK-JWT-008 | JWT | Alta | Token vacio responde `401` | Enviar `Bearer ` sin token | Pendiente | |
| CHK-JWT-009 | JWT | Alta | Token de usuario inactivo es denegado | Inactivar usuario con token vigente y volver a consultar | Pendiente | |
| CHK-ROLE-001 | Roles | Alta | Cada endpoint protegido valida rol antes de logica de negocio | Revisar dependencias de autorizacion en endpoints | Pendiente | |
| CHK-ROLE-002 | Roles | Alta | `operario_movimientos` no puede acceder a chequeos | Probar `GET/POST /chequeos` con rol movimientos | Pendiente | |
| CHK-ROLE-003 | Roles | Alta | `operario_movimientos` no puede acceder a catalogos admin | Probar `usuarios`, `vehiculos`, `conductores`, `dashboard` | Pendiente | |
| CHK-ROLE-004 | Roles | Alta | `operario_movimientos` no puede exportar | Probar endpoint/boton de exportacion con ese rol | Pendiente | |
| CHK-ROLE-005 | Roles | Alta | `operario_chequeo` no puede acceder a movimientos | Probar `GET/POST /movimientos` con rol chequeo | Pendiente | |
| CHK-ROLE-006 | Roles | Alta | `operario_chequeo` no puede acceder a catalogos admin | Probar `usuarios`, `vehiculos`, `conductores`, `dashboard` | Pendiente | |
| CHK-ROLE-007 | Roles | Alta | `operario_chequeo` no puede exportar | Probar endpoint/boton de exportacion con ese rol | Pendiente | |
| CHK-ROLE-008 | Roles | Alta | `admin` accede a todos los modulos permitidos | Ejecutar smoke de endpoints admin | Pendiente | |
| CHK-OWN-001 | Ownership | Alta | Politica de ownership esta definida y documentada | Revisar SRS/backlog y docs tecnicas | Pendiente | |
| CHK-OWN-002 | Ownership | Alta | No hay escalamiento por cambiar ID en URL | Probar acceso cruzado por ID con roles no autorizados | Pendiente | |
| CHK-OWN-003 | Ownership | Media | Si aplica ownership, operario solo ve/edita lo permitido | Probar historial y detalle entre usuarios operarios | Pendiente | |
| CHK-VAL-001 | Validacion | Alta | No hay SQL construido por concatenacion de strings | Revisar consultas ORM/repositorio | Pendiente | |
| CHK-VAL-002 | Validacion | Alta | Entrada valida campos obligatorios y tipos | Probar payloads incompletos o tipos invalidos | Pendiente | |
| CHK-VAL-003 | Validacion | Alta | `placa` es unica | Intentar crear vehiculo duplicado | Pendiente | |
| CHK-VAL-004 | Validacion | Alta | `cedula` es unica | Intentar crear conductor duplicado | Pendiente | |
| CHK-VAL-005 | Validacion | Alta | `email` es unico | Intentar crear usuario duplicado | Pendiente | |
| CHK-VAL-006 | Validacion | Alta | `km_final >= km_inicial` en entradas | Registrar retorno con km invalido | Pendiente | |
| CHK-VAL-007 | Validacion | Alta | `tipo` de movimiento acepta solo valores validos | Enviar tipo fuera de enum | Pendiente | |
| CHK-VAL-008 | Validacion | Media | No se aceptan campos inesperados sin control | Enviar payload con atributos extra | Pendiente | |
| CHK-VAL-009 | Validacion | Alta | Chequeo exige todos los items requeridos | Enviar chequeo incompleto | Pendiente | |
| CHK-ROUTE-001 | Exposicion | Alta | `/docs` y `/redoc` estan bloqueados/protegidos en produccion | Probar acceso en entorno productivo | Pendiente | |
| CHK-ROUTE-002 | Exposicion | Alta | Rutas de debug/prueba no estan expuestas en produccion | Probar rutas como `/test-db` | Pendiente | |
| CHK-ROUTE-003 | Exposicion | Alta | Errores no exponen stack trace ni secretos | Forzar error interno y revisar respuesta | Pendiente | |
| CHK-ROUTE-004 | Exposicion | Alta | Frontend bloquea rutas privadas sin token valido | Navegar directo a vistas privadas sin sesion | Pendiente | |
| CHK-ABUSE-001 | Abuse | Media | Existe limite de intentos de login (rate limit/bloqueo) | Simular intentos fallidos repetidos | Pendiente | |
| CHK-ABUSE-002 | Abuse | Media | Endpoints sensibles tienen limite de requests | Ejecutar rafaga de peticiones | Pendiente | |
| CHK-ABUSE-003 | Abuse | Media | Paginacion y tamanos de respuesta tienen limites maximos | Solicitar `limit` extremo y validar truncamiento | Pendiente | |
| CHK-LOG-001 | Auditoria | Alta | Login exitoso y fallido queda logueado | Revisar log despues de pruebas de login | Pendiente | |
| CHK-LOG-002 | Auditoria | Alta | Se registran altas/ediciones/bajas logicas | Probar CRUD y revisar log asociado | Pendiente | |
| CHK-LOG-003 | Auditoria | Alta | Log incluye fecha, usuario, accion, recurso, resultado | Inspeccionar formato de log | Pendiente | |
| CHK-LOG-004 | Auditoria | Alta | Logs no incluyen contrasenas ni tokens completos | Buscar secretos en archivos de log | Pendiente | |
| CHK-DB-001 | BD/Servidor | Alta | SQLite no esta en ruta publica servida por HTTP | Revisar estructura de despliegue | Pendiente | |
| CHK-DB-002 | BD/Servidor | Alta | Permisos de archivo `.db` restringidos al backend | Revisar permisos del sistema operativo | Pendiente | |
| CHK-DB-003 | BD/Servidor | Alta | No existe endpoint para descargar la base | Probar discovery de archivos/paths | Pendiente | |
| CHK-DB-004 | BD/Servidor | Media | Solo backend accede a SQLite | Verificar arquitectura y bloqueo de acceso directo | Pendiente | |
| CHK-DB-005 | BD/Servidor | Media | Puertos expuestos son solo los necesarios | Escaneo basico de puertos internos | Pendiente | |
| CHK-DB-006 | BD/Servidor | Media | Existe estrategia de backup y restauracion | Revisar procedimiento y prueba de restore | Pendiente | |
| CHK-FE-001 | Frontend | Alta | Salidas de texto se renderizan de forma segura (sin XSS) | Probar payload con script en observaciones | Pendiente | |
| CHK-FE-002 | Frontend | Alta | Token no se expone en DOM ni consola en produccion | Inspeccionar consola y elementos UI | Pendiente | |
| CHK-FE-003 | Frontend | Alta | UI oculta acciones por rol y backend tambien las bloquea | Probar ocultamiento + llamada directa API | Pendiente | |
| CHK-FE-004 | Frontend | Media | Manejo de errores no filtra detalles internos | Forzar errores y revisar mensajes de UI | Pendiente | |

## Criterio de salida recomendado

- `Alta`: 100% en `Aprobado` para liberar a produccion.
- `Media`: minimo 80% en `Aprobado` y plan de remediacion para lo pendiente.
- Cualquier `Fallido` en `Alta` bloquea liberacion.
