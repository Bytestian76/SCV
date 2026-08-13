import { API } from '../api.js';
import { ICONS, openModal, closeModal, showToast } from '../ui.js';
import { exportMovimientosExcel, exportMovimientosPdf } from '../exports.js';

export function renderMovimientosView() {
    return `
        <!-- TOOLBAR -->
        <div class="toolbar">
            <div class="toolbar-filters">
                <div class="search-box">
                    ${ICONS.search}
                    <input type="text" id="mov-search" placeholder="Buscar por placa, conductor o destino...">
                </div>
                <select class="filter-select" id="mov-filter-tipo">
                    <option value="">Todos los Movimientos</option>
                    <option value="ENTRADA">Solo Entradas</option>
                    <option value="SALIDA">Solo Salidas</option>
                </select>
            </div>
            <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
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
                <button class="btn-primary" id="btn-reg-entrada" style="background:#16a34a;">
                    <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                    Registrar Entrada
                </button>
                <button class="btn-primary" id="btn-reg-salida" style="background:#ea580c;">
                    <svg viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                    Registrar Salida
                </button>
            </div>
        </div>

        <!-- TABLE CARD -->
        <div class="table-card">
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha y Hora</th>
                            <th>Tipo</th>
                            <th>Vehículo (Placa)</th>
                            <th>Conductor</th>
                            <th>Kilometraje</th>
                            <th>Destino / Origen</th>
                            <th>Novedades</th>
                        </tr>
                    </thead>
                    <tbody id="movimientos-table-body">
                        <tr><td colspan="7" style="text-align:center; padding:3rem; color:#6b7280;">Cargando movimientos del patio...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

export async function initMovimientosView(router) {
    const searchInput = document.getElementById('mov-search');
    const filterTipo = document.getElementById('mov-filter-tipo');
    let rawList = [];
    let currentFiltered = [];

    const loadData = async () => {
        try {
            const res = await API.movimientos.list();
            rawList = Array.isArray(res) ? res : (res?.items || []);
            applyFilterAndRender();
        } catch (err) {
            console.error("Error loading movimientos:", err);
            const tbody = document.getElementById('movimientos-table-body');
            if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger); padding:2rem;">Error al cargar datos.</td></tr>`;
        }
    };

    const applyFilterAndRender = () => {
        const query = searchInput?.value.toLowerCase().trim() || '';
        const tipo = filterTipo?.value || '';

        currentFiltered = (rawList || []).filter(item => {
            const itemTipo = item.tipo_movimiento || item.tipo;
            if (tipo && itemTipo !== tipo) return false;
            if (query) {
                const s = JSON.stringify(item).toLowerCase();
                if (!s.includes(query)) return false;
            }
            return true;
        });

        renderRows(currentFiltered);
    };

    searchInput?.addEventListener('input', applyFilterAndRender);
    filterTipo?.addEventListener('change', applyFilterAndRender);

    document.getElementById('btn-reg-entrada')?.addEventListener('click', () => openMovimientoModal('ENTRADA', loadData));
    document.getElementById('btn-reg-salida')?.addEventListener('click', () => openMovimientoModal('SALIDA', loadData));

    // Exportación
    document.getElementById('btn-export-excel')?.addEventListener('click', () => {
        if (!currentFiltered.length) { showToast('No hay datos para exportar', 'warning'); return; }
        if (exportMovimientosExcel(currentFiltered)) showToast(`${currentFiltered.length} movimientos exportados a Excel`, 'success');
    });
    document.getElementById('btn-export-pdf')?.addEventListener('click', async () => {
        if (!currentFiltered.length) { showToast('No hay datos para exportar', 'warning'); return; }
        showToast('Generando PDF...', 'info');
        const ok = await exportMovimientosPdf(currentFiltered);
        if (!ok) showToast('No se pudo generar el PDF', 'error');
    });

    // Global listener for dashboard triggers
    window.addEventListener('scv:open-movimiento-modal', (e) => {
        openMovimientoModal(e.detail?.tipo || 'ENTRADA', loadData);
    });

    await loadData();
}

function renderRows(items) {
    const tbody = document.getElementById('movimientos-table-body');
    if (!tbody) return;

    if (!items || items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:3rem; color:#6b7280;">No se registraron movimientos en el periodo seleccionado.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(m => {
        const isEntrada = (m.tipo_movimiento || m.tipo) === 'ENTRADA';
        const dateFormatted = m.fecha_hora || m.created_at ? new Date(m.fecha_hora || m.created_at).toLocaleString('es-CO') : 'Reciente';

        return `
            <tr>
                <td data-label="Fecha y Hora">${dateFormatted}</td>
                <td data-label="Tipo">
                    <span class="badge ${isEntrada ? 'badge-success' : 'b-warning'}">
                        ${isEntrada ? 'ENTRADA' : 'SALIDA'}
                    </span>
                </td>
                <td data-label="Placa"><strong style="color:var(--primary); font-size:1.05rem;">${m.vehiculo?.placa || m.vehiculo_placa || m.placa || 'N/A'}</strong></td>
                <td data-label="Conductor">${m.conductor?.nombre || m.conductor_nombre || m.conductor || 'N/A'}</td>
                <td data-label="Kilometraje">${m.kilometraje ? `${m.kilometraje.toLocaleString()} km` : 'N/A'}</td>
                <td data-label="Destino / Origen">${m.proveedor || m.destino || m.origen || 'Patio Central'}</td>
                <td data-label="Novedades">${m.observaciones || m.novedades || '<span style="color:#9ca3af;">Sin novedades</span>'}</td>
            </tr>
        `;
    }).join('');
}

