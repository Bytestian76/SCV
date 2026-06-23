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
                        '<span>' + escapeHtml(item.responsable?.nombre || 'Sin asignar') + '</span>' +
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

    const prioridadSel = document.getElementById('orden-prioridad');
    if (prioridadSel) prioridadSel.value = 'media';

    const estadoSel = document.getElementById('orden-estado');
    if (estadoSel) estadoSel.value = 'pendiente';

    const tituloField = document.getElementById('orden-titulo');
    if (tituloField) tituloField.value = '';

    const descripcionField = document.getElementById('orden-descripcion');
    if (descripcionField) descripcionField.value = '';

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

        if (o.vehiculo) {
            const searchInput = document.getElementById('orden-vehiculo-search');
            const hidden = document.getElementById('orden-vehiculo-id');
            const selected = document.getElementById('orden-vehiculo-selected');
            if (searchInput) searchInput.value = `${o.vehiculo.placa} - ${o.vehiculo.marca || ''} ${o.vehiculo.modelo || ''}`;
            if (hidden) hidden.value = o.vehiculo_id;
            if (selected) selected.textContent = `Seleccionado: ${o.vehiculo.placa} · ${o.vehiculo.marca || ''} ${o.vehiculo.modelo || ''}`;
        }

        if (o.responsable) {
            const searchInput = document.getElementById('orden-mecanico-search');
            const hidden = document.getElementById('orden-mecanico-id');
            const selected = document.getElementById('orden-mecanico-selected');
            if (searchInput) searchInput.value = o.responsable.nombre;
            if (hidden) hidden.value = o.responsable_id;
            if (selected) selected.textContent = `Seleccionado: ${o.responsable.nombre}`;
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

    if (!vehiculoId) {
        showAppAlert('Error', 'Debes seleccionar un vehículo.');
        return;
    }
    if (!titulo) {
        showAppAlert('Error', 'Debes ingresar un título.');
        return;
    }

    const data = {
        vehiculo_id: vehiculoId,
        responsable_id: mecanicoId,
        descripcion: titulo + (descripcion ? '\n\n' + descripcion : ''),
        prioridad,
    };

    if (hallazgoId) {
        data.hallazgo_id = hallazgoId;
    }

    try {
        if (ordenId) {
            await API.updateOrdenTrabajo(parseInt(ordenId), { responsable_id: mecanicoId, prioridad, descripcion: data.descripcion });
        } else {
            if (!hallazgoId) {
                showAppAlert('Error', 'Debes seleccionar un hallazgo relacionado o crear la orden desde un hallazgo.');
                return;
            }
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
    const content = document.getElementById('orden-detalle-content');
    if (title) title.textContent = 'Detalle de Orden de Trabajo';
    if (content) content.innerHTML = '<p class="helper-text">Cargando...</p>';

    try {
        const orden = await API.getOrdenTrabajo(ordenId);
        if (!orden) return;

        const userRole = APP.user?.rol;
        const isAdmin = userRole === CONFIG.ROLES.ADMIN || userRole === CONFIG.ROLES.JEFE_MECANICOS;

        if (content) {
            content.innerHTML = `
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
                        <span class="detalle-value">${orden.responsable ? escapeHtml(orden.responsable.nombre) : 'Sin asignar'}</span>
                    </div>
                    <div class="detalle-field">
                        <span class="detalle-label">Fecha</span>
                        <span class="detalle-value">${formatApiDateTime(orden.fecha_creacion)}</span>
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

        const actividadesBtn = document.getElementById('orden-tab-actividades-btn');
        const costosBtn = document.getElementById('orden-tab-costos-btn');
        const evidenciasBtn = document.getElementById('orden-tab-evidencias-btn');
        const historialBtn = document.getElementById('orden-tab-historial-btn');

        const setActiveTab = (tab) => {
            document.querySelectorAll('.orden-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.orden-tab-panel').forEach(p => p.classList.remove('active'));

            const btn = document.getElementById(`orden-tab-${tab}-btn`);
            const panel = document.getElementById(`orden-tab-${tab}-panel`);
            if (btn) btn.classList.add('active');
            if (panel) panel.classList.add('active');
        };

        const tabHandler = (tab) => {
            return () => {
                setActiveTab(tab);
                switch (tab) {
                    case 'actividades': loadOrdenActividades(ordenId); break;
                    case 'costos': loadOrdenCostos(ordenId); break;
                    case 'evidencias': loadOrdenEvidencias(ordenId); break;
                    case 'historial': loadOrdenHistorial(ordenId); break;
                }
            };
        };

        if (actividadesBtn) {
            actividadesBtn.removeEventListener('click', actividadesBtn._handler);
            actividadesBtn._handler = tabHandler('actividades');
            actividadesBtn.addEventListener('click', actividadesBtn._handler);
        }
        if (costosBtn) {
            costosBtn.removeEventListener('click', costosBtn._handler);
            costosBtn._handler = tabHandler('costos');
            costosBtn.addEventListener('click', costosBtn._handler);
        }
        if (evidenciasBtn) {
            evidenciasBtn.removeEventListener('click', evidenciasBtn._handler);
            evidenciasBtn._handler = tabHandler('evidencias');
            evidenciasBtn.addEventListener('click', evidenciasBtn._handler);
        }
        if (historialBtn) {
            historialBtn.removeEventListener('click', historialBtn._handler);
            historialBtn._handler = tabHandler('historial');
            historialBtn.addEventListener('click', historialBtn._handler);
        }

        const actividadNuevoBtn = document.getElementById('actividad-nuevo-btn');
        if (actividadNuevoBtn) actividadNuevoBtn.style.display = isAdmin ? '' : 'none';

        const costoNuevoBtn = document.getElementById('costo-nuevo-btn');
        if (costoNuevoBtn) costoNuevoBtn.style.display = isAdmin ? '' : 'none';

        setActiveTab('actividades');
        loadOrdenActividades(ordenId);

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
        if (content) content.innerHTML = '<p class="helper-text">Error al cargar detalle.</p>';
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
                    <strong>${escapeHtml(a.nombre)}</strong>
                    <p>${escapeHtml(a.descripcion || '')}</p>
                </div>
                <div class="item-footer">
                    <span>${a.completada ? 'Completada' : 'Pendiente'}</span>
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
    document.getElementById('actividad-nombre').value = '';
    document.getElementById('actividad-descripcion').value = '';
    document.getElementById('actividad-completada').checked = false;

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
        document.getElementById('actividad-nombre').value = a.nombre || '';
        document.getElementById('actividad-descripcion').value = a.descripcion || '';
        document.getElementById('actividad-completada').checked = !!a.completada;
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
    const nombre = document.getElementById('actividad-nombre').value.trim();
    const descripcion = document.getElementById('actividad-descripcion').value.trim();
    const completada = document.getElementById('actividad-completada').checked;

    if (!nombre) {
        showAppAlert('Error', 'Debes ingresar un nombre para la actividad.');
        return;
    }

    const data = { nombre, descripcion, completada };

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

        const total = costos.reduce((sum, c) => sum + Number(c.valor || 0), 0);

        container.innerHTML = `<div class="management-list">${costos.map(c => `
            <div class="management-item">
                <div class="item-header">
                    <span class="item-date">${formatApiDateTime(c.fecha_creacion)}</span>
                </div>
                <div class="item-body">
                    <strong>${escapeHtml(c.descripcion || c.nombre || 'Costo')}</strong>
                    <p class="costo-valor">${formatCurrency(c.valor)}</p>
                </div>
                <div class="item-footer">
                    <span></span>
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
    document.getElementById('costo-descripcion').value = '';
    document.getElementById('costo-valor').value = '';

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

        document.getElementById('costo-id').value = c.id;
        document.getElementById('costo-descripcion').value = c.descripcion || c.nombre || '';
        document.getElementById('costo-valor').value = c.valor || '';
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
    const descripcion = document.getElementById('costo-descripcion').value.trim();
    const valor = parseFloat(document.getElementById('costo-valor').value);

    if (!descripcion) {
        showAppAlert('Error', 'Debes ingresar una descripción.');
        return;
    }
    if (isNaN(valor) || valor < 0) {
        showAppAlert('Error', 'Debes ingresar un valor válido.');
        return;
    }

    const data = { descripcion, valor };

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
    if (!container) return;

    container.innerHTML = '<p class="helper-text">Cargando...</p>';

    try {
        const historial = await API.getOrdenHistorial(ordenId);
        if (!historial || historial.length === 0) {
            container.innerHTML = '<div class="empty-state"><p class="helper-text">No hay historial disponible.</p></div>';
            return;
        }
        container.innerHTML = `<div class="historial-list">${historial.map(h => `
            <div class="historial-item">
                <div class="historial-header">
                    <span class="item-date">${formatApiDateTime(h.fecha)}</span>
                    <span class="item-badge estado-${h.estado_nuevo || ''}">${LABEL_ESTADO_O[h.estado_nuevo] || h.estado_nuevo || ''}</span>
                </div>
                <p>${escapeHtml(h.accion || h.descripcion || '')}</p>
                <span class="historial-usuario">${escapeHtml(h.usuario?.nombre || h.responsable || 'Sistema')}</span>
            </div>
        `).join('')}</div>`;
    } catch (err) {
        console.error('Error cargando historial:', err);
        container.innerHTML = '<p class="helper-text">Error al cargar historial.</p>';
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
