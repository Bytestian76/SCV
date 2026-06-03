/**
 * Admin Mantenimientos - Kanban + List view
 */

const ESTADO_META = {
    pendiente:          { label: 'Pendiente',          cls: 'is-pendiente',          icon: 'assets/icons/hourglass.svg' },
    en_progreso:        { label: 'En progreso',        cls: 'is-en_progreso',        icon: 'assets/icons/arrow-clockwise.svg' },
    esperando_repuesto: { label: 'Esperando repuesto', cls: 'is-esperando_repuesto', icon: 'assets/icons/truck.svg' },
    completado:         { label: 'Completado',         cls: 'is-completado',         icon: 'assets/icons/clipboard-check.svg' },
    cancelado:          { label: 'Cancelado',          cls: 'is-cancelado',          icon: 'assets/icons/x-lg.svg' },
};

const TIPO_LABELS = { correctivo: 'Correctivo', preventivo: 'Preventivo' };
const PRIORIDAD_LABELS = { baja: 'Baja', media: 'Media', alta: 'Alta', critica: 'Crítica' };
const ESTADO_ACT_LABELS = { pendiente: 'Pendiente', en_progreso: 'En progreso', completada: 'Completada' };
const COSTO_TIPO_LABELS = { repuesto: 'Repuesto', otro: 'Otro' };
const AUDITORIA_ACCION_LABELS = { creacion: 'Creada', cambio_estado: 'Cambio de estado', update: 'Actualizada' };

let MANT_VIEW_MODE = 'kanban';

function toggleMantenimientosView() {
    MANT_VIEW_MODE = MANT_VIEW_MODE === 'kanban' ? 'list' : 'kanban';
    const kanbanEl = document.getElementById('mantenimientos-kanban');
    const listEl = document.getElementById('mantenimientos-list');
    const titleEl = document.getElementById('mant-view-title');
    const btnIcon = document.querySelector('#mant-toggle-view-btn img');
    if (MANT_VIEW_MODE === 'kanban') {
        kanbanEl.style.display = '';
        listEl.style.display = 'none';
        titleEl.textContent = 'Tablero Kanban';
        if (btnIcon) btnIcon.src = 'assets/icons/bar-chart-line.svg';
    } else {
        kanbanEl.style.display = 'none';
        listEl.style.display = '';
        titleEl.textContent = 'Lista de órdenes';
        if (btnIcon) btnIcon.src = 'assets/icons/columns.svg';
    }
    loadMantenimientosManagement();
}

function setMantenimientoFeedback(msg, isError) {
    const el = document.getElementById('mantenimientos-feedback');
    if (el) {
        el.textContent = msg;
        el.style.color = isError ? 'var(--error-color, #dc3545)' : 'var(--text-secondary, #666)';
    }
}

