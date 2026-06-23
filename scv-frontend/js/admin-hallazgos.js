function setHallazgosFeedback(message, isError = false) {
    const feedback = document.getElementById('hallazgos-feedback');
    if (!feedback) return;
    feedback.textContent = message;
    feedback.style.color = isError ? '#b82318' : '';
    setTimeout(() => { feedback.textContent = ''; }, 4000);
}

const LABEL_CRITICIDAD_H = { baja: 'Baja', media: 'Media', alta: 'Alta', critica: 'Crítica' };
const LABEL_ESTADO_H = { abierto: 'Abierto', evaluado: 'Evaluado', convertido_orden: 'Convertido a Orden', descartado: 'Descartado' };
const LABEL_ORIGEN_H = { chequeo: 'Chequeo', movimiento: 'Movimiento', manual: 'Manual' };
const LABEL_CATEGORIA_H = { motor: 'Motor', transmision: 'Transmisión', frenos: 'Frenos', suspension: 'Suspensión', electrico: 'Eléctrico', carroceria: 'Carrocería', neumaticos: 'Neumáticos', neumatica: 'Neumática', varias: 'Varias', otro: 'Otro' };

function loadHallazgosManagement() {
    const isAdmin = [CONFIG.ROLES.ADMIN, CONFIG.ROLES.JEFE_MECANICOS].includes(APP.user?.rol);
    const nuevoBtn = document.getElementById('hallazgo-nuevo-btn');
    if (nuevoBtn) nuevoBtn.style.display = isAdmin ? '' : 'none';
    if (!APP.admin.hallazgosFilters) APP.admin.hallazgosFilters = { query: '', estado: 'todas', prioridad: 'todas', categoria: 'todas' };
    renderHallazgosList();
}

async function renderHallazgosList() {
    const container = document.getElementById('hallazgos-list');
    if (!container) return;
    container.innerHTML = '<p class="helper-text">Cargando...</p>';

    try {
        const f = APP.admin?.hallazgosFilters || {};
        const params = {};
        if (f.estado && f.estado !== 'todas') params.estado = f.estado;
        if (f.prioridad && f.prioridad !== 'todas') params.criticidad = f.prioridad;
        if (f.query) params.search = f.query;

        const hallazgos = await API.getHallazgos(params);
        const list = Array.isArray(hallazgos) ? hallazgos : hallazgos?.data || [];

        const feedback = document.getElementById('hallazgos-feedback');
        const resultsInfo = document.getElementById('hallazgos-results');
        if (feedback) feedback.textContent = '';
        if (resultsInfo) resultsInfo.textContent = list.length ? list.length + ' resultado(s)' : '';

        if (!list.length) {
            container.innerHTML = '<div class="empty-state"><p class="helper-text">No hay hallazgos registrados.</p></div>';
            return;
        }

        APP.admin.hallazgos = list;
        const canEdit = [CONFIG.ROLES.ADMIN, CONFIG.ROLES.JEFE_MECANICOS].includes(APP.user?.rol);

        container.innerHTML = '<div class="management-list">' + list.map(function(item) {
            const isAbierto = item.estado === 'abierto';
            return (
                '<div class="management-item">' +
                    '<div class="item-header">' +
                        '<span class="item-badge estado-' + item.estado + '">' + (LABEL_ESTADO_H[item.estado] || item.estado) + '</span>' +
                        '<span class="item-badge prioridad-' + item.criticidad + '">' + (LABEL_CRITICIDAD_H[item.criticidad] || item.criticidad) + '</span>' +
                        (item.categoria ? '<span class="item-badge categoria-' + item.categoria + '">' + (LABEL_CATEGORIA_H[item.categoria] || item.categoria) + '</span>' : '') +
                        '<span class="item-date">' + formatApiDateTime(item.fecha_creacion) + '</span>' +
                    '</div>' +
                    '<div class="item-body">' +
                        '<strong>' + escapeHtml(item.vehiculo?.placa || 'Sin vehículo') + '</strong>' +
                        '<p>' + escapeHtml((item.descripcion || '').substring(0, 120)) + '</p>' +
                    '</div>' +
                    '<div class="item-footer">' +
                        '<span>' + (LABEL_ORIGEN_H[item.origen] || item.origen) + '</span>' +
                        '<div class="item-actions">' +
                            '<button type="button" class="btn-ghost btn-sm" onclick="handleHallazgosBtnClick(' + item.id + ', \'view\')">Ver</button>' +
                            (canEdit ? '<button type="button" class="btn-ghost btn-sm" onclick="handleHallazgosBtnClick(' + item.id + ', \'edit\')">Editar</button>' : '') +
                            (canEdit && isAbierto ? '<button type="button" class="btn-ghost btn-sm" onclick="handleHallazgosBtnClick(' + item.id + ', \'evaluar\')">Evaluar</button>' : '') +
                            (canEdit ? '<button type="button" class="btn-danger btn-sm" onclick="handleHallazgosBtnClick(' + item.id + ', \'delete\')">Eliminar</button>' : '') +
                        '</div>' +
                    '</div>' +
                '</div>'
            );
        }).join('') + '</div>';
    } catch (err) {
        console.error('Error cargando hallazgos:', err);
        container.innerHTML = '<p class="helper-text">Error al cargar hallazgos.</p>';
    }
}

