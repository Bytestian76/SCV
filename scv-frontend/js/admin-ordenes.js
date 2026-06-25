/**
 * Admin - Gestión de Órdenes de Trabajo
 */

function setOrdenesFeedback(message, isError = false) {
    const feedback = document.getElementById('ordenes-feedback');
    if (!feedback) return;
    feedback.textContent = message;
    feedback.style.color = isError ? '#b82318' : '';
    setTimeout(() => { feedback.textContent = ''; }, 4000);
}

const PRIORIDADES_ORDEN = ["baja", "media", "alta", "critica"];

const ESTADOS_ORDEN = ["pendiente", "asignada", "en_progreso", "completada", "cancelada"];

const LABEL_PRIORIDAD_O = {
    baja: "Baja", media: "Media", alta: "Alta", critica: "Crítica", urgente: "Urgente",
};

const LABEL_ESTADO_O = {
    pendiente: "Pendiente", asignada: "Asignada", en_progreso: "En progreso",
    completada: "Completada", cancelada: "Cancelada", pausada: "Pausada",
};

function loadOrdenesManagement() {
    const userRole = APP.user?.rol;
    const isAdmin = userRole === CONFIG.ROLES.ADMIN || userRole === CONFIG.ROLES.JEFE_MECANICOS;

    const nuevoBtn = document.getElementById('orden-nuevo-btn');
    if (nuevoBtn) nuevoBtn.style.display = isAdmin ? '' : 'none';

    if (!APP.admin.ordenesFilters) APP.admin.ordenesFilters = { query: '', estado: 'todas', prioridad: 'todas' };
    renderOrdenesList();
}

async function renderOrdenesList() {
    const container = document.getElementById('ordenes-list');
    if (!container) return;

    container.innerHTML = '<p class="helper-text">Cargando...</p>';

    try {
        const filters = APP.admin?.ordenesFilters || {};
        const params = {};
        if (filters.estado && filters.estado !== 'todas') params.estado = filters.estado;
        if (filters.prioridad && filters.prioridad !== 'todas') params.prioridad = filters.prioridad;
        if (filters.query) params.search = filters.query;

        const ordenes = await API.getOrdenesTrabajo(params);
        APP.admin.ordenes = ordenes || [];

        if (!ordenes || ordenes.length === 0) {
            container.innerHTML = '<div class="empty-state"><p class="helper-text">No hay órdenes de trabajo.</p></div>';
            return;
        }

        const userRole = APP.user?.rol;
        const isAdmin = userRole === CONFIG.ROLES.ADMIN || userRole === CONFIG.ROLES.JEFE_MECANICOS;

        container.innerHTML = '<div class="management-list">' + ordenes.map(function(item) {
            return (
                '<div class="management-item">' +
                    '<div class="item-header">' +
                        '<span class="item-badge estado-' + item.estado + '">' + (LABEL_ESTADO_O[item.estado] || item.estado) + '</span>' +
                        '<span class="item-badge prioridad-' + item.prioridad + '">' + (LABEL_PRIORIDAD_O[item.prioridad] || item.prioridad) + '</span>' +
                        '<span class="item-date">' + formatApiDateTime(item.fecha_creacion) + '</span>' +
                    '</div>' +
                    '<div class="item-body">' +
                        '<strong>#' + item.id + ' - ' + escapeHtml(item.vehiculo?.placa || 'Sin vehículo') + '</strong>' +
                        '<p>' + escapeHtml((item.descripcion || '').split('\n')[0]) + '</p>' +
                    '</div>' +
                    '<div class="item-footer">' +
                        '<span>' + escapeHtml(item.responsable?.nombre || item.responsable_externo || 'Sin asignar') + '</span>' +
                        '<div class="item-actions">' +
                            '<button type="button" class="btn-ghost btn-sm" onclick="handleOrdenesBtnClick(' + item.id + ', \'view\')">Ver</button>' +
                            (isAdmin ? '<button type="button" class="btn-ghost btn-sm" onclick="handleOrdenesBtnClick(' + item.id + ', \'edit\')">Editar</button>' : '') +
                            '<button type="button" class="btn-ghost btn-sm" onclick="handleOrdenesBtnClick(' + item.id + ', \'cambiar-estado\')">Cambiar Estado</button>' +
                            (isAdmin ? '<button type="button" class="btn-danger btn-sm" onclick="handleOrdenesBtnClick(' + item.id + ', \'delete\')">Eliminar</button>' : '') +
                        '</div>' +
                    '</div>' +
                '</div>'
            );
        }).join('') + '</div>';
    } catch (err) {
        console.error('Error cargando órdenes:', err);
        container.innerHTML = '<p class="helper-text">Error al cargar órdenes.</p>';
    }
}

function handleOrdenesListClick() {}
function handleOrdenesBtnClick(ordenId, action) {
    const userRole = APP.user?.rol;
    const isAdmin = userRole === CONFIG.ROLES.ADMIN || userRole === CONFIG.ROLES.JEFE_MECANICOS;

    switch (action) {
        case 'view':
            openOrdenDetalleModal(ordenId);
            break;
        case 'edit':
            if (!isAdmin) {
                showAppAlert('Acceso denegado', 'No tienes permisos para editar órdenes.');
                return;
            }
            openOrdenForm(ordenId);
            break;
        case 'cambiar-estado':
            handleCambiarEstadoOrden(ordenId);
            break;
        case 'delete':
            if (!isAdmin) {
                showAppAlert('Acceso denegado', 'No tienes permisos para eliminar órdenes.');
                return;
            }
            handleDeleteOrden(ordenId);
            break;
    }
}

