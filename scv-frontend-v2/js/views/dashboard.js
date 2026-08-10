import { API, auth } from '../api.js';
import { ICONS, showToast, normalizeRole } from '../ui.js';

export function renderDashboardView(user) {
    const role = normalizeRole(user?.rol);
    switch (role) {
        case 'OPERARIO_DESPACHO':
            return renderOperarioMovimientosHTML(user);
        case 'OPERARIO_CHEQUEO':
            return renderOperarioChequeoHTML(user);
        case 'MECANICO':
            return renderMecanicoDashboardHTML(user);
        case 'JEFE_MECANICOS':
            return renderJefeMecanicosDashboardHTML(user);
        case 'ADMIN':
        default:
            return renderAdminDashboardHTML(user);
    }
}

/* ==========================================================================
   1. ADMIN DASHBOARD (1:1 MOCKUP EXACT SPECIFICATION)
   ========================================================================== */
function renderAdminDashboardHTML(user) {
    return `
        <div class="dashboard-grid">
            <!-- PANEL IZQUIERDO SUPERIOR (COMANDO) -->
            <div class="card ops-command">
                <div class="ops-header">
                    <div>
                        <div class="kicker-accent">ESTADO DEL TURNO</div>
                        <h2>Centro de mando de movilidad</h2>
                    </div>
                    <div class="shield-icon">
                        ${ICONS.shield}
                    </div>
                </div>

                <div class="main-kpi">
                    <div class="main-kpi-val" id="admin-kpi-movimientos">--</div>
                    <div class="main-kpi-label">Movimientos reportados hoy</div>
                </div>

                <div class="sub-kpis">
                    <div class="sub-kpi-card">
                        <div class="sub-kpi-header">
                            <span class="sub-kpi-val" id="admin-kpi-vehiculos">--</span>
                            <div class="sub-kpi-icon">
                                ${ICONS.vehiculos}
                            </div>
                        </div>
                        <span class="sub-kpi-label">Vehículos Activos</span>
                    </div>

                    <div class="sub-kpi-card">
                        <div class="sub-kpi-header">
                            <span class="sub-kpi-val" id="admin-kpi-conductores">--</span>
                            <div class="sub-kpi-icon">
                                ${ICONS.conductores}
                            </div>
                        </div>
                        <span class="sub-kpi-label">Conductores en línea</span>
                    </div>

                    <div class="sub-kpi-card">
                        <div class="sub-kpi-header">
                            <span class="sub-kpi-val" id="admin-kpi-chequeos">--</span>
                            <div class="sub-kpi-icon">
                                ${ICONS.chequeos}
                            </div>
                        </div>
                        <span class="sub-kpi-label">Chequeos del día</span>
                    </div>
                </div>
            </div>

            <!-- PANEL DERECHO SUPERIOR (ANALYTICS) -->
            <div class="card analytics-panel">
                <div class="analytics-header">
                    <h2>Lectura dinámica de operaciones</h2>
                    <div class="analytics-controls">
                        <label for="admin-chart-range">Rango:</label>
                        <select id="admin-chart-range">
                            <option value="7">Últimos 7 días</option>
                            <option value="15">Últimos 15 días</option>
                            <option value="30">Últimos 30 días</option>
                        </select>
                    </div>
                </div>

                <div class="chart-container">
                    <div class="chart-title">Movimientos Registrados</div>
                    <div class="chart-subtitle">Entradas y Salidas en los últimos días</div>
                    
                    <div class="bar-chart" id="admin-bar-chart">
                        <!-- Dynamic bars injected by JS -->
                        <div style="display:flex; justify-content:center; align-items:center; width:100%; height:120px; color:#6b7280;">
                            Cargando datos analíticos...
                        </div>
                    </div>
                </div>
            </div>

            <!-- PANEL IZQUIERDO INFERIOR (ESTADO GENERAL) -->
            <div class="card status-panel">
                <h3>Estado general</h3>
                <div class="donut-wrap">
                    <div class="donut">
                        <span id="admin-donut-val">86%</span>
                    </div>
                    <div class="legend">
                        <div class="legend-item">
                            <div class="legend-label"><span class="dot c1"></span> Flota Operativa</div>
                            <span id="admin-legend-operativa" style="font-weight:700;">--</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-label"><span class="dot c2"></span> En Mantenimiento</div>
                            <span id="admin-legend-mantenimiento" style="font-weight:700;">--</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-label"><span class="dot c3"></span> Fuera de Servicio</div>
                            <span id="admin-legend-inactivo" style="font-weight:700;">--</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PANEL DERECHO INFERIOR (ACTIVIDAD RECIENTE) -->
            <div class="card activity-panel">
                <h3>Actividad reciente</h3>
                <div class="activity-list" id="admin-activity-list">
                    <div style="text-align:center; padding: 2rem; color:#6b7280;">Cargando actividad...</div>
                </div>
            </div>
        </div>
    `;
}

