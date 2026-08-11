import { API } from '../api.js';
import { ICONS, openModal, closeModal, showToast } from '../ui.js';
import {
    exportVehiculosExcel, exportVehiculosPdf,
    exportConductoresExcel, exportConductoresPdf,
    exportUsuariosExcel, exportUsuariosPdf
} from '../exports.js';

export function renderGestionView(entityType = 'vehiculos') {
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
            <button class="tab-btn ${entityType === 'vehiculos' ? 'active' : ''}" data-gestion="vehiculos">
                ${ICONS.vehiculos} Vehículos
            </button>
            <button class="tab-btn ${entityType === 'conductores' ? 'active' : ''}" data-gestion="conductores">
                ${ICONS.conductores} Conductores
            </button>
            <button class="tab-btn ${entityType === 'usuarios' ? 'active' : ''}" data-gestion="usuarios">
                ${ICONS.usuarios} Usuarios
            </button>
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
            <div class="export-btns">
                <button id="btn-export-excel" class="btn-ghost" title="Exportar tabla a Excel">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                    Excel
                </button>
                <button id="btn-export-pdf" class="btn-ghost" title="Exportar tabla a PDF">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    PDF
                </button>
            </div>
            <button id="btn-gestion-new" class="btn-primary">
                ${ICONS.plus}
                ${newBtnLabels[entityType] || 'Registrar'}
            </button>
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
            if (entityType === 'vehiculos') {
                rawData = await API.vehiculos.list();
            } else if (entityType === 'conductores') {
                rawData = await API.conductores.list();
            } else {
                rawData = await API.usuarios.list();
            }
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
                    <td><strong style="color:var(--primary); font-size:1.05rem;">${item.placa || 'N/A'}</strong></td>
                    <td>${item.tipo_vehiculo || item.tipo || 'Camión'} • ${item.marca || ''} ${item.modelo || ''}</td>
                    <td>Capacidad: ${item.capacidad_carga_kg ? `${item.capacidad_carga_kg} kg` : (item.capacidad || 'N/A')}</td>
                    <td><span class="badge ${badgeClass}">${estado}</span></td>
                    <td>${item.ultima_inspeccion || item.updated_at ? new Date(item.ultima_inspeccion || item.updated_at).toLocaleDateString('es-CO') : 'Al día'}</td>
                    <td>
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
                    <td><strong>${item.nombre || item.nombre_completo || 'Conductor'}</strong></td>
                    <td>${item.cedula || item.documento || 'N/A'}</td>
                    <td>${item.numero_licencia || item.licencia || 'C2'} (Cat: ${item.categoria_licencia || 'C2'})</td>
                    <td>${item.telefono || item.celular || 'N/A'}</td>
                    <td><span class="badge ${estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}">${estado}</span></td>
                    <td>
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
                    <td><strong>${item.nombre || 'Usuario'}</strong></td>
                    <td>${item.email || 'N/A'}</td>
                    <td><span class="badge badge-info">${item.rol || 'OPERADOR'}</span></td>
                    <td><span class="badge ${estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}">${estado}</span></td>
                    <td>${item.created_at ? new Date(item.created_at).toLocaleDateString('es-CO') : 'Reciente'}</td>
                    <td>
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
        `;
        openModal('Detalles del Vehículo', body, [
            { text: 'Cerrar', className: 'btn-secondary', onClick: (e, close) => close() }
        ]);
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
                            <option value="ADMIN">ADMIN</option>
                            <option value="OPERARIO_DESPACHO">OPERARIO_DESPACHO</option>
                            <option value="OPERARIO_CHEQUEO">OPERARIO_CHEQUEO</option>
                            <option value="MECANICO">MECANICO</option>
                            <option value="JEFE_MECANICOS">JEFE_MECANICOS</option>
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
                    try {
                        await API.vehiculos.update(item.id, { estado, capacidad_carga_kg: cap });
                        item.estado = estado;
                        item.capacidad_carga_kg = cap;
                        showToast('Vehículo actualizado', 'success');
                        close();
                        if (onSuccess) onSuccess();
                    } catch (err) {
                        showToast(err.message || 'Error al actualizar', 'error');
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
