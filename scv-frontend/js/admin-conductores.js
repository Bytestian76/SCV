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
        <article class="management-item">
            <div class="management-item-main">
                <p class="management-item-title">${conductor.nombre}</p>
                <p class="management-item-subtitle">Cédula: ${conductor.cedula} · Licencia: ${conductor.licencia}</p>
                <p class="management-item-meta">Categoría: ${conductor.categoria}</p>
                <p class="management-item-meta">Vence licencia: ${formatVencimientoLabel(conductor.fecha_venc_licencia)}</p>
            </div>
            <div class="management-item-actions">
                <span class="status-badge ${conductor.activo ? 'is-active' : 'is-inactive'}">${conductor.activo ? 'Activo' : 'Inactivo'}</span>
                <button type="button" class="btn-ghost btn-item" data-action="edit" data-id="${conductor.id}">Editar</button>
                <button type="button" class="btn-danger btn-item" data-action="deactivate" data-id="${conductor.id}" ${conductor.activo ? '' : 'disabled'}>Desactivar</button>
            </div>
        </article>
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
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const conductorId = parseInt(button.dataset.id, 10);
    const conductor = APP.admin.conductores.find((item) => item.id === conductorId);

    if (!conductor) return;

    if (button.dataset.action === 'edit') {
        openConductorForm(conductor);
        return;
    }

    if (button.dataset.action === 'deactivate') {
        const confirmed = await showAppConfirm(
            'Desactivar conductor',
            `Se desactivará ${conductor.nombre}. Continuará visible en el historial como inactivo.`
        );
        if (!confirmed) return;

        try {
            await API.deleteConductor(conductorId);
            setConductoresFeedback(`Conductor ${conductor.nombre} desactivado.`);
            await loadConductoresManagement();
        } catch (error) {
            setConductoresFeedback(error.message || 'No se pudo desactivar el conductor.', true);
        }
    }
}
