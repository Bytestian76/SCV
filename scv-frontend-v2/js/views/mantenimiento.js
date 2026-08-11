import { API } from '../api.js';
import { ICONS, openModal, closeModal, showToast } from '../ui.js';
import { exportHallazgosExcel, exportHallazgosPdf, exportOrdenesExcel, exportOrdenesPdf } from '../exports.js';

export function renderMantenimientoView(activeTab = 'estadisticas') {
    return `
        <!-- TABS HEADER -->
        <div class="tabs-header">
            <button class="tab-btn ${activeTab === 'estadisticas' ? 'active' : ''}" data-mant-tab="estadisticas">
                ${ICONS.estadisticas} Estadísticas
            </button>
            <button class="tab-btn ${activeTab === 'ordenes' ? 'active' : ''}" data-mant-tab="ordenes">
                ${ICONS.ordenes} Órdenes de Trabajo
            </button>
            <button class="tab-btn ${activeTab === 'hallazgos' ? 'active' : ''}" data-mant-tab="hallazgos">
                ${ICONS.hallazgos} Hallazgos de Inspección
            </button>
        </div>

        <div id="mantenimiento-tab-content">
            ${activeTab === 'estadisticas' ? renderEstadisticasHTML() : (activeTab === 'ordenes' ? renderOrdenesHTML() : renderHallazgosHTML())}
        </div>
    `;
}

function renderEstadisticasHTML() {
    return `
        <!-- KPIS ROW (1:1 MOCKUP) -->
        <div class="kpi-row" style="margin-bottom: 1.5rem;">
            <div class="kpi-card c-green">
                <span class="kpi-val" id="mant-kpi-preventivo">18</span>
                <span class="kpi-label">Preventivos este mes</span>
            </div>
            <div class="kpi-card c-blue">
                <span class="kpi-val" id="mant-kpi-correctivo">5</span>
                <span class="kpi-label">Correctivos / Urgentes</span>
            </div>
            <div class="kpi-card c-yellow">
                <span class="kpi-val" id="mant-kpi-tiempototal">4.2h</span>
                <span class="kpi-label">Tiempo promedio parada</span>
            </div>
            <div class="kpi-card c-lightgreen">
                <span class="kpi-val" id="mant-kpi-costototal">$ 2.4M</span>
                <span class="kpi-label">Costo invertido</span>
            </div>
        </div>

        <!-- CHARTS GRID (1:1 MOCKUP) -->
        <div class="dashboard-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="card">
                <div class="card-title">Fallas más recurrentes</div>
                <div style="flex:1; display:flex; flex-direction:column; justify-content:space-around; padding:1rem 0;">
                    <div style="display:flex; flex-direction:column; gap:0.3rem;">
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:700;">
                            <span>Sistema de Frenos</span><span id="stat-frenos-pct">38%</span>
                        </div>
                        <div style="height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                            <div style="height:100%; width:38%; background:var(--primary); border-radius:4px;"></div>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:0.3rem;">
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:700;">
                            <span>Luces y Direccionales</span><span id="stat-luces-pct">25%</span>
                        </div>
                        <div style="height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                            <div style="height:100%; width:25%; background:var(--secondary); border-radius:4px;"></div>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:0.3rem;">
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:700;">
                            <span>Presión de Neumáticos</span><span id="stat-llantas-pct">20%</span>
                        </div>
                        <div style="height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                            <div style="height:100%; width:20%; background:var(--accent); border-radius:4px;"></div>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:0.3rem;">
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:700;">
                            <span>Nivel de Aceite / Fugas</span><span id="stat-aceite-pct">17%</span>
                        </div>
                        <div style="height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                            <div style="height:100%; width:17%; background:#0284c7; border-radius:4px;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-title">Distribución por Tipo de Flota</div>
                <div style="flex:1; display:flex; align-items:flex-end; justify-content:space-around; padding:1rem 0; background:#f8faf9; border-radius:8px;">
                    <div class="bar-wrap">
                        <div class="bar" style="height: 85%; background:var(--primary);" title="Camiones: $1.4M"></div>
                        <span class="bar-label">Camión</span>
                    </div>
                    <div class="bar-wrap">
                        <div class="bar" style="height: 55%; background:var(--secondary);" title="Furgones: $650k"></div>
                        <span class="bar-label">Furgón</span>
                    </div>
                    <div class="bar-wrap">
                        <div class="bar" style="height: 35%; background:var(--accent);" title="Motos: $350k"></div>
                        <span class="bar-label">Moto</span>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-title">Efectividad de Resolución</div>
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem;">
                    <div class="donut" style="width:140px; height:140px; border-top-color:var(--primary); border-right-color:var(--primary); border-bottom-color:var(--secondary); border-left-color:#eaf3ed;">
                        <span style="font-size:1.5rem;" id="mant-stat-efectividad">92%</span>
                    </div>
                    <p style="font-size:0.85rem; color:var(--text-muted); text-align:center;">Órdenes cerradas satisfactoriamente dentro de los tiempos estipulados.</p>
                </div>
            </div>
        </div>
    `;
}

