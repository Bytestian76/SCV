# Backlog de Migración y Modernización - SCV

Este documento recopila la hoja de ruta técnica, análisis de deuda técnica y tareas planificadas para la transición del frontend monolítico basado en Vanilla JS hacia un framework moderno por componentes (como Vue 3 / React + Vite / Svelte), manteniendo la arquitectura REST de FastAPI.

---

## 1. Estado Actual de la Modularización

- [x] **Extracción de Pantallas**: Se desacoplaron las 14 pantallas principales de `index.html` a `views/screens/*.html`.
- [x] **Extracción de Modales**: Se modularizaron los 8 grupos de modales y diálogos a `views/modals/*.html`.
- [x] **Loader Dinámico (`loader.js`)**: Carga asíncrona y bajo demanda con caché de fragmentos DOM en tiempo de ejecución.
- [x] **Store Centralizado (`store.js`)**: Encapsulación de estado global con getters, setters y bus de eventos reactivo (`scv:store-mutation`).
- [x] **Index Ultraliviano**: `index.html` reducido de más de 1650 líneas a una plantilla mínima de menos de 45 líneas.

---

## 2. Epics & Fases de Migración

### Fase 1: Desacoplamiento y Contratos de Datos (Completada / En curso)
- [x] Unificación de selectores y autocompletados (`selectors.js`).
- [x] Estandarización de endpoints paginados (`PaginatedResponse`) en backend y frontend.
- [x] Pruebas automatizadas de regresión para asegurar compatibilidad de contratos.

### Fase 2: Modularización de Lógica de Negocio (Completada)
- [x] Migración del módulo de autenticación (`auth.js`) hacia la API reactiva de `Store` (`Store.setAuth`, `Store.clearAuth`, `Store.getToken`).
- [x] Adaptación de consumidores de estado (`api.js`, `router.js`, `operations.js`, `notificaciones.js`) para interactuar a través de `Store`.
- [x] Tipado y documentación JSDoc en los controladores de autenticación y navegación.
- [x] Modularización de controladores de administración (`admin-vehiculos.js`, `admin-conductores.js`, `admin-usuarios.js`, `admin-chequeos.js`, `admin-movimientos.js`) hacia la API del `Store`.
- [x] Modularización de controladores de mantenimiento y operaciones (`admin-hallazgos.js`, `admin-ordenes.js`, `admin-dashboard-mecanico.js`).
- [x] Integración de selectores predictivos con Store reactivo y bus de eventos (`scv:store-mutation`).
- [ ] Implementación de validación de esquemas en cliente antes del envío a la API.

### Fase 3: Migración a Framework SPA / SSR
- [ ] Configuración del entorno de compilación moderno (Vite + TypeScript + TailwindCSS / Vanilla CSS tokens).
- [ ] Conversión de vistas HTML (`views/screens/`) a componentes SFC (Single File Components).
- [ ] Reemplazo del enrutador manual (`router.js`) por un Router oficial (Vue Router / React Router).
- [ ] Gestión de estado con Pinia / Zustand / TanStack Query para caché de peticiones HTTP.

### Fase 4: PWA Offline-First y Sincronización
- [ ] Migración de `sw.js` a Workbox.
- [ ] Cola IndexedDB para captura de chequeos y movimientos sin conexión con sincronización en segundo plano (Background Sync).
- [ ] Notificaciones Push avanzadas para mecánicos y administradores.

---

## 3. Matriz de Prioridad de Componentes

| Módulo | Complejidad | Impacto | Prioridad |
|---|---|---|---|
| **Autenticación & Sesión** | Media | Crítico | Inmediata |
| **Chequeos Preoperacionales** | Alta | Crítico | Alta |
| **Movimientos (Entradas/Salidas)** | Media | Crítico | Alta |
| **Órdenes de Trabajo & Mecánicos** | Alta | Alto | Alta |
| **Administración (CRUDs & Reportes)** | Media | Medio | Media |
| **Gráficas & Estadísticas** | Baja | Medio | Media |
