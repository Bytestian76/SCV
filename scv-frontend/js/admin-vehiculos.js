function setVehiculosFeedback(message, isError = false) {
    const feedback = document.getElementById('vehiculos-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.toggle('is-error', isError);
}

async function loadVehiculosManagement() {
    try {
        setVehiculosFeedback('Cargando flota...');
        APP.admin.vehiculos = await API.getVehiculos();
        renderVehiculosList();
        setVehiculosFeedback(`${APP.admin.vehiculos.length} vehículos cargados.`);
    } catch (error) {
        setVehiculosFeedback(error.message || 'No se pudo cargar la flota.', true);
    }
}

function resetVehiculosFilters() {
    APP.admin.filters = {
        query: '',
        estado: 'todos',
        orden: 'placa_asc',
        anioMin: '',
        anioMax: ''
    };

    const vehiculosSearch = document.getElementById('vehiculos-search');
    const vehiculosEstado = document.getElementById('vehiculos-estado');
    const vehiculosOrden = document.getElementById('vehiculos-orden');
    const vehiculosAnioMin = document.getElementById('vehiculos-anio-min');
    const vehiculosAnioMax = document.getElementById('vehiculos-anio-max');

    if (vehiculosSearch) vehiculosSearch.value = '';
    if (vehiculosEstado) vehiculosEstado.value = 'todos';
    if (vehiculosOrden) vehiculosOrden.value = 'placa_asc';
    if (vehiculosAnioMin) vehiculosAnioMin.value = '';
    if (vehiculosAnioMax) vehiculosAnioMax.value = '';

    renderVehiculosList();
}

function getFilteredVehiculos(vehiculos) {
    const filters = APP.admin.filters;
    const query = normalizeText(filters.query).trim();

    const filtered = vehiculos.filter((vehiculo) => {
        const estadoMatch =
            filters.estado === 'todos'
            || (filters.estado === 'activos' && vehiculo.activo)
            || (filters.estado === 'inactivos' && !vehiculo.activo);

        const anio = Number(vehiculo.año);
        const anioMin = filters.anioMin ? Number(filters.anioMin) : null;
        const anioMax = filters.anioMax ? Number(filters.anioMax) : null;

        const anioMinMatch = anioMin === null || anio >= anioMin;
        const anioMaxMatch = anioMax === null || anio <= anioMax;

        if (!estadoMatch || !anioMinMatch || !anioMaxMatch) {
            return false;
        }

        if (!query) {
            return true;
        }

        const searchable = [
            vehiculo.placa,
            vehiculo.marca,
            vehiculo.modelo,
            vehiculo.empresa,
            vehiculo.kilometraje,
            vehiculo.año,
            vehiculo.fecha_venc_soat,
            vehiculo.fecha_venc_rtm,
            vehiculo.activo ? 'activo' : 'inactivo'
        ]
            .map(normalizeText)
            .join(' ');

        return searchable.includes(query);
    });

    return filtered.sort((a, b) => {
        if (filters.orden === 'placa_desc') {
            return normalizeText(b.placa).localeCompare(normalizeText(a.placa));
        }
        if (filters.orden === 'anio_desc') {
            return Number(b.año) - Number(a.año);
        }
        if (filters.orden === 'anio_asc') {
            return Number(a.año) - Number(b.año);
        }
        if (filters.orden === 'marca_asc') {
            const byMarca = normalizeText(a.marca).localeCompare(normalizeText(b.marca));
            if (byMarca !== 0) return byMarca;
            return normalizeText(a.modelo).localeCompare(normalizeText(b.modelo));
        }

        return normalizeText(a.placa).localeCompare(normalizeText(b.placa));
    });
}

function updateVehiculosResults(visible, total) {
    const results = document.getElementById('vehiculos-results');
    if (!results) return;

    results.textContent = `Mostrando ${visible} de ${total} vehículos.`;
}

function renderVehiculosList() {
    const container = document.getElementById('vehiculos-list');
    if (!container) return;

    const filteredVehiculos = getFilteredVehiculos(APP.admin.vehiculos);
    updateVehiculosResults(filteredVehiculos.length, APP.admin.vehiculos.length);

    if (!APP.admin.vehiculos.length) {
        container.innerHTML = '<p class="empty-message">No hay vehículos registrados.</p>';
        return;
    }

    if (!filteredVehiculos.length) {
        container.innerHTML = '<p class="empty-message">No hay resultados con los filtros actuales.</p>';
        return;
    }

    container.innerHTML = filteredVehiculos.map((vehiculo) => `
        <article class="management-item">
            <div class="management-item-main">
                <p class="management-item-title">${vehiculo.placa}</p>
                <p class="management-item-subtitle">${vehiculo.marca} ${vehiculo.modelo} · ${vehiculo.año}</p>
                <p class="management-item-meta">Empresa: ${vehiculo.empresa || 'Sin asignar'}</p>
                <p class="management-item-meta">Kilometraje actual: ${vehiculo.kilometraje ?? 0} km</p>
                <p class="management-item-meta">SOAT: ${formatVencimientoLabel(vehiculo.fecha_venc_soat)} · RTM: ${formatVencimientoLabel(vehiculo.fecha_venc_rtm)}</p>
            </div>
            <div class="management-item-actions">
                <span class="status-badge ${vehiculo.activo ? 'is-active' : 'is-inactive'}">${vehiculo.activo ? 'Activo' : 'Inactivo'}</span>
                <button type="button" class="btn-ghost btn-item" data-action="historial" data-id="${vehiculo.id}">Historial</button>
                <button type="button" class="btn-ghost btn-item" data-action="edit" data-id="${vehiculo.id}">Editar</button>
                <button type="button" class="${vehiculo.activo ? 'btn-danger' : 'btn-ghost'} btn-item" data-action="${vehiculo.activo ? 'deactivate' : 'activate'}" data-id="${vehiculo.id}">${vehiculo.activo ? 'Desactivar' : 'Reactivar'}</button>
            </div>
        </article>
    `).join('');
}

function openVehiculoForm(vehiculo = null) {
    const title = document.getElementById('vehiculo-form-title');
    const form = document.getElementById('vehiculo-form');
    if (!title || !form) return;

    APP.admin.editingVehiculoId = vehiculo?.id || null;
    title.textContent = vehiculo ? 'Editar vehículo' : 'Nuevo vehículo';

    form.reset();
    if (vehiculo) {
        form.placa.value = vehiculo.placa || '';
        form.marca.value = vehiculo.marca || '';
        form.modelo.value = vehiculo.modelo || '';
        form['año'].value = vehiculo.año || '';
        form.kilometraje.value = vehiculo.kilometraje ?? 0;
        form.empresa.value = vehiculo.empresa || '';
        form.fecha_venc_soat.value = vehiculo.fecha_venc_soat || '';
        form.fecha_venc_rtm.value = vehiculo.fecha_venc_rtm || '';
        if (form.especificaciones) {
            form.especificaciones.value = vehiculo.especificaciones || '';
        }
    }

    toggleModal('vehiculo-modal', true);
    form.placa.focus();
}

function closeVehiculoForm() {
    const form = document.getElementById('vehiculo-form');
    APP.admin.editingVehiculoId = null;

    if (form) {
        form.reset();
    }
    toggleModal('vehiculo-modal', false);
}

async function handleVehiculoSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    payload.año = parseInt(payload.año, 10);
    payload.kilometraje = parseInt(payload.kilometraje, 10);
    payload.fecha_venc_soat = payload.fecha_venc_soat || null;
    payload.fecha_venc_rtm = payload.fecha_venc_rtm || null;

    try {
        if (APP.admin.editingVehiculoId) {
            await API.updateVehiculo(APP.admin.editingVehiculoId, payload);
            setVehiculosFeedback('Vehículo actualizado correctamente.');
        } else {
            await API.createVehiculo(payload);
            setVehiculosFeedback('Vehículo creado correctamente.');
        }

        closeVehiculoForm();
        await loadVehiculosManagement();
    } catch (error) {
        setVehiculosFeedback(error.message || 'No se pudo guardar el vehículo.', true);
    }
}