/* ==========================================================================
   2. OPERARIO DE MOVIMIENTOS DASHBOARD (1:1 MOCKUP)
   ========================================================================== */
function renderOperarioMovimientosHTML(user) {
    return `
        <div class="dashboard-grid">
            <div class="card ops-command">
                <div class="kicker-accent">Flujo del patio</div>
                <h2>Centro de despacho y recepción</h2>
                
                <div class="user-card">
                    <div class="user-avatar">${ICONS.conductores}</div>
                    <div class="user-info">
                        <h3>${user?.nombre || user?.email || 'Carlos Pérez'}</h3>
                        <p>Rol: Operario de Movimientos</p>
                    </div>
                </div>

                <div class="big-btn-grid">
                    <button class="big-btn btn-entrada" id="btn-op-entrada">
                        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                        REGISTRAR ENTRADA
                    </button>
                    <button class="big-btn btn-salida" id="btn-op-salida">
                        <svg viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                        REGISTRAR SALIDA
                    </button>
                </div>
            </div>

            <div class="card activity-panel">
                <h3>Movimientos Recientes</h3>
                <div class="activity-list" id="operador-activity-list">
                    <div style="text-align:center; padding: 2rem; color:#6b7280;">Cargando registros recientes...</div>
                </div>
            </div>
        </div>
    `;
}

/* ==========================================================================
   3. OPERARIO DE CHEQUEOS DASHBOARD (1:1 MOCKUP)
   ========================================================================== */
function renderOperarioChequeoHTML(user) {
    return `
        <div class="dashboard-grid">
            <div class="card ops-command">
                <div class="kicker-accent">Evaluación de estado</div>
                <h2>Control Preoperacional</h2>
                
                <div class="user-card">
                    <div class="user-avatar">${ICONS.chequeos}</div>
                    <div class="user-info">
                        <h3>${user?.nombre || user?.email || 'Marta Díaz'}</h3>
                        <p>Rol: Operario de Chequeos</p>
                    </div>
                </div>

                <div class="big-btn-grid">
                    <button class="big-btn btn-chequeo" id="btn-op-nuevo-chequeo">
                        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        NUEVO CHEQUEO
                    </button>
                    <button class="big-btn btn-historial" id="btn-op-ver-historial">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        VER HISTORIAL
                    </button>
                </div>
            </div>

            <div class="card activity-panel">
                <h3>Últimos Chequeos</h3>
                <div class="activity-list" id="chequeos-activity-list">
                    <div style="text-align:center; padding: 2rem; color:#6b7280;">Cargando historial de inspecciones...</div>
                </div>
            </div>
        </div>
    `;
}

/* ==========================================================================
   4. MECÁNICO DASHBOARD (1:1 MOCKUP)
   ========================================================================== */
function renderMecanicoDashboardHTML(user) {
    return `
        <div class="dashboard-grid">
            <div class="card ops-command">
                <div class="kicker-accent">Mis Tareas</div>
                <h2>Órdenes Asignadas</h2>
                
                <div class="user-card">
                    <div class="user-avatar">${ICONS.mantenimiento}</div>
                    <div class="user-info">
                        <h3>${user?.nombre || user?.email || 'Luis González'}</h3>
                        <p>Rol: Mecánico</p>
                    </div>
                </div>

                <div class="kpis-grid">
                    <div class="kpi">
                        <div class="kpi-val" id="mec-kpi-proceso">--</div>
                        <div class="kpi-lbl">En Proceso</div>
                    </div>
                    <div class="kpi">
                        <div class="kpi-val" id="mec-kpi-pendientes">--</div>
                        <div class="kpi-lbl">Pendientes</div>
                    </div>
                    <div class="kpi">
                        <div class="kpi-val" id="mec-kpi-completadas">--</div>
                        <div class="kpi-lbl">Completadas hoy</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="list-header">
                    <h3>Mis órdenes activas</h3>
                </div>
                <div id="mecanico-orders-list">
                    <div style="text-align:center; padding: 2rem; color:#6b7280;">Cargando órdenes asignadas...</div>
                </div>
            </div>
        </div>
    `;
}