async function handleCambiarEstadoOrden(ordenId) {
    const orden = APP.admin.ordenes.find(o => o.id === ordenId);
    if (!orden) return;

    const currentIndex = ESTADOS_ORDEN.indexOf(orden.estado);
    if (currentIndex === -1 || currentIndex >= ESTADOS_ORDEN.length - 1) {
        showAppAlert('Sin cambios', 'La orden ya está en su estado final.');
        return;
    }

    const nextEstado = ESTADOS_ORDEN[currentIndex + 1];
    const confirmed = await showAppConfirm(
        'Cambiar Estado',
        `¿Cambiar orden #${ordenId} de "${LABEL_ESTADO_O[orden.estado]}" a "${LABEL_ESTADO_O[nextEstado]}"?`
    );
    if (!confirmed) return;

    try {
        await API.cambiarEstadoOrden(ordenId, { estado: nextEstado });
        showAppAlert('Estado actualizado', `Orden cambiada a "${LABEL_ESTADO_O[nextEstado]}".`);
        renderOrdenesList();
    } catch (err) {
        showAppAlert('Error', err.message || 'No se pudo cambiar el estado.');
    }
}

async function handleDeleteOrden(ordenId) {
    const confirmed = await showAppConfirm('Eliminar Orden', '¿Estás seguro de eliminar esta orden de trabajo? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
        await API.deleteOrdenTrabajo(ordenId);
        showAppAlert('Eliminada', 'La orden de trabajo ha sido eliminada.');
        renderOrdenesList();
    } catch (err) {
        showAppAlert('Error', err.message || 'No se pudo eliminar la orden.');
    }
}

function openOrdenForm(ordenId) {
    toggleModal('orden-modal', true);

    const title = document.getElementById('orden-form-title');
    const form = document.getElementById('orden-form');
    if (form) form.reset();

    document.getElementById('orden-id').value = '';
    document.getElementById('orden-vehiculo-id').value = '';
    document.getElementById('orden-vehiculo-search').value = '';
    document.getElementById('orden-vehiculo-selected').textContent = 'Sin vehículo seleccionado.';
    document.getElementById('orden-vehiculo-results').innerHTML = '';
    document.getElementById('orden-vehiculo-results').classList.remove('is-open');
    document.getElementById('orden-mecanico-id').value = '';
    document.getElementById('orden-mecanico-search').value = '';
    document.getElementById('orden-mecanico-selected').textContent = 'Sin mecánico seleccionado.';
    document.getElementById('orden-mecanico-results').innerHTML = '';
    document.getElementById('orden-mecanico-results').classList.remove('is-open');

    // Inicializar responsable externo/tercero
    const esTerceroCheckbox = document.getElementById('orden-es-tercero');
    const respExternoGroup = document.getElementById('orden-responsable-externo-group');
    const respExternoInput = document.getElementById('orden-responsable-externo');
    const mecanicoSearch = document.getElementById('orden-mecanico-search');

    if (esTerceroCheckbox) {
        esTerceroCheckbox.checked = false;
        esTerceroCheckbox.onchange = function() {
            if (this.checked) {
                if (respExternoGroup) respExternoGroup.style.display = 'block';
                if (mecanicoSearch) {
                    mecanicoSearch.disabled = true;
                    mecanicoSearch.value = '';
                }
                document.getElementById('orden-mecanico-id').value = '';
                document.getElementById('orden-mecanico-selected').textContent = 'Se asignará a responsable externo.';
            } else {
                if (respExternoGroup) respExternoGroup.style.display = 'none';
                if (respExternoInput) respExternoInput.value = '';
                if (mecanicoSearch) mecanicoSearch.disabled = false;
                document.getElementById('orden-mecanico-selected').textContent = 'Sin mecánico seleccionado.';
            }
        };
    }
    if (respExternoGroup) respExternoGroup.style.display = 'none';
    if (respExternoInput) respExternoInput.value = '';
    if (mecanicoSearch) mecanicoSearch.disabled = false;

    const prioridadSel = document.getElementById('orden-prioridad');
    if (prioridadSel) prioridadSel.value = 'media';

    const estadoSel = document.getElementById('orden-estado');
    if (estadoSel) estadoSel.value = 'pendiente';

    const tituloField = document.getElementById('orden-titulo');
    if (tituloField) tituloField.value = '';

    const descripcionField = document.getElementById('orden-descripcion');
    if (descripcionField) descripcionField.value = '';

    const horaInicioField = document.getElementById('orden-hora-inicio');
    if (horaInicioField) horaInicioField.value = '';

    const horaFinField = document.getElementById('orden-hora-fin');
    if (horaFinField) horaFinField.value = '';

    if (ordenId) {
        title.textContent = 'Editar Orden de Trabajo';
        loadOrdenForEdit(ordenId);
    } else {
        title.textContent = 'Nueva Orden de Trabajo';
        initOrdenVehiculoSelector();
        initOrdenMecanicoSelector();
    }
}