function humanizeLabel(str) {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

async function loadMantenimientosManagement() {
    initMantenimientoEventListeners();
    if (MANT_VIEW_MODE === 'kanban') {
        await loadKanbanBoard();
    } else {
        await loadMantenimientosList();
    }
}

function getFilteredMantenimientos() {
    const estado = document.getElementById('mantenimientos-estado')?.value || '';
    const tipo = document.getElementById('mantenimientos-tipo')?.value || '';
    const prioridad = document.getElementById('mantenimientos-prioridad')?.value || '';
    const search = document.getElementById('mantenimientos-search')?.value?.trim() || '';
    const filters = {};
    if (estado) filters.estado = estado;
    if (tipo) filters.tipo = tipo;
    if (prioridad) filters.prioridad = prioridad;
    if (search) filters.search = search;
    APP.admin.mantenimientos = { ...APP.admin.mantenimientos, filters };
    return filters;
}

async function loadMantenimientosList() {
    const listEl = document.getElementById('mantenimientos-list');
    if (!listEl) return;
    listEl.innerHTML = '<p class="helper-text">Cargando...</p>';

    const filters = getFilteredMantenimientos();

    try {
        const data = await API.getMantenimientos(filters);
        renderMantenimientosList(data);
    } catch (err) {
        listEl.innerHTML = '<p class="helper-text">Error al cargar mantenimientos.</p>';
        setMantenimientoFeedback(err.message || 'Error de conexión', true);
    }
}

function renderMantenimientosList(data) {
    const listEl = document.getElementById('mantenimientos-list');
    const resultsEl = document.getElementById('mantenimientos-results');

    if (!listEl) return;

    if (!data || data.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><p class="helper-text">No hay órdenes de mantenimiento.</p></div>';
        if (resultsEl) resultsEl.textContent = '0 resultados';
        return;
    }

    if (resultsEl) resultsEl.textContent = `${data.length} resultado(s)`;

    listEl.innerHTML = data.map(m => {
        const st = ESTADO_META[m.estado] || { label: m.estado, cls: 'is-pendiente' };
        const pr = PRIORIDAD_LABELS[m.prioridad] || '';
        const tieneItems = (m.items_count || 0) > 0;
        return `
        <div class="management-item" data-id="${m.id}">
            <div class="item-main-row">
                <div class="item-info">
                    <div class="item-title-row">
                        <img src="assets/icons/truck.svg" alt="" class="item-vehiculo-icon" aria-hidden="true">
                        <span class="management-item-title">
                            ${m.vehiculo ? `${m.vehiculo.placa} <span class="item-marca">${m.vehiculo.marca} ${m.vehiculo.modelo}</span>` : 'Vehículo #' + m.vehiculo_id}
                        </span>
                    </div>
                    <div class="item-meta-row">
                        <span class="item-meta-tag item-tipo-${m.tipo}">${TIPO_LABELS[m.tipo] || m.tipo}</span>
                        ${pr ? `<span class="item-meta-tag is-${m.prioridad}" style="font-size:0.75rem;">${pr}</span>` : ''}
                        <span class="item-meta-dot">·</span>
                        <span>${tieneItems ? m.items_count + ' items' : 'Sin items'}</span>
                        ${m.kilometraje ? ` <span class="item-meta-dot">·</span> <span>${m.kilometraje} km</span>` : ''}
                        <span class="item-meta-dot">·</span>
                        <span>${new Date(m.fecha_creacion).toLocaleDateString()}</span>
                        ${m.creador ? ` <span class="item-meta-dot">·</span> <span>${m.creador.nombre}</span>` : ''}
                    </div>
                    ${m.descripcion ? `<p class="item-desc">${m.descripcion.substring(0, 120)}${m.descripcion.length > 120 ? '...' : ''}</p>` : ''}
                </div>
                <div class="item-right-col">
                    <span class="status-badge ${st.cls}">${st.label}</span>
                    <div class="item-action-buttons">
                        ${renderEstadoButtons(m)}
                        <button class="btn-item btn-item-ghost" onclick="verDetalleMantenimiento(${m.id})"><img src="assets/icons/search.svg" alt="" class="btn-inline-icon" aria-hidden="true">Ver</button>
                        ${window.APP?.user?.rol === 'admin' ? `<button class="btn-item btn-item-danger" onclick="eliminarMantenimiento(${m.id})"><img src="assets/icons/x-lg.svg" alt="" class="btn-inline-icon" aria-hidden="true"></button>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function renderEstadoButtons(m) {
    const btns = [];
    if (m.estado === 'pendiente') {
        btns.push(`<button class="btn-item btn-item-primary" onclick="cambiarEstadoMantenimiento(${m.id},'en_progreso')"><img src="assets/icons/arrow-clockwise.svg" alt="" class="btn-inline-icon" aria-hidden="true">Iniciar</button>`);
    }
    if (m.estado === 'en_progreso') {
        btns.push(`<button class="btn-item btn-item-warning" onclick="cambiarEstadoMantenimiento(${m.id},'esperando_repuesto')"><img src="assets/icons/truck.svg" alt="" class="btn-inline-icon" aria-hidden="true">Espera repuesto</button>`);
        btns.push(`<button class="btn-item btn-item-success" onclick="cambiarEstadoMantenimiento(${m.id},'completado')"><img src="assets/icons/clipboard-check.svg" alt="" class="btn-inline-icon" aria-hidden="true">Completar</button>`);
    }
    if (m.estado === 'esperando_repuesto') {
        btns.push(`<button class="btn-item btn-item-primary" onclick="cambiarEstadoMantenimiento(${m.id},'en_progreso')"><img src="assets/icons/arrow-clockwise.svg" alt="" class="btn-inline-icon" aria-hidden="true">Reanudar</button>`);
    }
    if (['pendiente','en_progreso','esperando_repuesto'].includes(m.estado)) {
        btns.push(`<button class="btn-item btn-item-muted" onclick="cambiarEstadoMantenimiento(${m.id},'cancelado')"><img src="assets/icons/x-lg.svg" alt="" class="btn-inline-icon" aria-hidden="true">Cancelar</button>`);
    }
    return btns.join('');
}

// ============ KANBAN ============

async function loadKanbanBoard() {
    const kanbanEl = document.getElementById('mantenimientos-kanban');
    if (!kanbanEl) return;
    kanbanEl.innerHTML = '<p class="helper-text">Cargando tablero...</p>';

    try {
        const board = await API.getKanbanBoard();
        const columnas = board.columnas || {};
        const totales = board.totales || {};

        const COLUMNAS = [
            { key: 'pendiente',          title: 'Pendientes',         cls: 'kanban-col-pendiente' },
            { key: 'en_progreso',        title: 'En progreso',        cls: 'kanban-col-progreso' },
            { key: 'esperando_repuesto', title: 'Esperando repuesto', cls: 'kanban-col-espera' },
            { key: 'completado',         title: 'Completadas',        cls: 'kanban-col-completado' },
            { key: 'cancelado',          title: 'Canceladas',         cls: 'kanban-col-cancelado' },
        ];

        kanbanEl.innerHTML = `<div class="kanban-columns">${COLUMNAS.map(col => {
            const items = columnas[col.key] || [];
            const count = totales[col.key] || 0;
            return `
            <div class="kanban-column ${col.cls}">
                <div class="kanban-col-header">
                    <span class="kanban-col-title">${col.title}</span>
                    <span class="kanban-col-count">${count}</span>
                </div>
                <div class="kanban-col-body">
                    ${items.length === 0 ? '<p class="kanban-empty">Sin órdenes</p>' : items.map(m => `
                        <div class="kanban-card" onclick="verDetalleMantenimiento(${m.id})">
                            <div class="kanban-card-header">
                                <span class="kanban-card-placa">${m.vehiculo ? m.vehiculo.placa : '#' + m.vehiculo_id}</span>
                                <span class="item-meta-tag item-tipo-${m.tipo}" style="font-size:0.7rem;">${TIPO_LABELS[m.tipo] || m.tipo}</span>
                            </div>
                            ${m.descripcion ? `<p class="kanban-card-desc">${m.descripcion.substring(0, 80)}${m.descripcion.length > 80 ? '…' : ''}</p>` : ''}
                            <div class="kanban-card-meta">
                                ${m.prioridad ? `<span class="kanban-prio is-${m.prioridad}">${PRIORIDAD_LABELS[m.prioridad] || m.prioridad}</span>` : ''}
                                <span class="kanban-card-date">${new Date(m.fecha_creacion).toLocaleDateString()}</span>
                            </div>
                            ${m.items_count > 0 ? `<span class="kanban-card-items">${m.items_count} ítem(s)</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }).join('')}</div>`;
    } catch (err) {
        kanbanEl.innerHTML = '<p class="helper-text">Error al cargar tablero Kanban.</p>';
        setMantenimientoFeedback(err.message || 'Error de conexión', true);
    }
}

// ============ CRUD ============

async function cambiarEstadoMantenimiento(id, nuevoEstado) {
    const labels = { pendiente: 'Pendiente', en_progreso: 'En progreso', esperando_repuesto: 'Esperando repuesto', completado: 'Completado', cancelado: 'Cancelado' };
    const confirmed = await showAppConfirm(`¿Cambiar estado a "${labels[nuevoEstado] || nuevoEstado}"?`);
    if (!confirmed) return;

    try {
        await API.updateEstadoMantenimiento(id, nuevoEstado);
        setMantenimientoFeedback(`Estado cambiado a "${labels[nuevoEstado] || nuevoEstado}"`);
        await loadMantenimientosManagement();
        if (APP.user?.rol === 'mecanico') loadDashboardMecanicoData();
    } catch (err) {
        setMantenimientoFeedback(err.message || 'Error al cambiar estado', true);
    }
}

async function verDetalleMantenimiento(id) {
    try {
        const m = await API.getMantenimiento(id);
        const content = document.getElementById('mantenimiento-detalle-content');
        const estadoBtn = document.getElementById('mantenimiento-detalle-estado');

        if (!content) return;

        const estados = Object.values(ESTADO_META);
        const estadoLabels = Object.fromEntries(estados.map(e => [e.label, e]));
        const nextStates = { pendiente: 'en_progreso', en_progreso: 'completado', esperando_repuesto: 'en_progreso' };

        const actividadesHtml = (m.actividades || []).map(a => {
            const evCount = (a.evidencias || []).length;
            return `
                <div class="timeline-item is-${a.estado}">
                    <div class="timeline-marker"></div>
                    <div class="timeline-body">
                        <div class="timeline-header">
                            <span class="status-badge is-${a.estado}">${ESTADO_ACT_LABELS[a.estado] || a.estado}</span>
                            <span class="timeline-date">${a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}</span>
                        </div>
                        <p class="timeline-desc">${escapeHtml(a.descripcion)}</p>
                        ${a.responsable ? `<p class="timeline-responsable"><strong>Resp:</strong> ${escapeHtml(a.responsable)}</p>` : ''}
                        ${a.fecha_inicio ? `<p class="timeline-range"><strong>Inicio:</strong> ${new Date(a.fecha_inicio).toLocaleString()}</p>` : ''}
                        ${a.fecha_fin ? `<p class="timeline-range"><strong>Fin:</strong> ${new Date(a.fecha_fin).toLocaleString()}</p>` : ''}
                        <div class="timeline-actions">
                            <button class="btn-sm btn-ghost" onclick="cambiarEstadoActividad(${a.id},'en_progreso',${id})">Iniciar</button>
                            <button class="btn-sm btn-ghost" onclick="cambiarEstadoActividad(${a.id},'completada',${id})">Completar</button>
                            <button class="btn-sm btn-ghost" onclick="abrirEvidencias(${a.id},${id})">${evCount > 0 ? `Evidencias (${evCount})` : 'Añadir Evidencia'}</button>
                        </div>
                        ${evCount > 0 ? `
                            <div class="timeline-evidencias">${a.evidencias.map(e => `
                                ${e.archivo_url ? `<img src="${e.archivo_url}" class="evidencia-thumb" onclick="window.open('${e.archivo_url}')">` : ''}
                            `).join('')}</div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        content.innerHTML = `
            <div class="item-details">
                <p><strong>Vehículo:</strong> ${m.vehiculo ? `${m.vehiculo.placa} - ${m.vehiculo.marca} ${m.vehiculo.modelo}` : 'N/A'}</p>
                <p><strong>Tipo:</strong> ${TIPO_LABELS[m.tipo] || m.tipo}</p>
                <p><strong>Estado:</strong> ${ESTADO_META[m.estado]?.label || m.estado}</p>
                ${m.prioridad ? `<p><strong>Prioridad:</strong> ${PRIORIDAD_LABELS[m.prioridad] || m.prioridad}</p>` : ''}
                ${m.items && m.items.length > 0 ? `<p><strong>Ítems:</strong> ${resumenItems(m)}</p>` : ''}
                ${m.kilometraje ? `<p><strong>Kilometraje:</strong> ${m.kilometraje}</p>` : ''}
                <p><strong>Creado:</strong> ${new Date(m.fecha_creacion).toLocaleString()}</p>
                ${m.creador ? `<p><strong>Por:</strong> ${m.creador.nombre}</p>` : ''}
                ${m.chequeo_origen_id ? `<p><strong>Origen:</strong> Chequeo #${m.chequeo_origen_id}</p>` : ''}
                ${m.falla_origen ? `<p><strong>Falla origen:</strong> ${m.falla_origen.categoria} - ${m.falla_origen.descripcion?.substring(0, 60)}</p>` : ''}
                ${m.falla_origen_id ? `<p><strong>Falla ID:</strong> #${m.falla_origen_id}</p>` : ''}
                ${m.fecha_actualizacion ? `<p><strong>Actualizado:</strong> ${new Date(m.fecha_actualizacion).toLocaleString()}</p>` : ''}
            </div>
            ${m.descripcion ? `<hr><p><strong>Descripción:</strong></p><p class="detalle-desc">${escapeHtml(m.descripcion)}</p>` : ''}
            ${m.items && m.items.length > 0 ? `
                <hr>
                <p><strong>Items (${m.items.length}):</strong></p>
                <ul class="mantenimiento-items-list">${m.items.map(i => {
                    const completo = i.realizado ? 'completado' : 'pendiente';
                    return `<li class="mantenimiento-item-row ${completo}">
                        <span class="item-section">${humanizeLabel(i.seccion)}</span>
                        <span class="item-arrow">&rarr;</span>
                        <span class="item-name">${humanizeLabel(i.item)}</span>
                        <span class="item-obs">${i.observacion || ''}</span>
                        <span class="item-status-icon">${i.realizado ? '✅' : '⏳'}</span>
                    </li>`;
                }).join('')}</ul>
            ` : ''}
            <hr>
            <div class="timeline-section">
                <div class="timeline-section-header">
                    <p><strong>Seguimiento (${(m.actividades || []).length})</strong></p>
                    <button class="btn-sm btn-primary" onclick="abrirNuevaActividad(${id})">+ Actividad</button>
                </div>
                <div class="timeline">
                    ${actividadesHtml || '<p class="helper-text">Sin actividades registradas.</p>'}
                </div>
            </div>
            <hr>
            <div class="costos-section">
                <div class="timeline-section-header">
                    <p><strong>Costos</strong></p>
                    <button class="btn-sm btn-primary" onclick="abrirNuevoCosto(${id})">+ Costo</button>
                </div>
                <div id="costos-list-${id}" class="costos-body">
                    <p class="helper-text">Cargando costos...</p>
                </div>
            </div>
            <hr>
            <div class="auditoria-section">
                <div class="timeline-section-header">
                    <p><strong>Auditoría</strong></p>
                </div>
                <div id="auditoria-list-${id}" class="auditoria-body">
                    <p class="helper-text">Cargando auditoría...</p>
                </div>
            </div>
        `;

        if (nextStates[m.estado]) {
            estadoBtn.style.display = 'inline-block';
            estadoBtn.textContent = `Marcar como "${ESTADO_META[nextStates[m.estado]]?.label}"`;
            estadoBtn.onclick = async () => {
                await cambiarEstadoMantenimiento(id, nextStates[m.estado]);
                document.getElementById('mantenimiento-detalle-accept')?.click();
            };
        } else if (m.estado === 'en_progreso') {
            estadoBtn.style.display = 'inline-block';
            estadoBtn.textContent = 'Marcar como "Esperando repuesto"';
            estadoBtn.onclick = async () => {
                await cambiarEstadoMantenimiento(id, 'esperando_repuesto');
                document.getElementById('mantenimiento-detalle-accept')?.click();
            };
        } else {
            estadoBtn.style.display = 'none';
        }

        toggleModal('mantenimiento-detalle-modal', true);

        // Load costos and auditoria in background
        loadCostosSeccion(id);
        loadAuditoriaSeccion(id);
    } catch (err) {
        setMantenimientoFeedback(err.message || 'Error al cargar detalle', true);
    }
}

async function loadCostosSeccion(mantenimientoId) {
    try {
        const costos = await API.getCostos(mantenimientoId);
        const container = document.getElementById(`costos-list-${mantenimientoId}`);
        if (!container) return;
        if (!costos || costos.length === 0) {
            container.innerHTML = '<p class="helper-text">Sin costos registrados.</p>';
            return;
        }
        const totalGral = costos.reduce((s, c) => s + (c.total || 0), 0);
        container.innerHTML = `
            <table class="costos-table">
                <tr><th>Tipo</th><th>Descripción</th><th>Cant</th><th>V/Unit</th><th>Total</th><th></th></tr>
                ${costos.map(c => `
                    <tr>
                        <td>${COSTO_TIPO_LABELS[c.tipo] || c.tipo}</td>
                        <td>${escapeHtml(c.descripcion)}</td>
                        <td>${c.cantidad}</td>
                        <td>$${c.valor_unitario?.toLocaleString()}</td>
                        <td><strong>$${c.total?.toLocaleString()}</strong></td>
                        <td><button class="btn-sm btn-ghost" onclick="eliminarCosto(${c.id}, ${mantenimientoId})">✕</button></td>
                    </tr>
                `).join('')}
                <tr class="costos-total-row"><td colspan="4"><strong>Total general</strong></td><td><strong>$${totalGral.toLocaleString()}</strong></td><td></td></tr>
            </table>
        `;
    } catch (err) {
        console.error('Error cargando costos:', err);
    }
}

async function loadAuditoriaSeccion(mantenimientoId) {
    try {
        const registros = await API.getAuditoria(mantenimientoId);
        const container = document.getElementById(`auditoria-list-${mantenimientoId}`);
        if (!container) return;
        if (!registros || registros.length === 0) {
            container.innerHTML = '<p class="helper-text">Sin registro de auditoría.</p>';
            return;
        }
        container.innerHTML = `
            <div class="auditoria-list">
                ${registros.map(r => {
                    const accionLabel = AUDITORIA_ACCION_LABELS[r.accion] || r.accion;
                    const detalle = r.estado_anterior && r.estado_nuevo
                        ? `: ${r.estado_anterior} → ${r.estado_nuevo}`
                        : '';
                    return `<div class="auditoria-item">
                        <span class="auditoria-accion">${accionLabel}${detalle}</span>
                        <span class="auditoria-usuario">${r.usuario_nombre || '#' + r.usuario_id}</span>
                        <span class="auditoria-fecha">${new Date(r.created_at).toLocaleString()}</span>
                    </div>`;
                }).join('')}
            </div>
        `;
    } catch (err) {
        console.error('Error cargando auditoría:', err);
    }
}

function resumenItems(m) {
    if (!m.items || m.items.length === 0) return '';
    const total = m.items.length;
    const conObs = m.items.filter(i => i.observacion).length;
    let s = `${total} ítem(s)`;
    if (conObs > 0) s += `, ${conObs} con observación`;
    return s;
}

async function cambiarEstadoActividad(id, estado, mantenimientoId) {
    try {
        await API.updateActividad(id, { estado });
        await verDetalleMantenimiento(mantenimientoId);
        setMantenimientoFeedback(`Actividad marcada como "${ESTADO_ACT_LABELS[estado] || estado}"`);
    } catch (err) {
        setMantenimientoFeedback(err.message || 'Error al actualizar actividad', true);
    }
}

function abrirNuevaActividad(mantenimientoId) {
    const desc = prompt('Descripción de la actividad:');
    if (!desc || !desc.trim()) return;
    const resp = prompt('Responsable (opcional):');
    API.createActividad(mantenimientoId, { descripcion: desc.trim(), responsable: resp?.trim() || null })
        .then(() => verDetalleMantenimiento(mantenimientoId))
        .catch(err => setMantenimientoFeedback(err.message || 'Error al crear actividad', true));
}

function abrirEvidencias(actividadId, mantenimientoId) {
    const tipo = prompt('Tipo de evidencia (foto/documento):') || 'foto';
    const desc = prompt('Descripción (opcional):');
    const url = prompt('URL de la imagen (o vacío para subir después):');
    API.createEvidencia(actividadId, { tipo, descripcion: desc || null, archivo_url: url || null })
        .then(() => verDetalleMantenimiento(mantenimientoId))
        .catch(err => setMantenimientoFeedback(err.message || 'Error al añadir evidencia', true));
}

async function eliminarMantenimiento(id) {
    const confirmed = await showAppConfirm('¿Eliminar esta orden? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
        await API.deleteMantenimiento(id);
        setMantenimientoFeedback('Orden eliminada');
        await loadMantenimientosManagement();
    } catch (err) {
        setMantenimientoFeedback(err.message || 'Error al eliminar', true);
    }
}

let _mtVehiculoSelectorInit = false;

function initVehiculoSelector(prefix) {
    if (_mtVehiculoSelectorInit) return;
    _mtVehiculoSelectorInit = true;

    const input = document.getElementById(prefix + 'vehiculo-search');
    const results = document.getElementById(prefix + 'vehiculo-results');
    const hidden = document.getElementById(prefix + 'vehiculo');
    const selected = document.getElementById(prefix + 'vehiculo-selected');
    if (!input || !results) return;

    const showResults = () => { results.style.display = 'block'; };
    const hideResults = () => { results.style.display = 'none'; };

    input.addEventListener('input', async () => {
        const q = input.value.trim();
        try {
            const vehiculos = await API.getSelectorVehiculos(q);
            if (!vehiculos || vehiculos.length === 0) {
                results.innerHTML = '<div class="selector-empty">Sin resultados</div>';
                showResults();
                return;
            }
            results.innerHTML = vehiculos.map(v =>
                `<div class="selector-result-item" data-id="${v.id}" data-label="${v.placa} - ${v.marca} ${v.modelo}">
                    ${v.placa} - ${v.marca} ${v.modelo}
                </div>`
            ).join('');
            showResults();

            results.querySelectorAll('.selector-result-item').forEach(el => {
                el.addEventListener('click', () => {
                    input.value = el.dataset.label;
                    if (hidden) hidden.value = el.dataset.id;
                    if (selected) selected.textContent = 'Seleccionado: ' + el.dataset.label;
                    hideResults();
                });
            });
        } catch (err) {
            console.error('Error buscando vehículos:', err);
        }
    });

    input.addEventListener('focus', () => {
        if (results.children.length > 0) showResults();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#' + prefix + 'vehiculo-search') &&
            !e.target.closest('#' + prefix + 'vehiculo-results')) {
            hideResults();
        }
    });
}

function openMantenimientoForm(data, fallaOrigenId) {
    document.getElementById('mantenimiento-form-title').textContent = data ? 'Editar orden' : 'Nueva orden de mantenimiento';
    document.getElementById('mantenimiento-form').reset();
    document.getElementById('mantenimiento-form').dataset.editId = data?.id || '';
    document.getElementById('mantenimiento-form').dataset.fallaOrigenId = fallaOrigenId || '';
    if (data) {
        document.getElementById('mt-tipo').value = data.tipo;
        document.getElementById('mt-descripcion').value = data.descripcion || '';
        document.getElementById('mt-kilometraje').value = data.kilometraje || '';
        document.getElementById('mt-prioridad').value = data.prioridad || '';
    }
    toggleModal('mantenimiento-modal', true);
    if (!data) {
        initVehiculoSelector('mt-');
    }
}

async function handleMantenimientoSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const editId = form.dataset.editId || '';
    const fallaOrigenId = form.dataset.fallaOrigenId || '';

    const data = {
        vehiculo_id: parseInt(document.getElementById('mt-vehiculo')?.value),
        tipo: document.getElementById('mt-tipo').value,
        descripcion: document.getElementById('mt-descripcion').value || null,
        prioridad: document.getElementById('mt-prioridad').value || null,
        kilometraje: document.getElementById('mt-kilometraje').value ? parseInt(document.getElementById('mt-kilometraje').value) : null,
    };

    if (!data.vehiculo_id) {
        setMantenimientoFeedback('Debes seleccionar un vehículo', true);
        return;
    }

    if (fallaOrigenId) {
        data.falla_origen_id = parseInt(fallaOrigenId);
    }

    try {
        if (editId) {
            await API.updateMantenimiento(parseInt(editId), data);
            setMantenimientoFeedback('Orden actualizada');
        } else {
            await API.createMantenimiento(data);
            setMantenimientoFeedback('Orden creada');
        }
        toggleModal('mantenimiento-modal', false);
        form.dataset.fallaOrigenId = '';
        await loadMantenimientosManagement();
    } catch (err) {
        setMantenimientoFeedback(err.message || 'Error al guardar', true);
    }
}

// ============ FALLA → ORDEN ============

let _currentFallaForConversion = null;

async function convertirFallaAOrden() {
    if (!_currentFallaForConversion) return;
    const f = _currentFallaForConversion;
    closeFallaDetalleModal();
    openMantenimientoForm(null, f.id);
    // Pre-fill form from falla data
    setTimeout(() => {
        document.getElementById('mt-tipo').value = 'correctivo';
        document.getElementById('mt-descripcion').value = f.descripcion || '';
        document.getElementById('mt-prioridad').value = f.prioridad || 'media';
        // Pre-fill vehicle
        if (f.vehiculo) {
            const searchInput = document.getElementById('mt-vehiculo-search');
            const hiddenInput = document.getElementById('mt-vehiculo');
            if (searchInput) searchInput.value = `${f.vehiculo.placa} - ${f.vehiculo.marca} ${f.vehiculo.modelo}`;
            if (hiddenInput) hiddenInput.value = f.vehiculo_id;
        }
    }, 200);
}

// Patch verDetalleFalla to show "Convertir a orden" button
const _originalVerDetalleFalla = window.verDetalleFalla;
window.verDetalleFalla = async function(id) {
    if (typeof _originalVerDetalleFalla === 'function') {
        await _originalVerDetalleFalla(id);
    }
    try {
        const f = await API.getFalla(id);
        _currentFallaForConversion = f;
        const convertirBtn = document.getElementById('falla-convertir-orden-btn');
        if (convertirBtn) {
            if (f.estado !== 'convertida_a_orden' && f.estado !== 'rechazada') {
                convertirBtn.style.display = 'inline-block';
            } else {
                convertirBtn.style.display = 'none';
            }
        }
    } catch (_) {}
};

// Init event listeners
function initMantenimientoEventListeners() {
    const nuevoBtn = document.getElementById('mantenimiento-nuevo-btn');
    if (nuevoBtn) nuevoBtn.addEventListener('click', () => openMantenimientoForm());

    const form = document.getElementById('mantenimiento-form');
    if (form) form.addEventListener('submit', handleMantenimientoSubmit);

    const cancelBtn = document.getElementById('mantenimiento-cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => toggleModal('mantenimiento-modal', false));

    const closeBtn = document.getElementById('mantenimiento-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => toggleModal('mantenimiento-modal', false));

    const detalleClose = document.getElementById('mantenimiento-detalle-close');
    if (detalleClose) detalleClose.addEventListener('click', () => toggleModal('mantenimiento-detalle-modal', false));

    const detalleAccept = document.getElementById('mantenimiento-detalle-accept');
    if (detalleAccept) detalleAccept.addEventListener('click', () => toggleModal('mantenimiento-detalle-modal', false));

    ['mantenimientos-estado', 'mantenimientos-tipo', 'mantenimientos-prioridad', 'mantenimientos-search'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', loadMantenimientosManagement);
        if (el && (el.type === 'search' || el.tagName === 'INPUT')) el.addEventListener('input', () => setTimeout(loadMantenimientosManagement, 300));
    });

    const clearFiltersBtn = document.getElementById('mantenimientos-clear-filters');
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => {
        ['mantenimientos-estado', 'mantenimientos-tipo', 'mantenimientos-prioridad'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const searchEl = document.getElementById('mantenimientos-search');
        if (searchEl) searchEl.value = '';
        loadMantenimientosManagement();
    });
}

async function eliminarCosto(costoId, mantenimientoId) {
    try {
        await API.deleteCosto(costoId);
        loadCostosSeccion(mantenimientoId);
        setMantenimientoFeedback('Costo eliminado');
    } catch (err) {
        setMantenimientoFeedback(err.message || 'Error al eliminar costo', true);
    }
}

function abrirNuevoCosto(mantenimientoId) {
    const tipo = prompt('Tipo (repuesto/otro):') || 'repuesto';
    const desc = prompt('Descripción:');
    if (!desc || !desc.trim()) return;
    const cant = parseInt(prompt('Cantidad:') || '1', 10);
    const valor = parseInt(prompt('Valor unitario ($):') || '0', 10);
    const prov = prompt('Proveedor (opcional):');
    API.createCosto(mantenimientoId, {
        tipo, descripcion: desc.trim(), cantidad: cant, valor_unitario: valor, proveedor: prov || null
    }).then(() => {
        loadCostosSeccion(mantenimientoId);
        setMantenimientoFeedback('Costo agregado');
    }).catch(err => setMantenimientoFeedback(err.message || 'Error al crear costo', true));
}
