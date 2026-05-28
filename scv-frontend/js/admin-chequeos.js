function setChequeosFeedback(message, isError = false) {
    const feedback = document.getElementById('chequeos-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.toggle('is-error', isError);
}

function getFilteredChequeos() {
    const { query, orden } = APP.admin.chequeosFilters;
    const queryLower = query.trim().toLowerCase();

    const filtered = APP.admin.chequeos.filter((chequeo) => {
        if (!queryLower) return true;
        const searchable = [
            chequeo.vehiculo?.placa,
            chequeo.conductor?.nombre,
            chequeo.usuario?.nombre,
            chequeo.obs_generales
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        return searchable.includes(queryLower);
    });

    return filtered.sort((a, b) => {
        const aTime = getApiTimestamp(a.fecha_hora);
        const bTime = getApiTimestamp(b.fecha_hora);
        return orden === 'fecha_asc' ? aTime - bTime : bTime - aTime;
    });
}

function updateChequeosResults(total) {
    const results = document.getElementById('chequeos-results');
    if (!results) return;

    const label = total === 1 ? 'chequeo' : 'chequeos';
    results.textContent = `${total} ${label} en pantalla`;
}

function renderChequeosManagementList() {
    const container = document.getElementById('chequeos-list');
    if (!container) return;

    const chequeos = getFilteredChequeos();
    updateChequeosResults(chequeos.length);

    if (chequeos.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay chequeos para los filtros seleccionados.</p>';
        return;
    }

    container.innerHTML = chequeos
        .map((c) => {
            const fecha = formatApiDateTime(c.fecha_hora);
            const itemLabel = c.total_items === 1 ? 'item' : 'items';
            return `
                <article class="management-card">
                    <div class="management-card-content">
                        <h4>${c.vehiculo?.placa || 'Sin placa'} · ${c.conductor?.nombre || 'Sin conductor'}</h4>
                        <p>Inspector: ${c.usuario?.nombre || 'N/A'} · Km: ${c.kilometraje || 0}</p>
                        <p>${fecha} · ${c.total_items || 0} ${itemLabel}</p>
                        ${c.obs_generales ? `<p>${c.obs_generales}</p>` : ''}
                        <button type="button" class="btn-ghost btn-inline" data-action="view-chequeo" data-id="${c.id}">Ver detalle</button>
                    </div>
                </article>
            `;
        })
        .join('');
}

function resetChequeosFilters() {
    APP.admin.chequeosFilters = {
        query: '',
        fechaInicio: '',
        fechaFin: '',
        orden: 'fecha_desc'
    };

    const searchInput = document.getElementById('chequeos-search');
    const fechaInicioInput = document.getElementById('chequeos-fecha-inicio');
    const fechaFinInput = document.getElementById('chequeos-fecha-fin');
    const ordenSelect = document.getElementById('chequeos-orden');

    if (searchInput) searchInput.value = '';
    if (fechaInicioInput) fechaInicioInput.value = '';
    if (fechaFinInput) fechaFinInput.value = '';
    if (ordenSelect) ordenSelect.value = 'fecha_desc';

    loadChequeosManagement();
}

async function loadChequeosManagement() {
    try {
        setChequeosFeedback('Cargando chequeos...');
        const filters = { limit: 1000 };

        if (APP.admin.chequeosFilters.fechaInicio) {
            filters.fecha_inicio = APP.admin.chequeosFilters.fechaInicio;
        }
        if (APP.admin.chequeosFilters.fechaFin) {
            filters.fecha_fin = APP.admin.chequeosFilters.fechaFin;
        }

        const chequeos = await API.getChequeos(filters);
        APP.admin.chequeos = Array.isArray(chequeos) ? chequeos : [];
        renderChequeosManagementList();
        setChequeosFeedback('Historial actualizado.');
    } catch (error) {
        APP.admin.chequeos = [];
        renderChequeosManagementList();
        setChequeosFeedback(error.message || 'No se pudieron cargar los chequeos.', true);
    }
}

function closeChequeoDetalleModal() {
    toggleModal('chequeo-detalle-modal', false);
}

function formatSectionName(value) {
    return String(value || '')
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function renderChequeoDetalle(detalle) {
    const container = document.getElementById('chequeo-detalle-content');
    if (!container) return;

    const items = Array.isArray(detalle.items) ? detalle.items : [];
    const grouped = items.reduce((acc, item) => {
        const key = item.seccion || 'general';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    const sectionsHtml = Object.entries(grouped)
        .map(([seccion, sectionItems]) => {
            const rows = sectionItems
                .map((item) => `
                    <tr>
                        <td>${formatSectionName(item.item)}</td>
                        <td>${formatOptionLabel(item.valor)}</td>
                        <td>${item.observacion || '-'}</td>
                    </tr>
                `)
                .join('');

            return `
                <section class="chequeo-detalle-block">
                    <h4>${formatSectionName(seccion)}</h4>
                    <table class="chequeo-items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Respuesta</th>
                                <th>Observacion</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </section>
            `;
        })
        .join('');

    container.innerHTML = `
        <section class="chequeo-detalle-grid">
            <div class="chequeo-detalle-block">
                <h4>Cabecera</h4>
                <p><strong>Fecha:</strong> ${formatApiDateTime(detalle.fecha_hora)}</p>
                <p><strong>Vehiculo:</strong> ${detalle.vehiculo?.placa || 'N/A'} (${detalle.vehiculo?.marca || 'N/A'} ${detalle.vehiculo?.modelo || ''})</p>
                <p><strong>Conductor:</strong> ${detalle.conductor?.nombre || 'N/A'} · ${detalle.conductor?.cedula || 'N/A'}</p>
                <p><strong>Inspector:</strong> ${detalle.usuario?.nombre || 'N/A'}</p>
                <p><strong>Kilometraje:</strong> ${detalle.kilometraje || 0} km</p>
            </div>
            <div class="chequeo-detalle-block">
                <h4>Vencimientos</h4>
                <p><strong>SOAT:</strong> ${detalle.fecha_venc_soat || 'No registrado'}</p>
                <p><strong>RTM:</strong> ${detalle.fecha_venc_rtm || 'No registrado'}</p>
                <p><strong>Extintor:</strong> ${detalle.fecha_venc_extintor || 'No registrado'}</p>
            </div>
            ${detalle.obs_generales ? `
                <div class="chequeo-detalle-block">
                    <h4>Observaciones generales</h4>
                    <p>${detalle.obs_generales}</p>
                </div>
            ` : ''}
        </section>
        ${sectionsHtml}
    `;
}

async function openChequeoDetalle(chequeoId) {
    try {
        const detalle = await API.getChequeo(chequeoId);
        renderChequeoDetalle(detalle);
        toggleModal('chequeo-detalle-modal', true);
    } catch (error) {
        await showAppAlert('Detalle no disponible', error.message || 'No se pudo cargar el detalle del chequeo.');
    }
}

function handleChequeosListClick(e) {
    const btn = e.target.closest('[data-action="view-chequeo"]');
    if (!btn) return;

    const chequeoId = parseInt(btn.dataset.id, 10);
    if (!Number.isInteger(chequeoId)) return;

    openChequeoDetalle(chequeoId);
}

function handleChequeosRecientesClick(e) {
    const btn = e.target.closest('[data-action="view-chequeo"]');
    if (!btn) return;

    const chequeoId = parseInt(btn.dataset.id, 10);
    if (!Number.isInteger(chequeoId)) return;

    openChequeoDetalle(chequeoId);
}
