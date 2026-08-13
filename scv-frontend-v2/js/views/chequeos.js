import { API } from '../api.js';
import { ICONS, openModal, closeModal, showToast } from '../ui.js';
import { exportChequeosExcel, exportChequeosPdf } from '../exports.js';

export function renderChequeosView() {
    return `
        <!-- TOOLBAR -->
        <div class="toolbar">
            <div class="toolbar-filters">
                <div class="search-box">
                    ${ICONS.search}
                    <input type="text" id="chq-search" placeholder="Buscar por placa o conductor...">
                </div>
                <select class="filter-select" id="chq-filter-estado">
                    <option value="">Todos los Estados</option>
                    <option value="APROBADO">Aprobados</option>
                    <option value="OBSERVADO">Con Observaciones</option>
                    <option value="RECHAZADO">Rechazados</option>
                </select>
            </div>
            <div style="display:flex; gap:0.75rem; align-items:center;">
                <div class="export-btns" style="display:flex; gap:0.5rem; align-items:center;">
                    <button class="btn-outline" id="btn-export-excel" title="Exportar a Excel" style="border-color: var(--border); padding: 0.5rem 1rem;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                        Exportar Excel
                    </button>
                    <button class="btn-outline" id="btn-export-pdf" title="Exportar a PDF" style="border-color: var(--border); padding: 0.5rem 1rem;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                        Exportar PDF
                    </button>
                </div>
                <button class="btn-primary" id="btn-nuevo-chequeo">
                    ${ICONS.plus}
                    Nuevo Chequeo Preoperacional
                </button>
            </div>

        <!-- TABLE CARD -->
        <div class="table-card">
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Vehículo (Placa)</th>
                            <th>Conductor</th>
                            <th>Tipo Chequeo</th>
                            <th>Estado / Dictamen</th>
                            <th>Hallazgos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="chequeos-table-body">
                        <tr><td colspan="7" style="text-align:center; padding:3rem; color:#6b7280;">Cargando historial de chequeos preoperacionales...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

export async function initChequeosView(router) {
    const searchInput = document.getElementById('chq-search');
    const filterEstado = document.getElementById('chq-filter-estado');
    let rawList = [];
    let currentFiltered = [];

    const loadData = async () => {
        try {
            const res = await API.chequeos.list();
            rawList = Array.isArray(res) ? res : (res?.items || []);
            applyFilterAndRender();
        } catch (err) {
            console.error("Error loading chequeos:", err);
            const tbody = document.getElementById('chequeos-table-body');
            if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger); padding:2rem;">Error al cargar datos.</td></tr>`;
        }
    };

    const applyFilterAndRender = () => {
        const query = searchInput?.value.toLowerCase().trim() || '';
        const estado = filterEstado?.value || '';

        currentFiltered = (rawList || []).filter(item => {
            const itemEstado = (item.estado || 'APROBADO').toUpperCase();
            if (estado && itemEstado !== estado) return false;
            if (query) {
                const s = JSON.stringify(item).toLowerCase();
                if (!s.includes(query)) return false;
            }
            return true;
        });

        renderRows(currentFiltered);
    };

    searchInput?.addEventListener('input', applyFilterAndRender);
    filterEstado?.addEventListener('change', applyFilterAndRender);

    document.getElementById('btn-nuevo-chequeo')?.addEventListener('click', () => openChequeoWizard(loadData));

    // Exportación
    document.getElementById('btn-export-excel')?.addEventListener('click', () => {
        if (!currentFiltered.length) { showToast('No hay datos para exportar', 'warning'); return; }
        if (exportChequeosExcel(currentFiltered)) showToast(`${currentFiltered.length} chequeos exportados a Excel`, 'success');
    });
    document.getElementById('btn-export-pdf')?.addEventListener('click', async () => {
        if (!currentFiltered.length) { showToast('No hay datos para exportar', 'warning'); return; }
        showToast('Generando PDF...', 'info');
        const ok = await exportChequeosPdf(currentFiltered);
        if (!ok) showToast('No se pudo generar el PDF', 'error');
    });

    // Global listener for dashboard trigger
    window.addEventListener('scv:open-chequeo-modal', () => openChequeoWizard(loadData));

    await loadData();
}