async function loadOrdenForEdit(id) {
    try {
        const o = await API.getOrdenTrabajo(id);
        const descParts = (o.descripcion || '').split('\n\n');
        document.getElementById('orden-id').value = o.id;
        document.getElementById('orden-titulo').value = descParts[0] || '';
        document.getElementById('orden-descripcion').value = descParts.slice(1).join('\n\n') || '';
        document.getElementById('orden-prioridad').value = o.prioridad || 'media';
        
        const horaInicioField = document.getElementById('orden-hora-inicio');
        if (horaInicioField) horaInicioField.value = o.hora_inicio || '';

        const horaFinField = document.getElementById('orden-hora-fin');
        if (horaFinField) horaFinField.value = o.hora_fin || '';

        if (o.vehiculo) {
            const searchInput = document.getElementById('orden-vehiculo-search');
            const hidden = document.getElementById('orden-vehiculo-id');
            const selected = document.getElementById('orden-vehiculo-selected');
            if (searchInput) searchInput.value = `${o.vehiculo.placa} - ${o.vehiculo.marca || ''} ${o.vehiculo.modelo || ''}`;
            if (hidden) hidden.value = o.vehiculo_id;
            if (selected) selected.textContent = `Seleccionado: ${o.vehiculo.placa} · ${o.vehiculo.marca || ''} ${o.vehiculo.modelo || ''}`;
        }

        const esTerceroCheckbox = document.getElementById('orden-es-tercero');
        const respExternoGroup = document.getElementById('orden-responsable-externo-group');
        const respExternoInput = document.getElementById('orden-responsable-externo');
        const mecanicoSearch = document.getElementById('orden-mecanico-search');

        if (o.responsable_externo) {
            if (esTerceroCheckbox) esTerceroCheckbox.checked = true;
            if (respExternoGroup) respExternoGroup.style.display = 'block';
            if (respExternoInput) respExternoInput.value = o.responsable_externo;
            if (mecanicoSearch) {
                mecanicoSearch.disabled = true;
                mecanicoSearch.value = '';
            }
            document.getElementById('orden-mecanico-id').value = '';
            document.getElementById('orden-mecanico-selected').textContent = `Externo: ${o.responsable_externo}`;
        } else if (o.responsable) {
            if (esTerceroCheckbox) esTerceroCheckbox.checked = false;
            if (respExternoGroup) respExternoGroup.style.display = 'none';
            if (respExternoInput) respExternoInput.value = '';
            if (mecanicoSearch) {
                mecanicoSearch.disabled = false;
                mecanicoSearch.value = o.responsable.nombre;
            }
            const hidden = document.getElementById('orden-mecanico-id');
            const selected = document.getElementById('orden-mecanico-selected');
            if (hidden) hidden.value = o.responsable_id;
            if (selected) selected.textContent = `Seleccionado: ${o.responsable.nombre}`;
        } else {
            if (esTerceroCheckbox) esTerceroCheckbox.checked = false;
            if (respExternoGroup) respExternoGroup.style.display = 'none';
            if (respExternoInput) respExternoInput.value = '';
            if (mecanicoSearch) {
                mecanicoSearch.disabled = false;
                mecanicoSearch.value = '';
            }
            document.getElementById('orden-mecanico-id').value = '';
            document.getElementById('orden-mecanico-selected').textContent = 'Sin mecánico seleccionado.';
        }

        if (o.hallazgo) {
            const hidden = document.getElementById('orden-hallazgo-id');
            const selected = document.getElementById('orden-hallazgo-selected');
            if (hidden) hidden.value = o.hallazgo.id;
            if (selected) selected.textContent = `Hallazgo #${o.hallazgo.id}: ${escapeHtml(o.hallazgo.descripcion.substring(0, 100))}`;
        }

        initOrdenVehiculoSelector();
        initOrdenMecanicoSelector();
    } catch (err) {
        console.error('Error cargando orden:', err);
    }
}

function initOrdenVehiculoSelector() {
    const searchInput = document.getElementById('orden-vehiculo-search');
    const resultsContainer = document.getElementById('orden-vehiculo-results');
    if (!searchInput || !resultsContainer) return;

    const newInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newInput, searchInput);

    const currentInput = document.getElementById('orden-vehiculo-search');
    const currentResults = document.getElementById('orden-vehiculo-results');

    currentInput.addEventListener('input', () => {
        const q = currentInput.value.trim();
        const currentHidden = document.getElementById('orden-vehiculo-id');
        if (currentHidden) currentHidden.value = '';

        scheduleSelectorSearch('orden-vehiculo', q, async (query) => {
            try {
                const vehiculos = await API.getSelectorVehiculos(query, 20);
                if (!vehiculos || vehiculos.length === 0) {
                    currentResults.innerHTML = '<div class="selector-empty">Sin resultados</div>';
                    currentResults.classList.add('is-open');
                    return;
                }
                currentResults.innerHTML = vehiculos.map(v =>
                    `<button type="button" class="selector-result-item" data-item-id="${v.id}" data-label="${v.placa || ''} - ${v.marca || ''} ${v.modelo || ''}">
                        <span class="selector-result-title">${v.placa || ''} · ${v.marca || ''} ${v.modelo || ''}</span>
                        <span class="selector-result-subtitle">Km: ${v.kilometraje ?? 0}</span>
                    </button>`
                ).join('');
                currentResults.classList.add('is-open');
            } catch (err) {
                console.error('Error buscando vehículos:', err);
            }
        });
    });

    currentInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            currentResults.classList.remove('is-open');
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            const firstResult = currentResults.querySelector('.selector-result-item');
            if (firstResult) selectOrdenVehiculo(firstResult);
        }
    });

    currentInput.addEventListener('focus', () => {
        if (currentResults.children.length > 0) {
            currentResults.classList.add('is-open');
        }
    });

    currentResults.addEventListener('click', (e) => {
        const option = e.target.closest('.selector-result-item');
        if (option) selectOrdenVehiculo(option);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.selector-search-group')) {
            currentResults.classList.remove('is-open');
        }
    });

    function selectOrdenVehiculo(el) {
        const id = el.dataset.itemId;
        const label = el.dataset.label;
        const currentHidden = document.getElementById('orden-vehiculo-id');
        const currentSelected = document.getElementById('orden-vehiculo-selected');
        if (currentInput) currentInput.value = label;
        if (currentHidden) currentHidden.value = id;
        if (currentSelected) currentSelected.textContent = `Seleccionado: ${label}`;
        currentResults.classList.remove('is-open');
    }
}

