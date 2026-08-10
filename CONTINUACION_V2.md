# SCV Frontend V2 — Continuación del Trabajo

## Estado actual de la infraestructura

| Contenedor | Puerto | Descripción |
|---|---|---|
| `scv-gateway` | 8089 → legacy / **8090 → V2** | Nginx gateway que enruta tráfico |
| `scv-frontend` | interno 80 | Frontend legacy (versión original, no tocar) |
| `scv-frontend-v2` | interno 80 | **Frontend V2 en desarrollo** |
| `scv-backend` | interno 9000 | API FastAPI compartida por ambos frontends |

> El contenedor `scv-frontend-v2` tiene montado el directorio local como volumen.
> Cualquier cambio en `/SCV/scv-frontend-v2/` se refleja en `http://localhost:8090` sin reconstruir la imagen.

## Estado de Implementación V2

- ✅ **Fidelidad Visual 1:1 con Mockups**:
  - Estructura exacta de cuadrícula 2x2 (`.dashboard-grid`, `.ops-command`, `.analytics-panel`, `.status-panel`, `.activity-panel`).
  - Gráfica dinámica interactiva con selector de rangos (7, 15, 30 días) y gráfico de barras conectado a la API.
  - Indicador de dona de estado y feed de actividad reciente en tiempo real.
- ✅ **Login Integrado y Autenticación Persistente**:
  - Funciona con credenciales reales (`sebas` / `admin123` y demás usuarios del sistema).
  - Manejo de token JWT en `localStorage`, expiración y cierre de sesión.
- ✅ **Dashboards Específicos por Rol**:
  - **Admin**: Centro de mando de movilidad, analítica dinámica, estado general y actividad reciente.
  - **Operario de Movimientos**: Registro rápido de entrada y salida con kilometraje automático de referencia y lista de despacho.
  - **Operario de Chequeos**: Wizard paso a paso de inspección preoperacional por secciones con opciones estándar y observaciones.
  - **Mecánico**: Tablero técnico de órdenes de trabajo asignadas, cambio de estado a en progreso/completada, registro de actividades y gastos/repuestos.
  - **Jefe de Mecánicos**: Supervisión de hallazgos críticos abiertos, creación y asignación de órdenes de trabajo a mecánicos.
- ✅ **Módulo de Gestión Integral (CRUD Admin)**:
  - Pestañas dinámicas para Vehículos, Conductores y Usuarios.
  - Búsqueda en vivo y filtrado reactivo.
  - Modales para Crear, Editar y Eliminar con validación y notificaciones Toast en tiempo real.
- ✅ **Módulo de Mantenimiento**:
  - Gestión completa de Hallazgos y Órdenes de Trabajo.
  - Registro de costos y tiempos de ejecución.
- ✅ **Historiales Operativos**:
  - Tablas completas de Movimientos y Chequeos con modal de inspección detallada.

---

## Acceso y Verificación

1. Abre en tu navegador: **`http://localhost:8090`**
2. Inicia sesión con tus credenciales:
   - **Usuario**: `sebas`
   - **Contraseña**: `admin123`
3. Explora el panel correspondiente a tu rol (`admin`) o prueba con otros roles registrados para validar sus vistas especializadas.

