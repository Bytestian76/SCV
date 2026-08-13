import { API } from '../api.js';
import { ICONS, openModal, closeModal, showToast } from '../ui.js';
import {
    exportVehiculosExcel, exportVehiculosPdf,
    exportConductoresExcel, exportConductoresPdf,
    exportUsuariosExcel, exportUsuariosPdf
} from '../exports.js';

export function renderGestionView(entityType = 'vehiculos') {
    const user = typeof APP !== 'undefined' && APP.user ? APP.user : {};
    const role = user.rol ? user.rol.toUpperCase() : 'ADMIN';
    const isMecanico = role === 'MECANICO' || role === 'JEFE_MECANICOS';
    const isAdmin = role === 'ADMIN';

    const titles = {
        'vehiculos': 'GESTIÓN DE VEHÍCULOS',
        'conductores': 'GESTIÓN DE CONDUCTORES',
        'usuarios': 'GESTIÓN DE USUARIOS'
    };

    const newBtnLabels = {
        'vehiculos': 'Registrar Vehículo',
        'conductores': 'Registrar Conductor',
        'usuarios': 'Registrar Usuario'
    };

    const placeholders = {
        'vehiculos': 'Buscar por placa, tipo o marca...',
        'conductores': 'Buscar por nombre, cédula o licencia...',
        'usuarios': 'Buscar por nombre o correo electrónico...'
    };

    return `
        <!-- HEADER CONTROLS (TABS SI ES ADMIN) -->
        <div class="tabs-header">
            <button class="tab-btn active" data-gestion="vehiculos">
                ${ICONS.vehiculos} Vehículos
            </button>
            ${isAdmin ? `
            <button class="tab-btn ${entityType === 'conductores' ? 'active' : ''}" data-gestion="conductores">
                ${ICONS.conductores} Conductores
            </button>
            <button class="tab-btn ${entityType === 'usuarios' ? 'active' : ''}" data-gestion="usuarios">
                ${ICONS.usuarios} Usuarios
            </button>
            ` : ''}
        </div>

        <!-- TOOLBAR (SEARCH & FILTERS & ADD BTN) -->
        <div class="toolbar">
            <div class="toolbar-filters">
                <div class="search-box">
                    ${ICONS.search}
                    <input type="text" id="gestion-search-input" placeholder="${placeholders[entityType] || 'Buscar...'}">
                </div>
                <select class="filter-select" id="gestion-filter-estado">
                    <option value="">Todos los Estados</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="MANTENIMIENTO">En Mantenimiento</option>
                    <option value="INACTIVO">Inactivo</option>
                </select>
                ${entityType === 'vehiculos' ? `
                    <select class="filter-select" id="gestion-filter-tipo">
                        <option value="">Todos los Tipos</option>
                        <option value="CAMION">Camión</option>
                        <option value="FURGON">Furgón</option>
                        <option value="MOTO">Motocicleta</option>
                        <option value="VOLQUETA">Volqueta</option>
                    </select>
                ` : ''}
            </div>
            
            <!-- ACTION BUTTONS -->
            <div class="export-btns" style="display:flex; gap:0.5rem; align-items:center; margin-right:1rem;">
                <button id="btn-export-excel" class="btn-outline" title="Exportar tabla a Excel" style="border-color: var(--border); padding: 0.5rem 1rem;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                    Exportar Excel
                </button>
                <button id="btn-export-pdf" class="btn-outline" title="Exportar tabla a PDF" style="border-color: var(--border); padding: 0.5rem 1rem;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    Exportar PDF
                </button>
            </div>
            ${!isMecanico ? `
            <button id="btn-gestion-new" class="btn-primary">
                ${ICONS.plus}
                ${newBtnLabels[entityType] || 'Registrar'}
            </button>
            ` : ''}
        </div>

        <!-- TABLE CARD -->
        <div class="table-card">
            <div class="table-responsive">
                <table id="gestion-data-table">
                    <thead>
                        ${renderTableHeader(entityType)}
                    </thead>
                    <tbody id="gestion-table-body">
                        <tr>
                            <td colspan="6" style="text-align:center; padding:3rem; color:#6b7280;">Cargando registros...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderTableHeader(entityType) {
    if (entityType === 'vehiculos') {
        return `
            <tr>
                <th>Identificación (Placa)</th>
                <th>Tipo de Vehículo</th>
                <th>Capacidad / Detalles</th>
                <th>Estado Actual</th>
                <th>Última Inspección</th>
                <th>Acciones</th>
            </tr>
        `;
    } else if (entityType === 'conductores') {
        return `
            <tr>
                <th>Nombre Completo</th>
                <th>Identificación / Cédula</th>
                <th>Licencia / Categoría</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
            </tr>
        `;
    } else {
        return `
            <tr>
                <th>Nombre de Usuario</th>
                <th>Correo Electrónico</th>
                <th>Rol en el Sistema</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
            </tr>
        `;
    }
}

export async function initGestionView(entityType = 'vehiculos', router) {
    // Bind Tab navigation
    document.querySelectorAll('.tab-btn[data-gestion]').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-gestion');
            router.navigate(`gestion-${target}`);
        });
    });

    let rawData = [];
    let currentFiltered = [];

    const loadTableData = async () => {
        try {
            let res;
            if (entityType === 'vehiculos') {
                res = await API.vehiculos.list();
            } else if (entityType === 'conductores') {
                res = await API.conductores.list();
            } else {
                res = await API.usuarios.list();
            }
            // Handle PaginatedResponse {items:[...]} or plain array
            rawData = Array.isArray(res) ? res : (res?.items || []);
            applyFiltersAndRender();
        } catch (err) {
            console.error(`Error loading ${entityType}:`, err);
            showToast(`Error al cargar lista de ${entityType}`, 'error');
            const tbody = document.getElementById('gestion-table-body');
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#dc2626; padding:2rem;">Error al obtener datos del servidor.</td></tr>`;
        }
    };


    const applyFiltersAndRender = () => {
        const query = document.getElementById('gestion-search-input')?.value.toLowerCase().trim() || '';
        const estado = document.getElementById('gestion-filter-estado')?.value || '';
        const tipo = document.getElementById('gestion-filter-tipo')?.value || '';

        currentFiltered = (rawData || []).filter(item => {
            if (estado) {
                const itemEstado = (item.estado || (item.activo ? 'ACTIVO' : 'INACTIVO')).toUpperCase();
                if (itemEstado !== estado) return false;
            }
            if (tipo && entityType === 'vehiculos') {
                const itemTipo = (item.tipo_vehiculo || item.tipo || '').toUpperCase();
                if (!itemTipo.includes(tipo)) return false;
            }
            if (query) {
                const matchStr = JSON.stringify(item).toLowerCase();
                if (!matchStr.includes(query)) return false;
            }
            return true;
        });

        renderTableRows(currentFiltered, entityType);
    };

    const searchInput = document.getElementById('gestion-search-input');
    const estadoFilter = document.getElementById('gestion-filter-estado');
    const tipoFilter = document.getElementById('gestion-filter-tipo');

    searchInput?.addEventListener('input', applyFiltersAndRender);
    estadoFilter?.addEventListener('change', applyFiltersAndRender);
    tipoFilter?.addEventListener('change', applyFiltersAndRender);

    document.getElementById('btn-gestion-new')?.addEventListener('click', () => {
        openCreateModal(entityType, loadTableData);
    });

    // ── Exportación ──────────────────────────────────────────────────────────
    document.getElementById('btn-export-excel')?.addEventListener('click', () => {
        if (!currentFiltered.length) { showToast('No hay datos para exportar', 'warning'); return; }
        let ok;
        if (entityType === 'vehiculos') ok = exportVehiculosExcel(currentFiltered);
        else if (entityType === 'conductores') ok = exportConductoresExcel(currentFiltered);
        else ok = exportUsuariosExcel(currentFiltered);
        if (ok) showToast(`${currentFiltered.length} registros exportados a Excel`, 'success');
    });

    document.getElementById('btn-export-pdf')?.addEventListener('click', async () => {
        if (!currentFiltered.length) { showToast('No hay datos para exportar', 'warning'); return; }
        showToast('Generando PDF...', 'info');
        let ok;
        if (entityType === 'vehiculos') ok = await exportVehiculosPdf(currentFiltered);
        else if (entityType === 'conductores') ok = await exportConductoresPdf(currentFiltered);
        else ok = await exportUsuariosPdf(currentFiltered);
        if (!ok) showToast('No se pudo generar el PDF. Revisa tu conexión.', 'error');
    });

    await loadTableData();
}