function handleHallazgosListClick() {}
window.handleHallazgosBtnClick = function(id, action) {
    const isAdmin = [CONFIG.ROLES.ADMIN, CONFIG.ROLES.JEFE_MECANICOS].includes(APP.user?.rol);

    switch (action) {
        case 'view':
            openHallazgoView(id);
            break;
        case 'edit':
            if (!isAdmin) { showAppAlert('Acceso denegado', 'No tienes permisos.'); return; }
            openHallazgoEdit(id);
            break;
        case 'evaluar':
            if (!isAdmin) { showAppAlert('Acceso denegado', 'No tienes permisos.'); return; }
            openHallazgoEvaluarModal(id);
            break;
        case 'delete':
            if (!isAdmin) { showAppAlert('Acceso denegado', 'No tienes permisos.'); return; }
            handleHallazgoDelete(id);
            break;
    }
}

async function handleHallazgoDelete(id) {
    const ok = await showAppConfirm('Eliminar Hallazgo', '¿Estás seguro de eliminar este hallazgo?');
    if (!ok) return;
    try {
        await API.deleteHallazgo(id);
        showAppAlert('Eliminado', 'Hallazgo eliminado.');
        renderHallazgosList();
    } catch (err) {
        showAppAlert('Error', err.message || 'No se pudo eliminar.');
    }
}

function openHallazgoView(id) {
    toggleModal('hallazgo-modal', true);
    document.getElementById('hallazgo-form-title').textContent = 'Detalle del Hallazgo';
    resetHallazgoForm();
    loadHallazgoData(id, true);
}

function openHallazgoEdit(id) {
    toggleModal('hallazgo-modal', true);
    document.getElementById('hallazgo-form-title').textContent = 'Editar Hallazgo';
    resetHallazgoForm();
    loadHallazgoData(id, false);
}

function openHallazgoForm(data) {
    if (data && data.id) {
        openHallazgoEdit(data.id);
    } else {
        toggleModal('hallazgo-modal', true);
        document.getElementById('hallazgo-form-title').textContent = 'Nuevo Hallazgo';
        resetHallazgoForm();
        initHallazgoVehiculoSelector();
    }
}

function resetHallazgoForm() {
    document.getElementById('hallazgo-id').value = '';
    document.getElementById('hallazgo-descripcion').value = '';
    document.getElementById('hallazgo-vehiculo-id').value = '';
    document.getElementById('hallazgo-vehiculo-search').value = '';
    document.getElementById('hallazgo-vehiculo-selected').textContent = 'Sin vehículo seleccionado.';
    document.getElementById('hallazgo-vehiculo-results').innerHTML = '';
    document.getElementById('hallazgo-vehiculo-results').classList.remove('is-open');

    const tipoInput = document.getElementById('hallazgo-tipo');
    if (tipoInput) tipoInput.value = 'operacion';

    const catSel = document.getElementById('hallazgo-categoria');
    if (catSel) catSel.value = '';

    const prioridadSel = document.getElementById('hallazgo-prioridad');
    if (prioridadSel) prioridadSel.value = 'media';

    const descField = document.getElementById('hallazgo-descripcion');
    if (descField) descField.disabled = false;

    const submitBtn = document.querySelector('#hallazgo-form .btn-form-action');
    if (submitBtn) submitBtn.style.display = '';
}