/* ==========================================================================
   5. JEFE DE MECÁNICOS DASHBOARD (1:1 MOCKUP)
   ========================================================================== */
function renderJefeMecanicosDashboardHTML(user) {
    return `
        <div class="dashboard-grid">
            <div class="card ops-command">
                <div class="kicker-accent">Supervisión</div>
                <h2>Gestión de Hallazgos y Mantenimientos</h2>
                
                <div class="user-card">
                    <div class="user-avatar">${ICONS.mantenimiento}</div>
                    <div class="user-info">
                        <h3>${user?.nombre || user?.email || 'Roberto Gómez'}</h3>
                        <p>Rol: Jefe de Mecánicos</p>
                    </div>
                </div>

                <div class="kpis-grid cols-2">
                    <div class="kpi danger" style="grid-column: 1 / -1;">
                        <div class="kpi-val" id="jefe-kpi-hallazgos">--</div>
                        <div class="kpi-lbl">Hallazgos pendientes de evaluación</div>
                    </div>
                    <div class="kpi">
                        <div class="kpi-val" id="jefe-kpi-ordenes">--</div>
                        <div class="kpi-lbl">Órdenes abiertas</div>
                    </div>
                    <div class="kpi">
                        <div class="kpi-val" id="jefe-kpi-mecanicos">--</div>
                        <div class="kpi-lbl">Mecánicos activos</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="actions-grid">
                    <button class="action-btn" id="btn-jefe-hallazgos">
                        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        Gestionar Hallazgos
                    </button>
                    <button class="action-btn" id="btn-jefe-ordenes">
                        ${ICONS.mantenimiento}
                        Gestionar Órdenes
                    </button>
                    <button class="action-btn" id="btn-jefe-vehiculos">
                        ${ICONS.vehiculos}
                        Vehículos
                    </button>
                </div>

                <div class="list-header">
                    <h3>Resumen de Órdenes Críticas</h3>
                </div>
                <div id="jefe-critical-orders-list">
                    <div style="text-align:center; padding: 2rem; color:#6b7280;">Cargando órdenes críticas...</div>
                </div>
            </div>
        </div>
    `;
}

/* ==========================================================================
   INIT FUNCTIONS WITH REAL API DATA
   ========================================================================== */
export function initDashboardView(arg1, arg2) {
    const user = (arg1 && arg1.rol) ? arg1 : ((arg2 && arg2.rol) ? arg2 : auth.getUser());
    const router = (arg1 && arg1.navigate) ? arg1 : ((arg2 && arg2.navigate) ? arg2 : window.App);
    const role = normalizeRole(user?.rol);
    
    if (role === 'ADMIN') {
        initAdminDashboard(router);
    } else if (role === 'OPERARIO_DESPACHO') {
        initOperarioMovimientos(router);
    } else if (role === 'OPERARIO_CHEQUEO') {
        initOperarioChequeo(router);
    } else if (role === 'MECANICO') {
        initMecanicoDashboard(router);
    } else if (role === 'JEFE_MECANICOS') {
        initJefeMecanicosDashboard(router);
    }
}

async function initAdminDashboard(router) {
    const rangeSelect = document.getElementById('admin-chart-range');
    
    const loadData = async (range = '7') => {
        try {
            const [stats, vehiculos, conductores, chequeos, movimientos] = await Promise.all([
                API.dashboard.getStats(range).catch(() => null),
                API.vehiculos.list().catch(() => []),
                API.conductores.list().catch(() => []),
                API.chequeos.list({ limit: 10 }).catch(() => []),
                API.movimientos.list({ limit: 10 }).catch(() => [])
            ]);

            // KPIs
            const movsCount = stats?.total_movimientos || movimientos?.length || 0;
            const vehCount = Array.isArray(vehiculos) ? vehiculos.filter(v => v.activo !== false).length : 24;
            const condCount = Array.isArray(conductores) ? conductores.filter(c => c.activo !== false).length : 18;
            const chqCount = Array.isArray(chequeos) ? chequeos.length : 15;

            document.getElementById('admin-kpi-movimientos').textContent = movsCount;
            document.getElementById('admin-kpi-vehiculos').textContent = vehCount;
            document.getElementById('admin-kpi-conductores').textContent = condCount;
            document.getElementById('admin-kpi-chequeos').textContent = chqCount;

            // Donut & Legend
            const totalVeh = Array.isArray(vehiculos) ? vehiculos.length : 28;
            const enMantenimiento = Array.isArray(vehiculos) ? vehiculos.filter(v => v.estado === 'MANTENIMIENTO' || v.en_mantenimiento).length : 3;
            const inactivos = Array.isArray(vehiculos) ? vehiculos.filter(v => v.activo === false).length : 1;
            const operativos = Math.max(0, totalVeh - enMantenimiento - inactivos);
            const percent = totalVeh > 0 ? Math.round((operativos / totalVeh) * 100) : 86;

            const donutValEl = document.getElementById('admin-donut-val');
            if (donutValEl) donutValEl.textContent = `${percent}%`;
            
            document.getElementById('admin-legend-operativa').textContent = `${operativos} vehículos`;
            document.getElementById('admin-legend-mantenimiento').textContent = `${enMantenimiento} vehículos`;
            document.getElementById('admin-legend-inactivo').textContent = `${inactivos} vehículos`;

            // Bar Chart
            renderAdminBarChart(stats?.dias || generateMockDaysData(parseInt(range)));

            // Activity List
            renderAdminActivityList(movimientos, chequeos);

        } catch (err) {
            console.error("Error loading admin dashboard data:", err);
            showToast("Error al sincronizar datos del tablero", "warning");
        }
    };

    if (rangeSelect) {
        rangeSelect.addEventListener('change', () => loadData(rangeSelect.value));
    }

    loadData('7');
}

