# 📡 Especificación Oficial de la API REST - SCV

**Comercializadora Normetales S.A.S.**  
*Framework: FastAPI / Python 3.11+*  
*Base URL:* `/api/v1`  
*Versión de API:* `2.0.0`

---

## 📌 1. Convenciones Generales

### 1.1. Autenticación y Cabeceras
Todas las solicitudes a rutas protegidas deben incluir la cabecera HTTP estándar de autorización con el Bearer Token obtenido en el Login:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### 1.2. Códigos de Respuesta HTTP Estándar
* `200 OK`: Consulta o actualización procesada exitosamente.
* `201 Created`: Recurso creado satisfactoriamente en la base de datos.
* `400 Bad Request`: Parámetros inválidos o inconsistencia en la lógica de negocio.
* `401 Unauthorized`: Token faltante, firma inválida o sesión expirada/revocada.
* `403 Forbidden`: Permiso insuficiente según el rol RBAC del usuario.
* `404 Not Found`: Recurso inexistente en el sistema.
* `422 Unprocessable Entity`: Error de validación de esquema en payload JSON (Pydantic).
* `500 Internal Server Error`: Excepción no controlada en el servidor.

---

## 🔑 2. Módulo de Autenticación (`/auth`)

### 2.1. Iniciar Sesión (Login)
* **Método:** `POST`
* **Ruta:** `/auth/login`
* **Acceso:** Público
* **Payload Request:**
```json
{
  "username": "admin@scv.local",
  "password": "tu_password_seguro"
}
```
* **Respuesta Exitosa (`200 OK`):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "expires_in": 28800,
  "role": "admin",
  "user": {
    "id": 1,
    "nombre": "Administrador Principal",
    "email": "admin@scv.local",
    "rol": "admin"
  }
}
```

### 2.2. Perfil del Usuario Autenticado
* **Método:** `GET`
* **Ruta:** `/auth/me`
* **Acceso:** Cualquier usuario autenticado
* **Respuesta Exitosa (`200 OK`):** Retorna el objeto completo del usuario en sesión.

### 2.3. Cerrar Sesión y Revocar Token (Logout)
* **Método:** `POST`
* **Ruta:** `/auth/logout`
* **Acceso:** Cualquier usuario autenticado
* **Comportamiento:** Extrae el `jti` del token JWT actual y lo inserta en `tokens_revocados`. Cualquier intento de reutilizar el token será rechazado con `401 Unauthorized`.

---

## 📊 3. Módulo de Centro de Mando y Dashboard (`/dashboard`)

### 3.1. Resumen Ejecutivo en Tiempo Real
* **Método:** `GET`
* **Ruta:** `/dashboard/summary`
* **Acceso:** Todos los roles autenticados
* **Respuesta Exitosa (`200 OK`):**
```json
{
  "kpis": {
    "total_vehiculos": 18,
    "vehiculos_activos": 15,
    "vehiculos_en_taller": 3,
    "movimientos_hoy": 24,
    "chequeos_hoy": 14,
    "alertas_activas": 2
  },
  "movimientos_recientes": [ ... ],
  "alertas_recientes": [ ... ],
  "flota_distribucion": {
    "activo": 15,
    "en_taller": 3,
    "inactivo": 0
  }
}
```

---

## 🚛 4. Módulo de Flota Vehicular (`/vehiculos`)

### 4.1. Listar Vehículos
* **Método:** `GET`
* **Ruta:** `/vehiculos/`
* **Parámetros Query:** `estado` (opcional: `activo`, `en_taller`, `inactivo`, `baja`), `skip`, `limit`.
* **Permisos Requeridos:** Cualquier usuario autenticado.

### 4.2. Registrar Vehículo
* **Método:** `POST`
* **Ruta:** `/vehiculos/`
* **Permisos Requeridos:** `admin`
* **Payload Request:**
```json
{
  "placa": "TRK-205",
  "marca": "Chevrolet",
  "modelo": "NPR Turbo 5.0",
  "año": 2024,
  "kilometraje": 12500,
  "fecha_venc_soat": "2027-04-10",
  "fecha_venc_rtm": "2027-04-10",
  "estado": "activo",
  "observaciones": "Furgón de alta capacidad para acopio Bogotá"
}
```

### 4.3. Detalle, Actualización y Eliminación
* `GET /vehiculos/{id}`: Detalle del vehículo y ficha técnica.
* `PUT /vehiculos/{id}`: Actualización de kilometraje, vigencia de documentos y estado operativo (`admin`, `jefe_mecanicos`).
* `DELETE /vehiculos/{id}`: Retiro o eliminación de vehículo (`admin`).

---

## 👥 5. Módulo de Usuarios y Personal Operativo (`/usuarios`)

### 5.1. Listar Usuarios y Conductores
* **Método:** `GET`
* **Ruta:** `/usuarios/`
* **Parámetros Query:** `rol`, `solo_conductores` (boolean), `skip`, `limit`.
* **Permisos Requeridos:** `admin`, `operario_movimientos`, `jefe_mecanicos`.

### 5.2. Crear Usuario / Operario
* **Método:** `POST`
* **Ruta:** `/usuarios/`
* **Permisos Requeridos:** `admin`
* **Payload Request:**
```json
{
  "nombre": "Mauricio Gómez",
  "email": "m.gomez@scv.local",
  "password": "Password123*",
  "rol": "operario_chequeo",
  "cedula": "1019283746",
  "licencia": "C2-1019283746",
  "categoria": "C2",
  "fecha_venc_licencia": "2028-09-15",
  "telefono": "3109876543"
}
```

---

## ⚖️ 6. Módulo de Movimientos y Despacho (`/movimientos`)

### 6.1. Listar Movimientos de Báscula
* **Método:** `GET`
* **Ruta:** `/movimientos/`
* **Parámetros Query:** `fecha_inicio`, `fecha_fin`, `vehiculo_id`, `tipo` (`entrada`/`salida`).
* **Permisos:** `admin`, `operario_movimientos`.

### 6.2. Registrar Entrada o Salida por Báscula
* **Método:** `POST`
* **Ruta:** `/movimientos/`
* **Permisos:** `admin`, `operario_movimientos`
* **Payload Request:**
```json
{
  "tipo": "salida",
  "vehiculo_id": 1,
  "auxiliar": "Hernando Silva",
  "proveedor": "Fundición Central S.A.",
  "kilometraje": 45310,
  "bascula_peso": 12850.50,
  "cantidad_sacas": 14,
  "estado_cajon": "bueno",
  "observaciones": "Despacho de chatarra de cobre con precinto #90812"
}
```

### 6.3. Exportación a CSV
* **Método:** `GET`
* **Ruta:** `/movimientos/export/csv`
* **Respuesta:** Stream de archivo `.csv` con delimitador `;` y codificación UTF-8 BOM para apertura nativa en Microsoft Excel.

---

## 📋 7. Módulo de Inspecciones Preoperacionales (`/chequeos`)

### 7.1. Listar Inspecciones
* **Método:** `GET`
* **Ruta:** `/chequeos/`
* **Parámetros:** `fecha_inicio`, `fecha_fin`, `vehiculo_id`, `aprobado` (boolean).

### 7.2. Registrar Chequeo Preoperacional Diario
* **Método:** `POST`
* **Ruta:** `/chequeos/`
* **Permisos:** `admin`, `operario_chequeo`
* **Payload Request:**
```json
{
  "vehiculo_id": 1,
  "kilometraje": 45300,
  "fecha_venc_soat": "2027-05-15",
  "fecha_venc_rtm": "2027-04-10",
  "fecha_venc_extintor": "2026-11-20",
  "observaciones_generales": "Vehículo en buen estado para ruta corta",
  "items": [
    {
      "seccion": "luces",
      "item": "luces_altas",
      "valor": "conforme",
      "observacion": null
    },
    {
      "seccion": "frenos",
      "item": "freno_emergencia",
      "valor": "no_conforme",
      "observacion": "Palanca con recorrido largo requiere calibración"
    }
  ]
}
```
* **Lógica Automática en Backend:** Si alguno de los ítems críticos es marcado como `no_conforme`, el sistema marca automáticamente `aprobado: false` y genera un registro inmediato en la tabla `hallazgos` para alerta de taller mecánico.

---

## 🔧 8. Módulo de Mantenimiento y Taller Mecánico (`/mantenimiento`)

### 8.1. Gestión de Hallazgos y Anomalías
* `GET /mantenimiento/hallazgos`: Listar anomalías filtradas por `estado` (`abierto`, `en_orden`, `resuelto`) y `criticidad`.
* `POST /mantenimiento/hallazgos`: Reportar hallazgo manual durante ruta o patios.
* `POST /mantenimiento/hallazgos/{id}/evaluar-y-convertir-ot`: Diagnosticar la falla y emitir automáticamente una Orden de Trabajo vinculada.

### 8.2. Gestión de Órdenes de Trabajo (OT)
* `GET /mantenimiento/ordenes`: Listar órdenes de trabajo activas o cerradas.
* `POST /mantenimiento/ordenes`: Creación directa de OT con código correlativo (`OT-2026-XXXX`).
* `GET /mantenimiento/ordenes/{id}`: Consulta consolidada que incluye la lista de actividades, costos detallados, evidencias fotográficas y registro de auditoría.
* `PUT /mantenimiento/ordenes/{id}`: Mutación de estado (`en_progreso`, `completada`, `cancelada`), reasignación de mecánico líder y notas técnicas.
* `PUT /mantenimiento/ordenes/{id}/completar`: Cierre formal de la orden de trabajo. Genera evento inmutable en la bitácora con IP del responsable y cambia el estado del vehículo nuevamente a `activo` si estaba en taller.

### 8.3. Actividades, Costos y Evidencias de OT
* `POST /mantenimiento/ordenes/{id}/actividades`: Registro de tareas individuales (ej. "Cambio de pastillas de freno delantero").
* `POST /mantenimiento/ordenes/{id}/costos`: Imputación de rubros de mantenimiento:
```json
{
  "tipo_gasto": "repuesto",
  "descripcion": "Kit de pastillas de freno cerámicas Isuzu NPR",
  "cantidad": 2,
  "valor_unitario": 145000.00
}
```
* `POST /mantenimiento/ordenes/{id}/evidencias`: Subida de registro fotográfico (`foto_antes`, `foto_durante`, `foto_despues`) o facturas escaneadas.

### 8.4. Hoja de Vida y Trazabilidad del Vehículo
* **Método:** `GET`
* **Ruta:** `/mantenimiento/vehiculos/{id}/hoja-de-vida`
* **Permisos:** `admin`, `jefe_mecanicos`
* **Respuesta:** Resumen inmutable de todas las intervenciones históricas, costo total acumulado en repuestos/mano de obra y kilometraje de cada mantenimiento.

---

## 🚨 9. Módulo de Alertas en Tiempo Real (`/alertas`)

* **Método:** `GET`
* **Ruta:** `/alertas/`
* **Permisos:** Todos los roles
* **Retorna:**
  * Alertas rojas de SOAT, RTM o Licencias vencidas o próximas a vencer (< 15 días).
  * Alertas de vehículos en ruta sin chequeo matutino.
  * Alertas de anomalías mecánicas con criticidad `alta` o `critica` sin Orden de Trabajo abierta.

---

## 📑 10. Módulo de Reportes Consolidados (`/reportes`)

Endpoints especializados en la entrega de reportes gerenciales en formato CSV estructurado con cabeceras en español:
1. `GET /reportes/despacho`: Historial consolidado de báscula, pesos netos, sacas y transportadores.
2. `GET /reportes/inspecciones`: Consolidado normativo de preoperacionales con matriz de hallazgos.
3. `GET /reportes/financiero`: Balance de gastos de mantenimiento discriminado por vehículo y tipo de repuesto.
4. `GET /reportes/auditoria`: Log inmutable forense de mutaciones de datos en taller y despachos.