async function handleVehiculosListClick(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const vehiculoId = parseInt(button.dataset.id, 10);
    const vehiculo = APP.admin.vehiculos.find((item) => item.id === vehiculoId);

    if (!vehiculo) return;

    if (button.dataset.action === 'historial') {
        openVehiculoHistorial(vehiculo);
        return;
    }

    if (button.dataset.action === 'edit') {
        openVehiculoForm(vehiculo);
        return;
    }

    if (button.dataset.action === 'deactivate') {
        const confirmed = await showAppConfirm(
            'Desactivar vehículo',
            `Se desactivará ${vehiculo.placa}. Podrás verlo como inactivo en la flota.`
        );
        if (!confirmed) return;

        try {
            await API.deleteVehiculo(vehiculoId);
            setVehiculosFeedback(`Vehículo ${vehiculo.placa} desactivado.`);
            await loadVehiculosManagement();
        } catch (error) {
            setVehiculosFeedback(error.message || 'No se pudo desactivar el vehículo.', true);
        }
    }

    if (button.dataset.action === 'activate') {
        const confirmed = await showAppConfirm(
            'Reactivar vehículo',
            `${vehiculo.placa} volverá a estar disponible para operaciones.`
        );
        if (!confirmed) return;

        try {
            await API.activateVehiculo(vehiculoId);
            setVehiculosFeedback(`Vehículo ${vehiculo.placa} reactivado.`);
            await loadVehiculosManagement();
        } catch (error) {
            setVehiculosFeedback(error.message || 'No se pudo reactivar el vehículo.', true);
        }
    }
}

