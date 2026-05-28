// ============ FORMULARIO DE MOVIMIENTO ============

document.getElementById('movimiento-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    data.vehiculo_id = parseInt(data.vehiculo_id);
    data.conductor_id = parseInt(data.conductor_id);
    data.kilometraje = parseInt(data.kilometraje);
    if (data.sacas) data.sacas = parseInt(data.sacas);
    const basculaNormalizada = normalizeSiNo(data.bascula);
    if (data.bascula && !basculaNormalizada) {
        await showAppAlert('Dato invalido', 'Bascula solo admite "si" o "no".');
        return;
    }
    data.bascula = basculaNormalizada;

    data.tipo = APP.formType;

    try {
        await API.createMovimiento(data);
        await showAppAlert('Movimiento registrado', 'El registro se guardó exitosamente.');
        closeMovimientoForm();
        if (APP.movimiento.returnScreen === 'admin-movimientos') {
            await loadMovimientosManagement();
        } else if (APP.user?.rol === CONFIG.ROLES.OPERARIO_MOVIMIENTOS) {
            await loadDashboardData(CONFIG.ROLES.OPERARIO_MOVIMIENTOS);
        } else {
            showDashboard(APP.user.rol);
        }
    } catch (error) {
        await showAppAlert('Error al guardar', error.message || 'Ocurrió un error desconocido.');
    }
});

// ============ FORMULARIO DE CHEQUEO ============

async function loadFormularioChequeo() {
    try {
        const formulario = await API.getFormularioChequeo();
        APP.chequeo.formulario = formulario.secciones || [];
        APP.chequeo.totalItems = formulario.total_items || 0;
        renderSeccionesChequeo(formulario.secciones);
    } catch (error) {
        console.error('Error cargando formulario:', error);
    }
}

