function setMovimientosFeedback(message, isError = false) {
    const feedback = document.getElementById('movimientos-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.toggle('is-error', isError);
}

function getMovimientoBadgeClass(tipo) {
    return tipo === 'entrada' ? 'is-entrada' : 'is-salida';
}

function formatMovimientoTipo(tipo) {
    return tipo === 'entrada' ? 'Entrada' : 'Salida';
}

function formatBasculaLabel(value) {
    const normalized = normalizeSiNo(value);
    if (normalized === 'si') return 'Si';
    if (normalized === 'no') return 'No';
    return value || 'No registrado';
}

function getFilteredMovimientos() {
    const { query, orden } = APP.admin.movimientosFilters;
    const queryLower = query.trim().toLowerCase();

    const filtered = APP.admin.movimientos.filter((movimiento) => {
        if (!queryLower) return true;

        const searchable = [
            movimiento.vehiculo?.placa,
            movimiento.conductor?.nombre,
            movimiento.usuario?.nombre,
            movimiento.auxiliar,
            movimiento.proveedor,
            movimiento.observaciones,
            movimiento.tipo
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchable.includes(queryLower);
    });

    return filtered.sort((a, b) => {
        if (orden === 'km_asc') return (a.kilometraje || 0) - (b.kilometraje || 0);
        if (orden === 'km_desc') return (b.kilometraje || 0) - (a.kilometraje || 0);

        const aTime = new Date(a.fecha_hora).getTime();
        const bTime = new Date(b.fecha_hora).getTime();
        return orden === 'fecha_asc' ? aTime - bTime : bTime - aTime;
    });
}

function updateMovimientosResults(total) {
    const results = document.getElementById('movimientos-results');
    if (!results) return;

    const label = total === 1 ? 'movimiento' : 'movimientos';
    results.textContent = `${total} ${label} en pantalla`;
}

function renderMovimientosManagementList() {
    const container = document.getElementById('movimientos-list');
    if (!container) return;

    const movimientos = getFilteredMovimientos();
    updateMovimientosResults(movimientos.length);

    if (movimientos.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay movimientos para los filtros seleccionados.</p>';
        return;
    }

    container.innerHTML = movimientos
        .map((m) => {
            const fecha = new Date(m.fecha_hora).toLocaleString();
            return `
                <article class="management-card">
                    <div class="management-card-content">
                        <h4>${m.vehiculo?.placa || 'Sin placa'} · ${m.conductor?.nombre || 'Sin conductor'}</h4>
                        <p>
                            <span class="status-badge ${getMovimientoBadgeClass(m.tipo)}">${formatMovimientoTipo(m.tipo)}</span>
                            Km: ${m.kilometraje || 0} · ${fecha}
                        </p>
                        <p>Operario: ${m.usuario?.nombre || 'N/A'} · Auxiliar: ${m.auxiliar || 'N/A'}</p>
                        <p>Proveedor/Destino: ${m.proveedor || 'N/A'} · Sacas: ${m.sacas ?? 'N/A'}</p>
                        <button type="button" class="btn-ghost btn-inline" data-action="view-movimiento" data-id="${m.id}">Ver detalle</button>
                    </div>
                </article>
            `;
        })
        .join('');
}

function resetMovimientosFilters() {
    APP.admin.movimientosFilters = {
        query: '',
        tipo: 'todos',
        fechaInicio: '',
        fechaFin: '',
        orden: 'fecha_desc'
    };

    const searchInput = document.getElementById('movimientos-search');
    const tipoSelect = document.getElementById('movimientos-tipo');
    const fechaInicioInput = document.getElementById('movimientos-fecha-inicio');
    const fechaFinInput = document.getElementById('movimientos-fecha-fin');
    const ordenSelect = document.getElementById('movimientos-orden');

    if (searchInput) searchInput.value = '';
    if (tipoSelect) tipoSelect.value = 'todos';
    if (fechaInicioInput) fechaInicioInput.value = '';
    if (fechaFinInput) fechaFinInput.value = '';
    if (ordenSelect) ordenSelect.value = 'fecha_desc';

    loadMovimientosManagement();
}

async function loadMovimientosManagement() {
    try {
        setMovimientosFeedback('Cargando movimientos...');
        const filters = { limit: 1000 };

        if (APP.admin.movimientosFilters.tipo !== 'todos') {
            filters.tipo = APP.admin.movimientosFilters.tipo;
        }
        if (APP.admin.movimientosFilters.fechaInicio) {
            filters.fecha_inicio = APP.admin.movimientosFilters.fechaInicio;
        }
        if (APP.admin.movimientosFilters.fechaFin) {
            filters.fecha_fin = APP.admin.movimientosFilters.fechaFin;
        }

        const movimientos = await API.getMovimientos(filters);
        APP.admin.movimientos = Array.isArray(movimientos) ? movimientos : [];
        renderMovimientosManagementList();
        setMovimientosFeedback('Historial actualizado.');
    } catch (error) {
        APP.admin.movimientos = [];
        renderMovimientosManagementList();
        setMovimientosFeedback(error.message || 'No se pudieron cargar los movimientos.', true);
    }
}

function closeMovimientoDetalleModal() {
    toggleModal('movimiento-detalle-modal', false);
}

function renderMovimientoDetalle(detalle) {
    const container = document.getElementById('movimiento-detalle-content');
    if (!container) return;

    const fecha = new Date(detalle.fecha_hora).toLocaleString();

    container.innerHTML = `
        <section class="chequeo-detalle-grid">
            <div class="chequeo-detalle-block">
                <h4>Cabecera</h4>
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p><strong>Tipo:</strong> <span class="status-badge ${getMovimientoBadgeClass(detalle.tipo)}">${formatMovimientoTipo(detalle.tipo)}</span></p>
                <p><strong>Vehiculo:</strong> ${detalle.vehiculo?.placa || 'N/A'} (${detalle.vehiculo?.marca || 'N/A'} ${detalle.vehiculo?.modelo || ''})</p>
                <p><strong>Conductor:</strong> ${detalle.conductor?.nombre || 'N/A'} · ${detalle.conductor?.cedula || 'N/A'}</p>
                <p><strong>Operario:</strong> ${detalle.usuario?.nombre || 'N/A'}</p>
                <p><strong>Kilometraje:</strong> ${detalle.kilometraje || 0} km</p>
            </div>
            <div class="chequeo-detalle-block">
                <h4>Datos de carga</h4>
                <p><strong>Auxiliar:</strong> ${detalle.auxiliar || 'No registrado'}</p>
                <p><strong>Proveedor / Destino:</strong> ${detalle.proveedor || 'No registrado'}</p>
                <p><strong>Bascula:</strong> ${formatBasculaLabel(detalle.bascula)}</p>
                <p><strong>Sacas:</strong> ${detalle.sacas ?? 'No registrado'}</p>
                <p><strong>Estado del cajon:</strong> ${detalle.cajon || 'No registrado'}</p>
            </div>
            ${detalle.observaciones ? `
                <div class="chequeo-detalle-block">
                    <h4>Observaciones</h4>
                    <p>${detalle.observaciones}</p>
                </div>
            ` : ''}
        </section>
    `;
}

async function openMovimientoDetalle(movimientoId) {
    try {
        const detalle = await API.getMovimiento(movimientoId);
        renderMovimientoDetalle(detalle);
        toggleModal('movimiento-detalle-modal', true);
    } catch (error) {
        await showAppAlert('Detalle no disponible', error.message || 'No se pudo cargar el detalle del movimiento.');
    }
}

function handleMovimientosListClick(e) {
    const btn = e.target.closest('[data-action="view-movimiento"]');
    if (!btn) return;

    const movimientoId = parseInt(btn.dataset.id, 10);
    if (!Number.isInteger(movimientoId)) return;

    openMovimientoDetalle(movimientoId);
}

function handleMovimientosRecientesClick(e) {
    const btn = e.target.closest('[data-action="view-movimiento"]');
    if (!btn) return;

    const movimientoId = parseInt(btn.dataset.id, 10);
    if (!Number.isInteger(movimientoId)) return;

    openMovimientoDetalle(movimientoId);
}