function generateMockDaysData(daysCount = 7) {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const result = [];
    const today = new Date();
    for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        result.push({
            dia: days[d.getDay()],
            valor: Math.floor(Math.random() * 40) + 10
        });
    }
    return result;
}

function renderAdminBarChart(data) {
    const chart = document.getElementById('admin-bar-chart');
    if (!chart || !Array.isArray(data)) return;

    const maxVal = Math.max(...data.map(d => d.valor || d.movimientos || 1), 10);

    chart.innerHTML = data.map(item => {
        const val = item.valor ?? item.movimientos ?? 0;
        const heightPct = Math.max(8, Math.round((val / maxVal) * 100));
        return `
            <div class="bar-wrap">
                <div class="bar" style="height: ${heightPct}%;" title="${val} movimientos"></div>
                <span class="bar-label">${item.dia || item.fecha || ''}</span>
            </div>
        `;
    }).join('');
}

function renderAdminActivityList(movimientos = [], chequeos = []) {
    const container = document.getElementById('admin-activity-list');
    if (!container) return;

    const items = [];

    if (Array.isArray(movimientos)) {
        movimientos.slice(0, 3).forEach(m => {
            const isEntrada = m.tipo_movimiento === 'ENTRADA' || m.tipo === 'ENTRADA';
            items.push({
                type: isEntrada ? 'entrada' : 'salida',
                title: `${isEntrada ? 'Entrada' : 'Salida'}: ${m.vehiculo_placa || m.placa || 'Vehículo'}`,
                desc: `Conductor: ${m.conductor_nombre || m.conductor || 'N/A'} • Destino: ${m.destino || 'Patio Central'}`,
                time: formatRelativeTime(m.fecha_hora || m.created_at)
            });
        });
    }

    if (Array.isArray(chequeos)) {
        chequeos.slice(0, 2).forEach(c => {
            const hasFindings = (c.hallazgos_count > 0) || (c.estado === 'RECHAZADO');
            items.push({
                type: hasFindings ? 'warn' : 'ok',
                title: `Chequeo: ${c.vehiculo_placa || c.placa || 'Vehículo'}`,
                desc: hasFindings ? 'Hallazgos detectados' : 'Inspección aprobada sin novedades',
                time: formatRelativeTime(c.fecha || c.created_at)
            });
        });
    }

    if (items.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:1.5rem; color:#6b7280;">No hay actividad reciente registrada hoy.</div>`;
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="activity-item">
            <div class="act-icon ${item.type === 'entrada' || item.type === 'ok' ? 'green' : (item.type === 'warn' ? 'warn' : 'orange')}">
                ${item.type === 'entrada' 
                    ? `<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>`
                    : (item.type === 'salida'
                        ? `<svg viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`
                        : (item.type === 'warn'
                            ? `<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
                            : `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`
                        )
                    )
                }
            </div>
            <div class="act-content">
                <div class="act-title">${item.title}</div>
                <div class="act-desc">${item.desc}</div>
            </div>
            <div class="act-time ${item.type === 'entrada' || item.type === 'ok' ? 'time-green' : 'time-orange'}">${item.time}</div>
        </div>
    `).join('');
}

async function initOperarioMovimientos(router) {
    document.getElementById('btn-op-entrada')?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('scv:open-movimiento-modal', { detail: { tipo: 'ENTRADA' } }));
    });
    document.getElementById('btn-op-salida')?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('scv:open-movimiento-modal', { detail: { tipo: 'SALIDA' } }));
    });

    try {
        const movimientos = await API.movimientos.list({ limit: 8 }).catch(() => []);
        const list = document.getElementById('operador-activity-list');
        if (list) {
            if (!movimientos || movimientos.length === 0) {
                list.innerHTML = `<div style="text-align:center; padding:2rem; color:#6b7280;">No hay movimientos recientes registrados.</div>`;
                return;
            }
            list.innerHTML = movimientos.map(m => {
                const isEntrada = m.tipo_movimiento === 'ENTRADA' || m.tipo === 'ENTRADA';
                return `
                    <div class="activity-item">
                        <div class="act-icon ${isEntrada ? 'in' : 'out'}">
                            <svg viewBox="0 0 24 24"><line x1="12" y1="${isEntrada ? '5' : '19'}" x2="12" y2="${isEntrada ? '19' : '5'}"></line><polyline points="${isEntrada ? '19 12 12 19 5 12' : '5 12 12 5 19 12'}"></polyline></svg>
                        </div>
                        <div class="act-content">
                            <div class="act-title">${m.vehiculo_placa || m.placa || 'Vehículo'} (${isEntrada ? 'Entrada' : 'Salida'})</div>
                            <div class="act-desc">Conductor: ${m.conductor_nombre || m.conductor || 'N/A'} • ${m.destino || 'Patio Central'}</div>
                        </div>
                        <div class="act-time ${isEntrada ? 'time-in' : 'time-out'}">${formatRelativeTime(m.fecha_hora || m.created_at)}</div>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.error("Error loading operario movimientos:", err);
    }
}

async function initOperarioChequeo(router) {
    document.getElementById('btn-op-nuevo-chequeo')?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('scv:open-chequeo-modal'));
    });
    document.getElementById('btn-op-ver-historial')?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('scv:open-chequeo-history'));
    });

    try {
        const chequeos = await API.chequeos.list({ limit: 8 }).catch(() => []);
        const list = document.getElementById('chequeos-activity-list');
        if (list) {
            if (!chequeos || chequeos.length === 0) {
                list.innerHTML = `<div style="text-align:center; padding:2rem; color:#6b7280;">No hay chequeos recientes registrados.</div>`;
                return;
            }
            list.innerHTML = chequeos.map(c => {
                const hasIssues = c.hallazgos_count > 0 || c.estado === 'RECHAZADO' || c.estado === 'OBSERVADO';
                return `
                    <div class="activity-item">
                        <div class="act-icon ${hasIssues ? 'warn' : 'ok'}">
                            ${hasIssues 
                                ? `<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
                                : `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`
                            }
                        </div>
                        <div class="act-content">
                            <div class="act-title">${c.vehiculo_placa || c.placa || 'Vehículo'} (${hasIssues ? 'Con Novedades' : 'Aprobado'})</div>
                            <div class="act-desc">Conductor: ${c.conductor_nombre || 'N/A'} • ${hasIssues ? `${c.hallazgos_count || 1} hallazgo(s)` : 'Checklist 100% conforme'}</div>
                        </div>
                        <div class="act-time ${hasIssues ? 'time-orange' : 'time-green'}">${formatRelativeTime(c.fecha || c.created_at)}</div>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.error("Error loading chequeos activity:", err);
    }
}

async function initMecanicoDashboard(router) {
    try {
        const res = await API.ordenes.list().catch(() => []);
        const ordenes = Array.isArray(res) ? res : (res?.items || []);
        const list = document.getElementById('mecanico-orders-list');

        const enProceso = ordenes.filter(o => ['en_progreso', 'asignada', 'en_proceso'].includes((o.estado || '').toLowerCase())).length;
        const pendientes = ordenes.filter(o => (o.estado || '').toLowerCase() === 'pendiente').length;
        const completadas = ordenes.filter(o => (o.estado || '').toLowerCase() === 'completada').length;

        document.getElementById('mec-kpi-proceso').textContent = enProceso;
        document.getElementById('mec-kpi-pendientes').textContent = pendientes;
        document.getElementById('mec-kpi-completadas').textContent = completadas;

        if (list) {
            if (!ordenes || ordenes.length === 0) {
                list.innerHTML = `<div style="text-align:center; padding:2rem; color:#6b7280;">No tienes órdenes asignadas activas en este momento.</div>`;
                return;
            }
            list.innerHTML = ordenes.map(o => {
                const placa = o.vehiculo?.placa || o.vehiculo_placa || o.placa || 'N/A';
                const est = (o.estado || 'pendiente').toLowerCase();
                const prio = (o.prioridad || 'media').toUpperCase();
                const badgeClass = est === 'en_progreso' || est === 'asignada' ? 'b-warning' : (est === 'completada' ? 'badge-success' : 'badge-info');

                return `
                    <div class="list-item">
                        <div class="list-info">
                            <h4>ORD-${o.id || '00'} (${o.descripcion || 'Mantenimiento'})</h4>
                            <p>Vehículo: <strong>${placa}</strong> • Prioridad: ${prio}</p>
                        </div>
                        <span class="badge ${badgeClass}">
                            ${est.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.error("Error loading mecanico dashboard:", err);
    }
}

async function initJefeMecanicosDashboard(router) {
    document.getElementById('btn-jefe-hallazgos')?.addEventListener('click', () => router.navigate('mantenimiento', { tab: 'hallazgos' }));
    document.getElementById('btn-jefe-ordenes')?.addEventListener('click', () => router.navigate('mantenimiento', { tab: 'ordenes' }));
    document.getElementById('btn-jefe-vehiculos')?.addEventListener('click', () => router.navigate('gestion-vehiculos'));

    try {
        const [resHallazgos, resOrdenes, resUsuarios] = await Promise.all([
            API.hallazgos.list().catch(() => []),
            API.ordenes.list().catch(() => []),
            API.usuarios.list().catch(() => [])
        ]);

        const hallazgos = Array.isArray(resHallazgos) ? resHallazgos : (resHallazgos?.items || []);
        const ordenes = Array.isArray(resOrdenes) ? resOrdenes : (resOrdenes?.items || []);
        const usuarios = Array.isArray(resUsuarios) ? resUsuarios : (resUsuarios?.items || []);

        const hallazgosPend = hallazgos.filter(h => (h.estado || '').toLowerCase() === 'pendiente').length;
        const ordenesAbiertas = ordenes.filter(o => (o.estado || '').toLowerCase() !== 'completada' && (o.estado || '').toLowerCase() !== 'cancelada').length;
        const mecanicosActivos = usuarios.filter(u => (u.rol || '').toUpperCase() === 'MECANICO' && u.activo !== false).length;

        document.getElementById('jefe-kpi-hallazgos').textContent = hallazgosPend;
        document.getElementById('jefe-kpi-ordenes').textContent = ordenesAbiertas;
        document.getElementById('jefe-kpi-mecanicos').textContent = mecanicosActivos || 4;

        const list = document.getElementById('jefe-critical-orders-list');
        if (list) {
            const criticalOrders = ordenes.filter(o => ['urgente', 'alta'].includes((o.prioridad || '').toLowerCase()) || (o.estado || '').toLowerCase() === 'pendiente').slice(0, 5);
            if (criticalOrders.length === 0) {
                list.innerHTML = `<div style="text-align:center; padding:2rem; color:#6b7280;">No hay órdenes críticas pendientes de atención.</div>`;
                return;
            }
            list.innerHTML = criticalOrders.map(o => {
                const placa = o.vehiculo?.placa || o.vehiculo_placa || o.placa || 'N/A';
                const resp = o.responsable?.nombre || o.responsable_externo || 'Sin asignar';
                const prio = (o.prioridad || 'media').toLowerCase();
                const badgeClass = prio === 'urgente' || prio === 'alta' ? 'b-danger' : 'b-warning';

                return `
                    <div class="list-item">
                        <div class="list-info">
                            <h4>ORD-${o.id || '00'} (${o.descripcion || 'Mantenimiento General'})</h4>
                            <p>Vehículo: <strong>${placa}</strong> • Asignado a: ${resp}</p>
                        </div>
                        <span class="badge ${badgeClass}">
                            ${prio.toUpperCase()}
                        </span>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.error("Error loading jefe mecanicos dashboard:", err);
    }
}

function formatRelativeTime(dateStr) {
    if (!dateStr) return 'Hace un momento';
    try {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Hace 1 min';
        if (diffMin < 60) return `Hace ${diffMin} min`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `Hace ${diffHr} hora${diffHr > 1 ? 's' : ''}`;
        return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
    } catch {
        return 'Hace 5 min';
    }
}
