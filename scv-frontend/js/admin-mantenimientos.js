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
    } catch (err) {
        setMantenimientoFeedback(err.message || 'Error al cargar detalle', true);
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