async function loadHallazgoData(id, readOnly) {
    try {
        const h = await API.getHallazgo(id);
        document.getElementById('hallazgo-id').value = h.id;
        document.getElementById('hallazgo-descripcion').value = h.descripcion || '';
        document.getElementById('hallazgo-prioridad').value = h.criticidad || 'media';

        const tipoInput = document.getElementById('hallazgo-tipo');
        if (tipoInput) tipoInput.value = h.tipo || 'operacion';

        const catSel = document.getElementById('hallazgo-categoria');
        if (catSel) catSel.value = h.categoria || '';

        if (h.vehiculo) {
            const searchInput = document.getElementById('hallazgo-vehiculo-search');
            const hidden = document.getElementById('hallazgo-vehiculo-id');
            const selected = document.getElementById('hallazgo-vehiculo-selected');
            if (searchInput) searchInput.value = h.vehiculo.placa + ' - ' + (h.vehiculo.marca || '') + ' ' + (h.vehiculo.modelo || '');
            if (hidden) hidden.value = h.vehiculo_id;
            if (selected) selected.textContent = 'Seleccionado: ' + h.vehiculo.placa + ' · ' + (h.vehiculo.marca || '') + ' ' + (h.vehiculo.modelo || '');
        }

        if (readOnly) {
            [document.getElementById('hallazgo-descripcion'), document.getElementById('hallazgo-prioridad')].forEach(el => {
                if (el) el.disabled = true;
            });
            const submitBtn = document.querySelector('#hallazgo-form .btn-form-action');
            if (submitBtn) submitBtn.style.display = 'none';
            const searchInput = document.getElementById('hallazgo-vehiculo-search');
            if (searchInput) searchInput.disabled = true;
        }

        initHallazgoVehiculoSelector();
    } catch (err) {
        console.error('Error cargando hallazgo:', err);
    }
}

function initHallazgoVehiculoSelector() {
    const searchInput = document.getElementById('hallazgo-vehiculo-search');
    const resultsContainer = document.getElementById('hallazgo-vehiculo-results');
    const hiddenInput = document.getElementById('hallazgo-vehiculo-id');
    const selectedText = document.getElementById('hallazgo-vehiculo-selected');
    if (!searchInput || !resultsContainer) return;

    const newInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newInput, searchInput);

    const currentInput = document.getElementById('hallazgo-vehiculo-search');
    const currentResults = document.getElementById('hallazgo-vehiculo-results');

    currentInput.addEventListener('input', function() {
        const q = this.value.trim();
        const currentHidden = document.getElementById('hallazgo-vehiculo-id');
        if (currentHidden) currentHidden.value = '';

        scheduleSelectorSearch('hallazgo-vehiculo', q, async function(query) {
            try {
                const list = await API.getSelectorVehiculos(query, 20);
                if (!list || !list.length) {
                    currentResults.innerHTML = '<div class="selector-empty">Sin resultados</div>';
                    currentResults.classList.add('is-open');
                    return;
                }
                currentResults.innerHTML = list.map(function(v) {
                    return '<button type="button" class="selector-result-item" data-item-id="' + v.id + '" data-label="' + (v.placa || '') + ' - ' + (v.marca || '') + ' ' + (v.modelo || '') + '">' +
                        '<span class="selector-result-title">' + (v.placa || '') + ' · ' + (v.marca || '') + ' ' + (v.modelo || '') + '</span>' +
                        '<span class="selector-result-subtitle">Km: ' + (v.kilometraje ?? 0) + '</span>' +
                    '</button>';
                }).join('');
                currentResults.classList.add('is-open');
            } catch (err) {
                console.error('Error buscando vehículos:', err);
            }
        });
    });

    currentInput.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') { currentResults.classList.remove('is-open'); return; }
        if (event.key === 'Enter') {
            event.preventDefault();
            var first = currentResults.querySelector('.selector-result-item');
            if (first) selectVehiculo(first);
        }
    });

    currentInput.addEventListener('focus', function() {
        if (currentResults.children.length > 0) currentResults.classList.add('is-open');
    });

    currentResults.addEventListener('click', function(e) {
        var opt = e.target.closest('.selector-result-item');
        if (opt) selectVehiculo(opt);
    });

    function selectVehiculo(el) {
        var id = el.dataset.itemId;
        var label = el.dataset.label;
        var h = document.getElementById('hallazgo-vehiculo-id');
        var s = document.getElementById('hallazgo-vehiculo-selected');
        if (currentInput) currentInput.value = label;
        if (h) h.value = id;
        if (s) s.textContent = 'Seleccionado: ' + label;
        currentResults.classList.remove('is-open');
    }
}

function closeHallazgoForm() {
    document.querySelectorAll('#hallazgo-form input, #hallazgo-form select, #hallazgo-form textarea').forEach(function(el) {
        el.disabled = false;
    });
    var submitBtn = document.querySelector('#hallazgo-form .btn-form-action');
    if (submitBtn) submitBtn.style.display = '';
    toggleModal('hallazgo-modal', false);
}

