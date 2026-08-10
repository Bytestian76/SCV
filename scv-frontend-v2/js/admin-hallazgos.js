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

        container.innerHTML = '<table><tbody>' + list.map(function(item) {
            const isAbierto = item.estado === 'abierto';
            return (
                '<tr>' +
                    '<td>' +
                        '<div class="cell-main">' + formatApiDateTime(item.fecha_creacion) + '</div>' +
                        '<div class="cell-sub">' + (LABEL_ORIGEN_H[item.origen] || item.origen) + '</div>' +
                    '</td>' +
                    '<td>' +
                        '<div style="font-weight: 500; color: var(--text-main);">' + escapeHtml(item.vehiculo?.placa || 'Sin vehículo') + '</div>' +
                        '<div class="cell-sub" style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="' + escapeHtml(item.descripcion || '') + '">' + escapeHtml((item.descripcion || '')) + '</div>' +
                    '</td>' +
                    '<td>' +
                        '<div>' + (item.categoria ? (LABEL_CATEGORIA_H[item.categoria] || item.categoria) : 'N/A') + '</div>' +
                    '</td>' +
                    '<td>' +
                        '<div class="cell-main"><span class="badge">' + (LABEL_ESTADO_H[item.estado] || item.estado) + '</span></div>' +
                        '<div class="cell-sub">Prioridad: ' + (LABEL_CRITICIDAD_H[item.criticidad] || item.criticidad) + '</div>' +
                    '</td>' +
                    '<td>' +
                        '<div class="table-actions">' +
                            '<button class="btn-icon" title="Ver" data-action="view" data-id="' + item.id + '">' +
                                '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
                            '</button>' +
                            (canEdit ? '<button class="btn-icon" title="Editar" data-action="edit" data-id="' + item.id + '">' +
                                '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>' +
                            '</button>' : '') +
                            (canEdit && isAbierto ? '<button class="btn-icon" title="Evaluar" data-action="evaluar" data-id="' + item.id + '">' +
                                '<svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>' +
                            '</button>' : '') +
                            (canEdit ? '<button class="btn-icon btn-icon-danger" title="Eliminar" data-action="delete" data-id="' + item.id + '">' +
                                '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
                            '</button>' : '') +
                        '</div>' +
                    '</td>' +
                '</tr>'
            );
        }).join('') + '</tbody></table>';
    } catch (err) {
        console.error('Error cargando hallazgos:', err);
        container.innerHTML = '<p class="helper-text">Error al cargar hallazgos.</p>';
    }
}

function handleHallazgosListClick(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const hallazgoId = parseInt(btn.dataset.id, 10);
    if (!Number.isInteger(hallazgoId)) return;

    handleHallazgosBtnClick(hallazgoId, action);
}

window.handleHallazgosBtnClick = function(id, action) {
    const isAdmin = [CONFIG.ROLES.ADMIN, CONFIG.ROLES.JEFE_MECANICOS].includes(APP.user?.rol);

    switch (action) {
        case 'view':
        case 'ver':
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
    
    const pdfBtn = document.getElementById('hallazgo-export-pdf-single-btn');
    const excelBtn = document.getElementById('hallazgo-export-excel-single-btn');
    if (pdfBtn) pdfBtn.style.display = '';
    if (excelBtn) excelBtn.style.display = '';

    loadHallazgoData(id, true);
}

function openHallazgoEdit(id) {
    toggleModal('hallazgo-modal', true);
    document.getElementById('hallazgo-form-title').textContent = 'Editar Hallazgo';
    resetHallazgoForm();
    loadHallazgoData(id, false);
}

// Global click handler to close selector results when clicking outside
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

    const pdfBtn = document.getElementById('hallazgo-export-pdf-single-btn');
    const excelBtn = document.getElementById('hallazgo-export-excel-single-btn');
    if (pdfBtn) pdfBtn.style.display = 'none';
    if (excelBtn) excelBtn.style.display = 'none';

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
