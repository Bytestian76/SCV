/**
 * Admin Mantenimientos - CRUD de ordenes de mantenimiento
 */

function setMantenimientoFeedback(msg, isError) {
    const el = document.getElementById('mantenimientos-feedback');
    if (el) {
        el.textContent = msg;
        el.style.color = isError ? 'var(--error-color, #dc3545)' : 'var(--text-secondary, #666)';
    }
}

async function loadMantenimientosManagement() {
    initMantenimientoEventListeners();
    await loadMantenimientosList();
}

function getFilteredMantenimientos() {
    const estado = document.getElementById('mantenimientos-estado')?.value || '';
    const tipo = document.getElementById('mantenimientos-tipo')?.value || '';
    const search = document.getElementById('mantenimientos-search')?.value?.trim() || '';
    const filters = {};
    if (estado) filters.estado = estado;
    if (tipo) filters.tipo = tipo;
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
        listEl.innerHTML = '<div class="empty-state"><p class="helper-text">No hay mantenimientos registrados.</p></div>';
        if (resultsEl) resultsEl.textContent = '0 resultados';
        return;
    }

    if (resultsEl) resultsEl.textContent = `${data.length} resultado(s)`;

    const estadoMeta = {
        pendiente:     { label: 'Pendiente',     cls: 'is-pendiente' },
        en_progreso:   { label: 'En progreso',   cls: 'is-en_progreso' },
        completado:    { label: 'Completado',    cls: 'is-completado' },
        cancelado:     { label: 'Cancelado',     cls: 'is-cancelado' }
    };
    const tipoLabels = { correctivo: 'Correctivo', preventivo: 'Preventivo' };

    listEl.innerHTML = data.map(m => {
        const st = estadoMeta[m.estado] || { label: m.estado, cls: 'is-pendiente' };
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
                        <span class="item-meta-tag item-tipo-${m.tipo}">${tipoLabels[m.tipo] || m.tipo}</span>
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
                        ${m.estado === 'pendiente' ? `<button class="btn-item btn-item-primary" onclick="cambiarEstadoMantenimiento(${m.id},'en_progreso')"><img src="assets/icons/arrow-clockwise.svg" alt="" class="btn-inline-icon" aria-hidden="true">Iniciar</button>` : ''}
                        ${m.estado === 'en_progreso' ? `<button class="btn-item btn-item-success" onclick="cambiarEstadoMantenimiento(${m.id},'completado')"><img src="assets/icons/clipboard-check.svg" alt="" class="btn-inline-icon" aria-hidden="true">Completar</button>` : ''}
                        ${['pendiente','en_progreso'].includes(m.estado) ? `<button class="btn-item btn-item-muted" onclick="cambiarEstadoMantenimiento(${m.id},'cancelado')"><img src="assets/icons/x-lg.svg" alt="" class="btn-inline-icon" aria-hidden="true">Cancelar</button>` : ''}
                        <button class="btn-item btn-item-ghost" onclick="verDetalleMantenimiento(${m.id})"><img src="assets/icons/search.svg" alt="" class="btn-inline-icon" aria-hidden="true">Ver</button>
                        ${window.APP?.user?.rol === 'admin' ? `<button class="btn-item btn-item-danger" onclick="eliminarMantenimiento(${m.id})"><img src="assets/icons/x-lg.svg" alt="" class="btn-inline-icon" aria-hidden="true"></button>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

async function cambiarEstadoMantenimiento(id, nuevoEstado) {
    const labels = { pendiente: 'Pendiente', en_progreso: 'En progreso', completado: 'Completado', cancelado: 'Cancelado' };
    const confirmed = await showAppConfirm(`¿Cambiar estado a "${labels[nuevoEstado] || nuevoEstado}"?`);
    if (!confirmed) return;

    try {
        await API.updateEstadoMantenimiento(id, nuevoEstado);
        setMantenimientoFeedback(`Estado cambiado a "${labels[nuevoEstado] || nuevoEstado}"`);
        await loadMantenimientosList();
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

        const estadoLabels = { pendiente: 'Pendiente', en_progreso: 'En progreso', completado: 'Completado', cancelado: 'Cancelado' };
        const tipoLabels = { correctivo: 'Correctivo', preventivo: 'Preventivo' };
        const nextStates = { pendiente: 'en_progreso', en_progreso: 'completado' };

        content.innerHTML = `
            <div class="item-details">
                <p><strong>Vehículo:</strong> ${m.vehiculo ? `${m.vehiculo.placa} - ${m.vehiculo.marca} ${m.vehiculo.modelo}` : 'N/A'}</p>
                <p><strong>Tipo:</strong> ${tipoLabels[m.tipo] || m.tipo}</p>
                <p><strong>Estado:</strong> ${estadoLabels[m.estado] || m.estado}</p>
                ${m.descripcion ? `<p><strong>Descripción:</strong> ${m.descripcion}</p>` : ''}
                ${m.kilometraje ? `<p><strong>Kilometraje:</strong> ${m.kilometraje}</p>` : ''}
                <p><strong>Creado:</strong> ${new Date(m.fecha_creacion).toLocaleString()}</p>
                ${m.creador ? `<p><strong>Por:</strong> ${m.creador.nombre}</p>` : ''}
                ${m.chequeo_origen_id ? `<p><strong>Origen:</strong> Chequeo #${m.chequeo_origen_id}</p>` : ''}
                ${m.fecha_actualizacion ? `<p><strong>Actualizado:</strong> ${new Date(m.fecha_actualizacion).toLocaleString()}</p>` : ''}
                ${m.items && m.items.length > 0 ? `
                    <hr>
                    <p><strong>Items (${m.items.length}):</strong></p>
                    <ul>${m.items.map(i => `<li>${i.seccion ? `[${i.seccion}] ` : ''}${i.item || ''}${i.observacion ? `: ${i.observacion}` : ''}${i.realizado ? ' ✅' : ' ❌'}</li>`).join('')}</ul>
                ` : ''}
            </div>
        `;

        if (nextStates[m.estado]) {
            estadoBtn.style.display = 'inline-block';
            estadoBtn.textContent = `Marcar como "${estadoLabels[nextStates[m.estado]]}"`;
            estadoBtn.onclick = async () => {
                await cambiarEstadoMantenimiento(id, nextStates[m.estado]);
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

async function eliminarMantenimiento(id) {
    const confirmed = await showAppConfirm('¿Eliminar este mantenimiento? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
        await API.deleteMantenimiento(id);
        setMantenimientoFeedback('Mantenimiento eliminado');
        await loadMantenimientosList();
    } catch (err) {
        setMantenimientoFeedback(err.message || 'Error al eliminar', true);
    }
}

function openMantenimientoForm(data) {
    document.getElementById('mantenimiento-form-title').textContent = data ? 'Editar mantenimiento' : 'Nuevo mantenimiento';
    document.getElementById('mantenimiento-form').reset();
    document.getElementById('mantenimiento-form').dataset.editId = data?.id || '';
    if (data) {
        document.getElementById('mt-tipo').value = data.tipo;
        document.getElementById('mt-descripcion').value = data.descripcion || '';
        document.getElementById('mt-kilometraje').value = data.kilometraje || '';
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

    const data = {
        vehiculo_id: parseInt(document.getElementById('mt-vehiculo')?.value),
        tipo: document.getElementById('mt-tipo').value,
        descripcion: document.getElementById('mt-descripcion').value || null,
        kilometraje: document.getElementById('mt-kilometraje').value ? parseInt(document.getElementById('mt-kilometraje').value) : null,
    };

    if (!data.vehiculo_id) {
        setMantenimientoFeedback('Debes seleccionar un vehículo', true);
        return;
    }

    try {
        if (editId) {
            await API.updateMantenimiento(parseInt(editId), data);
            setMantenimientoFeedback('Mantenimiento actualizado');
        } else {
            await API.createMantenimiento(data);
            setMantenimientoFeedback('Mantenimiento creado');
        }
        toggleModal('mantenimiento-modal', false);
        await loadMantenimientosList();
    } catch (err) {
        setMantenimientoFeedback(err.message || 'Error al guardar', true);
    }
}

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

    ['mantenimientos-estado', 'mantenimientos-tipo', 'mantenimientos-search'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', loadMantenimientosList);
        if (el && (el.type === 'search' || el.tagName === 'INPUT')) el.addEventListener('input', () => setTimeout(loadMantenimientosList, 300));
    });

    const clearFiltersBtn = document.getElementById('mantenimientos-clear-filters');
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => {
        const estadoEl = document.getElementById('mantenimientos-estado');
        const tipoEl = document.getElementById('mantenimientos-tipo');
        const searchEl = document.getElementById('mantenimientos-search');
        if (estadoEl) estadoEl.value = '';
        if (tipoEl) tipoEl.value = '';
        if (searchEl) searchEl.value = '';
        loadMantenimientosList();
    });
}

// Auto-init on first use via loadMantenimientosManagement