function renderSeccionesChequeo(secciones) {
    const container = document.getElementById('secciones-chequeo');
    if (!container) return;

    container.innerHTML = '';

    secciones.forEach((seccion) => {
        const sectionHTML = `
            <div class="form-section">
                <h3>${seccion.label}</h3>
                ${seccion.items.map((item) => `
                    <div class="check-item">
                        <label>${item.label}</label>
                        <input type="hidden" class="chequeo-item-value" data-seccion="${seccion.nombre}" data-item="${item.item}" value="">
                        <div class="check-options" role="radiogroup" aria-label="${item.label}">
                            ${(item.options || []).map((option) => `
                                <button
                                    type="button"
                                    class="check-option-btn"
                                    data-seccion="${seccion.nombre}"
                                    data-item="${item.item}"
                                    data-value="${option}"
                                >${formatOptionLabel(option)}</button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <div class="form-group">
                    <label for="obs_${seccion.nombre}">Observaciones de ${seccion.label}</label>
                    <textarea
                        id="obs_${seccion.nombre}"
                        class="chequeo-section-obs"
                        data-seccion="${seccion.nombre}"
                        data-seccion-label="${seccion.label}"
                        rows="2"
                        placeholder="Opcional"
                    ></textarea>
                </div>
            </div>
        `;
        container.innerHTML += sectionHTML;
    });
}

function handleChequeoOptionClick(e) {
    const button = e.target.closest('.check-option-btn');
    if (!button) return;

    const { seccion, item, value } = button.dataset;
    const groupSelector = `.check-option-btn[data-seccion="${seccion}"][data-item="${item}"]`;
    document.querySelectorAll(groupSelector).forEach((btn) => {
        btn.classList.remove('is-selected');
    });

    button.classList.add('is-selected');

    const hidden = document.querySelector(`.chequeo-item-value[data-seccion="${seccion}"][data-item="${item}"]`);
    if (hidden) {
        hidden.value = value;
    }
}

function formatOptionLabel(value) {
    return String(value || '')
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function construirObservacionesGenerales(baseTexto = '') {
    const observacionesSeccion = Array.from(document.querySelectorAll('.chequeo-section-obs'))
        .map((input) => ({
            seccion: input.dataset.seccion,
            label: input.dataset.seccionLabel,
            valor: (input.value || '').trim()
        }))
        .filter((obs) => obs.valor.length > 0);

    if (observacionesSeccion.length === 0) {
        return baseTexto;
    }

    const detalleSecciones = observacionesSeccion
        .map((obs) => `${obs.label}: ${obs.valor}`)
        .join(' | ');

    if (!baseTexto) {
        return `Observaciones por seccion -> ${detalleSecciones}`;
    }

    return `${baseTexto}\n\nObservaciones por seccion -> ${detalleSecciones}`;
}

function recolectarChequeoItems() {
    const fields = Array.from(document.querySelectorAll('.chequeo-item-value'));
    const observacionesPorSeccion = {};
    document.querySelectorAll('.chequeo-section-obs').forEach((input) => {
        const value = (input.value || '').trim();
        if (value) {
            observacionesPorSeccion[input.dataset.seccion] = value;
        }
    });

    const observacionAplicada = new Set();
    const items = [];

    for (const field of fields) {
        const valor = (field.value || '').trim();
        if (!valor) {
            return {
                ok: false,
                error: 'Debes responder todos los items antes de finalizar el chequeo.'
            };
        }

        const seccion = field.dataset.seccion;
        const item = {
            seccion,
            item: field.dataset.item,
            valor
        };

        if (!observacionAplicada.has(seccion) && observacionesPorSeccion[seccion]) {
            item.observacion = observacionesPorSeccion[seccion];
            observacionAplicada.add(seccion);
        }

        items.push(item);
    }

    return {
        ok: true,
        items
    };
}

async function handleChequeoSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
    }

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const itemsResult = recolectarChequeoItems();
    if (!itemsResult.ok) {
        if (submitBtn) submitBtn.disabled = false;
        await showAppAlert('Items pendientes', itemsResult.error);
        return;
    }

    const cabecera = {
        vehiculo_id: parseInt(data.vehiculo_id, 10),
        conductor_id: parseInt(data.conductor_id, 10),
        kilometraje: parseInt(data.kilometraje, 10),
        fecha_venc_soat: data.fecha_venc_soat || null,
        fecha_venc_rtm: data.fecha_venc_rtm || null,
        fecha_venc_extintor: data.fecha_venc_extintor || null,
        obs_generales: construirObservacionesGenerales((data.obs_generales || '').trim()) || null
    };

    if (!Number.isInteger(cabecera.vehiculo_id) || !Number.isInteger(cabecera.conductor_id) || !Number.isInteger(cabecera.kilometraje)) {
        if (submitBtn) submitBtn.disabled = false;
        await showAppAlert('Datos incompletos', 'Debes seleccionar vehiculo, conductor y kilometraje valido.');
        return;
    }

    try {
        const chequeo = await API.createChequeoCabecera(cabecera);
        await API.createChequeoItems(chequeo.id, itemsResult.items);
        await showAppAlert('Chequeo registrado', 'La lista de chequeo se guardo correctamente.');
        closeChequeoForm();
        if (APP.chequeo.returnScreen === 'admin-chequeos') {
            await loadChequeosManagement();
        } else if (APP.user?.rol === CONFIG.ROLES.OPERARIO_CHEQUEO) {
            await loadDashboardData(CONFIG.ROLES.OPERARIO_CHEQUEO);
        } else {
            showDashboard(APP.user?.rol);
        }
    } catch (error) {
        await showAppAlert('Error al guardar', error.message || 'No se pudo guardar el chequeo.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
        }
    }
}

// ============ RENDERIZADO DE LISTAS ============

function renderMovimientosRecientes(movimientos) {
    const container = document.getElementById('movimientos-recientes');
    if (!container) return;

    if (movimientos.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay movimientos registrados</p>';
        return;
    }

    container.innerHTML = movimientos.map((m) => `
        <div class="list-item">
            <div class="list-item-content">
                <span class="list-item-title">${m.vehiculo?.placa || 'N/A'}</span>
                <span class="list-item-subtitle">${m.conductor?.nombre || 'N/A'} - ${formatMovimientoTipo(m.tipo)}</span>
            </div>
            <div class="list-item-actions">
                <span class="status-badge ${getMovimientoBadgeClass(m.tipo)}">${formatMovimientoTipo(m.tipo)}</span>
                <span class="list-item-meta">${formatApiTime(m.fecha_hora)}</span>
                <button type="button" class="btn-ghost btn-item" data-action="view-movimiento" data-id="${m.id}">Detalle</button>
            </div>
        </div>
    `).join('');
}

function renderChequeosRecientes(chequeos) {
    const container = document.getElementById('chequeos-recientes');
    if (!container) return;

    if (chequeos.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay chequeos registrados</p>';
        return;
    }

    container.innerHTML = chequeos.map((c) => `
        <div class="list-item">
            <div class="list-item-content">
                <span class="list-item-title">${c.vehiculo?.placa || 'N/A'}</span>
                <span class="list-item-subtitle">${c.conductor?.nombre || 'N/A'}</span>
            </div>
            <div class="list-item-actions">
                <span class="list-item-meta">${formatApiDate(c.fecha_hora)}</span>
                <button type="button" class="btn-ghost btn-item" data-action="view-chequeo" data-id="${c.id}">Detalle</button>
            </div>
        </div>
    `).join('');
}