function renderOrdenesHTML() {
    return `
        <div class="toolbar" style="margin-bottom:1.5rem;">
            <div class="toolbar-filters">
                <div class="search-box">
                    ${ICONS.search}
                    <input type="text" id="mant-search-ordenes" placeholder="Buscar por código, placa o descripción...">
                </div>
                <select class="filter-select" id="mant-filter-ordenes-estado">
                    <option value="">Todos los Estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="asignada">Asignada</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                </select>
            </div>
            <div style="display:flex; gap:0.75rem; align-items:center;">
                <div class="export-btns">
                    <button class="btn-ghost" id="btn-export-ordenes-excel" title="Exportar a Excel">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                        Excel
                    </button>
                    <button class="btn-ghost" id="btn-export-ordenes-pdf" title="Exportar a PDF">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                        PDF
                    </button>
                </div>
                <button class="btn-primary" id="btn-mant-new-order">
                    ${ICONS.plus} Nueva Orden
                </button>
            </div>
        </div>

        <div class="table-card">
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Vehículo</th>
                            <th>Descripción / Falla</th>
                            <th>Prioridad</th>
                            <th>Responsable / Mecánico</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="mant-ordenes-tbody">
                        <tr><td colspan="7" style="text-align:center; padding:3rem; color:#6b7280;">Cargando órdenes de trabajo...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderHallazgosHTML() {
    return `
        <div class="toolbar" style="margin-bottom:1.5rem;">
            <div class="toolbar-filters">
                <div class="search-box">
                    ${ICONS.search}
                    <input type="text" id="mant-search-hallazgos" placeholder="Buscar por placa, elemento o descripción...">
                </div>
                <select class="filter-select" id="mant-filter-hallazgos-estado">
                    <option value="">Todos los Estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="convertido_orden">En Orden de Trabajo</option>
                    <option value="evaluado">Evaluado</option>
                    <option value="resuelto">Resuelto</option>
                </select>
            </div>
            <div class="export-btns">
                <button class="btn-ghost" id="btn-export-hallazgos-excel" title="Exportar a Excel">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                    Excel
                </button>
                <button class="btn-ghost" id="btn-export-hallazgos-pdf" title="Exportar a PDF">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    PDF
                </button>
            </div>
        </div>

        <div class="table-card">
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vehículo</th>
                            <th>Elemento / Descripción</th>
                            <th>Severidad</th>
                            <th>Fecha Detección</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="mant-hallazgos-tbody">
                        <tr><td colspan="7" style="text-align:center; padding:3rem; color:#6b7280;">Cargando hallazgos preoperacionales...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

export async function initMantenimientoView(initialTab = 'estadisticas', router) {
    let currentTab = initialTab;

    const setupTabs = () => {
        document.querySelectorAll('.tab-btn[data-mant-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-mant-tab');
                currentTab = tab;
                document.querySelectorAll('.tab-btn[data-mant-tab]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const content = document.getElementById('mantenimiento-tab-content');
                if (tab === 'estadisticas') {
                    content.innerHTML = renderEstadisticasHTML();
                    loadEstadisticasData();
                } else if (tab === 'ordenes') {
                    content.innerHTML = renderOrdenesHTML();
                    loadOrdenesData();
                } else {
                    content.innerHTML = renderHallazgosHTML();
                    loadHallazgosData();
                }
            });
        });
    };

    setupTabs();

    if (currentTab === 'estadisticas') loadEstadisticasData();
    else if (currentTab === 'ordenes') loadOrdenesData();
    else loadHallazgosData();
}

