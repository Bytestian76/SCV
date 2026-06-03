/**
 * Admin - Gestión de Fallas Reportadas
 */

const CATEGORIAS_FALLA = [
    "motor", "frenos", "suspension", "direccion",
    "sistema_electrico", "llantas", "carroceria",
    "hidraulico", "otro",
];

const PRIORIDADES_FALLA = ["baja", "media", "alta", "critica"];

const ESTADOS_FALLA = ["pendiente", "evaluada", "aprobada", "rechazada", "convertida_a_orden"];

const LABEL_CATEGORIA = {
    motor: "Motor", frenos: "Frenos", suspension: "Suspensión",
    direccion: "Dirección", sistema_electrico: "Sistema Eléctrico",
    llantas: "Llantas", carroceria: "Carrocería",
    hidraulico: "Hidráulico", otro: "Otro",
};

const LABEL_PRIORIDAD = {
    baja: "Baja", media: "Media", alta: "Alta", critica: "Crítica",
};

const LABEL_ESTADO = {
    pendiente: "Pendiente", evaluada: "Evaluada", aprobada: "Aprobada",
    rechazada: "Rechazada", convertida_a_orden: "Convertida a Orden",
};

const APP = window.APP || {};

function loadFallasManagement() {
    renderFallasList();
}

async function renderFallasList() {
    const container = document.getElementById('fallas-list');
    if (!container) return;
    container.innerHTML = '<p class="helper-text">Cargando...</p>';

    try {
        const filters = APP.admin?.fallasFilters || {};
        const params = {};
        if (filters.estado && filters.estado !== 'todas') params.estado = filters.estado;
        if (filters.prioridad && filters.prioridad !== 'todas') params.prioridad = filters.prioridad;
        if (filters.categoria && filters.categoria !== 'todas') params.categoria = filters.categoria;
        if (filters.query) params.search = filters.query;

        const fallas = await API.getFallas(params);

        if (!fallas || fallas.length === 0) {
            container.innerHTML = '<div class="empty-state"><p class="helper-text">No hay fallas reportadas.</p></div>';
            return;
        }

        container.innerHTML = `<div class="management-list">${fallas.map(f => `
            <div class="list-item" onclick="verDetalleFalla(${f.id})">
                <div class="list-item-body">
                    <span class="list-item-title">${escapeHtml(f.vehiculo?.placa || '#' + f.vehiculo_id)}</span>
                    <span class="list-item-sub">${escapeHtml(LABEL_CATEGORIA[f.categoria] || f.categoria)} · ${escapeHtml(f.descripcion?.substring(0, 80) || '')}</span>
                </div>
                <div class="list-item-meta">
                    <span class="status-badge is-${f.prioridad}">${LABEL_PRIORIDAD[f.prioridad] || f.prioridad}</span>
                    <span class="status-badge is-${f.estado}">${LABEL_ESTADO[f.estado] || f.estado}</span>
                </div>
            </div>
        `).join('')}</div>`;
    } catch (err) {
        console.error('Error cargando fallas:', err);
        container.innerHTML = '<p class="helper-text">Error al cargar fallas.</p>';
    }
}

function openFallaForm(fallaId) {
    const modal = document.getElementById('falla-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');

    const title = document.getElementById('falla-form-title');
    const form = document.getElementById('falla-form');
    form.reset();

    document.getElementById('falla-id').value = '';

    const secciones = document.getElementById('falla-categoria');
    secciones.innerHTML = CATEGORIAS_FALLA.map(c =>
        `<option value="${c}">${LABEL_CATEGORIA[c] || c}</option>`
    ).join('');

    // Reset prioridad
    const prioridadSel = document.getElementById('falla-prioridad');
    prioridadSel.value = 'media';

    if (fallaId) {
        title.textContent = 'Editar Falla';
        loadFallaForEdit(fallaId);
    } else {
        title.textContent = 'Reportar Falla';
    }

    setTimeout(() => loadVehiculosSelect('falla-vehiculo-search', 'falla-vehiculo-results'), 100);
    setTimeout(() => loadConductoresSelect('falla-conductor-search', 'falla-conductor-results'), 100);
}