async function handleHallazgoSubmit(e) {
    e.preventDefault();
    var id = document.getElementById('hallazgo-id').value;
    var vehiculoId = parseInt(document.getElementById('hallazgo-vehiculo-id').value) || null;
    var descripcion = document.getElementById('hallazgo-descripcion').value.trim();
    var criticidad = document.getElementById('hallazgo-prioridad').value || 'media';
    var tipo = 'operacion';
    var categoria = document.getElementById('hallazgo-categoria').value || '';

    if (!vehiculoId) { showAppAlert('Error', 'Debes seleccionar un vehículo.'); return; }
    if (!descripcion) { showAppAlert('Error', 'Debes ingresar una descripción.'); return; }

    try {
        if (id) {
            await API.updateHallazgo(parseInt(id), { descripcion: descripcion, criticidad: criticidad, tipo: tipo, categoria: categoria });
        } else {
            await API.createHallazgo({ vehiculo_id: vehiculoId, descripcion: descripcion, criticidad: criticidad, tipo: tipo, categoria: categoria, origen: 'manual' });
        }
        closeHallazgoForm();
        renderHallazgosList();
    } catch (err) {
        showAppAlert('Error', err.message || 'No se pudo guardar el hallazgo.');
    }
}

function openHallazgoEvaluarModal(hallazgoId) {
    toggleModal('hallazgo-evaluar-modal', true);
    document.getElementById('hallazgo-evaluar-id').value = hallazgoId;
    document.getElementById('hallazgo-evaluar-estado').value = '';
    document.getElementById('hallazgo-evaluar-observaciones').value = '';
    document.getElementById('hallazgo-evaluar-info').innerHTML = '<p class="helper-text">Cargando...</p>';

    API.getHallazgo(hallazgoId).then(function(h) {
        var container = document.getElementById('hallazgo-evaluar-info');
        if (!container) return;
        container.innerHTML =
            '<div class="detalle-field"><span class="detalle-label">Vehículo</span><span class="detalle-value">' + (h.vehiculo ? escapeHtml(h.vehiculo.placa) : '#' + h.vehiculo_id) + '</span></div>' +
            '<div class="detalle-field"><span class="detalle-label">Criticidad</span><span class="detalle-value">' + (LABEL_CRITICIDAD_H[h.criticidad] || h.criticidad) + '</span></div>' +
            '<div class="detalle-field"><span class="detalle-label">Fecha</span><span class="detalle-value">' + formatApiDateTime(h.fecha_creacion) + '</span></div>' +
            '<div class="detalle-field detalle-field-full"><span class="detalle-label">Descripción</span><p class="detalle-desc">' + escapeHtml(h.descripcion) + '</p></div>';
    }).catch(function(err) {
        console.error(err);
        var container = document.getElementById('hallazgo-evaluar-info');
        if (container) container.innerHTML = '<p class="helper-text">Error al cargar.</p>';
    });
}

function closeHallazgoEvaluarModal() {
    toggleModal('hallazgo-evaluar-modal', false);
}

async function handleHallazgoEvaluarSubmit(e) {
    e.preventDefault();
    var id = document.getElementById('hallazgo-evaluar-id').value;
    var estado = document.getElementById('hallazgo-evaluar-estado').value;
    var obs = document.getElementById('hallazgo-evaluar-observaciones').value.trim();

    if (!estado) { showAppAlert('Error', 'Debes seleccionar una decisión.'); return; }

    try {
        var data = { estado: estado };
        if (obs) data.observaciones = obs;
        await API.evaluarHallazgo(parseInt(id), data);
        closeHallazgoEvaluarModal();
        renderHallazgosList();
        showAppAlert('Hallazgo evaluado', 'El hallazgo ha sido ' + (LABEL_ESTADO_H[estado] || estado) + '.');
    } catch (err) {
        showAppAlert('Error', err.message || 'No se pudo evaluar.');
    }
}

function resetHallazgosFilters() {
    if (APP.admin) {
        APP.admin.hallazgosFilters = { query: '', estado: 'todas', prioridad: 'todas', categoria: 'todas' };
    }
    ['hallazgos-filtro-estado', 'hallazgos-filtro-prioridad', 'hallazgos-filtro-categoria'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = 'todas';
    });
    var search = document.getElementById('hallazgos-search');
    if (search) search.value = '';
    renderHallazgosList();
}