export function openMovimientoModal(tipo = 'ENTRADA', onSuccess) {
    const isEntrada = tipo === 'ENTRADA';
    // Store loaded data in closure for lookup during submit
    let vehiculosData = [];
    let conductoresData = [];

    const body = `
        <form id="modal-form-movimiento">
            <div class="form-group">
                <label class="form-label">Placa del Vehículo *</label>
                <input type="text" class="form-input" id="mov-inp-placa" list="mov-dl-placas" placeholder="ej. ABC-123" required style="padding-left:1rem; text-transform:uppercase;" autocomplete="off">
                <datalist id="mov-dl-placas"></datalist>
            </div>
            <div class="form-group">
                <label class="form-label">Nombre del Conductor *</label>
                <input type="text" class="form-input" id="mov-inp-conductor" list="mov-dl-conductores" placeholder="ej. Juan Gómez" required style="padding-left:1rem;" autocomplete="off">
                <datalist id="mov-dl-conductores"></datalist>
            </div>
            <div class="details-grid" style="padding:0; background:transparent; border:none; margin-bottom:1rem;">
                <div class="form-group">
                    <label class="form-label">Kilometraje Actual *</label>
                    <input type="number" class="form-input" id="mov-inp-km" placeholder="Ej. 45200" required style="padding-left:1rem;">
                    <small style="color:#6b7280; font-size:0.8rem; margin-top:0.2rem; display:block;">Debe ser mayor al último registro</small>
                </div>
                <div class="form-group">
                    <label class="form-label">${isEntrada ? 'Origen' : 'Destino / Ruta'}</label>
                    <input type="text" class="form-input" id="mov-inp-destino" placeholder="${isEntrada ? 'Sede Norte' : 'Ruta Zona Industrial'}" style="padding-left:1rem;">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Observaciones / Novedades</label>
                <textarea class="form-input" id="mov-inp-obs" rows="2" placeholder="Opcional: novedades del viaje o estado visual..." style="padding:0.6rem 1rem;"></textarea>
            </div>
        </form>
    `;

    openModal(`Registrar ${isEntrada ? 'Entrada al Patio' : 'Salida de Patio'}`, body, [
        { text: 'Cancelar', className: 'btn-secondary', onClick: (e, close) => close() },
        {
            text: `Confirmar ${isEntrada ? 'Entrada' : 'Salida'}`,
            className: 'btn-primary',
            attrs: isEntrada ? 'style="background:#16a34a;"' : 'style="background:#ea580c;"',
            onClick: async (e, close) => {
                const placaRaw = document.getElementById('mov-inp-placa')?.value.trim().toUpperCase();
                const conductorNombre = document.getElementById('mov-inp-conductor')?.value.trim();
                const km = parseFloat(document.getElementById('mov-inp-km')?.value) || 0;
                const destino = document.getElementById('mov-inp-destino')?.value.trim();
                const obs = document.getElementById('mov-inp-obs')?.value.trim();

                if (!placaRaw || !conductorNombre) {
                    showToast('Placa y conductor son obligatorios', 'warning');
                    return;
                }
                if (isNaN(km) || km <= 0) {
                    showToast('El kilometraje es obligatorio y debe ser mayor a 0', 'warning');
                    return;
                }

                // Find vehiculo_id by placa
                const vehiculo = vehiculosData.find(v => v.placa && v.placa.toUpperCase() === placaRaw);
                if (!vehiculo) {
                    showToast(`Vehículo con placa ${placaRaw} no encontrado. Verifica la placa.`, 'error');
                    return;
                }

                // Find conductor_id by name (case-insensitive partial match)
                const conductorNombreLower = conductorNombre.toLowerCase();
                const conductor = conductoresData.find(c => 
                    c.nombre && c.nombre.toLowerCase().includes(conductorNombreLower)
                );
                if (!conductor) {
                    showToast(`Conductor '${conductorNombre}' no encontrado. Verifica el nombre.`, 'error');
                    return;
                }

                try {
                    await API.movimientos.create({
                        tipo: tipo.toLowerCase(),
                        vehiculo_id: vehiculo.id,
                        conductor_id: conductor.id,
                        kilometraje: Math.round(km),
                        proveedor: destino || null,
                        observaciones: obs || null,
                    });
                    showToast(`${tipo === 'ENTRADA' ? 'Entrada' : 'Salida'} de ${placaRaw} registrada`, 'success');
                    close();
                    if (onSuccess) onSuccess();
                } catch (err) {
                    showToast(err.message || 'Error al registrar movimiento', 'error');
                }
            }
        }
    ]);

    // Load smart search data asynchronously
    setTimeout(async () => {
        try {
            const [vRes, cRes] = await Promise.all([
                API.vehiculos ? API.vehiculos.list().catch(() => []) : [],
                API.conductores ? API.conductores.list().catch(() => []): []
            ]);
            vehiculosData = Array.isArray(vRes) ? vRes : (vRes?.items || []);
            conductoresData = Array.isArray(cRes) ? cRes : (cRes?.items || []);

            const dlPlacas = document.getElementById('mov-dl-placas');
            if (dlPlacas && vehiculosData.length) {
                dlPlacas.innerHTML = vehiculosData.map(v => `<option value="${v.placa}">${v.marca || ''} ${v.modelo || ''}</option>`).join('');
            }

            const dlCond = document.getElementById('mov-dl-conductores');
            if (dlCond && conductoresData.length) {
                dlCond.innerHTML = conductoresData.map(c => `<option value="${c.nombre}">CC: ${c.cedula || ''}</option>`).join('');
            }
        } catch (e) {
            console.error('Error loading datalists', e);
        }
    }, 100);
}