async function openVehiculoHistorial(vehiculo) {
    const title = document.getElementById('vehiculo-historial-title');
    const specsText = document.getElementById('vh-especificaciones-texto');
    const timeline = document.getElementById('vehiculo-historial-timeline');
    const closeBtn = document.getElementById('vehiculo-historial-close-btn');

    if (title) title.textContent = `Historial de Mantenimientos - ${vehiculo.placa}`;
    if (specsText) specsText.textContent = vehiculo.especificaciones || 'Sin especificaciones registradas.';
    
    if (timeline) timeline.innerHTML = '<p class="helper-text">Cargando historial...</p>';
    
    if (closeBtn) {
        closeBtn.onclick = () => toggleModal('vehiculo-historial-modal', false);
    }

    toggleModal('vehiculo-historial-modal', true);

    try {
        const history = await API.getVehiculoHistorial(vehiculo.id);
        if (!timeline) return;

        if (!history || history.length === 0) {
            timeline.innerHTML = '<p class="helper-text">No se registran mantenimientos finalizados para este vehículo.</p>';
            return;
        }

        timeline.innerHTML = history.map(ev => {
            const timeAgo = formatTimeAgo(ev.fecha);
            return `
                <div class="timeline-item" style="margin-bottom: 15px; border-left: 3px solid #1f6a43; padding-left: 10px; margin-left: 5px;">
                    <div class="timeline-item-header" style="display: flex; justify-content: space-between; font-size: 0.9em; color: #666; font-weight: bold;">
                        <span>${ev.titulo}</span>
                        <span style="font-weight: normal; color: #888;">${timeAgo} (${ev.fecha})</span>
                    </div>
                    <p style="margin: 5px 0 0 0; font-size: 0.95em; color: #333;">${ev.descripcion}</p>
                    <div style="font-size: 0.85em; color: #777; margin-top: 3px;">Responsable: ${ev.responsable}</div>
                </div>
            `;
        }).join('');
    } catch (err) {
        if (timeline) timeline.innerHTML = '<p class="helper-text">Error al cargar el historial.</p>';
    }
}

function formatTimeAgo(dateString) {
    if (!dateString) return '';
    const formattedDate = dateString.replace(' ', 'T');
    const date = new Date(formattedDate);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hora(s)`;
    return `Hace ${diffDays} día(s)`;
}