function renderRows(items) {
    const tbody = document.getElementById('chequeos-table-body');
    if (!tbody) return;

    if (!items || items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:3rem; color:#6b7280;">No se encontraron registros de chequeo.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(c => {
        const estado = c.estado || (c.hallazgos_count > 0 ? 'OBSERVADO' : 'APROBADO');
        let badgeClass = 'badge-success';
        if (estado === 'OBSERVADO') badgeClass = 'b-warning';
        if (estado === 'RECHAZADO') badgeClass = 'b-danger';

        return `
            <tr>
                <td data-label="Fecha">${c.fecha || c.created_at ? new Date(c.fecha || c.created_at).toLocaleDateString('es-CO') : 'Hoy'}</td>
                <td data-label="Placa"><strong style="color:var(--primary); font-size:1.05rem;">${c.vehiculo_placa || c.placa || 'N/A'}</strong></td>
                <td data-label="Conductor">${c.conductor_nombre || 'N/A'}</td>
                <td data-label="Tipo Chequeo">Preoperacional Diario</td>
                <td data-label="Estado"><span class="badge ${badgeClass}">${estado}</span></td>
                <td data-label="Hallazgos">${c.hallazgos_count || (estado === 'OBSERVADO' ? '1 detectado' : '0')}</td>
                <td data-label="Acciones">
                    <button class="btn-action view" data-chq-id="${c.id}" title="Ver Inspección">${ICONS.eye}</button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('.btn-action.view').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-chq-id');
            const item = items.find(i => String(i.id) === String(id));
            if (item) openChequeoDetailsModal(item);
        });
    });
}

function openChequeoDetailsModal(item) {
    const body = `
        <div class="details-grid">
            <div class="detail-item"><span class="detail-label">Vehículo</span><span class="detail-value">${item.vehiculo_placa || 'N/A'}</span></div>
            <div class="detail-item"><span class="detail-label">Inspector / Conductor</span><span class="detail-value">${item.conductor_nombre || 'N/A'}</span></div>
            <div class="detail-item"><span class="detail-label">Fecha Inspección</span><span class="detail-value">${item.fecha ? new Date(item.fecha).toLocaleString('es-CO') : 'Reciente'}</span></div>
            <div class="detail-item"><span class="detail-label">Dictamen</span><span class="detail-value">${item.estado || 'APROBADO'}</span></div>
        </div>
        <h4 style="margin: 1.25rem 0 0.5rem; font-size:0.95rem; font-weight:700; color:var(--text-main);">Ítems Verificados</h4>
        <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:8px; padding:0.75rem 1rem; font-size:0.85rem; display:flex; flex-direction:column; gap:0.5rem;">
            <div style="display:flex; justify-content:space-between;"><span>• Sistema de frenos y emergencia:</span> <strong style="color:#16a34a;">CONFORME</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>• Luces altas, bajas y direccionales:</span> <strong style="color:#16a34a;">CONFORME</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>• Estado y labrado de neumáticos:</span> <strong style="color:#16a34a;">CONFORME</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>• Niveles de fluidos y refrigerante:</span> <strong style="color:#16a34a;">CONFORME</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>• Equipo de prevención y seguridad:</span> <strong style="color:#16a34a;">CONFORME</strong></div>
        </div>
    `;

    openModal(`Inspección Preoperacional: ${item.vehiculo_placa || 'Vehículo'}`, body, [
        { text: 'Cerrar', className: 'btn-secondary', onClick: (e, close) => close() }
    ]);
}

export async function openChequeoWizard(onSuccess) {
    let SECCIONES = [];
    try {
        const formInfo = await API.chequeos.getFormulario();
        SECCIONES = formInfo.secciones || [];
    } catch (err) {
        showToast('Error cargando el formulario preoperacional', 'error');
        return;
    }


    const renderItems = (items) => items.map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:0.35rem 0.6rem; border-radius:5px; border:1px solid var(--border-color); font-size:0.8rem; gap:0.5rem;">
            <span style="flex:1; min-width:120px;">${item.label}</span>
            <div style="display:flex; gap:0.35rem; flex-wrap:wrap; justify-content:flex-end;">
                ${(item.options || []).map((o, i) => `<label style="white-space:nowrap; font-size:0.78rem; cursor:pointer;"><input type="radio" name="chk_${item.item}" value="${o}" ${i === 0 ? 'checked' : ''}> ${o.replace(/_/g, ' ')}</label>`).join('')}
            </div>
        </div>
    `).join('');

    const body = `
        <form id="form-chequeo-wizard">
            <div class="details-grid" style="padding:0; background:transparent; border:none; margin-bottom:1rem;">
                <div class="form-group">
                    <label class="form-label">Placa del Vehículo *</label>
                    <input type="text" class="form-input" id="chq-inp-placa" list="chq-dl-placas" placeholder="ej. ABC-123" required style="padding-left:1rem; text-transform:uppercase;" autocomplete="off">
                    <datalist id="chq-dl-placas"></datalist>
                </div>
                <div class="form-group">
                    <label class="form-label">Conductor Evaluado *</label>
                    <input type="text" class="form-input" id="chq-inp-conductor" list="chq-dl-conductores" placeholder="ej. Juan Gómez" required style="padding-left:1rem;" autocomplete="off">
                    <datalist id="chq-dl-conductores"></datalist>
                </div>
            </div>
            <div class="form-group" style="margin-bottom:1rem;">
                <label class="form-label">Kilometraje Actual *</label>
                <input type="number" class="form-input" id="chq-inp-km" placeholder="ej. 45200" required style="padding-left:1rem;" min="0">
            </div>

            <label class="form-label" style="margin-bottom:0.5rem;">Lista de Verificación Preoperacional</label>
            <div style="display:flex; flex-direction:column; gap:0.75rem; max-height:340px; overflow-y:auto; padding:0.75rem; border:1px solid var(--border-color); border-radius:8px;">
                ${SECCIONES.map(sec => `
                    <div>
                        <div style="font-weight:700; color:var(--primary); padding:0.2rem 0; border-bottom:1px solid var(--border-color); margin-bottom:0.35rem; font-size:0.82rem;">${sec.label}</div>
                        <div style="display:flex; flex-direction:column; gap:0.3rem;">
                            ${renderItems(sec.items)}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="form-group" style="margin-top:0.75rem;">
                <label class="form-label">Observaciones Generales</label>
                <textarea class="form-input" id="chq-inp-obs" rows="2" placeholder="Opcional..." style="padding:0.6rem 1rem;"></textarea>
            </div>
        </form>
    `;

    // Store loaded data in closure for submit lookup
    let vehiculosData = [];
    let conductoresData = [];

    openModal('Nuevo Chequeo Preoperacional', body, [
        { text: 'Cancelar', className: 'btn-secondary', onClick: (e, close) => close() },
        {
            text: 'Guardar Inspección',
            className: 'btn-primary',
            onClick: async (e, close) => {
                const placaRaw = document.getElementById('chq-inp-placa')?.value.trim().toUpperCase();
                const conductorNombre = document.getElementById('chq-inp-conductor')?.value.trim();
                const kmVal = parseFloat(document.getElementById('chq-inp-km')?.value) || 0;
                const obsGenerales = document.getElementById('chq-inp-obs')?.value.trim() || null;

                if (!placaRaw || !conductorNombre) {
                    showToast('Placa y conductor son obligatorios', 'warning');
                    return;
                }
                if (!kmVal || kmVal <= 0) {
                    showToast('El kilometraje es obligatorio y debe ser mayor a 0', 'warning');
                    return;
                }

                // Find vehiculo_id by placa (exact match)
                const vehiculo = vehiculosData.find(v => v.placa && v.placa.toUpperCase() === placaRaw);
                if (!vehiculo) {
                    showToast(`Vehículo con placa ${placaRaw} no encontrado. Verifica la placa.`, 'error');
                    return;
                }
                // Find conductor_id by name (case-insensitive partial match)
                const conductorLower = conductorNombre.toLowerCase();
                const conductor = conductoresData.find(c => c.nombre && c.nombre.toLowerCase().includes(conductorLower));
                if (!conductor) {
                    showToast(`Conductor '${conductorNombre}' no encontrado. Verifica el nombre.`, 'error');
                    return;
                }

                // Collect all item values from the form
                const chequeoItems = [];
                for (const sec of SECCIONES) {
                    for (const item of sec.items) {
                        const selected = document.querySelector(`input[name="chk_${item.item}"]:checked`);
                        chequeoItems.push({
                            seccion: sec.nombre,
                            item: item.item,
                            valor: selected ? selected.value : (item.options?.[0] || '')
                        });
                    }
                }

                try {
                    // Step 1: Create chequeo header
                    const chequeo = await API.chequeos.create({
                        vehiculo_id: vehiculo.id,
                        conductor_id: conductor.id,
                        kilometraje: Math.round(kmVal),
                        obs_generales: obsGenerales,
                    });
                    // Step 2: Submit all checklist items in one batch call
                    await API.chequeos.createItems(chequeo.id, chequeoItems);
                    showToast(`Chequeo de ${placaRaw} guardado satisfactoriamente`, 'success');
                    close();
                    if (onSuccess) onSuccess();
                } catch (err) {
                    showToast(err.message || 'Error al guardar chequeo', 'error');
                }
            }
        }
    ]);

    // Load smart search data asynchronously for datalists
    setTimeout(async () => {
        try {
            const [vRes, cRes] = await Promise.all([
                API.vehiculos ? API.vehiculos.list().catch(() => []) : [],
                API.conductores ? API.conductores.list().catch(() => []) : []
            ]);
            vehiculosData = Array.isArray(vRes) ? vRes : (vRes?.items || []);
            conductoresData = Array.isArray(cRes) ? cRes : (cRes?.items || []);

            const dlPlacas = document.getElementById('chq-dl-placas');
            if (dlPlacas && vehiculosData.length) {
                dlPlacas.innerHTML = vehiculosData.map(v => `<option value="${v.placa}">${v.marca || ''} ${v.modelo || ''}</option>`).join('');
            }

            const dlCond = document.getElementById('chq-dl-conductores');
            if (dlCond && conductoresData.length) {
                dlCond.innerHTML = conductoresData.map(c => `<option value="${c.nombre}">CC: ${c.cedula || ''}</option>`).join('');
            }
        } catch (e) {
            console.error('Error loading datalists', e);
        }
    }, 100);
}