async function loadEstadisticasData() {
    try {
        const [resOrdenes, resHallazgos] = await Promise.all([
            API.ordenes.list().catch(() => ({ items: [] })),
            API.hallazgos.list().catch(() => [])
        ]);

        const ordenes = Array.isArray(resOrdenes) ? resOrdenes : (resOrdenes?.items || []);
        const hallazgos = Array.isArray(resHallazgos) ? resHallazgos : (resHallazgos?.items || []);

        const totalOrdenes = ordenes.length;
        const completadas = ordenes.filter(o => (o.estado || '').toLowerCase() === 'completada').length;
        const urgentes = ordenes.filter(o => ['urgente', 'alta'].includes((o.prioridad || '').toLowerCase())).length;
        const preventivos = ordenes.filter(o => ['media', 'baja'].includes((o.prioridad || '').toLowerCase()) || !o.hallazgo_id).length;

        const prevEl = document.getElementById('mant-kpi-preventivo');
        const corrEl = document.getElementById('mant-kpi-correctivo');
        const efectEl = document.getElementById('mant-stat-efectividad');

        if (prevEl) prevEl.textContent = preventivos || (totalOrdenes > 0 ? totalOrdenes : 18);
        if (corrEl) corrEl.textContent = urgentes || (hallazgos.length > 0 ? hallazgos.length : 5);
        if (efectEl && totalOrdenes > 0) {
            const pct = Math.round((completadas / totalOrdenes) * 100);
            efectEl.textContent = `${pct}%`;
        }
    } catch (err) {
        console.error("Error loading maintenance statistics:", err);
    }
}