function initOrdenMecanicoSelector() {
    const searchInput = document.getElementById('orden-mecanico-search');
    const resultsContainer = document.getElementById('orden-mecanico-results');
    if (!searchInput || !resultsContainer) return;

    const newInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newInput, searchInput);

    const currentInput = document.getElementById('orden-mecanico-search');
    const currentResults = document.getElementById('orden-mecanico-results');
    let mecanicosCache = [];

    async function loadMecanicos(query) {
        try {
            if (mecanicosCache.length === 0) {
                mecanicosCache = await API.getMecanicos();
                if (!mecanicosCache) mecanicosCache = [];
            }

            const cleanQuery = (query || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const filtered = cleanQuery
                ? mecanicosCache.filter(u => {
                    const name = (u.nombre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    const email = (u.email || '').toLowerCase();
                    return name.includes(cleanQuery) || email.includes(cleanQuery);
                  })
                : mecanicosCache;

            if (filtered.length === 0) {
                currentResults.innerHTML = '<div class="selector-empty">Sin resultados</div>';
                currentResults.classList.add('is-open');
                return;
            }

            currentResults.innerHTML = filtered.map(m =>
                `<button type="button" class="selector-result-item" data-item-id="${m.id}" data-label="${m.nombre}">
                    <span class="selector-result-title">${m.nombre}</span>
                    <span class="selector-result-subtitle">${m.email || ''}</span>
                </button>`
            ).join('');
            currentResults.classList.add('is-open');
        } catch (err) {
            console.error('Error cargando mecánicos:', err);
        }
    }

    currentInput.addEventListener('input', () => {
        const q = currentInput.value.trim();
        const currentHidden = document.getElementById('orden-mecanico-id');
        if (currentHidden) currentHidden.value = '';

        scheduleSelectorSearch('orden-mecanico', q, (query) => {
            loadMecanicos(query);
        });
    });

    currentInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            currentResults.classList.remove('is-open');
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            const firstResult = currentResults.querySelector('.selector-result-item');
            if (firstResult) selectOrdenMecanico(firstResult);
        }
    });

    currentInput.addEventListener('focus', () => {
        if (currentResults.children.length > 0) {
            currentResults.classList.add('is-open');
        } else {
            loadMecanicos('');
        }
    });

    currentResults.addEventListener('click', (e) => {
        const option = e.target.closest('.selector-result-item');
        if (option) selectOrdenMecanico(option);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.selector-search-group')) {
            currentResults.classList.remove('is-open');
        }
    });

    function selectOrdenMecanico(el) {
        const id = el.dataset.itemId;
        const label = el.dataset.label;
        const currentHidden = document.getElementById('orden-mecanico-id');
        const currentSelected = document.getElementById('orden-mecanico-selected');
        if (currentInput) currentInput.value = label;
        if (currentHidden) currentHidden.value = id;
        if (currentSelected) currentSelected.textContent = `Seleccionado: ${label}`;
        currentResults.classList.remove('is-open');
    }
}

function closeOrdenForm() {
    const searchInput = document.getElementById('orden-vehiculo-search');
    if (searchInput) searchInput.disabled = false;

    toggleModal('orden-modal', false);
}

async function handleOrdenSubmit(e) {
    e.preventDefault();

    const ordenId = document.getElementById('orden-id').value;
    const vehiculoHidden = document.getElementById('orden-vehiculo-id');
    const vehiculoId = vehiculoHidden ? parseInt(vehiculoHidden.value) : null;
    const mecanicoHidden = document.getElementById('orden-mecanico-id');
    const mecanicoId = mecanicoHidden ? parseInt(mecanicoHidden.value) || null : null;
    const titulo = document.getElementById('orden-titulo').value.trim();
    const descripcion = document.getElementById('orden-descripcion').value.trim();
    const prioridad = document.getElementById('orden-prioridad').value;
    const hallazgoHidden = document.getElementById('orden-hallazgo-id');
    const hallazgoId = hallazgoHidden ? parseInt(hallazgoHidden.value) || null : null;

    const horaInicio = document.getElementById('orden-hora-inicio').value;
    const horaFin = document.getElementById('orden-hora-fin').value;

    if (!vehiculoId) {
        showAppAlert('Error', 'Debes seleccionar un vehículo.');
        return;
    }
    if (!titulo) {
        showAppAlert('Error', 'Debes ingresar un título.');
        return;
    }

    const esTercero = document.getElementById('orden-es-tercero')?.checked || false;
    const respExternoVal = document.getElementById('orden-responsable-externo')?.value.trim() || null;

    if (esTercero && !respExternoVal) {
        showAppAlert('Error', 'Debes ingresar el nombre del responsable externo.');
        return;
    }

    const data = {
        vehiculo_id: vehiculoId,
        responsable_id: esTercero ? null : mecanicoId,
        responsable_externo: esTercero ? respExternoVal : null,
        descripcion: titulo + (descripcion ? '\n\n' + descripcion : ''),
        prioridad,
        hora_inicio: horaInicio || null,
        hora_fin: horaFin || null,
    };

    if (hallazgoId) {
        data.hallazgo_id = hallazgoId;
    }

    try {
        if (ordenId) {
            await API.updateOrdenTrabajo(parseInt(ordenId), { 
                responsable_id: data.responsable_id, 
                responsable_externo: data.responsable_externo,
                prioridad, 
                descripcion: data.descripcion,
                hora_inicio: data.hora_inicio,
                hora_fin: data.hora_fin
            });
        } else {
            await API.createOrdenTrabajo(data);
        }
        closeOrdenForm();
        renderOrdenesList();
    } catch (err) {
        showAppAlert('Error', err.message || 'No se pudo guardar la orden.');
    }
}

// ============ DETALLE DE ORDEN ============

