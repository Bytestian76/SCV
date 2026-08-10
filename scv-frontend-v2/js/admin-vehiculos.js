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
        <tr>
            <td>
                <div class="cell-main">${vehiculo.placa}</div>
                <div class="cell-sub">ID: ${vehiculo.id}</div>
            </td>
            <td>
                <div style="font-weight: 500; color: var(--text-main);">${vehiculo.marca}</div>
            </td>
            <td>
                <div>Modelo: ${vehiculo.modelo}</div>
                <div class="cell-sub">Año: ${vehiculo.año} | Km: ${vehiculo.kilometraje ?? 0}</div>
            </td>
            <td>
                <span class="badge ${vehiculo.activo ? 'badge-success' : 'badge-neutral'}">${vehiculo.activo ? 'ACTIVO' : 'INACTIVO'}</span>
            </td>
            <td>
                <div class="cell-sub">SOAT: ${formatVencimientoLabel(vehiculo.fecha_venc_soat)}</div>
                <div class="cell-sub">RTM: ${formatVencimientoLabel(vehiculo.fecha_venc_rtm)}</div>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon" title="Ver Detalles" data-action="ver" data-id="${vehiculo.id}">
                        <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <button class="btn-icon" title="Historial" data-action="historial" data-id="${vehiculo.id}">
                        <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </button>
                    <button class="btn-icon" title="Editar" data-action="edit" data-id="${vehiculo.id}">
                        <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-icon ${vehiculo.activo ? 'danger' : ''}" title="${vehiculo.activo ? 'Desactivar' : 'Activar'}" data-action="${vehiculo.activo ? 'deactivate' : 'activate'}" data-id="${vehiculo.id}">
                        <svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                    </button>
                </div>
            </td>
        </tr>
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
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id, 10);
    const vehiculo = APP.admin.vehiculos.find(v => v.id === id);

    if (!vehiculo) return;

    if (action === 'edit') {
        openVehiculoForm(vehiculo);
    } else if (action === 'deactivate') {
        const confirmed = await showAppConfirm(
            'Desactivar vehículo',
            `Se desactivará ${vehiculo.placa}. Podrás verlo como inactivo en la flota.`
        );
        if (!confirmed) return;

        try {
            await API.deleteVehiculo(id);
            setVehiculosFeedback(`Vehículo ${vehiculo.placa} desactivado.`);
            await loadVehiculosManagement();
        } catch (error) {
            setVehiculosFeedback(error.message || 'No se pudo desactivar el vehículo.', true);
        }
    } else if (action === 'activate') {
        const confirmed = await showAppConfirm(
            'Reactivar vehículo',
            `${vehiculo.placa} volverá a estar disponible para operaciones.`
        );
        if (!confirmed) return;

        try {
            await API.activateVehiculo(id);
            setVehiculosFeedback(`Vehículo ${vehiculo.placa} reactivado.`);
            await loadVehiculosManagement();
        } catch (error) {
            setVehiculosFeedback(error.message || 'No se pudo reactivar el vehículo.', true);
        }
    } else if (action === 'historial') {
        openVehiculoHistorial(vehiculo);
    } else if (action === 'ver') {
        openVehiculoDetails(vehiculo);
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

function openVehiculoDetails(vehiculo) {
    const modal = document.getElementById('vehiculo-detalle-modal');
    if (!modal) return;

    document.getElementById('detalle-vh-placa').textContent = vehiculo.placa;
    const estadoBadge = document.getElementById('detalle-vh-estado');
    estadoBadge.textContent = vehiculo.activo ? 'ACTIVO' : 'INACTIVO';
    estadoBadge.className = 'badge ' + (vehiculo.activo ? 'badge-success' : 'badge-neutral');

    document.getElementById('detalle-vh-marca-modelo').textContent = `${vehiculo.marca} ${vehiculo.modelo}`;
    document.getElementById('detalle-vh-anio').textContent = vehiculo.año;
    document.getElementById('detalle-vh-km').textContent = `${vehiculo.kilometraje ?? 0} km`;
    document.getElementById('detalle-vh-empresa').textContent = vehiculo.empresa || 'N/A';
    document.getElementById('detalle-vh-soat').textContent = formatVencimientoLabel(vehiculo.fecha_venc_soat);
    document.getElementById('detalle-vh-rtm').textContent = formatVencimientoLabel(vehiculo.fecha_venc_rtm);
    document.getElementById('detalle-vh-especs').textContent = vehiculo.especificaciones || 'Sin especificaciones';

    const btnHistorial = document.getElementById('vehiculo-btn-historial');
    if (btnHistorial) {
        btnHistorial.onclick = () => {
            toggleModal('vehiculo-detalle-modal', false);
            openVehiculoHistorial(vehiculo);
        };
    }

    toggleModal('vehiculo-detalle-modal', true);
}
