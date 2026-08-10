function setConductoresFeedback(message, isError = false) {
    const feedback = document.getElementById('conductores-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.toggle('is-error', isError);
}

function resetConductoresFilters() {
    APP.admin.conductoresFilters = {
        query: '',
        estado: 'todos',
        categoria: 'todas',
        orden: 'nombre_asc',
        licencia: ''
    };

    const conductoresSearch = document.getElementById('conductores-search');
    const conductoresEstado = document.getElementById('conductores-estado');
    const conductoresCategoria = document.getElementById('conductores-categoria');
    const conductoresOrden = document.getElementById('conductores-orden');
    const conductoresLicencia = document.getElementById('conductores-licencia');

    if (conductoresSearch) conductoresSearch.value = '';
    if (conductoresEstado) conductoresEstado.value = 'todos';
    if (conductoresCategoria) conductoresCategoria.value = 'todas';
    if (conductoresOrden) conductoresOrden.value = 'nombre_asc';
    if (conductoresLicencia) conductoresLicencia.value = '';

    renderConductoresList();
}

async function loadConductoresManagement() {
    try {
        setConductoresFeedback('Cargando conductores...');
        APP.admin.conductores = await API.getConductores();
        renderConductoresList();
        setConductoresFeedback(`${APP.admin.conductores.length} conductores cargados.`);
    } catch (error) {
        setConductoresFeedback(error.message || 'No se pudo cargar la lista de conductores.', true);
    }
}

function getFilteredConductores(conductores) {
    const filters = APP.admin.conductoresFilters;
    const query = normalizeText(filters.query).trim();
    const licenciaFilter = normalizeText(filters.licencia).trim();

    const filtered = conductores.filter((conductor) => {
        const estadoMatch =
            filters.estado === 'todos'
            || (filters.estado === 'activos' && conductor.activo)
            || (filters.estado === 'inactivos' && !conductor.activo);

        const categoriaMatch =
            filters.categoria === 'todas'
            || normalizeText(conductor.categoria) === normalizeText(filters.categoria);

        const licenciaMatch =
            !licenciaFilter
            || normalizeText(conductor.licencia).includes(licenciaFilter);

        if (!estadoMatch || !categoriaMatch || !licenciaMatch) {
            return false;
        }

        if (!query) {
            return true;
        }

        const searchable = [
            conductor.nombre,
            conductor.cedula,
            conductor.licencia,
            conductor.fecha_venc_licencia,
            conductor.categoria,
            conductor.activo ? 'activo' : 'inactivo'
        ]
            .map(normalizeText)
            .join(' ');

        return searchable.includes(query);
    });

    return filtered.sort((a, b) => {
        if (filters.orden === 'nombre_desc') {
            return normalizeText(b.nombre).localeCompare(normalizeText(a.nombre));
        }
        if (filters.orden === 'cedula_asc') {
            return normalizeText(a.cedula).localeCompare(normalizeText(b.cedula));
        }
        if (filters.orden === 'categoria_asc') {
            const byCategoria = normalizeText(a.categoria).localeCompare(normalizeText(b.categoria));
            if (byCategoria !== 0) return byCategoria;
            return normalizeText(a.nombre).localeCompare(normalizeText(b.nombre));
        }

        return normalizeText(a.nombre).localeCompare(normalizeText(b.nombre));
    });
}

function updateConductoresResults(visible, total) {
    const results = document.getElementById('conductores-results');
    if (!results) return;

    results.textContent = `Mostrando ${visible} de ${total} conductores.`;
}

function renderConductoresList() {
    const container = document.getElementById('conductores-list');
    if (!container) return;

    const filteredConductores = getFilteredConductores(APP.admin.conductores);
    updateConductoresResults(filteredConductores.length, APP.admin.conductores.length);

    if (!APP.admin.conductores.length) {
        container.innerHTML = '<p class="empty-message">No hay conductores registrados.</p>';
        return;
    }

    if (!filteredConductores.length) {
        container.innerHTML = '<p class="empty-message">No hay resultados con los filtros actuales.</p>';
        return;
    }

    container.innerHTML = filteredConductores.map((conductor) => `
        <tr>
            <td>
                <div class="cell-main">${conductor.nombre}</div>
                <div class="cell-sub">C.C: ${conductor.cedula}</div>
            </td>
            <td>
                <div>Licencia: ${conductor.licencia}</div>
                <div class="cell-sub">Categoría: <span class="badge badge-neutral">${conductor.categoria}</span></div>
            </td>
            <td>
                <div class="cell-sub">Licencia Vence: ${formatVencimientoLabel(conductor.fecha_venc_licencia)}</div>
            </td>
            <td>
                <span class="badge ${conductor.activo ? 'badge-success' : 'badge-neutral'}">${conductor.activo ? 'ACTIVO' : 'INACTIVO'}</span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon" title="Ver Detalles" data-action="ver" data-id="${conductor.id}">
                        <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <button class="btn-icon" title="Editar" data-action="edit" data-id="${conductor.id}">
                        <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-icon ${conductor.activo ? 'danger' : ''}" title="${conductor.activo ? 'Desactivar' : 'Activar'}" data-action="${conductor.activo ? 'deactivate' : 'activate'}" data-id="${conductor.id}">
                        <svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openConductorForm(conductor = null) {
    const title = document.getElementById('conductor-form-title');
    const form = document.getElementById('conductor-form');
    if (!title || !form) return;

    APP.admin.editingConductorId = conductor?.id || null;
    title.textContent = conductor ? 'Editar conductor' : 'Nuevo conductor';

    form.reset();
    if (conductor) {
        form.nombre.value = conductor.nombre || '';
        form.cedula.value = conductor.cedula || '';
        form.licencia.value = conductor.licencia || '';
        form.categoria.value = conductor.categoria || '';
        form.fecha_venc_licencia.value = conductor.fecha_venc_licencia || '';
    }

    toggleModal('conductor-modal', true);
    form.nombre.focus();
}

function closeConductorForm() {
    const form = document.getElementById('conductor-form');
    APP.admin.editingConductorId = null;

    if (form) {
        form.reset();
    }
    toggleModal('conductor-modal', false);
}

async function handleConductorSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    payload.fecha_venc_licencia = payload.fecha_venc_licencia || null;

    try {
        if (APP.admin.editingConductorId) {
            await API.updateConductor(APP.admin.editingConductorId, payload);
            setConductoresFeedback('Conductor actualizado correctamente.');
        } else {
            await API.createConductor(payload);
            setConductoresFeedback('Conductor creado correctamente.');
        }

        closeConductorForm();
        await loadConductoresManagement();
    } catch (error) {
        setConductoresFeedback(error.message || 'No se pudo guardar el conductor.', true);
    }
}

async function handleConductoresListClick(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id, 10);
    const conductor = APP.admin.conductores.find(c => c.id === id);

    if (!conductor) return;

    if (action === 'edit') {
        openConductorForm(conductor);
    } else if (action === 'deactivate') {
        const confirmed = await showAppConfirm(
            'Desactivar conductor',
            `Se desactivará ${conductor.nombre}. Continuará visible en el historial como inactivo.`
        );
        if (!confirmed) return;

        try {
            await API.deleteConductor(id);
            setConductoresFeedback(`Conductor ${conductor.nombre} desactivado.`);
            await loadConductoresManagement();
        } catch (error) {
            setConductoresFeedback(error.message || 'No se pudo desactivar el conductor.', true);
        }
    } else if (action === 'activate') {
        const confirmed = await showAppConfirm(
            'Reactivar conductor',
            `${conductor.nombre} volverá a estar disponible para asignaciones.`
        );
        if (!confirmed) return;

        try {
            await API.activateConductor(id);
            setConductoresFeedback(`Conductor ${conductor.nombre} reactivado.`);
            await loadConductoresManagement();
        } catch (error) {
            setConductoresFeedback(error.message || 'No se pudo reactivar el conductor.', true);
        }
    } else if (action === 'ver') {
        openConductorDetails(conductor);
    }
}

function openConductorDetails(conductor) {
    const modal = document.getElementById('conductor-detalle-modal');
    if (!modal) return;

    document.getElementById('detalle-cond-nombre').textContent = conductor.nombre;
    const estadoBadge = document.getElementById('detalle-cond-estado');
    estadoBadge.textContent = conductor.activo ? 'ACTIVO' : 'INACTIVO';
    estadoBadge.className = 'badge ' + (conductor.activo ? 'badge-success' : 'badge-neutral');

    document.getElementById('detalle-cond-cedula').textContent = conductor.cedula;
    document.getElementById('detalle-cond-licencia').textContent = conductor.licencia;
    document.getElementById('detalle-cond-categoria').textContent = conductor.categoria;
    document.getElementById('detalle-cond-vence').textContent = formatVencimientoLabel(conductor.fecha_venc_licencia);

    toggleModal('conductor-detalle-modal', true);
}
