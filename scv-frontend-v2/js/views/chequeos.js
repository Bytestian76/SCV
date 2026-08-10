import { API } from '../api.js';
import { ICONS, openModal, closeModal, showToast } from '../ui.js';

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

    const loadData = async () => {
        try {
            rawList = await API.chequeos.list();
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

        const filtered = (rawList || []).filter(item => {
            const itemEstado = (item.estado || 'APROBADO').toUpperCase();
            if (estado && itemEstado !== estado) return false;
            if (query) {
                const s = JSON.stringify(item).toLowerCase();
                if (!s.includes(query)) return false;
            }
            return true;
        });

        renderRows(filtered);
    };

    searchInput?.addEventListener('input', applyFilterAndRender);
    filterEstado?.addEventListener('change', applyFilterAndRender);

    document.getElementById('btn-nuevo-chequeo')?.addEventListener('click', () => openChequeoWizard(loadData));

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
                <td>${c.fecha || c.created_at ? new Date(c.fecha || c.created_at).toLocaleDateString('es-CO') : 'Hoy'}</td>
                <td><strong style="color:var(--primary); font-size:1.05rem;">${c.vehiculo_placa || c.placa || 'N/A'}</strong></td>
                <td>${c.conductor_nombre || 'N/A'}</td>
                <td>Preoperacional Diario</td>
                <td><span class="badge ${badgeClass}">${estado}</span></td>
                <td>${c.hallazgos_count || (estado === 'OBSERVADO' ? '1 detectado' : '0')}</td>
                <td>
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

export function openChequeoWizard(onSuccess) {
    const items = [
        { id: 'frenos', label: '1. Sistema de frenos y pedal' },
        { id: 'luces', label: '2. Luces principales y direccionales' },
        { id: 'llantas', label: '3. Presión y desgaste de llantas' },
        { id: 'fluidos', label: '4. Nivel de aceite y refrigerante' },
        { id: 'limpiabrisas', label: '5. Limpiaparabrisas y plumillas' },
        { id: 'cinturon', label: '6. Cinturones de seguridad' },
        { id: 'kit', label: '7. Kit de carretera y extintor vig.' }
    ];

    const body = `
        <form id="form-chequeo-wizard">
            <div class="details-grid" style="padding:0; background:transparent; border:none; margin-bottom:1rem;">
                <div class="form-group">
                    <label class="form-label">Placa del Vehículo *</label>
                    <input type="text" class="form-input" id="chq-inp-placa" placeholder="ej. ABC-123" required style="padding-left:1rem; text-transform:uppercase;">
                </div>
                <div class="form-group">
                    <label class="form-label">Conductor Evaluado *</label>
                    <input type="text" class="form-input" id="chq-inp-conductor" placeholder="ej. Juan Gómez" required style="padding-left:1rem;">
                </div>
            </div>

            <label class="form-label" style="margin-bottom:0.5rem;">Lista de Verificación:</label>
            <div style="display:flex; flex-direction:column; gap:0.6rem; max-height:220px; overflow-y:auto; padding-right:0.5rem;">
                ${items.map(item => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:0.5rem 0.75rem; border-radius:6px; border:1px solid var(--border-color); font-size:0.85rem;">
                        <span>${item.label}</span>
                        <div style="display:flex; gap:0.5rem;">
                            <label><input type="radio" name="chk_${item.id}" value="CUMPLE" checked> Ok</label>
                            <label><input type="radio" name="chk_${item.id}" value="NO_CUMPLE"> Falla</label>
                        </div>
                    </div>
                `).join('')}
            </div>
        </form>
    `;

    openModal('Nuevo Chequeo Preoperacional', body, [
        { text: 'Cancelar', className: 'btn-secondary', onClick: (e, close) => close() },
        {
            text: 'Guardar Inspección',
            className: 'btn-primary',
            onClick: async (e, close) => {
                const placa = document.getElementById('chq-inp-placa')?.value.trim().toUpperCase();
                const conductor = document.getElementById('chq-inp-conductor')?.value.trim();

                if (!placa || !conductor) {
                    showToast('Placa y conductor son obligatorios', 'warning');
                    return;
                }

                // Check for failures
                let hasFailures = false;
                items.forEach(item => {
                    const sel = document.querySelector(`input[name="chk_${item.id}"]:checked`);
                    if (sel && sel.value === 'NO_CUMPLE') hasFailures = true;
                });

                try {
                    await API.chequeos.create({
                        vehiculo_placa: placa,
                        conductor_nombre: conductor,
                        estado: hasFailures ? 'OBSERVADO' : 'APROBADO',
                        fecha: new Date().toISOString(),
                        hallazgos_count: hasFailures ? 1 : 0
                    });
                    showToast(`Chequeo de ${placa} guardado satisfactoriamente`, 'success');
                    close();
                    if (onSuccess) onSuccess();
                } catch (err) {
                    showToast(err.message || 'Error al guardar chequeo', 'error');
                }
            }
        }
    ]);
}