function renderTableRows(items, entityType) {
    const tbody = document.getElementById('gestion-table-body');
    if (!tbody) return;

    if (!items || items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:3rem; color:#6b7280;">No se encontraron registros que coincidan con la búsqueda.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(item => {
        if (entityType === 'vehiculos') {
            const estado = item.estado || (item.activo === false ? 'INACTIVO' : 'ACTIVO');
            let badgeClass = 'badge-success';
            if (estado === 'MANTENIMIENTO') badgeClass = 'badge-warning';
            if (estado === 'INACTIVO') badgeClass = 'badge-danger';

            return `
                <tr>
                    <td data-label="Placa"><strong style="color:var(--primary); font-size:1.05rem;">${item.placa || 'N/A'}</strong></td>
                    <td data-label="Tipo / Marca">${item.tipo_vehiculo || item.tipo || 'Camión'} • ${item.marca || ''} ${item.modelo || ''}</td>
                    <td data-label="Capacidad">Capacidad: ${item.capacidad_carga_kg ? `${item.capacidad_carga_kg} kg` : (item.capacidad || 'N/A')}</td>
                    <td data-label="Estado"><span class="badge ${badgeClass}">${estado}</span></td>
                    <td data-label="Última Insp.">${item.ultima_inspeccion || item.updated_at ? new Date(item.ultima_inspeccion || item.updated_at).toLocaleDateString('es-CO') : 'Al día'}</td>
                    <td data-label="Acciones">
                        <div class="action-btns">
                            <button class="btn-action view" data-id="${item.id}" title="Ver Detalles">${ICONS.eye}</button>
                            <button class="btn-action edit" data-id="${item.id}" title="Editar">${ICONS.edit}</button>
                            <button class="btn-action delete" data-id="${item.id}" title="Eliminar">${ICONS.trash}</button>
                        </div>
                    </td>
                </tr>
            `;
        } else if (entityType === 'conductores') {
            const estado = item.activo !== false ? 'ACTIVO' : 'INACTIVO';
            return `
                <tr>
                    <td data-label="Nombre"><strong>${item.nombre || item.nombre_completo || 'Conductor'}</strong></td>
                    <td data-label="Cédula">${item.cedula || item.documento || 'N/A'}</td>
                    <td data-label="Licencia">${item.numero_licencia || item.licencia || 'C2'} (Cat: ${item.categoria_licencia || 'C2'})</td>
                    <td data-label="Teléfono">${item.telefono || item.celular || 'N/A'}</td>
                    <td data-label="Estado"><span class="badge ${estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}">${estado}</span></td>
                    <td data-label="Acciones">
                        <div class="action-btns">
                            <button class="btn-action view" data-id="${item.id}" title="Ver Detalles">${ICONS.eye}</button>
                            <button class="btn-action edit" data-id="${item.id}" title="Editar">${ICONS.edit}</button>
                            <button class="btn-action delete" data-id="${item.id}" title="Eliminar">${ICONS.trash}</button>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            const estado = item.activo !== false ? 'ACTIVO' : 'INACTIVO';
            return `
                <tr>
                    <td data-label="Nombre"><strong>${item.nombre || 'Usuario'}</strong></td>
                    <td data-label="Email">${item.email || 'N/A'}</td>
                    <td data-label="Rol"><span class="badge badge-info">${item.rol || 'OPERADOR'}</span></td>
                    <td data-label="Estado"><span class="badge ${estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}">${estado}</span></td>
                    <td data-label="Creación">${item.created_at ? new Date(item.created_at).toLocaleDateString('es-CO') : 'Reciente'}</td>
                    <td data-label="Acciones">
                        <div class="action-btns">
                            <button class="btn-action view" data-id="${item.id}" title="Ver Detalles">${ICONS.eye}</button>
                            <button class="btn-action edit" data-id="${item.id}" title="Editar">${ICONS.edit}</button>
                            <button class="btn-action delete" data-id="${item.id}" title="Eliminar">${ICONS.trash}</button>
                        </div>
                    </td>
                </tr>
            `;
        }
    }).join('');

    // Bind action buttons
    tbody.querySelectorAll('.btn-action.view').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const item = items.find(i => String(i.id) === String(id));
            if (item) openDetailsModal(entityType, item);
        });
    });

    tbody.querySelectorAll('.btn-action.edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const item = items.find(i => String(i.id) === String(id));
            if (item) openEditModal(entityType, item, () => renderTableRows(items, entityType));
        });
    });

    tbody.querySelectorAll('.btn-action.delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            openDeleteConfirmModal(entityType, id, () => {
                const idx = items.findIndex(i => String(i.id) === String(id));
                if (idx > -1) items.splice(idx, 1);
                renderTableRows(items, entityType);
            });
        });
    });
}

function openDetailsModal(entityType, item) {
    if (entityType === 'vehiculos') {
        const body = `
            <div class="detail-header-block">
                <div class="detail-avatar">${ICONS.vehiculos}</div>
                <div>
                    <h4 style="font-size:1.25rem; color:var(--primary); font-weight:700;">Placa: ${item.placa}</h4>
                    <p style="color:var(--text-muted); font-size:0.9rem;">${item.marca || ''} ${item.modelo || ''} (${item.anio || 'Año N/A'})</p>
                </div>
            </div>
            <div class="details-grid">
                <div class="detail-item"><span class="detail-label">Tipo</span><span class="detail-value">${item.tipo_vehiculo || 'Camión'}</span></div>
                <div class="detail-item"><span class="detail-label">Estado</span><span class="detail-value">${item.estado || (item.activo ? 'ACTIVO' : 'INACTIVO')}</span></div>
                <div class="detail-item"><span class="detail-label">Capacidad de Carga</span><span class="detail-value">${item.capacidad_carga_kg ? `${item.capacidad_carga_kg} kg` : 'N/A'}</span></div>
                <div class="detail-item"><span class="detail-label">Kilometraje Actual</span><span class="detail-value">${item.kilometraje ? `${item.kilometraje} km` : 'N/A'}</span></div>
                <div class="detail-item"><span class="detail-label">Número de Chasis / VIN</span><span class="detail-value">${item.vin || item.chasis || 'N/A'}</span></div>
                <div class="detail-item"><span class="detail-label">Vencimiento SOAT</span><span class="detail-value">${item.soat_vencimiento || 'Vigente'}</span></div>
            </div>
            <div style="margin-top: 1.5rem;">
                <h4 style="font-size:1.1rem; color:var(--primary); font-weight:700; margin-bottom:0.5rem;">Comentarios / Notas</h4>
                <textarea class="form-input" id="veh-comentarios" rows="3" style="width:100%; padding:0.6rem;">${item.comentarios || ''}</textarea>
                <div style="text-align:right; margin-top:0.5rem;">
                    <button class="btn btn-primary" style="padding:0.4rem 0.8rem; font-size:0.85rem;" id="btn-save-veh-comments">Guardar Comentarios</button>
                </div>
            </div>
            <div style="margin-top: 1.5rem;">
                <h4 style="font-size:1.1rem; color:var(--primary); font-weight:700; margin-bottom:0.5rem;">Historial de Mantenimientos</h4>
                <div id="veh-history-container" style="max-height: 200px; overflow-y: auto; background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.75rem; font-size: 0.85rem;">
                    Cargando historial...
                </div>
            </div>
        `;
        openModal('Detalles del Vehículo', body, [
            { text: 'Cerrar', className: 'btn-secondary', onClick: (e, close) => close() }
        ]);

        setTimeout(() => {
            const btnSave = document.getElementById('btn-save-veh-comments');
            if (btnSave) {
                btnSave.addEventListener('click', async () => {
                    const notas = document.getElementById('veh-comentarios').value;
                    try {
                        await API.vehiculos.update(item.id, { comentarios: notas });
                        showToast('Comentarios actualizados', 'success');
                    } catch (e) {
                        showToast('Error al actualizar comentarios', 'error');
                    }
                });
            }

            const histContainer = document.getElementById('veh-history-container');
            if (histContainer) {
                API.mantenimientos.list().then(res => {
                    const allMants = Array.isArray(res) ? res : (res?.items || []);
                    const vehMants = allMants.filter(m => m.vehiculo_id === item.id || m.vehiculo_placa === item.placa || (m.vehiculo && m.vehiculo.placa === item.placa));
                    if (vehMants.length === 0) {
                        histContainer.innerHTML = '<span style="color:var(--text-muted);">No hay mantenimientos registrados.</span>';
                    } else {
                        vehMants.sort((a,b) => new Date(b.fecha_creacion || 0) - new Date(a.fecha_creacion || 0));
                        histContainer.innerHTML = vehMants.map(m => `
                            <div style="margin-bottom:0.5rem; padding-bottom:0.5rem; border-bottom:1px solid var(--border-color);">
                                <strong style="color:var(--primary);">ORD-${m.id} (${m.estado})</strong> - ${new Date(m.fecha_creacion || Date.now()).toLocaleDateString()}<br>
                                <span style="color:var(--text-muted);">${m.descripcion || 'Sin descripción'}</span>
                            </div>
                        `).join('');
                    }
                }).catch(() => {
                    histContainer.innerHTML = '<span style="color:var(--danger);">Error al cargar historial.</span>';
                });
            }
        }, 100);
    } else if (entityType === 'conductores') {
        const body = `
            <div class="detail-header-block">
                <div class="detail-avatar">${ICONS.conductores}</div>
                <div>
                    <h4 style="font-size:1.25rem; color:var(--primary); font-weight:700;">${item.nombre || item.nombre_completo}</h4>
                    <p style="color:var(--text-muted); font-size:0.9rem;">C.C. ${item.cedula || 'N/A'}</p>
                </div>
            </div>
            <div class="details-grid">
                <div class="detail-item"><span class="detail-label">Licencia No.</span><span class="detail-value">${item.numero_licencia || 'N/A'}</span></div>
                <div class="detail-item"><span class="detail-label">Categoría</span><span class="detail-value">${item.categoria_licencia || 'C2'}</span></div>
                <div class="detail-item"><span class="detail-label">Teléfono</span><span class="detail-value">${item.telefono || 'N/A'}</span></div>
                <div class="detail-item"><span class="detail-label">Estado</span><span class="detail-value">${item.activo !== false ? 'Activo' : 'Inactivo'}</span></div>
            </div>
        `;
        openModal('Detalles del Conductor', body, [
            { text: 'Cerrar', className: 'btn-secondary', onClick: (e, close) => close() }
        ]);
    } else {
        const body = `
            <div class="detail-header-block">
                <div class="detail-avatar">${ICONS.usuarios}</div>
                <div>
                    <h4 style="font-size:1.25rem; color:var(--primary); font-weight:700;">${item.nombre}</h4>
                    <p style="color:var(--text-muted); font-size:0.9rem;">${item.email}</p>
                </div>
            </div>
            <div class="details-grid">
                <div class="detail-item"><span class="detail-label">Rol Asignado</span><span class="detail-value">${item.rol}</span></div>
                <div class="detail-item"><span class="detail-label">Estado de Cuenta</span><span class="detail-value">${item.activo !== false ? 'Activo' : 'Inactivo'}</span></div>
            </div>
        `;
        openModal('Detalles del Usuario', body, [
            { text: 'Cerrar', className: 'btn-secondary', onClick: (e, close) => close() }
        ]);
    }
}

function openCreateModal(entityType, onSuccess) {
    if (entityType === 'vehiculos') {
        const body = `
            <form id="modal-form-create">
                <div class="form-group">
                    <label class="form-label">Placa *</label>
                    <input type="text" class="form-input" id="inp-placa" placeholder="ej. ABC-123" required style="padding-left:1rem; text-transform:uppercase;">
                </div>
                <div class="details-grid" style="padding:0; background:transparent; border:none; margin-bottom:1rem;">
                    <div class="form-group">
                        <label class="form-label">Tipo de Vehículo</label>
                        <select class="filter-select" id="inp-tipo" style="width:100%;">
                            <option value="CAMION">Camión</option>
                            <option value="FURGON">Furgón</option>
                            <option value="MOTO">Motocicleta</option>
                            <option value="VOLQUETA">Volqueta</option>
                            <option value="CAMIONETA">Camioneta</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Marca</label>
                        <input type="text" class="form-input" id="inp-marca" placeholder="ej. Chevrolet" style="padding-left:1rem;">
                    </div>
                </div>
                <div class="details-grid" style="padding:0; background:transparent; border:none;">
                    <div class="form-group">
                        <label class="form-label">Modelo / Año</label>
                        <input type="text" class="form-input" id="inp-modelo" placeholder="ej. 2024" style="padding-left:1rem;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Capacidad (Kg)</label>
                        <input type="number" class="form-input" id="inp-capacidad" placeholder="5000" style="padding-left:1rem;">
                    </div>
                </div>
            </form>
        `;
        openModal('Registrar Nuevo Vehículo', body, [
            { text: 'Cancelar', className: 'btn-secondary', onClick: (e, close) => close() },
            { 
                text: 'Guardar Vehículo', 
                className: 'btn-primary', 
                id: 'btn-modal-save',
                onClick: async (e, close) => {
                    const placa = document.getElementById('inp-placa')?.value.trim().toUpperCase();
                    const tipo = document.getElementById('inp-tipo')?.value;
                    const marca = document.getElementById('inp-marca')?.value.trim();
                    const modelo = document.getElementById('inp-modelo')?.value.trim();
                    const capacidad = parseFloat(document.getElementById('inp-capacidad')?.value) || 0;

                    if (!placa) {
                        showToast('La placa es obligatoria', 'warning');
                        return;
                    }

                    try {
                        await API.vehiculos.create({
                            placa,
                            tipo_vehiculo: tipo,
                            marca,
                            modelo,
                            capacidad_carga_kg: capacidad,
                            estado: 'ACTIVO'
                        });
                        showToast(`Vehículo ${placa} registrado con éxito`, 'success');
                        close();
                        if (onSuccess) onSuccess();
                    } catch (err) {
                        showToast(err.message || 'Error al guardar el vehículo', 'error');
                    }
                }
            }
        ]);
    } else if (entityType === 'conductores') {
        const body = `
            <form id="modal-form-create">
                <div class="form-group">
                    <label class="form-label">Nombre Completo *</label>
                    <input type="text" class="form-input" id="inp-nombre" placeholder="ej. Juan Gómez" required style="padding-left:1rem;">
                </div>
                <div class="details-grid" style="padding:0; background:transparent; border:none; margin-bottom:1rem;">
                    <div class="form-group">
                        <label class="form-label">Cédula / Documento *</label>
                        <input type="text" class="form-input" id="inp-cedula" placeholder="ej. 1020304050" required style="padding-left:1rem;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Teléfono</label>
                        <input type="text" class="form-input" id="inp-telefono" placeholder="ej. 3001234567" style="padding-left:1rem;">
                    </div>
                </div>
                <div class="details-grid" style="padding:0; background:transparent; border:none;">
                    <div class="form-group">
                        <label class="form-label">Número de Licencia</label>
                        <input type="text" class="form-input" id="inp-licencia" placeholder="LIC-9988" style="padding-left:1rem;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Categoría</label>
                        <select class="filter-select" id="inp-cat" style="width:100%;">
                            <option value="C1">C1</option>
                            <option value="C2" selected>C2</option>
                            <option value="C3">C3</option>
                        </select>
                    </div>
                </div>
            </form>
        `;
        openModal('Registrar Nuevo Conductor', body, [
            { text: 'Cancelar', className: 'btn-secondary', onClick: (e, close) => close() },
            {
                text: 'Guardar Conductor',
                className: 'btn-primary',
                onClick: async (e, close) => {
                    const nombre = document.getElementById('inp-nombre')?.value.trim();
                    const cedula = document.getElementById('inp-cedula')?.value.trim();
                    const telefono = document.getElementById('inp-telefono')?.value.trim();
                    const licencia = document.getElementById('inp-licencia')?.value.trim();
                    const cat = document.getElementById('inp-cat')?.value;

                    if (!nombre || !cedula) {
                        showToast('Nombre y cédula son obligatorios', 'warning');
                        return;
                    }

                    try {
                        await API.conductores.create({
                            nombre,
                            cedula,
                            telefono,
                            numero_licencia: licencia,
                            categoria_licencia: cat,
                            activo: true
                        });
                        showToast(`Conductor ${nombre} registrado con éxito`, 'success');
                        close();
                        if (onSuccess) onSuccess();
                    } catch (err) {
                        showToast(err.message || 'Error al guardar el conductor', 'error');
                    }
                }
            }
        ]);
    } else {
        const body = `
            <form id="modal-form-create">
                <div class="form-group">
                    <label class="form-label">Nombre Completo *</label>
                    <input type="text" class="form-input" id="inp-user-nombre" placeholder="ej. Sebastian Admin" required style="padding-left:1rem;">
                </div>
                <div class="form-group">
                    <label class="form-label">Correo Electrónico *</label>
                    <input type="email" class="form-input" id="inp-user-email" placeholder="usuario@translogix.com" required style="padding-left:1rem;">
                </div>
                <div class="details-grid" style="padding:0; background:transparent; border:none;">
                    <div class="form-group">
                        <label class="form-label">Rol del Usuario</label>
                        <select class="filter-select" id="inp-user-rol" style="width:100%;">
                            <option value="admin">ADMINISTRADOR</option>
                            <option value="operario_movimientos">OPERARIO MOVIMIENTOS</option>
                            <option value="operario_chequeo">OPERARIO CHEQUEO</option>
                            <option value="mecanico">MECÁNICO</option>
                            <option value="jefe_mecanicos">JEFE DE MECÁNICOS</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Contraseña Inicial *</label>
                        <input type="password" class="form-input" id="inp-user-pass" placeholder="••••••••" required style="padding-left:1rem;">
                    </div>
                </div>
            </form>
        `;
        openModal('Registrar Nuevo Usuario', body, [
            { text: 'Cancelar', className: 'btn-secondary', onClick: (e, close) => close() },
            {
                text: 'Guardar Usuario',
                className: 'btn-primary',
                onClick: async (e, close) => {
                    const nombre = document.getElementById('inp-user-nombre')?.value.trim();
                    const email = document.getElementById('inp-user-email')?.value.trim();
                    const rol = document.getElementById('inp-user-rol')?.value;
                    const password = document.getElementById('inp-user-pass')?.value;

                    if (!nombre || !email || !password) {
                        showToast('Todos los campos marcados son obligatorios', 'warning');
                        return;
                    }

                    try {
                        await API.usuarios.create({
                            nombre,
                            email,
                            rol,
                            password,
                            activo: true
                        });
                        showToast(`Usuario ${nombre} creado con éxito`, 'success');
                        close();
                        if (onSuccess) onSuccess();
                    } catch (err) {
                        showToast(err.message || 'Error al guardar el usuario', 'error');
                    }
                }
            }
        ]);
    }
}

function openEditModal(entityType, item, onSuccess) {
    if (entityType === 'vehiculos') {
        const body = `
            <form id="modal-form-edit">
                <div class="form-group">
                    <label class="form-label">Placa (Solo lectura)</label>
                    <input type="text" class="form-input" value="${item.placa}" disabled style="padding-left:1rem; background:#f1f5f9;">
                </div>
                <div class="details-grid" style="padding:0; background:transparent; border:none; margin-bottom:1rem;">
                    <div class="form-group">
                        <label class="form-label">Estado</label>
                        <select class="filter-select" id="edit-veh-estado" style="width:100%;">
                            <option value="ACTIVO" ${item.estado === 'ACTIVO' ? 'selected' : ''}>ACTIVO</option>
                            <option value="MANTENIMIENTO" ${item.estado === 'MANTENIMIENTO' ? 'selected' : ''}>EN MANTENIMIENTO</option>
                            <option value="INACTIVO" ${item.estado === 'INACTIVO' ? 'selected' : ''}>INACTIVO</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Capacidad Carga (Kg)</label>
                        <input type="number" class="form-input" id="edit-veh-cap" value="${item.capacidad_carga_kg || ''}" style="padding-left:1rem;">
                    </div>
                </div>
                <div class="details-grid" style="padding:0; background:transparent; border:none;">
                    <div class="form-group">
                        <label class="form-label">Marca</label>
                        <input type="text" class="form-input" id="edit-veh-marca" value="${item.marca || ''}" style="padding-left:1rem;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Modelo / Año</label>
                        <input type="text" class="form-input" id="edit-veh-modelo" value="${item.modelo || ''}" style="padding-left:1rem;">
                    </div>
                </div>
            </form>
        `;
        openModal(`Editar Vehículo: ${item.placa}`, body, [
            { text: 'Cancelar', className: 'btn-secondary', onClick: (e, close) => close() },
            {
                text: 'Actualizar',
                className: 'btn-primary',
                onClick: async (e, close) => {
                    const estado = document.getElementById('edit-veh-estado')?.value;
                    const cap = parseFloat(document.getElementById('edit-veh-cap')?.value) || item.capacidad_carga_kg;
                    const marca = document.getElementById('edit-veh-marca')?.value.trim();
                    const modelo = document.getElementById('edit-veh-modelo')?.value.trim();
                    try {
                        await API.vehiculos.update(item.id, { estado, capacidad_carga_kg: cap, marca, modelo });
                        item.estado = estado;
                        item.capacidad_carga_kg = cap;
                        item.marca = marca;
                        item.modelo = modelo;
                        showToast('Vehículo actualizado', 'success');
                        close();
                        if (onSuccess) onSuccess();
                    } catch (err) {
                        showToast(err.message || 'Error al actualizar', 'error');
                    }
                }
            }
        ]);
    } else if (entityType === 'conductores') {
        const body = `
            <form id="modal-form-edit-conductor">
                <div class="form-group">
                    <label class="form-label">Nombre Completo *</label>
                    <input type="text" class="form-input" id="edit-con-nombre" value="${item.nombre || ''}" required style="padding-left:1rem;">
                </div>
                <div class="details-grid" style="padding:0; background:transparent; border:none; margin-bottom:1rem;">
                    <div class="form-group">
                        <label class="form-label">Cédula / Documento</label>
                        <input type="text" class="form-input" id="edit-con-cedula" value="${item.cedula || ''}" style="padding-left:1rem;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Teléfono</label>
                        <input type="tel" class="form-input" id="edit-con-telefono" value="${item.telefono || ''}" style="padding-left:1rem;">
                    </div>
                </div>
                <div class="details-grid" style="padding:0; background:transparent; border:none; margin-bottom:1rem;">
                    <div class="form-group">
                        <label class="form-label">Nro. Licencia</label>
                        <input type="text" class="form-input" id="edit-con-licencia" value="${item.numero_licencia || ''}" style="padding-left:1rem;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Categoría Licencia</label>
                        <select class="filter-select" id="edit-con-categoria" style="width:100%;">
                            <option value="B1" ${item.categoria_licencia === 'B1' ? 'selected' : ''}>B1</option>
                            <option value="B2" ${item.categoria_licencia === 'B2' ? 'selected' : ''}>B2</option>
                            <option value="B3" ${item.categoria_licencia === 'B3' ? 'selected' : ''}>B3</option>
                            <option value="C1" ${item.categoria_licencia === 'C1' ? 'selected' : ''}>C1</option>
                            <option value="C2" ${item.categoria_licencia === 'C2' ? 'selected' : ''}>C2</option>
                            <option value="C3" ${item.categoria_licencia === 'C3' ? 'selected' : ''}>C3</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Estado</label>
                    <select class="filter-select" id="edit-con-activo" style="width:100%;">
                        <option value="true" ${item.activo !== false ? 'selected' : ''}>Activo</option>
                        <option value="false" ${item.activo === false ? 'selected' : ''}>Inactivo</option>
                    </select>
                </div>
            </form>
        `;
        openModal(`Editar Conductor: ${item.nombre || 'Conductor'}`, body, [
            { text: 'Cancelar', className: 'btn-secondary', onClick: (e, close) => close() },
            {
                text: 'Actualizar Conductor',
                className: 'btn-primary',
                onClick: async (e, close) => {
                    const nombre = document.getElementById('edit-con-nombre')?.value.trim();
                    if (!nombre) { showToast('El nombre es obligatorio', 'warning'); return; }
                    const cedula = document.getElementById('edit-con-cedula')?.value.trim();
                    const telefono = document.getElementById('edit-con-telefono')?.value.trim();
                    const numero_licencia = document.getElementById('edit-con-licencia')?.value.trim();
                    const categoria_licencia = document.getElementById('edit-con-categoria')?.value;
                    const activo = document.getElementById('edit-con-activo')?.value === 'true';
                    try {
                        await API.conductores.update(item.id, {
                            nombre, cedula, telefono, numero_licencia, categoria_licencia, activo
                        });
                        Object.assign(item, { nombre, cedula, telefono, numero_licencia, categoria_licencia, activo });
                        showToast('Conductor actualizado correctamente', 'success');
                        close();
                        if (onSuccess) onSuccess();
                    } catch (err) {
                        showToast(err.message || 'Error al actualizar conductor', 'error');
                    }
                }
            }
        ]);
    } else {
        // Usuarios
        const rolesOptions = [
            'admin', 'operario_movimientos', 'operario_chequeo', 'mecanico', 'jefe_mecanicos'
        ];
        const body = `
            <form id="modal-form-edit-usuario">
                <div class="form-group">
                    <label class="form-label">Nombre *</label>
                    <input type="text" class="form-input" id="edit-usr-nombre" value="${item.nombre || ''}" required style="padding-left:1rem;">
                </div>
                <div class="form-group">
                    <label class="form-label">Email (Solo lectura)</label>
                    <input type="email" class="form-input" value="${item.email || ''}" disabled style="padding-left:1rem; background:#f1f5f9;">
                </div>
                <div class="form-group">
                    <label class="form-label">Rol</label>
                    <select class="filter-select" id="edit-usr-rol" style="width:100%;">
                        ${rolesOptions.map(r => `<option value="${r}" ${item.rol === r ? 'selected' : ''}>${r}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Estado</label>
                    <select class="filter-select" id="edit-usr-activo" style="width:100%;">
                        <option value="true" ${item.activo !== false ? 'selected' : ''}>Activo</option>
                        <option value="false" ${item.activo === false ? 'selected' : ''}>Inactivo</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Nueva Contraseña (opcional)</label>
                    <input type="password" class="form-input" id="edit-usr-password" placeholder="Dejar vacío para no cambiar" style="padding-left:1rem;">
                </div>
            </form>
        `;
        openModal(`Editar Usuario: ${item.nombre || item.email}`, body, [
            { text: 'Cancelar', className: 'btn-secondary', onClick: (e, close) => close() },
            {
                text: 'Actualizar Usuario',
                className: 'btn-primary',
                onClick: async (e, close) => {
                    const nombre = document.getElementById('edit-usr-nombre')?.value.trim();
                    if (!nombre) { showToast('El nombre es obligatorio', 'warning'); return; }
                    const rol = document.getElementById('edit-usr-rol')?.value;
                    const activo = document.getElementById('edit-usr-activo')?.value === 'true';
                    const password = document.getElementById('edit-usr-password')?.value.trim();
                    const payload = { nombre, rol, activo };
                    if (password) payload.password = password;
                    try {
                        await API.usuarios.update(item.id, payload);
                        Object.assign(item, { nombre, rol, activo });
                        showToast('Usuario actualizado correctamente', 'success');
                        close();
                        if (onSuccess) onSuccess();
                    } catch (err) {
                        showToast(err.message || 'Error al actualizar usuario', 'error');
                    }
                }
            }
        ]);
    }
}


function openDeleteConfirmModal(entityType, id, onSuccess) {
    const body = `
        <p style="font-size:1rem; color:var(--text-main); margin-bottom:1rem;">
            ¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.
        </p>
    `;
    openModal('Confirmar Eliminación', body, [
        { text: 'Cancelar', className: 'btn-secondary', onClick: (e, close) => close() },
        {
            text: 'Eliminar Registro',
            className: 'btn-primary',
            attrs: 'style="background:var(--danger);"',
            onClick: async (e, close) => {
                try {
                    if (entityType === 'vehiculos') await API.vehiculos.delete(id);
                    else if (entityType === 'conductores') await API.conductores.delete(id);
                    else await API.usuarios.delete(id);
                    showToast('Registro eliminado correctamente', 'success');
                    close();
                    if (onSuccess) onSuccess();
                } catch (err) {
                    showToast(err.message || 'Error al eliminar', 'error');
                }
            }
        }
    ]);
}
