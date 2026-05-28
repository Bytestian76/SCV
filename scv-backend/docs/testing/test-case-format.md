# SCV - Formato de Test Case

Usa este formato para documentar pruebas funcionales y de seguridad.

## Plantilla

| Campo | Descripcion |
| --- | --- |
| ID | Identificador unico (ej: `SEC-001`, `API-010`) |
| Modulo | Componente bajo prueba (`Auth`, `Movimientos`, `Usuarios`, etc.) |
| Tipo | `Seguridad`, `Funcional`, `Integracion`, `Regresion` |
| Prioridad | `Alta`, `Media`, `Baja` |
| Precondiciones | Datos y estado requeridos antes de ejecutar |
| Datos de prueba | Payload, token, parametros, usuario/rol |
| Pasos | Secuencia exacta de ejecucion |
| Resultado esperado | Comportamiento correcto esperado |
| Resultado obtenido | Evidencia del resultado real |
| Estado | `Pendiente`, `Aprobado`, `Fallido`, `Bloqueado` |
| Evidencia | Logs, JSON, capturas, reporte automatizado |

## Ejemplo de Caso

```text
ID: SEC-004
Modulo: Auth
Tipo: Seguridad
Prioridad: Alta
Precondiciones:
- Usuario admin activo
- API levantada en entorno de pruebas

Datos de prueba:
- JWT valido obtenido por login
- JWT corrompido (1 caracter modificado)

Pasos:
1) Ejecutar POST /api/v1/auth/login con credenciales validas
2) Guardar access_token
3) Corromper el token cambiando el ultimo caracter
4) Ejecutar GET /api/v1/auth/me con Bearer token_corrompido

Resultado esperado:
- La API responde 401
- Mensaje: "Token invalido"

Resultado obtenido:
- 401 recibido
- detail="Token invalido"

Estado: Aprobado
Evidencia:
- tests/test_security_and_api.py::test_corrupted_jwt_is_rejected
```

## Catalogo inicial sugerido (SCV)

| ID | Modulo | Objetivo | Prioridad |
| --- | --- | --- | --- |
| SEC-001 | Auth | Bloquear endpoints protegidos sin token | Alta |
| SEC-002 | Auth | Rechazar token JWT malformado | Alta |
| SEC-003 | Auth | Rechazar token JWT expirado | Alta |
| SEC-004 | Auth | Rechazar token JWT corrompido | Alta |
| SEC-005 | Auth | Revocar token despues de logout | Alta |
| SEC-006 | Roles | Impedir acceso de no-admin a rutas admin | Alta |
| SEC-007 | Movimientos | Limitar historial de operario a sus propios datos | Alta |
| SEC-008 | Selectores | Validar que payload tipo SQL injection no rompa API | Media |
| API-001 | Salud | Verificar `/` y `/ping` operativos | Media |
| API-002 | Movimientos | Crear y consultar movimiento con JWT valido | Alta |

## Documentos de apoyo

- Checklist de auditoria tecnica: `docs/testing/security-verification-checklist.md`
- Bateria minima critica de casos: `docs/testing/critical-test-cases.md`