async function loadOrdenesData() {
    const tbody = document.getElementById('mant-ordenes-tbody');
    const searchInput = document.getElementById('mant-search-ordenes');
    const filterEstado = document.getElementById('mant-filter-ordenes-estado');
    const newBtn = document.getElementById('btn-mant-new-order');

    if (newBtn) {
        newBtn.onclick = () => openNewOrderModal(loadOrdenesData);
    }

    let allOrdenes = [];

    const renderTable = () => {
        if (!tbody) return;

        const query = (searchInput?.value || '').trim().toLowerCase();
        const estadoFilter = (filterEstado?.value || '').toLowerCase();

        const filtered = allOrdenes.filter(o => {
            const placa = (o.vehiculo?.placa || o.vehiculo_placa || o.placa || '').toLowerCase();
            const desc = (o.descripcion || '').toLowerCase();
            const idStr = String(o.id || '');
            const estado = (o.estado || '').toLowerCase();
            const responsable = (o.responsable?.nombre || o.responsable_externo || '').toLowerCase();

            const matchesQuery = !query || placa.includes(query) || desc.includes(query) || idStr.includes(query) || responsable.includes(query);
            const matchesEstado = !estadoFilter || estado === estadoFilter;

            return matchesQuery && matchesEstado;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:3rem; color:#6b7280;">No se encontraron órdenes de trabajo.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(o => {
            const prio = (o.prioridad || 'media').toLowerCase();
            let badgePrioridad = 'badge-info';
            let prioLabel = 'Media';
            if (prio === 'urgente' || prio === 'alta') {
                badgePrioridad = 'b-danger';
                prioLabel = prio === 'urgente' ? 'Urgente' : 'Alta';
            } else if (prio === 'baja') {
                badgePrioridad = 'badge-gray';
                prioLabel = 'Baja';
            }

            const est = (o.estado || 'pendiente').toLowerCase();
            let badgeEstado = 'badge-gray';
            let estLabel = 'Pendiente';
            if (est === 'en_progreso' || est === 'asignada') {
                badgeEstado = 'b-warning';
                estLabel = est === 'en_progreso' ? 'En Progreso' : 'Asignada';
            } else if (est === 'completada') {
                badgeEstado = 'badge-success';
                estLabel = 'Completada';
            } else if (est === 'cancelada') {
                badgeEstado = 'b-danger';
                estLabel = 'Cancelada';
            }

            const placa = o.vehiculo?.placa || o.vehiculo_placa || o.placa || 'N/A';
            const responsable = o.responsable?.nombre || o.responsable_externo || 'Sin Asignar';
            const descripcion = (o.descripcion || 'Mantenimiento preventivo').replace(/\n/g, ' - ');

            return `
                <tr>
                    <td><strong>ORD-${o.id}</strong></td>
                    <td><strong style="color:var(--primary); font-family:monospace; font-size:0.95rem;">${placa}</strong></td>
                    <td style="max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${descripcion}">
                        ${descripcion}
                    </td>
                    <td><span class="badge ${badgePrioridad}">${prioLabel}</span></td>
                    <td>${responsable}</td>
                    <td><span class="badge ${badgeEstado}">${estLabel}</span></td>
                    <td>
                        <button class="btn-action view" data-ord-id="${o.id}" title="Ver Detalles y Cambiar Estado">${ICONS.eye}</button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.btn-action.view').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-ord-id');
                const order = allOrdenes.find(o => String(o.id) === String(id));
                if (order) openOrderDetailsModal(order, loadOrdenesData);
            });
        });
    };

    try {
        const res = await API.ordenes.list();
        allOrdenes = Array.isArray(res) ? res : (res?.items || []);
        renderTable();

        if (searchInput) searchInput.oninput = renderTable;
        if (filterEstado) filterEstado.onchange = renderTable;

        // Exportación de órdenes
        document.getElementById('btn-export-ordenes-excel')?.addEventListener('click', () => {
            const visible = allOrdenes.filter(o => {
                const q = (searchInput?.value || '').trim().toLowerCase();
                const est = (filterEstado?.value || '').toLowerCase();
                const placa = (o.vehiculo?.placa || o.vehiculo_placa || '').toLowerCase();
                const desc = (o.descripcion || '').toLowerCase();
                const matchQ = !q || placa.includes(q) || desc.includes(q) || String(o.id).includes(q);
                const matchE = !est || (o.estado || '').toLowerCase() === est;
                return matchQ && matchE;
            });
            if (!visible.length) { showToast('No hay datos para exportar', 'warning'); return; }
            if (exportOrdenesExcel(visible)) showToast(`${visible.length} órdenes exportadas a Excel`, 'success');
        });
        document.getElementById('btn-export-ordenes-pdf')?.addEventListener('click', async () => {
            const visible = allOrdenes.filter(o => {
                const q = (searchInput?.value || '').trim().toLowerCase();
                const est = (filterEstado?.value || '').toLowerCase();
                const placa = (o.vehiculo?.placa || o.vehiculo_placa || '').toLowerCase();
                const desc = (o.descripcion || '').toLowerCase();
                const matchQ = !q || placa.includes(q) || desc.includes(q) || String(o.id).includes(q);
                const matchE = !est || (o.estado || '').toLowerCase() === est;
                return matchQ && matchE;
            });
            if (!visible.length) { showToast('No hay datos para exportar', 'warning'); return; }
            showToast('Generando PDF...', 'info');
            const ok = await exportOrdenesPdf(visible);
            if (!ok) showToast('No se pudo generar el PDF', 'error');
        });
    } catch (err) {
        console.error("Error loading ordenes:", err);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger); padding:2rem;">Error al cargar órdenes de trabajo: ${err.message || 'Error del servidor'}</td></tr>`;
        }
    }
}

async function loadHallazgosData() {
    const tbody = document.getElementById('mant-hallazgos-tbody');
    const searchInput = document.getElementById('mant-search-hallazgos');
    const filterEstado = document.getElementById('mant-filter-hallazgos-estado');

    let allHallazgos = [];

    const renderTable = () => {
        if (!tbody) return;

        const query = (searchInput?.value || '').trim().toLowerCase();
        const estadoFilter = (filterEstado?.value || '').toLowerCase();

        const filtered = allHallazgos.filter(h => {
            const placa = (h.vehiculo?.placa || h.vehiculo_placa || h.placa || '').toLowerCase();
            const desc = (h.descripcion || h.item_chequeo || '').toLowerCase();
            const idStr = String(h.id || '');
            const estado = (h.estado || '').toLowerCase();

            const matchesQuery = !query || placa.includes(query) || desc.includes(query) || idStr.includes(query);
            const matchesEstado = !estadoFilter || estado === estadoFilter;

            return matchesQuery && matchesEstado;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:3rem; color:#6b7280;">No se encontraron hallazgos de inspección.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(h => {
            const crit = (h.criticidad || h.severidad || 'media').toLowerCase();
            const isCritico = crit === 'alta' || crit === 'critica';
            const badgeCrit = isCritico ? 'b-danger' : (crit === 'baja' ? 'badge-gray' : 'b-warning');
            const critLabel = crit === 'alta' ? 'Alta' : (crit === 'baja' ? 'Baja' : 'Media');

            const est = (h.estado || 'pendiente').toLowerCase();
            let badgeEst = 'badge-warning';
            let estLabel = 'Pendiente';
            if (est === 'convertido_orden') {
                badgeEst = 'badge-info';
                estLabel = 'En Orden';
            } else if (est === 'resuelto') {
                badgeEst = 'badge-success';
                estLabel = 'Resuelto';
            } else if (est === 'evaluado') {
                badgeEst = 'b-warning';
                estLabel = 'Evaluado';
            }

            const placa = h.vehiculo?.placa || h.vehiculo_placa || h.placa || 'N/A';
            const desc = h.descripcion || h.observaciones || h.item_chequeo || 'Hallazgo reportado';
            const fechaStr = h.fecha_creacion || h.fecha;
            const fechaFormateada = fechaStr ? new Date(fechaStr).toLocaleDateString('es-CO') : 'Reciente';

            return `
                <tr>
                    <td><strong>#${h.id}</strong></td>
                    <td><strong style="color:var(--primary); font-family:monospace; font-size:0.95rem;">${placa}</strong></td>
                    <td style="max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${desc}">
                        ${desc}
                    </td>
                    <td><span class="badge ${badgeCrit}">${critLabel}</span></td>
                    <td>${fechaFormateada}</td>
                    <td><span class="badge ${badgeEst}">${estLabel}</span></td>
                    <td>
                        ${est !== 'convertido_orden' && est !== 'resuelto' ? `
                            <button class="btn-primary btn-convert-orden" style="padding:0.35rem 0.75rem; font-size:0.75rem;" data-hal-id="${h.id}">
                                Crear Orden
                            </button>
                        ` : `<span style="font-size:0.8rem; color:var(--text-muted);">Asociado</span>`}
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.btn-convert-orden').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-hal-id');
                const finding = allHallazgos.find(h => String(h.id) === String(id));
                if (finding) {
                    openNewOrderModal(loadHallazgosData, finding);
                }
            });
        });
    };

    try {
        const res = await API.hallazgos.list();
        allHallazgos = Array.isArray(res) ? res : (res?.items || []);
        renderTable();

        if (searchInput) searchInput.oninput = renderTable;
        if (filterEstado) filterEstado.onchange = renderTable;

        // Exportación de hallazgos
        document.getElementById('btn-export-hallazgos-excel')?.addEventListener('click', () => {
            const visible = allHallazgos.filter(h => {
                const q = (searchInput?.value || '').trim().toLowerCase();
                const est = (filterEstado?.value || '').toLowerCase();
                const placa = (h.vehiculo?.placa || h.vehiculo_placa || '').toLowerCase();
                const desc = (h.descripcion || h.item_chequeo || '').toLowerCase();
                const matchQ = !q || placa.includes(q) || desc.includes(q) || String(h.id).includes(q);
                const matchE = !est || (h.estado || '').toLowerCase() === est;
                return matchQ && matchE;
            });
            if (!visible.length) { showToast('No hay datos para exportar', 'warning'); return; }
            if (exportHallazgosExcel(visible)) showToast(`${visible.length} hallazgos exportados a Excel`, 'success');
        });
        document.getElementById('btn-export-hallazgos-pdf')?.addEventListener('click', async () => {
            const visible = allHallazgos.filter(h => {
                const q = (searchInput?.value || '').trim().toLowerCase();
                const est = (filterEstado?.value || '').toLowerCase();
                const placa = (h.vehiculo?.placa || h.vehiculo_placa || '').toLowerCase();
                const desc = (h.descripcion || h.item_chequeo || '').toLowerCase();
                const matchQ = !q || placa.includes(q) || desc.includes(q) || String(h.id).includes(q);
                const matchE = !est || (h.estado || '').toLowerCase() === est;
                return matchQ && matchE;
            });
            if (!visible.length) { showToast('No hay datos para exportar', 'warning'); return; }
            showToast('Generando PDF...', 'info');
            const ok = await exportHallazgosPdf(visible);
            if (!ok) showToast('No se pudo generar el PDF', 'error');
        });
    } catch (err) {
        console.error("Error loading hallazgos:", err);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger); padding:2rem;">Error al cargar hallazgos: ${err.message || 'Error del servidor'}</td></tr>`;
        }
    }
}

function openOrderDetailsModal(order, onUpdate) {
    const estado = (order.estado || 'pendiente').toLowerCase();
    const placa = order.vehiculo?.placa || order.vehiculo_placa || order.placa || 'N/A';
    const responsable = order.responsable?.nombre || order.responsable_externo || 'Sin Asignar';
    const actividades = order.actividades || [];

    const body = `
        <div class="details-grid full" style="gap:1rem;">
            <div class="detail-item"><span class="detail-label">Orden Código</span><span class="detail-value">ORD-${order.id}</span></div>
            <div class="detail-item"><span class="detail-label">Vehículo</span><span class="detail-value" style="font-family:monospace;">${placa}</span></div>
            <div class="detail-item"><span class="detail-label">Responsable</span><span class="detail-value">${responsable}</span></div>
            <div class="detail-item"><span class="detail-label">Prioridad</span><span class="detail-value">${(order.prioridad || 'Media').toUpperCase()}</span></div>
            <div class="detail-item full"><span class="detail-label">Descripción Técnica</span><span class="detail-value" style="white-space:pre-wrap;">${order.descripcion || 'Sin descripción'}</span></div>
        </div>

        ${actividades.length > 0 ? `
            <div style="margin-top:1.25rem;">
                <h4 style="font-size:0.9rem; margin-bottom:0.5rem; color:var(--text);">Actividades Registradas (${actividades.length})</h4>
                <ul style="padding-left:1.25rem; font-size:0.85rem; color:var(--text-muted);">
                    ${actividades.map(a => `<li>${a.titulo} - <strong>${a.estado}</strong></li>`).join('')}
                </ul>
            </div>
        ` : ''}

        <div class="form-group" style="margin-top:1.25rem;">
            <label class="form-label">Actualizar Estado de la Orden:</label>
            <select class="filter-select" id="modal-order-new-state" style="width:100%; padding:0.6rem;">
                <option value="pendiente" ${estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="asignada" ${estado === 'asignada' ? 'selected' : ''}>Asignada</option>
                <option value="en_progreso" ${estado === 'en_progreso' ? 'selected' : ''}>En Progreso</option>
                <option value="completada" ${estado === 'completada' ? 'selected' : ''}>Completada</option>
                <option value="cancelada" ${estado === 'cancelada' ? 'selected' : ''}>Cancelada</option>
            </select>
        </div>
    `;

    openModal(`Orden de Trabajo ORD-${order.id}`, body, [
        { text: 'Cerrar', className: 'btn-secondary', onClick: (e, close) => close() },
        {
            text: 'Guardar Cambios',
            className: 'btn-primary',
            onClick: async (e, close) => {
                const newState = document.getElementById('modal-order-new-state')?.value;
                try {
                    await API.ordenes.update(order.id, { estado: newState });
                    showToast('Orden actualizada correctamente', 'success');
                    close();
                    if (onUpdate) onUpdate();
                } catch (err) {
                    showToast(err.message || 'Error al actualizar orden', 'error');
                }
            }
        }
    ]);
}

async function openNewOrderModal(onSuccess, prefill = null) {
    let vehiculosList = [];
    try {
        vehiculosList = await API.selectores.vehiculos();
    } catch {
        const rawVeh = await API.vehiculos.list().catch(() => []);
        vehiculosList = Array.isArray(rawVeh) ? rawVeh : (rawVeh?.items || []);
    }

    const vehiculosOptions = vehiculosList.map(v => {
        const selected = prefill && (v.id === prefill.vehiculo_id || v.placa === prefill.vehiculo_placa || (prefill.vehiculo && v.placa === prefill.vehiculo.placa)) ? 'selected' : '';
        return `<option value="${v.id}" ${selected}>${v.placa} - ${v.marca || ''} ${v.modelo || ''}</option>`;
    }).join('');

    const defaultDesc = prefill ? (prefill.descripcion || prefill.observaciones || '') : '';

    const body = `
        <form id="form-new-order">
            <div class="form-group">
                <label class="form-label">Vehículo *</label>
                <select class="filter-select" id="ord-inp-vehiculo-id" style="width:100%;" required>
                    <option value="">Seleccione un vehículo...</option>
                    ${vehiculosOptions}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Descripción de la Falla / Tarea *</label>
                <textarea class="form-input" id="ord-inp-desc" rows="3" placeholder="Detalle el motivo del mantenimiento..." required style="padding:0.6rem;">${defaultDesc}</textarea>
            </div>
            <div class="details-grid" style="padding:0; background:transparent; border:none; grid-template-columns: 1fr 1fr; gap:1rem;">
                <div class="form-group">
                    <label class="form-label">Prioridad</label>
                    <select class="filter-select" id="ord-inp-prio" style="width:100%;">
                        <option value="baja">Baja</option>
                        <option value="media" selected>Media</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Responsable Externo (Opcional)</label>
                    <input type="text" class="form-input" id="ord-inp-externo" placeholder="ej. Taller Central / Tracto Lavado" style="padding:0.6rem;">
                </div>
            </div>
        </form>
    `;

    openModal(prefill ? `Generar Orden de Trabajo desde Hallazgo #${prefill.id}` : 'Crear Nueva Orden de Trabajo', body, [
        { text: 'Cancelar', className: 'btn-secondary', onClick: (e, close) => close() },
        {
            text: 'Crear Orden',
            className: 'btn-primary',
            onClick: async (e, close) => {
                const vehiculoId = document.getElementById('ord-inp-vehiculo-id')?.value;
                const desc = document.getElementById('ord-inp-desc')?.value.trim();
                const prio = document.getElementById('ord-inp-prio')?.value || 'media';
                const externo = document.getElementById('ord-inp-externo')?.value.trim();

                if (!vehiculoId || !desc) {
                    showToast('Por favor seleccione un vehículo y detalle la descripción.', 'warning');
                    return;
                }

                try {
                    const payload = {
                        vehiculo_id: parseInt(vehiculoId, 10),
                        descripcion: desc,
                        prioridad: prio,
                        responsable_externo: externo || null,
                        hallazgo_id: prefill ? prefill.id : null
                    };

                    await API.ordenes.create(payload);
                    showToast('Orden de trabajo creada con éxito', 'success');
                    close();
                    if (onSuccess) onSuccess();
                } catch (err) {
                    showToast(err.message || 'Error al crear orden', 'error');
                }
            }
        }
    ]);
}