async function openOrdenDetalleModal(ordenId) {
    toggleModal('orden-detalle-modal', true);
    APP.admin.ordenDetalleId = ordenId;

    const title = document.getElementById('orden-detalle-title');
    const infoContainer = document.getElementById('orden-detalle-info');
    if (title) title.textContent = 'Detalle de Orden de Trabajo';
    if (infoContainer) infoContainer.innerHTML = '<p class="helper-text">Cargando...</p>';

    try {
        const orden = await API.getOrdenTrabajo(ordenId);
        if (!orden) return;

        const userRole = APP.user?.rol;
        const isAdmin = userRole === CONFIG.ROLES.ADMIN || userRole === CONFIG.ROLES.JEFE_MECANICOS;

        if (infoContainer) {
            infoContainer.innerHTML = `
                <div class="detalle-header">
                    <div class="detalle-field">
                        <span class="detalle-label"># Orden</span>
                        <span class="detalle-value">${orden.id}</span>
                    </div>
                    <div class="detalle-field">
                        <span class="detalle-label">Vehículo</span>
                        <span class="detalle-value">${orden.vehiculo ? `${escapeHtml(orden.vehiculo.placa)} - ${escapeHtml(orden.vehiculo.marca)} ${escapeHtml(orden.vehiculo.modelo)}` : '#' + orden.vehiculo_id}</span>
                    </div>
                    <div class="detalle-field">
                        <span class="detalle-label">Título</span>
                        <span class="detalle-value">${escapeHtml((orden.descripcion || '').split('\n')[0])}</span>
                    </div>
                    <div class="detalle-field">
                        <span class="detalle-label">Hallazgo</span>
                        <span class="detalle-value">${orden.hallazgo ? `#${orden.hallazgo.id}: ${escapeHtml(orden.hallazgo.descripcion.substring(0, 80))}` : 'Ninguno'}</span>
                    </div>
                    <div class="detalle-field">
                        <span class="detalle-label">Mecánico</span>
                        <span class="detalle-value">${orden.responsable ? escapeHtml(orden.responsable.nombre) : (orden.responsable_externo ? `${escapeHtml(orden.responsable_externo)} (Externo)` : 'Sin asignar')}</span>
                    </div>
                    <div class="detalle-field">
                        <span class="detalle-label">Fecha</span>
                        <span class="detalle-value">${formatApiDateTime(orden.fecha_creacion)}</span>
                    </div>
                    <div class="detalle-field">
                        <span class="detalle-label">Horario</span>
                        <span class="detalle-value">${orden.hora_inicio && orden.hora_fin ? `${orden.hora_inicio} - ${orden.hora_fin}` : 'No programado'}</span>
                    </div>
                    <div class="detalle-field">
                        <span class="detalle-label">Prioridad</span>
                        <span class="detalle-value"><span class="item-badge prioridad-${orden.prioridad}">${LABEL_PRIORIDAD_O[orden.prioridad] || orden.prioridad}</span></span>
                    </div>
                    <div class="detalle-field">
                        <span class="detalle-label">Estado</span>
                        <span class="detalle-value">
                            <span class="item-badge estado-${orden.estado}">${LABEL_ESTADO_O[orden.estado] || orden.estado}</span>
                            ${isAdmin ? `<select id="orden-detalle-estado" class="estado-select">
                                <option value="pendiente" ${orden.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                                <option value="asignada" ${orden.estado === 'asignada' ? 'selected' : ''}>Asignada</option>
                                <option value="en_progreso" ${orden.estado === 'en_progreso' ? 'selected' : ''}>En progreso</option>
                                <option value="pausada" ${orden.estado === 'pausada' ? 'selected' : ''}>Pausada</option>
                                <option value="completada" ${orden.estado === 'completada' ? 'selected' : ''}>Completada</option>
                                <option value="cancelada" ${orden.estado === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                            </select>` : ''}
                        </span>
                    </div>
                    <div class="detalle-field detalle-field-full">
                        <span class="detalle-label">Descripción</span>
                        <p class="detalle-desc">${escapeHtml(orden.descripcion || 'Sin descripción')}</p>
                    </div>
                </div>
            `;
        }

        const tabsContainer = document.querySelector('.orden-detalle-tabs');
        if (tabsContainer) {
            tabsContainer.querySelectorAll('.orden-tab-btn').forEach(btn => {
                btn.removeEventListener('click', btn._handler);
                const tabName = btn.dataset.tab;
                btn._handler = () => {
                    // Set active tab button
                    tabsContainer.querySelectorAll('.orden-tab-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // Set active tab panel
                    document.querySelectorAll('.orden-tab-content').forEach(p => p.classList.remove('active'));
                    const panel = document.getElementById(`orden-detalle-${tabName}`);
                    if (panel) panel.classList.add('active');

                    // Load tab content
                    switch (tabName) {
                        case 'actividades': loadOrdenActividades(ordenId); break;
                        case 'costos': loadOrdenCostos(ordenId); break;
                        case 'evidencias': loadOrdenEvidencias(ordenId); break;
                        case 'historial': loadOrdenHistorial(ordenId); break;
                    }
                };
                btn.addEventListener('click', btn._handler);
            });
        }

        const actividadNuevoBtn = document.getElementById('actividad-nuevo-btn');
        if (actividadNuevoBtn) actividadNuevoBtn.style.display = isAdmin ? '' : 'none';

        const costoNuevoBtn = document.getElementById('costo-nuevo-btn');
        if (costoNuevoBtn) costoNuevoBtn.style.display = isAdmin ? '' : 'none';

        // Open default tab (Actividades)
        const defaultBtn = tabsContainer ? tabsContainer.querySelector('[data-tab="actividades"]') : null;
        if (defaultBtn) {
            defaultBtn.click();
        } else {
            loadOrdenActividades(ordenId);
        }

        if (orden.estado) {
            const estadoSelect = document.getElementById('orden-detalle-estado');
            if (estadoSelect) {
                estadoSelect.value = orden.estado;
                estadoSelect.removeEventListener('change', estadoSelect._handler);
                estadoSelect._handler = async () => {
                    try {
                        await API.cambiarEstadoOrden(ordenId, { estado: estadoSelect.value });
                        showAppAlert('Estado actualizado', `Orden cambiada a "${LABEL_ESTADO_O[estadoSelect.value]}".`);
                        renderOrdenesList();
                    } catch (err) {
                        showAppAlert('Error', err.message || 'No se pudo actualizar el estado.');
                    }
                };
                estadoSelect.addEventListener('change', estadoSelect._handler);
            }
        }
    } catch (err) {
        console.error('Error cargando detalle de orden:', err);
        const infoContainer = document.getElementById('orden-detalle-info');
        if (infoContainer) infoContainer.innerHTML = '<p class="helper-text">Error al cargar detalle.</p>';
    }
}

function closeOrdenDetalleModal() {
    APP.admin.ordenDetalleId = null;
    toggleModal('orden-detalle-modal', false);
}

// ============ ACTIVIDADES ============

async function loadOrdenActividades(ordenId) {
    const container = document.getElementById('orden-actividades-list');
    if (!container) return;

    container.innerHTML = '<p class="helper-text">Cargando...</p>';

    try {
        const actividades = await API.getOrdenActividades(ordenId);
        if (!actividades || actividades.length === 0) {
            container.innerHTML = '<div class="empty-state"><p class="helper-text">No hay actividades registradas.</p></div>';
            return;
        }
        container.innerHTML = `<div class="management-list">${actividades.map(a => `
            <div class="management-item">
                <div class="item-header">
                    <span class="item-date">${formatApiDateTime(a.fecha_creacion)}</span>
                </div>
                <div class="item-body">
                    <strong>${escapeHtml(a.titulo || 'Actividad')}</strong>
                    <p>${escapeHtml(a.descripcion || '')}</p>
                </div>
                <div class="item-footer">
                    <span class="item-badge estado-${a.estado}">${a.estado === 'en_progreso' ? 'En curso' : (a.estado === 'completada' ? 'Completada' : 'Pendiente')}</span>
                    <div class="item-actions">
                        <button class="btn-ghost btn-sm" data-action="edit" data-id="${a.id}">Editar</button>
                        <button class="btn-danger btn-sm" data-action="delete" data-id="${a.id}">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('')}</div>`;
    } catch (err) {
        console.error('Error cargando actividades:', err);
        container.innerHTML = '<p class="helper-text">Error al cargar actividades.</p>';
    }
}

function handleActividadesListClick(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const actividadId = parseInt(button.dataset.id, 10);
    if (!actividadId) return;

    switch (button.dataset.action) {
        case 'edit':
            openActividadForm(actividadId);
            break;
        case 'delete':
            handleDeleteActividad(actividadId);
            break;
    }
}

async function handleDeleteActividad(actividadId) {
    const ordenId = APP.admin.ordenDetalleId;
    if (!ordenId) return;

    const confirmed = await showAppConfirm('Eliminar Actividad', '¿Estás seguro de eliminar esta actividad?');
    if (!confirmed) return;

    try {
        await API.deleteOrdenActividad(ordenId, actividadId);
        showAppAlert('Eliminada', 'La actividad ha sido eliminada.');
        loadOrdenActividades(ordenId);
    } catch (err) {
        showAppAlert('Error', err.message || 'No se pudo eliminar la actividad.');
    }
}

function openActividadForm(actividadId) {
    toggleModal('actividad-modal', true);

    const title = document.getElementById('actividad-form-title');
    const form = document.getElementById('actividad-form');
    if (form) form.reset();

    document.getElementById('actividad-id').value = '';
    document.getElementById('actividad-descripcion').value = '';
    document.getElementById('actividad-estado').value = 'pendiente';
    document.getElementById('actividad-observaciones').value = '';

    if (actividadId) {
        title.textContent = 'Editar Actividad';
        loadActividadForEdit(actividadId);
    } else {
        title.textContent = 'Nueva Actividad';
    }
}

async function loadActividadForEdit(id) {
    const ordenId = APP.admin.ordenDetalleId;
    if (!ordenId) return;

    try {
        const actividades = await API.getOrdenActividades(ordenId);
        const a = (actividades || []).find(act => act.id === id);
        if (!a) return;

        document.getElementById('actividad-id').value = a.id;
        document.getElementById('actividad-descripcion').value = a.titulo || '';
        document.getElementById('actividad-estado').value = a.estado === 'en_progreso' ? 'en_curso' : (a.estado || 'pendiente');
        document.getElementById('actividad-observaciones').value = a.descripcion || '';
    } catch (err) {
        console.error('Error cargando actividad:', err);
    }
}

function closeActividadForm() {
    toggleModal('actividad-modal', false);
}

async function handleActividadSubmit(e) {
    e.preventDefault();

    const ordenId = APP.admin.ordenDetalleId;
    if (!ordenId) return;

    const actividadId = document.getElementById('actividad-id').value;
    const titulo = document.getElementById('actividad-descripcion').value.trim();
    const estadoSel = document.getElementById('actividad-estado').value;
    const estado = estadoSel === 'en_curso' ? 'en_progreso' : estadoSel;
    const descripcion = document.getElementById('actividad-observaciones').value.trim();

    if (!titulo) {
        showAppAlert('Error', 'Debes ingresar una descripción de la actividad.');
        return;
    }

    const data = { titulo, estado, descripcion };

    try {
        if (actividadId) {
            await API.updateOrdenActividad(ordenId, parseInt(actividadId), data);
        } else {
            await API.createOrdenActividad(ordenId, data);
        }
        closeActividadForm();
        loadOrdenActividades(ordenId);
    } catch (err) {
        showAppAlert('Error', err.message || 'No se pudo guardar la actividad.');
    }
}

// ============ COSTOS ============

function formatCurrency(value) {
    const num = Number(value || 0);
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
}

async function loadOrdenCostos(ordenId) {
    const container = document.getElementById('orden-costos-list');
    if (!container) return;

    container.innerHTML = '<p class="helper-text">Cargando...</p>';

    try {
        const costos = await API.getOrdenCostos(ordenId);
        if (!costos || costos.length === 0) {
            container.innerHTML = '<div class="empty-state"><p class="helper-text">No hay costos registrados.</p></div>';
            return;
        }

        const total = costos.reduce((sum, c) => sum + Number(c.valor_total || c.valor || 0), 0);

        container.innerHTML = `<div class="management-list">${costos.map(c => `
            <div class="management-item">
                <div class="item-header">
                    <span class="item-date">${formatApiDateTime(c.fecha || c.fecha_creacion)}</span>
                    <span class="item-badge tipo-${c.tipo_gasto || 'otro'}">${c.tipo_gasto || 'otro'}</span>
                </div>
                <div class="item-body">
                    <strong>${escapeHtml(c.descripcion || 'Costo')}</strong>
                    <p class="costo-valor">${formatCurrency(c.valor_total || c.valor)}</p>
                </div>
                <div class="item-footer">
                    <span>${c.proveedor ? `Proveedor: ${escapeHtml(c.proveedor)}` : ''}</span>
                    <div class="item-actions">
                        <button class="btn-ghost btn-sm" data-action="edit" data-id="${c.id}">Editar</button>
                        <button class="btn-danger btn-sm" data-action="delete" data-id="${c.id}">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('')}</div>
        <div class="costos-total"><strong>Total: ${formatCurrency(total)}</strong></div>`;
    } catch (err) {
        console.error('Error cargando costos:', err);
        container.innerHTML = '<p class="helper-text">Error al cargar costos.</p>';
    }
}

function handleCostosListClick(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const costoId = parseInt(button.dataset.id, 10);
    if (!costoId) return;

    switch (button.dataset.action) {
        case 'edit':
            openCostoForm(costoId);
            break;
        case 'delete':
            handleDeleteCosto(costoId);
            break;
    }
}

async function handleDeleteCosto(costoId) {
    const ordenId = APP.admin.ordenDetalleId;
    if (!ordenId) return;

    const confirmed = await showAppConfirm('Eliminar Costo', '¿Estás seguro de eliminar este costo?');
    if (!confirmed) return;

    try {
        await API.deleteOrdenCosto(ordenId, costoId);
        showAppAlert('Eliminado', 'El costo ha sido eliminado.');
        loadOrdenCostos(ordenId);
    } catch (err) {
        showAppAlert('Error', err.message || 'No se pudo eliminar el costo.');
    }
}

function openCostoForm(costoId) {
    toggleModal('costo-modal', true);

    const title = document.getElementById('costo-form-title');
    const form = document.getElementById('costo-form');
    if (form) form.reset();

    document.getElementById('costo-id').value = '';
    document.getElementById('costo-concepto').value = '';
    document.getElementById('costo-tipo').value = 'repuesto';
    document.getElementById('costo-monto').value = '';
    document.getElementById('costo-observaciones').value = '';

    if (costoId) {
        title.textContent = 'Editar Costo';
        loadCostoForEdit(costoId);
    } else {
        title.textContent = 'Nuevo Costo';
    }
}

async function loadCostoForEdit(id) {
    const ordenId = APP.admin.ordenDetalleId;
    if (!ordenId) return;

    try {
        const costos = await API.getOrdenCostos(ordenId);
        const c = (costos || []).find(co => co.id === id);
        if (!c) return;

        // Parse descripcion to split concept and observations if formatted as "Concept (Observations)"
        let concepto = c.descripcion || '';
        let observaciones = '';
        const match = concepto.match(/^(.*?)\s*\((.*?)\)$/);
        if (match) {
            concepto = match[1];
            observaciones = match[2];
        }

        document.getElementById('costo-id').value = c.id;
        document.getElementById('costo-concepto').value = concepto;
        document.getElementById('costo-tipo').value = c.tipo_gasto === 'mano_obra' ? 'mano_de_obra' : (c.tipo_gasto || 'otro');
        document.getElementById('costo-monto').value = c.valor_unitario || c.valor_total || 0;
        document.getElementById('costo-observaciones').value = observaciones || c.numero_factura || c.proveedor || '';
    } catch (err) {
        console.error('Error cargando costo:', err);
    }
}

function closeCostoForm() {
    toggleModal('costo-modal', false);
}

async function handleCostoSubmit(e) {
    e.preventDefault();

    const ordenId = APP.admin.ordenDetalleId;
    if (!ordenId) return;

    const costoId = document.getElementById('costo-id').value;
    const concepto = document.getElementById('costo-concepto').value.trim();
    const tipoSel = document.getElementById('costo-tipo').value;
    const tipo_gasto = tipoSel === 'mano_de_obra' ? 'mano_obra' : tipoSel;
    const monto = parseFloat(document.getElementById('costo-monto').value);
    const observaciones = document.getElementById('costo-observaciones').value.trim();

    if (!concepto) {
        showAppAlert('Error', 'Debes ingresar un concepto.');
        return;
    }
    if (isNaN(monto) || monto < 0) {
        showAppAlert('Error', 'Debes ingresar un monto válido.');
        return;
    }

    const descripcion = observaciones ? `${concepto} (${observaciones})` : concepto;

    const data = {
        tipo_gasto,
        descripcion,
        cantidad: 1,
        valor_unitario: Math.round(monto),
        valor_total: Math.round(monto)
    };

    try {
        if (costoId) {
            await API.updateOrdenCosto(ordenId, parseInt(costoId), data);
        } else {
            await API.createOrdenCosto(ordenId, data);
        }
        closeCostoForm();
        loadOrdenCostos(ordenId);
    } catch (err) {
        showAppAlert('Error', err.message || 'No se pudo guardar el costo.');
    }
}

// ============ EVIDENCIAS ============

async function loadOrdenEvidencias(ordenId) {
    const container = document.getElementById('orden-evidencias-list');
    if (!container) return;

    container.innerHTML = '<p class="helper-text">Cargando...</p>';

    try {
        const evidencias = await API.getOrdenEvidencias(ordenId);
        if (!evidencias || evidencias.length === 0) {
            container.innerHTML = '<div class="empty-state"><p class="helper-text">No hay evidencias registradas.</p></div>';
            return;
        }
        container.innerHTML = `<div class="evidencias-grid">${evidencias.map(e => `
            <div class="evidencia-item">
                <a href="${escapeHtml(e.archivo_url || e.url || '#')}" target="_blank" rel="noopener noreferrer">
                    <img src="${escapeHtml(e.archivo_url || e.url || '')}" alt="${escapeHtml(e.descripcion || 'Evidencia')}" loading="lazy" />
                </a>
                <p class="evidencia-desc">${escapeHtml(e.descripcion || '')}</p>
                <span class="item-date">${formatApiDateTime(e.fecha_subida || e.fecha_creacion)}</span>
            </div>
        `).join('')}</div>`;
    } catch (err) {
        console.error('Error cargando evidencias:', err);
        container.innerHTML = '<p class="helper-text">Error al cargar evidencias.</p>';
    }
}

// ============ HISTORIAL ============

async function loadOrdenHistorial(ordenId) {
    const container = document.getElementById('orden-historial-list');
    const specsContainer = document.getElementById('orden-vehiculo-especificaciones-resumen');
    const specsText = document.getElementById('orden-vh-especificaciones-texto');
    const timelineContainer = document.getElementById('orden-vehiculo-historial-timeline');

    if (container) container.innerHTML = '<p class="helper-text">Cargando...</p>';
    if (timelineContainer) timelineContainer.innerHTML = '<p class="helper-text">Cargando...</p>';

    // Load vehicle details and maintenance history
    try {
        const orden = await API.getOrdenTrabajo(ordenId);
        if (orden && orden.vehiculo) {
            const vh = orden.vehiculo;
            if (specsContainer && specsText) {
                specsText.textContent = vh.especificaciones || 'Sin especificaciones registradas.';
                specsContainer.style.display = 'block';
            }
            if (timelineContainer) {
                try {
                    const history = await API.getVehiculoHistorial(vh.id);
                    if (!history || history.length === 0) {
                        timelineContainer.innerHTML = '<p class="helper-text">No se registran mantenimientos finalizados para este vehículo.</p>';
                    } else {
                        // formatTimeAgo helper is defined in admin-vehiculos.js, which is loaded globally in the frontend
                        const formatTimeAgoFn = typeof formatTimeAgo === 'function' ? formatTimeAgo : (dateString) => {
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
                        };

                        timelineContainer.innerHTML = history.map(ev => {
                            const timeAgo = formatTimeAgoFn(ev.fecha);
                            return `
                                <div class="timeline-item" style="margin-bottom: 15px; border-left: 3px solid #1f6a43; padding-left: 10px; margin-left: 5px;">
                                    <div class="timeline-item-header" style="display: flex; justify-content: space-between; font-size: 0.9em; color: #666; font-weight: bold;">
                                        <span>${escapeHtml(ev.titulo)}</span>
                                        <span style="font-weight: normal; color: #888;">${timeAgo} (${ev.fecha})</span>
                                    </div>
                                    <p style="margin: 5px 0 0 0; font-size: 0.95em; color: #333;">${escapeHtml(ev.descripcion)}</p>
                                    <div style="font-size: 0.85em; color: #777; margin-top: 3px;">Responsable: ${escapeHtml(ev.responsable)}</div>
                                </div>
                            `;
                        }).join('');
                    }
                } catch (errHistory) {
                    console.error('Error cargando historial de vehículo:', errHistory);
                    timelineContainer.innerHTML = '<div class="empty-state"><p class="helper-text" style="color: #b82318;">Error al cargar el historial del vehículo.</p></div>';
                }
            }
        }
    } catch (errOrden) {
        console.error('Error cargando detalles del vehículo para el historial:', errOrden);
    }

    try {
        const historial = await API.getOrdenHistorial(ordenId);
        if (!container) return;
        if (!historial || historial.length === 0) {
            container.innerHTML = '<div class="empty-state"><p class="helper-text">No hay historial disponible.</p></div>';
            return;
        }
        container.innerHTML = `<div class="historial-list">${historial.map(h => `
            <div class="historial-item">
                <div class="historial-header">
                    <span class="item-date">${formatApiDateTime(h.fecha_hora)}</span>
                    <span class="item-badge estado-${h.estado_nuevo || ''}">${LABEL_ESTADO_O[h.estado_nuevo] || h.estado_nuevo || ''}</span>
                </div>
                <p>${escapeHtml(h.accion || h.descripcion || '')}</p>
                <span class="historial-usuario">${escapeHtml(h.usuario?.nombre || h.responsable || 'Sistema')}</span>
            </div>
        `).join('')}</div>`;
    } catch (err) {
        console.error('Error cargando historial de la orden:', err);
        if (container) container.innerHTML = '<div class="empty-state"><p class="helper-text" style="color: #b82318;">Error al cargar el historial de cambios de la orden.</p></div>';
    }
}

// ============ FILTROS ============

function resetOrdenesFilters() {
    if (APP.admin) {
        APP.admin.ordenesFilters = { query: '', estado: 'todas', prioridad: 'todas' };
    }
    const estado = document.getElementById('ordenes-filtro-estado');
    const prioridad = document.getElementById('ordenes-filtro-prioridad');
    const search = document.getElementById('ordenes-search');
    if (estado) estado.value = 'todas';
    if (prioridad) prioridad.value = 'todas';
    if (search) search.value = '';
    renderOrdenesList();
}
