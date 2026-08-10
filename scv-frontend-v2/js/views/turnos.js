import { API } from '../api.js';
import { ICONS, openModal, closeModal, showToast } from '../ui.js';

export function renderTurnosView() {
    return `
        <!-- TOOLBAR -->
        <div class="toolbar">
            <div class="toolbar-filters">
                <div class="search-box">
                    ${ICONS.search}
                    <input type="text" id="turnos-search" placeholder="Buscar operador o supervisor...">
                </div>
                <select class="filter-select" id="turnos-filter-estado">
                    <option value="">Todos los Estados</option>
                    <option value="ABIERTO">Turno Activo</option>
                    <option value="CERRADO">Cerrado</option>
                </select>
            </div>
            <button class="btn-primary" id="btn-iniciar-turno">
                ${ICONS.plus}
                Apertura de Turno
            </button>
        </div>

        <!-- TABLE CARD -->
        <div class="table-card">
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>ID Turno</th>
                            <th>Operario Responsable</th>
                            <th>Fecha y Hora Inicio</th>
                            <th>Fecha y Hora Cierre</th>
                            <th>Movimientos Atendidos</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="turnos-table-body">
                        <tr><td colspan="7" style="text-align:center; padding:3rem; color:#6b7280;">Cargando turnos operativos...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

export async function initTurnosView(router) {
    let rawList = [];

    const loadData = async () => {
        try {
            rawList = await API.turnos.list();
            renderRows(rawList);
        } catch (err) {
            console.error("Error loading turnos:", err);
            const tbody = document.getElementById('turnos-table-body');
            if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger); padding:2rem;">Error al cargar turnos.</td></tr>`;
        }
    };

    document.getElementById('btn-iniciar-turno')?.addEventListener('click', () => openAperturaTurnoModal(loadData));

    await loadData();
}

function renderRows(items) {
    const tbody = document.getElementById('turnos-table-body');
    if (!tbody) return;

    if (!items || items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:3rem; color:#6b7280;">No hay turnos registrados recientemente.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(t => {
        const isAbierto = t.estado === 'ABIERTO' || !t.fecha_cierre;
        return `
            <tr>
                <td><strong>TRN-${t.id || '01'}</strong></td>
                <td><strong>${t.usuario_nombre || t.operario || 'Operario'}</strong></td>
                <td>${t.fecha_inicio ? new Date(t.fecha_inicio).toLocaleString('es-CO') : 'Hoy 06:00 AM'}</td>
                <td>${t.fecha_cierre ? new Date(t.fecha_cierre).toLocaleString('es-CO') : '<span style="color:#16a34a; font-weight:600;">En curso</span>'}</td>
                <td>${t.movimientos_count || 12} movimientos</td>
                <td><span class="badge ${isAbierto ? 'badge-success' : 'badge-gray'}">${isAbierto ? 'ACTIVO' : 'CERRADO'}</span></td>
                <td>
                    ${isAbierto 
                        ? `<button class="btn-primary" style="padding:0.3rem 0.6rem; font-size:0.75rem; background:var(--danger);" data-close-trn="${t.id}">Cerrar Turno</button>`
                        : `<button class="btn-action view" data-view-trn="${t.id}">${ICONS.eye}</button>`
                    }
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('button[data-close-trn]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-close-trn');
            try {
                await API.turnos.cerrar(id);
                showToast('Turno cerrado exitosamente', 'success');
                initTurnosView();
            } catch (err) {
                showToast(err.message || 'Error al cerrar turno', 'error');
            }
        });
    });
}

function openAperturaTurnoModal(onSuccess) {
    const body = `
        <form id="form-turno-open">
            <div class="form-group">
                <label class="form-label">Nombre del Operador *</label>
                <input type="text" class="form-input" id="trn-inp-nombre" placeholder="ej. Carlos Pérez" required style="padding-left:1rem;">
            </div>
            <div class="form-group">
                <label class="form-label">Observaciones iniciales del patio</label>
                <textarea class="form-input" id="trn-inp-obs" rows="2" placeholder="Estado general del patio de maniobras al recibir turno..." style="padding:0.6rem 1rem;"></textarea>
            </div>
        </form>
    `;

    openModal('Apertura de Nuevo Turno', body, [
        { text: 'Cancelar', className: 'btn-secondary', onClick: (e, close) => close() },
        {
            text: 'Iniciar Turno',
            className: 'btn-primary',
            onClick: async (e, close) => {
                const nombre = document.getElementById('trn-inp-nombre')?.value.trim();
                const obs = document.getElementById('trn-inp-obs')?.value.trim();

                if (!nombre) {
                    showToast('El nombre del operador es obligatorio', 'warning');
                    return;
                }

                try {
                    await API.turnos.iniciar({
                        operario: nombre,
                        observaciones: obs,
                        fecha_inicio: new Date().toISOString(),
                        estado: 'ABIERTO'
                    });
                    showToast('Turno iniciado con éxito', 'success');
                    close();
                    if (onSuccess) onSuccess();
                } catch (err) {
                    showToast(err.message || 'Error al iniciar turno', 'error');
                }
            }
        }
    ]);
}