async function loadFallaForEdit(id) {
    try {
        const f = await API.getFalla(id);
        document.getElementById('falla-id').value = f.id;
        document.getElementById('falla-categoria').value = f.categoria;
        document.getElementById('falla-descripcion').value = f.descripcion || '';
        document.getElementById('falla-prioridad').value = f.prioridad;
        if (f.vehiculo) {
            document.getElementById('falla-vehiculo-search').value = `${f.vehiculo.placa} - ${f.vehiculo.marca} ${f.vehiculo.modelo}`;
            const hidden = document.getElementById('falla-vehiculo-id');
            if (hidden) hidden.value = f.vehiculo_id;
        }
        if (f.conductor) {
            document.getElementById('falla-conductor-search').value = f.conductor.nombre;
            const hidden = document.getElementById('falla-conductor-id');
            if (hidden) hidden.value = f.conductor_id;
        }
    } catch (err) {
        console.error('Error cargando falla:', err);
    }
}

function closeFallaForm() {
    const modal = document.getElementById('falla-modal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

async function handleFallaSubmit(e) {
    e.preventDefault();

    const fallaId = document.getElementById('falla-id').value;
    const vehiculoInput = document.getElementById('falla-vehiculo-search');
    const vehiculoHidden = document.getElementById('falla-vehiculo-id');
    const vehiculoId = vehiculoHidden ? parseInt(vehiculoHidden.value) : null;
    const conductorHidden = document.getElementById('falla-conductor-id');
    const conductorId = conductorHidden ? parseInt(conductorHidden.value) || null : null;
    const categoria = document.getElementById('falla-categoria').value;
    const descripcion = document.getElementById('falla-descripcion').value.trim();
    const prioridad = document.getElementById('falla-prioridad').value;

    if (!vehiculoId) {
        showAppAlert('Error', 'Debes seleccionar un vehículo.');
        return;
    }
    if (!categoria) {
        showAppAlert('Error', 'Debes seleccionar una categoría.');
        return;
    }
    if (!descripcion) {
        showAppAlert('Error', 'Debes ingresar una descripción.');
        return;
    }

    const data = { vehiculo_id: vehiculoId, conductor_id: conductorId, categoria, descripcion, prioridad };

    try {
        if (fallaId) {
            await API.updateFalla(parseInt(fallaId), data);
        } else {
            await API.createFalla(data);
        }
        closeFallaForm();
        renderFallasList();
    } catch (err) {
        showAppAlert('Error', err.message || 'No se pudo guardar la falla.');
    }
}

async function verDetalleFalla(id) {
    try {
        const f = await API.getFalla(id);
        if (!f) return;

        const estadoOptions = ESTADOS_FALLA.map(e =>
            `<option value="${e}" ${e === f.estado ? 'selected' : ''}>${LABEL_ESTADO[e] || e}</option>`
        ).join('');

        const detailHtml = `
            <div class="detalle-header">
                <div class="detalle-field">
                    <span class="detalle-label">Vehículo</span>
                    <span class="detalle-value">${f.vehiculo ? `${escapeHtml(f.vehiculo.placa)} - ${escapeHtml(f.vehiculo.marca)} ${escapeHtml(f.vehiculo.modelo)}` : '#' + f.vehiculo_id}</span>
                </div>
                <div class="detalle-field">
                    <span class="detalle-label">Conductor</span>
                    <span class="detalle-value">${f.conductor ? escapeHtml(f.conductor.nombre) : 'No asignado'}</span>
                </div>
                <div class="detalle-field">
                    <span class="detalle-label">Reportado por</span>
                    <span class="detalle-value">${f.usuario ? escapeHtml(f.usuario.nombre) : '#' + f.usuario_id}</span>
                </div>
                <div class="detalle-field">
                    <span class="detalle-label">Fecha</span>
                    <span class="detalle-value">${formatApiDateTime(f.fecha_reporte)}</span>
                </div>
                <div class="detalle-field">
                    <span class="detalle-label">Categoría</span>
                    <span class="detalle-value">${LABEL_CATEGORIA[f.categoria] || f.categoria}</span>
                </div>
                <div class="detalle-field">
                    <span class="detalle-label">Prioridad</span>
                    <span class="detalle-value"><span class="status-badge is-${f.prioridad}">${LABEL_PRIORIDAD[f.prioridad] || f.prioridad}</span></span>
                </div>
                <div class="detalle-field">
                    <span class="detalle-label">Estado</span>
                    <span class="detalle-value">
                        <select class="estado-select" data-falla-id="${f.id}" onchange="cambiarEstadoFalla(${f.id}, this.value)">
                            ${estadoOptions}
                        </select>
                    </span>
                </div>
                <div class="detalle-field detalle-field-full">
                    <span class="detalle-label">Descripción</span>
                    <p class="detalle-desc">${escapeHtml(f.descripcion)}</p>
                </div>
            </div>
        `;

        const modal = document.getElementById('falla-detalle-modal');
        const content = document.getElementById('falla-detalle-content');
        const title = document.getElementById('falla-detalle-title');
        if (!modal || !content) return;
        title.textContent = 'Detalle de Falla';
        content.innerHTML = detailHtml;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    } catch (err) {
        console.error('Error cargando detalle:', err);
    }
}

function closeFallaDetalleModal() {
    const modal = document.getElementById('falla-detalle-modal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

async function cambiarEstadoFalla(id, estado) {
    try {
        await API.updateEstadoFalla(id, estado);
        showAppAlert('Estado actualizado', `Falla cambiada a "${LABEL_ESTADO[estado] || estado}".`);
        renderFallasList();
    } catch (err) {
        showAppAlert('Error', err.message || 'No se pudo actualizar el estado.');
    }
}

function loadVehiculosSelect(searchInputId, resultsId) {
    const input = document.getElementById(searchInputId);
    const results = document.getElementById(resultsId);
    if (!input || !results) return;

    input.addEventListener('input', async () => {
        const q = input.value.trim();
        try {
            const vehiculos = await API.getSelectorVehiculos(q);
            if (!vehiculos || vehiculos.length === 0) {
                results.innerHTML = '<div class="selector-empty">Sin resultados</div>';
                results.style.display = 'block';
                return;
            }
            results.innerHTML = vehiculos.map(v => `
                <div class="selector-result-item" data-id="${v.id}" data-label="${v.placa} - ${v.marca} ${v.modelo}">
                    ${v.placa} - ${v.marca} ${v.modelo}
                </div>
            `).join('');
            results.style.display = 'block';

            results.querySelectorAll('.selector-result-item').forEach(el => {
                el.addEventListener('click', () => {
                    input.value = el.dataset.label;
                    const hidden = document.getElementById('falla-vehiculo-id');
                    if (hidden) hidden.value = el.dataset.id;
                    results.style.display = 'none';
                });
            });
        } catch (err) {
            console.error('Error buscando vehículos:', err);
        }
    });

    input.addEventListener('focus', () => {
        if (results.children.length > 0) results.style.display = 'block';
    });
}

function loadConductoresSelect(searchInputId, resultsId) {
    const input = document.getElementById(searchInputId);
    const results = document.getElementById(resultsId);
    if (!input || !results) return;

    input.addEventListener('input', async () => {
        const q = input.value.trim();
        try {
            const conductores = await API.getSelectorConductores(q);
            if (!conductores || conductores.length === 0) {
                results.innerHTML = '<div class="selector-empty">Sin resultados</div>';
                results.style.display = 'block';
                return;
            }
            results.innerHTML = conductores.map(c => `
                <div class="selector-result-item" data-id="${c.id}" data-label="${c.nombre}">
                    ${c.nombre} - ${c.cedula || ''}
                </div>
            `).join('');
            results.style.display = 'block';

            results.querySelectorAll('.selector-result-item').forEach(el => {
                el.addEventListener('click', () => {
                    input.value = el.dataset.label;
                    const hidden = document.getElementById('falla-conductor-id');
                    if (hidden) hidden.value = el.dataset.id;
                    results.style.display = 'none';
                });
            });
        } catch (err) {
            console.error('Error buscando conductores:', err);
        }
    });

    input.addEventListener('focus', () => {
        if (results.children.length > 0) results.style.display = 'block';
    });
}

function resetFallasFilters() {
    if (APP.admin) {
        APP.admin.fallasFilters = { estado: 'todas', prioridad: 'todas', categoria: 'todas', query: '' };
    }
    const estado = document.getElementById('fallas-filtro-estado');
    const prioridad = document.getElementById('fallas-filtro-prioridad');
    const categoria = document.getElementById('fallas-filtro-categoria');
    const search = document.getElementById('fallas-search');
    if (estado) estado.value = 'todas';
    if (prioridad) prioridad.value = 'todas';
    if (categoria) categoria.value = 'todas';
    if (search) search.value = '';
    renderFallasList();
}
