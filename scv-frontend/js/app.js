/**
 * Aplicación Principal - SCV
 */

// Estado global de la app
const APP = {
    currentScreen: 'login-screen',
    user: null,
    token: null,
    formType: null, // 'salida', 'entrada', 'chequeo'
    admin: {
        vehiculos: [],
        editingVehiculoId: null,
        filters: {
            query: '',
            estado: 'todos',
            orden: 'placa_asc',
            anioMin: '',
            anioMax: ''
        },
        conductores: [],
        editingConductorId: null,
        conductoresFilters: {
            query: '',
            estado: 'todos',
            categoria: 'todas',
            orden: 'nombre_asc',
            licencia: ''
        },
        usuarios: [],
        editingUsuarioId: null,
        usuariosFilters: {
            query: '',
            estado: 'todos',
            rol: 'todos',
            orden: 'nombre_asc',
            emailDomain: ''
        },
        chequeos: [],
        chequeosFilters: {
            query: '',
            fechaInicio: '',
            fechaFin: '',
            orden: 'fecha_desc'
        },
        movimientos: [],
        movimientosFilters: {
            query: '',
            tipo: 'todos',
            fechaInicio: '',
            fechaFin: '',
            orden: 'fecha_desc'
        }
    },
    chequeo: {
        formulario: null,
        totalItems: 0,
        returnScreen: 'dashboard-chequeo'
    },
    movimiento: {
        returnScreen: 'dashboard-movimientos'
    },
    ui: {
        dialogResolver: null,
        adminChartsInterval: null
    },
    selectorSearchTimers: {},
    selectorOptions: {},
    selectorSelections: {}
};

// ============ INICIALIZACIÓN ============

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    initAdaptiveButtonIcons();
});

function normalizeUiText(value = '') {
    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function resolveUnifiedButtonIcon(button, label) {
    if (label.includes('cerrar sesion')) return 'assets/icons/box-arrow-right.svg';
    if (label.includes('iniciar sesion')) return 'assets/icons/box-arrow-right.svg';
    if (label.startsWith('volver')) return 'assets/icons/box-arrow-in-left.svg';
    if (label.includes('salida')) return 'assets/icons/box-arrow-up-right.svg';
    if (label.includes('entrada')) return 'assets/icons/box-arrow-in-left.svg';
    if (label.includes('historial') || label.includes('ver movimientos') || label.includes('ver chequeos')) return 'assets/icons/bar-chart-line.svg';
    if (label.includes('vehiculo')) return 'assets/icons/truck.svg';
    if (label.includes('conductor') || label.includes('usuario')) return 'assets/icons/people.svg';
    if (label.includes('chequeo')) return 'assets/icons/clipboard-check.svg';
    if (label.includes('buscar') || label.includes('filtro')) return 'assets/icons/search.svg';
    if (label.includes('actualizar') || label.includes('refrescar')) return 'assets/icons/arrow-clockwise.svg';
    if (label.includes('exportar') || label.includes('descargar')) return 'assets/icons/download.svg';
    if (label.includes('cancelar') || label.includes('cerrar') || label.includes('limpiar')) return 'assets/icons/x-lg.svg';
    if (label.includes('guardar') || label.includes('registrar') || label.includes('nuevo')) return 'assets/icons/plus-lg.svg';

    if (button.classList.contains('btn-danger')) return 'assets/icons/x-lg.svg';
    return 'assets/icons/search.svg';
}

function getUnifiedIconClass(button) {
    if (button.classList.contains('action-btn')) return 'action-icon';
    if (button.classList.contains('btn-large')) return 'btn-large-icon';
    if (button.classList.contains('btn-back') || button.classList.contains('btn-logout')) return 'btn-icon';
    return 'btn-inline-icon';
}

function decorateButtonWithIcon(button) {
    if (!button || button.dataset.iconReady === 'true') return;
    if (button.classList.contains('modal-close')) return;
    if (button.classList.contains('selector-result-item')) return;
    if (button.querySelector('img')) {
        button.dataset.iconReady = 'true';
        return;
    }

    const label = normalizeUiText(button.textContent || '');
    if (!label) return;

    const iconPath = resolveUnifiedButtonIcon(button, label);
    const icon = document.createElement('img');
    icon.src = iconPath;
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');
    icon.className = getUnifiedIconClass(button);

    button.prepend(icon);
    button.dataset.iconReady = 'true';
}

function applyUnifiedButtonIcons(scope = document) {
    const buttons = scope.querySelectorAll ? scope.querySelectorAll('button') : [];
    buttons.forEach(decorateButtonWithIcon);
}

function initAdaptiveButtonIcons() {
    applyUnifiedButtonIcons(document);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (!(node instanceof HTMLElement)) return;
                if (node.matches('button')) {
                    decorateButtonWithIcon(node);
                    return;
                }
                applyUnifiedButtonIcons(node);
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function checkAuth() {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const userJson = localStorage.getItem(CONFIG.USER_KEY);
    
    if (token && userJson) {
        try {
            const user = JSON.parse(userJson);
            APP.token = token;
            APP.user = user;
            showDashboard(user.rol);
        } catch (e) {
            logout();
        }
    } else {
        showScreen('login-screen');
    }
}

function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Logout button global
    window.logout = logout;
    window.navigate = navigate;
    window.openChequeosPanel = openChequeosPanel;
    window.openMovimientosPanel = openMovimientosPanel;
    window.showForm = showForm;
    window.goBack = goBack;

    const vehiculoNuevoBtn = document.getElementById('vehiculo-nuevo-btn');
    const vehiculosExportBtn = document.getElementById('vehiculos-export-btn');
    const vehiculosExportPdfBtn = document.getElementById('vehiculos-export-pdf-btn');
    const vehiculoCancelBtn = document.getElementById('vehiculo-cancel-btn');
    const vehiculoCloseBtn = document.getElementById('vehiculo-close-btn');
    const vehiculoForm = document.getElementById('vehiculo-form');
    const vehiculosList = document.getElementById('vehiculos-list');
    const vehiculosSearch = document.getElementById('vehiculos-search');
    const vehiculosEstado = document.getElementById('vehiculos-estado');
    const vehiculosOrden = document.getElementById('vehiculos-orden');
    const vehiculosAnioMin = document.getElementById('vehiculos-anio-min');
    const vehiculosAnioMax = document.getElementById('vehiculos-anio-max');
    const vehiculosClearFilters = document.getElementById('vehiculos-clear-filters');
    const vehiculoModal = document.getElementById('vehiculo-modal');
    const conductorNuevoBtn = document.getElementById('conductor-nuevo-btn');
    const conductoresExportBtn = document.getElementById('conductores-export-btn');
    const conductoresExportPdfBtn = document.getElementById('conductores-export-pdf-btn');
    const conductorCancelBtn = document.getElementById('conductor-cancel-btn');
    const conductorCloseBtn = document.getElementById('conductor-close-btn');
    const conductorForm = document.getElementById('conductor-form');
    const conductoresList = document.getElementById('conductores-list');
    const conductoresSearch = document.getElementById('conductores-search');
    const conductoresEstado = document.getElementById('conductores-estado');
    const conductoresCategoria = document.getElementById('conductores-categoria');
    const conductoresOrden = document.getElementById('conductores-orden');
    const conductoresLicencia = document.getElementById('conductores-licencia');
    const conductoresClearFilters = document.getElementById('conductores-clear-filters');
    const conductorModal = document.getElementById('conductor-modal');
    const usuarioNuevoBtn = document.getElementById('usuario-nuevo-btn');
    const usuariosExportBtn = document.getElementById('usuarios-export-btn');
    const usuariosExportPdfBtn = document.getElementById('usuarios-export-pdf-btn');
    const usuarioCancelBtn = document.getElementById('usuario-cancel-btn');
    const usuarioCloseBtn = document.getElementById('usuario-close-btn');
    const usuarioForm = document.getElementById('usuario-form');
    const usuariosList = document.getElementById('usuarios-list');
    const usuariosSearch = document.getElementById('usuarios-search');
    const usuariosEstado = document.getElementById('usuarios-estado');
    const usuariosRol = document.getElementById('usuarios-rol');
    const usuariosOrden = document.getElementById('usuarios-orden');
    const usuariosEmailDomain = document.getElementById('usuarios-email-domain');
    const usuariosClearFilters = document.getElementById('usuarios-clear-filters');
    const usuarioModal = document.getElementById('usuario-modal');
    const chequeoNuevoBtn = document.getElementById('chequeo-nuevo-btn');
    const chequeosExportBtn = document.getElementById('chequeos-export-btn');
    const chequeosExportPdfBtn = document.getElementById('chequeos-export-pdf-btn');
    const chequeosSearch = document.getElementById('chequeos-search');
    const chequeosFechaInicio = document.getElementById('chequeos-fecha-inicio');
    const chequeosFechaFin = document.getElementById('chequeos-fecha-fin');
    const chequeosOrden = document.getElementById('chequeos-orden');
    const chequeosClearFilters = document.getElementById('chequeos-clear-filters');
    const chequeosList = document.getElementById('chequeos-list');
    const chequeosRecientes = document.getElementById('chequeos-recientes');
    const movimientosExportBtn = document.getElementById('movimientos-export-btn');
    const movimientosExportPdfBtn = document.getElementById('movimientos-export-pdf-btn');
    const movimientosSearch = document.getElementById('movimientos-search');
    const movimientosTipo = document.getElementById('movimientos-tipo');
    const movimientosFechaInicio = document.getElementById('movimientos-fecha-inicio');
    const movimientosFechaFin = document.getElementById('movimientos-fecha-fin');
    const movimientosOrden = document.getElementById('movimientos-orden');
    const movimientosClearFilters = document.getElementById('movimientos-clear-filters');
    const movimientosList = document.getElementById('movimientos-list');
    const movimientosRecientes = document.getElementById('movimientos-recientes');
    const adminChartRange = document.getElementById('admin-chart-range');
    const chequeoModal = document.getElementById('chequeo-modal');
    const chequeoCloseBtn = document.getElementById('chequeo-close-btn');
    const chequeoCancelBtn = document.getElementById('chequeo-cancel-btn');
    const dialogModal = document.getElementById('app-dialog');
    const dialogConfirmBtn = document.getElementById('dialog-confirm');
    const dialogCancelBtn = document.getElementById('dialog-cancel');
    const chequeoDetalleModal = document.getElementById('chequeo-detalle-modal');
    const chequeoDetalleClose = document.getElementById('chequeo-detalle-close');
    const chequeoDetalleAccept = document.getElementById('chequeo-detalle-accept');
    const movimientoDetalleModal = document.getElementById('movimiento-detalle-modal');
    const movimientoDetalleClose = document.getElementById('movimiento-detalle-close');
    const movimientoDetalleAccept = document.getElementById('movimiento-detalle-accept');
    const chequeoForm = document.getElementById('chequeo-form');
    const movimientoModal = document.getElementById('movimiento-modal');
    const movimientoCloseBtn = document.getElementById('movimiento-close-btn');
    const movimientoCancelBtn = document.getElementById('movimiento-cancel-btn');
    const seccionesChequeo = document.getElementById('secciones-chequeo');
    const movimientoVehiculoSearch = document.getElementById('mov-vehiculo-search');
    const movimientoConductorSearch = document.getElementById('mov-conductor-search');
    const chequeoVehiculoSearch = document.getElementById('ch-vehiculo-search');
    const chequeoConductorSearch = document.getElementById('ch-conductor-search');

    if (vehiculoNuevoBtn) {
        vehiculoNuevoBtn.addEventListener('click', () => openVehiculoForm());
    }

    if (vehiculosExportBtn) {
        vehiculosExportBtn.addEventListener('click', exportVehiculosReport);
    }

    if (vehiculosExportPdfBtn) {
        vehiculosExportPdfBtn.addEventListener('click', exportVehiculosPdfReport);
    }

    if (vehiculoCancelBtn) {
        vehiculoCancelBtn.addEventListener('click', closeVehiculoForm);
    }

    if (vehiculoCloseBtn) {
        vehiculoCloseBtn.addEventListener('click', closeVehiculoForm);
    }

    if (vehiculoForm) {
        vehiculoForm.addEventListener('submit', handleVehiculoSubmit);
    }

    if (vehiculosList) {
        vehiculosList.addEventListener('click', handleVehiculosListClick);
    }

    if (vehiculosSearch) {
        vehiculosSearch.addEventListener('input', (e) => {
            APP.admin.filters.query = e.target.value || '';
            renderVehiculosList();
        });
    }

    if (vehiculosEstado) {
        vehiculosEstado.addEventListener('change', (e) => {
            APP.admin.filters.estado = e.target.value;
            renderVehiculosList();
        });
    }

    if (vehiculosOrden) {
        vehiculosOrden.addEventListener('change', (e) => {
            APP.admin.filters.orden = e.target.value || 'placa_asc';
            renderVehiculosList();
        });
    }

    if (vehiculosAnioMin) {
        vehiculosAnioMin.addEventListener('input', (e) => {
            APP.admin.filters.anioMin = e.target.value || '';
            renderVehiculosList();
        });
    }

    if (vehiculosAnioMax) {
        vehiculosAnioMax.addEventListener('input', (e) => {
            APP.admin.filters.anioMax = e.target.value || '';
            renderVehiculosList();
        });
    }

    if (vehiculosClearFilters) {
        vehiculosClearFilters.addEventListener('click', resetVehiculosFilters);
    }

    if (vehiculoModal) {
        vehiculoModal.addEventListener('click', (e) => {
            if (e.target === vehiculoModal) {
                closeVehiculoForm();
            }
        });
    }

    if (conductorNuevoBtn) {
        conductorNuevoBtn.addEventListener('click', () => openConductorForm());
    }

    if (conductoresExportBtn) {
        conductoresExportBtn.addEventListener('click', exportConductoresReport);
    }

    if (conductoresExportPdfBtn) {
        conductoresExportPdfBtn.addEventListener('click', exportConductoresPdfReport);
    }

    if (conductorCancelBtn) {
        conductorCancelBtn.addEventListener('click', closeConductorForm);
    }

    if (conductorCloseBtn) {
        conductorCloseBtn.addEventListener('click', closeConductorForm);
    }

    if (conductorForm) {
        conductorForm.addEventListener('submit', handleConductorSubmit);
    }

    if (conductoresList) {
        conductoresList.addEventListener('click', handleConductoresListClick);
    }

    if (conductoresSearch) {
        conductoresSearch.addEventListener('input', (e) => {
            APP.admin.conductoresFilters.query = e.target.value || '';
            renderConductoresList();
        });
    }

    if (conductoresEstado) {
        conductoresEstado.addEventListener('change', (e) => {
            APP.admin.conductoresFilters.estado = e.target.value;
            renderConductoresList();
        });
    }

    if (conductoresCategoria) {
        conductoresCategoria.addEventListener('change', (e) => {
            APP.admin.conductoresFilters.categoria = e.target.value;
            renderConductoresList();
        });
    }

    if (conductoresOrden) {
        conductoresOrden.addEventListener('change', (e) => {
            APP.admin.conductoresFilters.orden = e.target.value || 'nombre_asc';
            renderConductoresList();
        });
    }

    if (conductoresLicencia) {
        conductoresLicencia.addEventListener('input', (e) => {
            APP.admin.conductoresFilters.licencia = e.target.value || '';
            renderConductoresList();
        });
    }

    if (conductoresClearFilters) {
        conductoresClearFilters.addEventListener('click', resetConductoresFilters);
    }

    if (conductorModal) {
        conductorModal.addEventListener('click', (e) => {
            if (e.target === conductorModal) {
                closeConductorForm();
            }
        });
    }

    if (usuarioNuevoBtn) {
        usuarioNuevoBtn.addEventListener('click', () => openUsuarioForm());
    }

    if (usuariosExportBtn) {
        usuariosExportBtn.addEventListener('click', exportUsuariosReport);
    }

    if (usuariosExportPdfBtn) {
        usuariosExportPdfBtn.addEventListener('click', exportUsuariosPdfReport);
    }

    if (usuarioCancelBtn) {
        usuarioCancelBtn.addEventListener('click', closeUsuarioForm);
    }

    if (usuarioCloseBtn) {
        usuarioCloseBtn.addEventListener('click', closeUsuarioForm);
    }

    if (usuarioForm) {
        usuarioForm.addEventListener('submit', handleUsuarioSubmit);
    }

    if (usuariosList) {
        usuariosList.addEventListener('click', handleUsuariosListClick);
    }

    if (usuariosSearch) {
        usuariosSearch.addEventListener('input', (e) => {
            APP.admin.usuariosFilters.query = e.target.value || '';
            renderUsuariosList();
        });
    }

    if (usuariosEstado) {
        usuariosEstado.addEventListener('change', (e) => {
            APP.admin.usuariosFilters.estado = e.target.value;
            renderUsuariosList();
        });
    }

    if (usuariosRol) {
        usuariosRol.addEventListener('change', (e) => {
            APP.admin.usuariosFilters.rol = e.target.value;
            renderUsuariosList();
        });
    }

    if (usuariosOrden) {
        usuariosOrden.addEventListener('change', (e) => {
            APP.admin.usuariosFilters.orden = e.target.value || 'nombre_asc';
            renderUsuariosList();
        });
    }

    if (usuariosEmailDomain) {
        usuariosEmailDomain.addEventListener('input', (e) => {
            APP.admin.usuariosFilters.emailDomain = e.target.value || '';
            renderUsuariosList();
        });
    }

    if (usuariosClearFilters) {
        usuariosClearFilters.addEventListener('click', resetUsuariosFilters);
    }

    if (usuarioModal) {
        usuarioModal.addEventListener('click', (e) => {
            if (e.target === usuarioModal) {
                closeUsuarioForm();
            }
        });
    }

    if (chequeoNuevoBtn) {
        chequeoNuevoBtn.addEventListener('click', () => showForm('chequeo'));
    }

    if (chequeosExportBtn) {
        chequeosExportBtn.addEventListener('click', exportChequeosReport);
    }

    if (chequeosExportPdfBtn) {
        chequeosExportPdfBtn.addEventListener('click', exportChequeosPdfReport);
    }

    if (chequeosSearch) {
        chequeosSearch.addEventListener('input', (e) => {
            APP.admin.chequeosFilters.query = e.target.value || '';
            renderChequeosManagementList();
        });
    }

    if (chequeosFechaInicio) {
        chequeosFechaInicio.addEventListener('change', (e) => {
            APP.admin.chequeosFilters.fechaInicio = e.target.value || '';
            loadChequeosManagement();
        });
    }

    if (chequeosFechaFin) {
        chequeosFechaFin.addEventListener('change', (e) => {
            APP.admin.chequeosFilters.fechaFin = e.target.value || '';
            loadChequeosManagement();
        });
    }

    if (chequeosOrden) {
        chequeosOrden.addEventListener('change', (e) => {
            APP.admin.chequeosFilters.orden = e.target.value || 'fecha_desc';
            renderChequeosManagementList();
        });
    }

    if (chequeosClearFilters) {
        chequeosClearFilters.addEventListener('click', resetChequeosFilters);
    }

    if (chequeosList) {
        chequeosList.addEventListener('click', handleChequeosListClick);
    }

    if (chequeosRecientes) {
        chequeosRecientes.addEventListener('click', handleChequeosRecientesClick);
    }

    if (movimientosExportBtn) {
        movimientosExportBtn.addEventListener('click', exportMovimientosReport);
    }

    if (movimientosExportPdfBtn) {
        movimientosExportPdfBtn.addEventListener('click', exportMovimientosPdfReport);
    }

    if (movimientosSearch) {
        movimientosSearch.addEventListener('input', (e) => {
            APP.admin.movimientosFilters.query = e.target.value || '';
            renderMovimientosManagementList();
        });
    }

    if (movimientosTipo) {
        movimientosTipo.addEventListener('change', (e) => {
            APP.admin.movimientosFilters.tipo = e.target.value || 'todos';
            loadMovimientosManagement();
        });
    }

    if (movimientosFechaInicio) {
        movimientosFechaInicio.addEventListener('change', (e) => {
            APP.admin.movimientosFilters.fechaInicio = e.target.value || '';
            loadMovimientosManagement();
        });
    }

    if (movimientosFechaFin) {
        movimientosFechaFin.addEventListener('change', (e) => {
            APP.admin.movimientosFilters.fechaFin = e.target.value || '';
            loadMovimientosManagement();
        });
    }

    if (movimientosOrden) {
        movimientosOrden.addEventListener('change', (e) => {
            APP.admin.movimientosFilters.orden = e.target.value || 'fecha_desc';
            renderMovimientosManagementList();
        });
    }

    if (movimientosClearFilters) {
        movimientosClearFilters.addEventListener('click', resetMovimientosFilters);
    }

    if (movimientosList) {
        movimientosList.addEventListener('click', handleMovimientosListClick);
    }

    if (movimientosRecientes) {
        movimientosRecientes.addEventListener('click', handleMovimientosRecientesClick);
    }

    if (adminChartRange) {
        adminChartRange.addEventListener('change', () => {
            loadDashboardData(CONFIG.ROLES.ADMIN);
        });
    }

    if (movimientoVehiculoSearch) {
        movimientoVehiculoSearch.addEventListener('input', (e) => {
            scheduleSelectorSearch('mov-vehiculo', e.target.value, () => {
                loadVehiculosForSelect('vehiculo', e.target.value);
            });
        });
        movimientoVehiculoSearch.addEventListener('focus', () => {
            scheduleSelectorSearch('mov-vehiculo', movimientoVehiculoSearch.value, () => {
                loadVehiculosForSelect('vehiculo', movimientoVehiculoSearch.value);
            });
        });
        movimientoVehiculoSearch.addEventListener('keydown', (e) => {
            handleSelectorSearchKeydown(e, 'mov-vehiculo');
        });
    }

    if (movimientoConductorSearch) {
        movimientoConductorSearch.addEventListener('input', (e) => {
            scheduleSelectorSearch('mov-conductor', e.target.value, () => {
                loadConductoresForSelect('conductor', e.target.value);
            });
        });
        movimientoConductorSearch.addEventListener('focus', () => {
            scheduleSelectorSearch('mov-conductor', movimientoConductorSearch.value, () => {
                loadConductoresForSelect('conductor', movimientoConductorSearch.value);
            });
        });
        movimientoConductorSearch.addEventListener('keydown', (e) => {
            handleSelectorSearchKeydown(e, 'mov-conductor');
        });
    }

    if (chequeoVehiculoSearch) {
        chequeoVehiculoSearch.addEventListener('input', (e) => {
            scheduleSelectorSearch('ch-vehiculo', e.target.value, () => {
                loadVehiculosForSelect('ch-vehiculo', e.target.value);
            });
        });
        chequeoVehiculoSearch.addEventListener('focus', () => {
            scheduleSelectorSearch('ch-vehiculo', chequeoVehiculoSearch.value, () => {
                loadVehiculosForSelect('ch-vehiculo', chequeoVehiculoSearch.value);
            });
        });
        chequeoVehiculoSearch.addEventListener('keydown', (e) => {
            handleSelectorSearchKeydown(e, 'ch-vehiculo');
        });
    }

    if (chequeoConductorSearch) {
        chequeoConductorSearch.addEventListener('input', (e) => {
            scheduleSelectorSearch('ch-conductor', e.target.value, () => {
                loadConductoresForSelect('ch-conductor', e.target.value);
            });
        });
        chequeoConductorSearch.addEventListener('focus', () => {
            scheduleSelectorSearch('ch-conductor', chequeoConductorSearch.value, () => {
                loadConductoresForSelect('ch-conductor', chequeoConductorSearch.value);
            });
        });
        chequeoConductorSearch.addEventListener('keydown', (e) => {
            handleSelectorSearchKeydown(e, 'ch-conductor');
        });
    }

    document.querySelectorAll('.selector-results').forEach((container) => {
        container.addEventListener('click', handleSelectorResultClick);
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('.selector-search-group')) return;
        hideAllSelectorResults();
    });

    if (dialogModal) {
        dialogModal.addEventListener('click', (e) => {
            if (e.target === dialogModal) {
                resolveDialog(false);
            }
        });
    }

    if (chequeoDetalleModal) {
        chequeoDetalleModal.addEventListener('click', (e) => {
            if (e.target === chequeoDetalleModal) {
                closeChequeoDetalleModal();
            }
        });
    }

    if (movimientoDetalleModal) {
        movimientoDetalleModal.addEventListener('click', (e) => {
            if (e.target === movimientoDetalleModal) {
                closeMovimientoDetalleModal();
            }
        });
    }

    if (chequeoDetalleClose) {
        chequeoDetalleClose.addEventListener('click', closeChequeoDetalleModal);
    }

    if (chequeoDetalleAccept) {
        chequeoDetalleAccept.addEventListener('click', closeChequeoDetalleModal);
    }

    if (movimientoDetalleClose) {
        movimientoDetalleClose.addEventListener('click', closeMovimientoDetalleModal);
    }

    if (movimientoDetalleAccept) {
        movimientoDetalleAccept.addEventListener('click', closeMovimientoDetalleModal);
    }

    if (chequeoForm) {
        chequeoForm.addEventListener('submit', handleChequeoSubmit);
    }

    if (seccionesChequeo) {
        seccionesChequeo.addEventListener('click', handleChequeoOptionClick);
    }

    if (chequeoCloseBtn) {
        chequeoCloseBtn.addEventListener('click', closeChequeoForm);
    }

    if (chequeoCancelBtn) {
        chequeoCancelBtn.addEventListener('click', closeChequeoForm);
    }

    if (movimientoCloseBtn) {
        movimientoCloseBtn.addEventListener('click', closeMovimientoForm);
    }

    if (movimientoCancelBtn) {
        movimientoCancelBtn.addEventListener('click', closeMovimientoForm);
    }

    if (chequeoModal) {
        chequeoModal.addEventListener('click', (e) => {
            if (e.target === chequeoModal) {
                closeChequeoForm();
            }
        });
    }

    if (movimientoModal) {
        movimientoModal.addEventListener('click', (e) => {
            if (e.target === movimientoModal) {
                closeMovimientoForm();
            }
        });
    }

    if (dialogConfirmBtn) {
        dialogConfirmBtn.addEventListener('click', () => resolveDialog(true));
    }

    if (dialogCancelBtn) {
        dialogCancelBtn.addEventListener('click', () => resolveDialog(false));
    }

    document.addEventListener('keydown', handleEscapeKey);
}

// ============ AUTENTICACIÓN ============

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    const errorDiv = document.getElementById('login-error');
    const btnText = document.querySelector('#login-form .btn-text');
    const btnLoading = document.querySelector('#login-form .btn-loading');
    
    errorDiv.style.display = 'none';
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    
    try {
        const response = await API.login(email, password);
        
        // Guardar datos
        APP.token = response.access_token;
        APP.user = response.user;
        
        localStorage.setItem(CONFIG.TOKEN_KEY, response.access_token);
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(response.user));
        
        if (remember) {
            localStorage.setItem(CONFIG.REMEMBER_KEY, 'true');
        }
        
        // Mostrar dashboard según rol
        showDashboard(response.user.rol);
        
    } catch (error) {
        errorDiv.textContent = error.message || 'Credenciales inválidas';
        errorDiv.style.display = 'block';
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

async function logout() {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);

    if (token) {
        try {
            await API.logout();
        } catch (error) {
            console.warn('No se pudo revocar token en backend:', error);
        }
    }

    APP.token = null;
    APP.user = null;
    clearAdminAutoRefresh();
    
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
    localStorage.removeItem(CONFIG.REMEMBER_KEY);
    
    showScreen('login-screen');
    document.getElementById('login-form').reset();
}

// ============ NAVEGACIÓN ============

function showScreen(screenId) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar la pantalla deseada
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        APP.currentScreen = screenId;
    }
}

function showDashboard(rol) {
    const dashboardId = CONFIG.DASHBOARDS[rol];
    if (dashboardId) {
        showScreen(dashboardId);
        renderUserCredentialCards();
        configureAdminAutoRefresh(rol);
        loadDashboardData(rol);
    }
}

function getRoleCredentialMeta(rol) {
    if (rol === CONFIG.ROLES.ADMIN) {
        return {
            className: 'is-admin',
            icon: 'assets/icons/people.svg'
        };
    }

    if (rol === CONFIG.ROLES.OPERARIO_MOVIMIENTOS) {
        return {
            className: 'is-operario-movimientos',
            icon: 'assets/icons/truck.svg'
        };
    }

    if (rol === CONFIG.ROLES.OPERARIO_CHEQUEO) {
        return {
            className: 'is-operario-chequeo',
            icon: 'assets/icons/clipboard-check.svg'
        };
    }

    return {
        className: 'is-admin',
        icon: 'assets/icons/people.svg'
    };
}

function renderUserCredentialCards() {
    const cards = document.querySelectorAll('[data-user-credential]');
    if (!cards.length) return;

    const user = APP.user || {};
    const roleMeta = getRoleCredentialMeta(user.rol);
    const roleText = rolLabel(user.rol);
    const userName = (user.nombre || 'Usuario no identificado').trim();
    const userEmail = (user.email || 'Sin correo registrado').trim();

    cards.forEach((card) => {
        card.classList.remove('is-admin', 'is-operario-movimientos', 'is-operario-chequeo');
        card.classList.add(roleMeta.className);

        const avatar = card.querySelector('[data-user-avatar]');
        const name = card.querySelector('[data-user-name]');
        const role = card.querySelector('[data-user-rol]');
        const email = card.querySelector('[data-user-email]');

        if (avatar) {
            avatar.src = roleMeta.icon;
            avatar.alt = `Perfil ${roleText}`;
        }
        if (name) name.textContent = userName;
        if (role) role.textContent = roleText;
        if (email) email.textContent = userEmail;
    });
}

function clearAdminAutoRefresh() {
    if (APP.ui.adminChartsInterval) {
        clearInterval(APP.ui.adminChartsInterval);
        APP.ui.adminChartsInterval = null;
    }
}

function configureAdminAutoRefresh(rol) {
    clearAdminAutoRefresh();
    if (rol !== CONFIG.ROLES.ADMIN) return;

    APP.ui.adminChartsInterval = setInterval(() => {
        if (APP.currentScreen === 'dashboard-admin') {
            loadDashboardData(CONFIG.ROLES.ADMIN);
        }
    }, 60000);
}

async function loadDashboardData(rol) {
    try {
        if (rol === CONFIG.ROLES.ADMIN) {
            const rangoSelect = document.getElementById('admin-chart-range');
            const dias = parseInt(rangoSelect?.value || '7', 10);
            const stats = await API.getDashboard(Number.isInteger(dias) ? dias : 7);
            document.getElementById('stat-vehiculos').textContent = stats.totales?.vehiculos_activos || 0;
            document.getElementById('stat-conductores').textContent = stats.totales?.conductores_activos || 0;
            document.getElementById('stat-movimientos').textContent = stats.totales?.movimientos_hoy || 0;
            document.getElementById('stat-chequeos').textContent = stats.totales?.chequeos_hoy || 0;
            renderAdminAnalytics(stats.analitica || null);
        } else if (rol === CONFIG.ROLES.OPERARIO_MOVIMIENTOS) {
            const movimientos = await API.getMovimientos();
            renderMovimientosRecientes(movimientos.slice(0, 5));
        } else if (rol === CONFIG.ROLES.OPERARIO_CHEQUEO) {
            const chequeos = await API.getChequeos();
            renderChequeosRecientes(chequeos.slice(0, 5));
        }
    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

function navigate(section) {
    if (APP.user?.rol !== CONFIG.ROLES.ADMIN) {
        return;
    }

    closeChequeoForm();
    closeMovimientoForm();

    if (section === 'vehiculos') {
        showScreen('admin-vehiculos');
        closeVehiculoForm();
        closeConductorForm();
        closeUsuarioForm();
        loadVehiculosManagement();
        return;
    }

    if (section === 'conductores') {
        showScreen('admin-conductores');
        closeConductorForm();
        closeVehiculoForm();
        closeUsuarioForm();
        loadConductoresManagement();
        return;
    }

    if (section === 'usuarios') {
        showScreen('admin-usuarios');
        closeUsuarioForm();
        closeConductorForm();
        closeVehiculoForm();
        loadUsuariosManagement();
        return;
    }

    if (section === 'chequeos') {
        openChequeosPanel();
        return;
    }

    if (section === 'movimientos') {
        openMovimientosPanel();
        return;
    }

    showAppAlert('Módulo en construcción', `El módulo ${section} se habilitará en la siguiente iteración.`);
}

function openChequeosPanel() {
    if (![CONFIG.ROLES.ADMIN, CONFIG.ROLES.OPERARIO_CHEQUEO].includes(APP.user?.rol)) {
        showAppAlert('Acceso denegado', 'No tienes permisos para ver el historial de chequeos.');
        return;
    }

    showScreen('admin-chequeos');
    closeUsuarioForm();
    closeConductorForm();
    closeVehiculoForm();
    closeChequeoForm();
    loadChequeosManagement();
}

function openMovimientosPanel() {
    if (![CONFIG.ROLES.ADMIN, CONFIG.ROLES.OPERARIO_MOVIMIENTOS].includes(APP.user?.rol)) {
        showAppAlert('Acceso denegado', 'No tienes permisos para ver el historial de movimientos.');
        return;
    }

    showScreen('admin-movimientos');
    closeUsuarioForm();
    closeConductorForm();
    closeVehiculoForm();
    closeChequeoForm();
    closeMovimientoForm();
    closeChequeoDetalleModal();
    closeMovimientoDetalleModal();
    resetMovimientosFilters();
}

function showForm(type) {
    APP.formType = type;
    
    if (type === 'salida' || type === 'entrada') {
        APP.movimiento.returnScreen = APP.currentScreen || 'dashboard-movimientos';
        document.getElementById('form-title').textContent =
            type === 'salida' ? 'Registro de Salida' : 'Registro de Entrada';
        loadSelectores();
        toggleModal('movimiento-modal', true);
    } else if (type === 'chequeo') {
        APP.chequeo.returnScreen = APP.currentScreen || 'dashboard-chequeo';
        loadSelectores();
        loadFormularioChequeo();
        toggleModal('chequeo-modal', true);
    }
}

function goBack() {
    const current = APP.currentScreen;
    if (current.startsWith('form-')) {
        // Volver al dashboard según rol
        showDashboard(APP.user.rol);
        return;
    }

    if (current === 'admin-vehiculos') {
        closeVehiculoForm();
        showScreen('dashboard-admin');
        return;
    }

    if (current === 'admin-conductores') {
        closeConductorForm();
        showScreen('dashboard-admin');
        return;
    }

    if (current === 'admin-usuarios') {
        closeUsuarioForm();
        showScreen('dashboard-admin');
        return;
    }

    if (current === 'admin-chequeos') {
        showDashboard(APP.user?.rol);
        return;
    }

    if (current === 'admin-movimientos') {
        showDashboard(APP.user?.rol);
    }
}

function setMovimientosFeedback(message, isError = false) {
    const feedback = document.getElementById('movimientos-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.toggle('is-error', isError);
}

function getMovimientoBadgeClass(tipo) {
    return tipo === 'entrada' ? 'is-entrada' : 'is-salida';
}

function formatMovimientoTipo(tipo) {
    return tipo === 'entrada' ? 'Entrada' : 'Salida';
}

function formatBasculaLabel(value) {
    const normalized = normalizeSiNo(value);
    if (normalized === 'si') return 'Si';
    if (normalized === 'no') return 'No';
    return value || 'No registrado';
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getTrendPoints(values, plotArea, minValue, maxValue) {
    if (!Array.isArray(values) || values.length === 0) return [];

    const range = Math.max(1, maxValue - minValue);
    const step = values.length > 1 ? plotArea.width / (values.length - 1) : 0;

    return values.map((value, index) => {
        const x = plotArea.x + (step * index);
        const y = plotArea.y + plotArea.height - (((value - minValue) / range) * plotArea.height);
        return { x, y };
    });
}

function pointsToPath(points) {
    if (!Array.isArray(points) || points.length === 0) return '';
    return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
}

function pointsToSmoothPath(points, tension = 0.18) {
    if (!Array.isArray(points) || points.length === 0) return '';
    if (points.length < 3) return pointsToPath(points);

    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

    for (let i = 0; i < points.length - 1; i += 1) {
        const p0 = points[i - 1] || points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;

        const cp1x = p1.x + ((p2.x - p0.x) * tension);
        const cp1y = p1.y + ((p2.y - p0.y) * tension);
        const cp2x = p2.x - ((p3.x - p1.x) * tension);
        const cp2y = p2.y - ((p3.y - p1.y) * tension);

        d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }

    return d;
}

function formatCompactNumber(value) {
    const numeric = Number(value || 0);
    return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(numeric);
}

function renderAdminTrendChart(series) {
    const container = document.getElementById('admin-trend-chart');
    if (!container) return;

    const labels = Array.isArray(series?.labels) ? series.labels : [];
    const movimientos = Array.isArray(series?.movimientos) ? series.movimientos : [];
    const chequeos = Array.isArray(series?.chequeos) ? series.chequeos : [];

    if (!labels.length || (!movimientos.length && !chequeos.length)) {
        container.innerHTML = '<p class="empty-message">Sin datos suficientes para graficar tendencia.</p>';
        return;
    }

    const width = 860;
    const height = 320;
    const plotArea = {
        x: 62,
        y: 18,
        width: width - 82,
        height: height - 56
    };

    const allValues = [...movimientos, ...chequeos].map((value) => Number(value || 0));
    const rawMin = Math.min(...allValues);
    const rawMax = Math.max(...allValues);
    const buffer = Math.max(2, Math.round((rawMax - rawMin) * 0.12));
    const minValue = rawMin === rawMax ? Math.max(0, rawMin - 5) : Math.max(0, rawMin - buffer);
    const maxValue = rawMin === rawMax ? rawMax + 5 : rawMax + buffer;

    const movPoints = getTrendPoints(movimientos, plotArea, minValue, maxValue);
    const chePoints = getTrendPoints(chequeos, plotArea, minValue, maxValue);
    const movPath = pointsToSmoothPath(movPoints);
    const chePath = pointsToSmoothPath(chePoints);

    const movAreaPath = `${movPath} L ${movPoints[movPoints.length - 1].x.toFixed(2)} ${(plotArea.y + plotArea.height).toFixed(2)} L ${movPoints[0].x.toFixed(2)} ${(plotArea.y + plotArea.height).toFixed(2)} Z`;

    const tickCount = 5;
    const ticks = Array.from({ length: tickCount + 1 }, (_, step) => {
        const ratio = step / tickCount;
        const y = plotArea.y + (plotArea.height * ratio);
        const value = maxValue - ((maxValue - minValue) * ratio);
        return {
            y,
            value: formatCompactNumber(value)
        };
    });

    const gridLines = ticks
        .map((tick) => `<line x1="${plotArea.x}" y1="${tick.y.toFixed(2)}" x2="${(plotArea.x + plotArea.width).toFixed(2)}" y2="${tick.y.toFixed(2)}" />`)
        .join('');

    const yLabels = ticks
        .map((tick) => `<text class="trend-y-label" x="${(plotArea.x - 8).toFixed(2)}" y="${(tick.y + 4).toFixed(2)}" text-anchor="end">${tick.value}</text>`)
        .join('');

    const pointsMarkup = movPoints.map((point, index) => {
        const label = labels[index] || '';
        const movValue = movimientos[index] ?? 0;
        const cheValue = chequeos[index] ?? 0;
        return `
            <circle class="trend-dot trend-dot-mov" cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="3.8">
                <title>${escapeHtml(label)} · Movimientos: ${movValue} · Chequeos: ${cheValue}</title>
            </circle>
            <circle class="trend-dot trend-dot-che" cx="${chePoints[index]?.x?.toFixed(2) || point.x.toFixed(2)}" cy="${chePoints[index]?.y?.toFixed(2) || point.y.toFixed(2)}" r="3.3">
                <title>${escapeHtml(label)} · Chequeos: ${cheValue} · Movimientos: ${movValue}</title>
            </circle>
        `;
    }).join('');

    const labelsMarkup = labels
        .filter((_, idx) => idx === 0 || idx === labels.length - 1 || idx % Math.ceil(labels.length / 6) === 0)
        .map((label, idx) => `<span>${escapeHtml(label)}</span>`)
        .join('');

    container.innerHTML = `
        <svg class="trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Tendencia diaria de movimientos y chequeos">
            <defs>
                <linearGradient id="trendFillMov" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(43, 99, 240, 0.26)" />
                    <stop offset="100%" stop-color="rgba(43, 99, 240, 0.03)" />
                </linearGradient>
            </defs>
            <g class="trend-grid">${gridLines}</g>
            ${yLabels}
            <line class="trend-axis" x1="${plotArea.x}" y1="${(plotArea.y + plotArea.height).toFixed(2)}" x2="${(plotArea.x + plotArea.width).toFixed(2)}" y2="${(plotArea.y + plotArea.height).toFixed(2)}" />
            <line class="trend-axis" x1="${plotArea.x}" y1="${plotArea.y}" x2="${plotArea.x}" y2="${(plotArea.y + plotArea.height).toFixed(2)}" />
            <path class="trend-area trend-area-mov" d="${movAreaPath}" />
            <path class="trend-line trend-line-mov" d="${movPath}" />
            <path class="trend-line trend-line-che" d="${chePath}" />
            ${pointsMarkup}
        </svg>
        <div class="trend-legend">
            <span><i class="legend-dot mov"></i>Movimientos</span>
            <span><i class="legend-dot che"></i>Chequeos</span>
        </div>
        <div class="trend-axis-labels">${labelsMarkup}</div>
    `;
}

function renderAdminTipoChart(movimientosTipo) {
    const container = document.getElementById('admin-tipo-chart');
    if (!container) return;

    const entrada = Number(movimientosTipo?.entrada || 0);
    const salida = Number(movimientosTipo?.salida || 0);
    const total = entrada + salida;

    if (total <= 0) {
        container.innerHTML = '<p class="empty-message">Sin movimientos en el rango seleccionado.</p>';
        return;
    }

    const porcentajeEntrada = Math.round((entrada / total) * 100);

    container.innerHTML = `
        <div class="donut-visual" style="--entrada:${porcentajeEntrada}%">
            <div class="donut-center">
                <strong>${total}</strong>
                <span>movimientos</span>
            </div>
        </div>
        <div class="donut-legend">
            <p><i class="legend-dot entrada"></i>Entradas: ${entrada}</p>
            <p><i class="legend-dot salida"></i>Salidas: ${salida}</p>
        </div>
    `;
}

function renderAdminTopVehiculosChart(topVehiculos) {
    const container = document.getElementById('admin-top-vehiculos-chart');
    if (!container) return;

    const items = Array.isArray(topVehiculos) ? topVehiculos : [];
    if (!items.length) {
        container.innerHTML = '<p class="empty-message">Aun no hay vehiculos con actividad en este rango.</p>';
        return;
    }

    const maxValue = Math.max(1, ...items.map((item) => Number(item.total || 0)));
    container.innerHTML = items.map((item) => {
        const value = Number(item.total || 0);
        const width = Math.max(8, Math.round((value / maxValue) * 100));
        return `
            <div class="bar-item">
                <div class="bar-item-header">
                    <span>${escapeHtml(item.placa || 'Sin placa')}</span>
                    <strong>${value}</strong>
                </div>
                <div class="bar-track">
                    <div class="bar-fill" style="width:${width}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderAdminAnalytics(analitica) {
    renderAdminTrendChart(analitica?.series || null);
    renderAdminTipoChart(analitica?.movimientos_tipo || null);
    renderAdminTopVehiculosChart(analitica?.top_vehiculos || null);
}

function getFilteredMovimientos() {
    const { query, orden } = APP.admin.movimientosFilters;
    const queryLower = query.trim().toLowerCase();

    const filtered = APP.admin.movimientos.filter((movimiento) => {
        if (!queryLower) return true;

        const searchable = [
            movimiento.vehiculo?.placa,
            movimiento.conductor?.nombre,
            movimiento.usuario?.nombre,
            movimiento.auxiliar,
            movimiento.proveedor,
            movimiento.observaciones,
            movimiento.tipo
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchable.includes(queryLower);
    });

    return filtered.sort((a, b) => {
        if (orden === 'km_asc') return (a.kilometraje || 0) - (b.kilometraje || 0);
        if (orden === 'km_desc') return (b.kilometraje || 0) - (a.kilometraje || 0);

        const aTime = new Date(a.fecha_hora).getTime();
        const bTime = new Date(b.fecha_hora).getTime();
        return orden === 'fecha_asc' ? aTime - bTime : bTime - aTime;
    });
}

function updateMovimientosResults(total) {
    const results = document.getElementById('movimientos-results');
    if (!results) return;

    const label = total === 1 ? 'movimiento' : 'movimientos';
    results.textContent = `${total} ${label} en pantalla`;
}

function renderMovimientosManagementList() {
    const container = document.getElementById('movimientos-list');
    if (!container) return;

    const movimientos = getFilteredMovimientos();
    updateMovimientosResults(movimientos.length);

    if (movimientos.length === 0) {
        container.innerHTML = '<p class="empty-message">No hay movimientos para los filtros seleccionados.</p>';
        return;
    }

    container.innerHTML = movimientos
        .map((m) => {
            const fecha = new Date(m.fecha_hora).toLocaleString();
            return `
                <article class="management-card">
                    <div class="management-card-content">
                        <h4>${m.vehiculo?.placa || 'Sin placa'} · ${m.conductor?.nombre || 'Sin conductor'}</h4>
                        <p>
                            <span class="status-badge ${getMovimientoBadgeClass(m.tipo)}">${formatMovimientoTipo(m.tipo)}</span>
                            Km: ${m.kilometraje || 0} · ${fecha}
                        </p>
                        <p>Operario: ${m.usuario?.nombre || 'N/A'} · Auxiliar: ${m.auxiliar || 'N/A'}</p>
                        <p>Proveedor/Destino: ${m.proveedor || 'N/A'} · Sacas: ${m.sacas ?? 'N/A'}</p>
                        <button type="button" class="btn-ghost btn-inline" data-action="view-movimiento" data-id="${m.id}">Ver detalle</button>
                    </div>
                </article>
            `;
        })
        .join('');
}

function resetMovimientosFilters() {
    APP.admin.movimientosFilters = {
        query: '',
        tipo: 'todos',
        fechaInicio: '',
        fechaFin: '',
        orden: 'fecha_desc'
    };

    const searchInput = document.getElementById('movimientos-search');
    const tipoSelect = document.getElementById('movimientos-tipo');
    const fechaInicioInput = document.getElementById('movimientos-fecha-inicio');
    const fechaFinInput = document.getElementById('movimientos-fecha-fin');
    const ordenSelect = document.getElementById('movimientos-orden');

    if (searchInput) searchInput.value = '';
    if (tipoSelect) tipoSelect.value = 'todos';
    if (fechaInicioInput) fechaInicioInput.value = '';
    if (fechaFinInput) fechaFinInput.value = '';
    if (ordenSelect) ordenSelect.value = 'fecha_desc';

    loadMovimientosManagement();
}

async function loadMovimientosManagement() {
    try {
        setMovimientosFeedback('Cargando movimientos...');
        const filters = { limit: 1000 };

        if (APP.admin.movimientosFilters.tipo !== 'todos') {
            filters.tipo = APP.admin.movimientosFilters.tipo;
        }
        if (APP.admin.movimientosFilters.fechaInicio) {
            filters.fecha_inicio = APP.admin.movimientosFilters.fechaInicio;
        }
        if (APP.admin.movimientosFilters.fechaFin) {
            filters.fecha_fin = APP.admin.movimientosFilters.fechaFin;
        }

        const movimientos = await API.getMovimientos(filters);
        APP.admin.movimientos = Array.isArray(movimientos) ? movimientos : [];
        renderMovimientosManagementList();
        setMovimientosFeedback('Historial actualizado.');
    } catch (error) {
        APP.admin.movimientos = [];
        renderMovimientosManagementList();
        setMovimientosFeedback(error.message || 'No se pudieron cargar los movimientos.', true);
    }
}

function closeMovimientoDetalleModal() {
    toggleModal('movimiento-detalle-modal', false);
}

function closeChequeoForm() {
    const form = document.getElementById('chequeo-form');
    if (form) {
        form.reset();
    }
    clearSelectorSelection('ch-vehiculo', true);
    clearSelectorSelection('ch-conductor', true);
    document.querySelectorAll('.check-option-btn.is-selected').forEach((btn) => {
        btn.classList.remove('is-selected');
    });
    document.querySelectorAll('.chequeo-item-value').forEach((input) => {
        input.value = '';
    });
    toggleModal('chequeo-modal', false);
}

function closeMovimientoForm() {
    const form = document.getElementById('movimiento-form');
    if (form) {
        form.reset();
    }
    APP.formType = null;
    clearSelectorSelection('mov-vehiculo', true);
    clearSelectorSelection('mov-conductor', true);
    toggleModal('movimiento-modal', false);
}

function renderMovimientoDetalle(detalle) {
    const container = document.getElementById('movimiento-detalle-content');
    if (!container) return;

    const fecha = new Date(detalle.fecha_hora).toLocaleString();

    container.innerHTML = `
        <section class="chequeo-detalle-grid">
            <div class="chequeo-detalle-block">
                <h4>Cabecera</h4>
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p><strong>Tipo:</strong> <span class="status-badge ${getMovimientoBadgeClass(detalle.tipo)}">${formatMovimientoTipo(detalle.tipo)}</span></p>
                <p><strong>Vehiculo:</strong> ${detalle.vehiculo?.placa || 'N/A'} (${detalle.vehiculo?.marca || 'N/A'} ${detalle.vehiculo?.modelo || ''})</p>
                <p><strong>Conductor:</strong> ${detalle.conductor?.nombre || 'N/A'} · ${detalle.conductor?.cedula || 'N/A'}</p>
                <p><strong>Operario:</strong> ${detalle.usuario?.nombre || 'N/A'}</p>
                <p><strong>Kilometraje:</strong> ${detalle.kilometraje || 0} km</p>
            </div>
            <div class="chequeo-detalle-block">
                <h4>Datos de carga</h4>
                <p><strong>Auxiliar:</strong> ${detalle.auxiliar || 'No registrado'}</p>
                <p><strong>Proveedor / Destino:</strong> ${detalle.proveedor || 'No registrado'}</p>
                <p><strong>Bascula:</strong> ${formatBasculaLabel(detalle.bascula)}</p>
                <p><strong>Sacas:</strong> ${detalle.sacas ?? 'No registrado'}</p>
                <p><strong>Estado del cajon:</strong> ${detalle.cajon || 'No registrado'}</p>
            </div>
            ${detalle.observaciones ? `
                <div class="chequeo-detalle-block">
                    <h4>Observaciones</h4>
                    <p>${detalle.observaciones}</p>
                </div>
            ` : ''}
        </section>
    `;
}

async function openMovimientoDetalle(movimientoId) {
    try {
        const detalle = await API.getMovimiento(movimientoId);
        renderMovimientoDetalle(detalle);
        toggleModal('movimiento-detalle-modal', true);
    } catch (error) {
        await showAppAlert('Detalle no disponible', error.message || 'No se pudo cargar el detalle del movimiento.');
    }
}

function handleMovimientosListClick(e) {
    const btn = e.target.closest('[data-action="view-movimiento"]');
    if (!btn) return;

    const movimientoId = parseInt(btn.dataset.id, 10);
    if (!Number.isInteger(movimientoId)) return;

    openMovimientoDetalle(movimientoId);
}

function handleMovimientosRecientesClick(e) {
    const btn = e.target.closest('[data-action="view-movimiento"]');
    if (!btn) return;

    const movimientoId = parseInt(btn.dataset.id, 10);
    if (!Number.isInteger(movimientoId)) return;

    openMovimientoDetalle(movimientoId);
}

// ============ ADMIN VEHÍCULOS ============

function setVehiculosFeedback(message, isError = false) {
    const feedback = document.getElementById('vehiculos-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.toggle('is-error', isError);
}

function toggleModal(modalId, visible) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.toggle('active', visible);
    modal.setAttribute('aria-hidden', visible ? 'false' : 'true');
}

function handleEscapeKey(e) {
    if (e.key !== 'Escape') return;

    const dialog = document.getElementById('app-dialog');
    if (dialog?.classList.contains('active')) {
        resolveDialog(false);
        return;
    }

    const vehiculoModal = document.getElementById('vehiculo-modal');
    if (vehiculoModal?.classList.contains('active')) {
        closeVehiculoForm();
        return;
    }

    const conductorModal = document.getElementById('conductor-modal');
    if (conductorModal?.classList.contains('active')) {
        closeConductorForm();
        return;
    }

    const usuarioModal = document.getElementById('usuario-modal');
    if (usuarioModal?.classList.contains('active')) {
        closeUsuarioForm();
        return;
    }

    const chequeoModal = document.getElementById('chequeo-modal');
    if (chequeoModal?.classList.contains('active')) {
        closeChequeoForm();
        return;
    }

    const movimientoModal = document.getElementById('movimiento-modal');
    if (movimientoModal?.classList.contains('active')) {
        closeMovimientoForm();
        return;
    }

    const chequeoDetalleModal = document.getElementById('chequeo-detalle-modal');
    if (chequeoDetalleModal?.classList.contains('active')) {
        closeChequeoDetalleModal();
        return;
    }

    const movimientoDetalleModal = document.getElementById('movimiento-detalle-modal');
    if (movimientoDetalleModal?.classList.contains('active')) {
        closeMovimientoDetalleModal();
    }
}

function openDialog({
    title = 'Notificación',
    message = '',
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    showCancel = false
}) {
    const dialogTitle = document.getElementById('dialog-title');
    const dialogMessage = document.getElementById('dialog-message');
    const dialogConfirm = document.getElementById('dialog-confirm');
    const dialogCancel = document.getElementById('dialog-cancel');

    if (!dialogTitle || !dialogMessage || !dialogConfirm || !dialogCancel) {
        return Promise.resolve(true);
    }

    dialogTitle.textContent = title;
    dialogMessage.textContent = message;
    dialogConfirm.textContent = confirmText;
    dialogCancel.textContent = cancelText;
    dialogCancel.style.display = showCancel ? 'inline-flex' : 'none';

    toggleModal('app-dialog', true);

    return new Promise((resolve) => {
        APP.ui.dialogResolver = resolve;
    });
}

function resolveDialog(result) {
    toggleModal('app-dialog', false);

    if (APP.ui.dialogResolver) {
        const resolver = APP.ui.dialogResolver;
        APP.ui.dialogResolver = null;
        resolver(result);
    }
}

async function showAppAlert(title, message) {
    await openDialog({ title, message, confirmText: 'Entendido', showCancel: false });
}

async function showAppConfirm(title, message) {
    return await openDialog({
        title,
        message,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        showCancel: true
    });
}

async function loadVehiculosManagement() {
    try {
        setVehiculosFeedback('Cargando flota...');
        APP.admin.vehiculos = await API.getVehiculos();
        renderVehiculosList();
        setVehiculosFeedback(`${APP.admin.vehiculos.length} vehículos cargados.`);
    } catch (error) {
        setVehiculosFeedback(error.message || 'No se pudo cargar la flota.', true);
    }
}

function normalizeText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function normalizeSiNo(value) {
    const normalized = normalizeText(value).trim();
    if (!normalized) return null;
    if (normalized === 'si' || normalized === 'no') return normalized;
    return null;
}

function syncVehiculoFechasToFields(vehiculo, { soatFieldId, rtmFieldId }) {
    const soatField = document.getElementById(soatFieldId);
    const rtmField = document.getElementById(rtmFieldId);
    if (!soatField || !rtmField) return;

    if (!vehiculo || !vehiculo.id) {
        soatField.value = '';
        rtmField.value = '';
        return;
    }

    soatField.value = vehiculo.fecha_venc_soat || '';
    rtmField.value = vehiculo.fecha_venc_rtm || '';
}

function formatVencimientoLabel(value) {
    if (!value) return 'No registrado';
    const parsedDate = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return value;
    return parsedDate.toLocaleDateString();
}

function resetVehiculosFilters() {
    APP.admin.filters = {
        query: '',
        estado: 'todos',
        orden: 'placa_asc',
        anioMin: '',
        anioMax: ''
    };

    const vehiculosSearch = document.getElementById('vehiculos-search');
    const vehiculosEstado = document.getElementById('vehiculos-estado');
    const vehiculosOrden = document.getElementById('vehiculos-orden');
    const vehiculosAnioMin = document.getElementById('vehiculos-anio-min');
    const vehiculosAnioMax = document.getElementById('vehiculos-anio-max');

    if (vehiculosSearch) vehiculosSearch.value = '';
    if (vehiculosEstado) vehiculosEstado.value = 'todos';
    if (vehiculosOrden) vehiculosOrden.value = 'placa_asc';
    if (vehiculosAnioMin) vehiculosAnioMin.value = '';
    if (vehiculosAnioMax) vehiculosAnioMax.value = '';

    renderVehiculosList();
}

function getFilteredVehiculos(vehiculos) {
    const filters = APP.admin.filters;
    const query = normalizeText(filters.query).trim();

    const filtered = vehiculos.filter((vehiculo) => {
        const estadoMatch =
            filters.estado === 'todos'
            || (filters.estado === 'activos' && vehiculo.activo)
            || (filters.estado === 'inactivos' && !vehiculo.activo);

        const anio = Number(vehiculo.año);
        const anioMin = filters.anioMin ? Number(filters.anioMin) : null;
        const anioMax = filters.anioMax ? Number(filters.anioMax) : null;

        const anioMinMatch = anioMin === null || anio >= anioMin;
        const anioMaxMatch = anioMax === null || anio <= anioMax;

        if (!estadoMatch || !anioMinMatch || !anioMaxMatch) {
            return false;
        }

        if (!query) {
            return true;
        }

        const searchable = [
            vehiculo.placa,
            vehiculo.marca,
            vehiculo.modelo,
            vehiculo.empresa,
            vehiculo.año,
            vehiculo.fecha_venc_soat,
            vehiculo.fecha_venc_rtm,
            vehiculo.activo ? 'activo' : 'inactivo'
        ]
            .map(normalizeText)
            .join(' ');

        return searchable.includes(query);
    });

    return filtered.sort((a, b) => {
        if (filters.orden === 'placa_desc') {
            return normalizeText(b.placa).localeCompare(normalizeText(a.placa));
        }
        if (filters.orden === 'anio_desc') {
            return Number(b.año) - Number(a.año);
        }
        if (filters.orden === 'anio_asc') {
            return Number(a.año) - Number(b.año);
        }
        if (filters.orden === 'marca_asc') {
            const byMarca = normalizeText(a.marca).localeCompare(normalizeText(b.marca));
            if (byMarca !== 0) return byMarca;
            return normalizeText(a.modelo).localeCompare(normalizeText(b.modelo));
        }

        return normalizeText(a.placa).localeCompare(normalizeText(b.placa));
    });
}

function updateVehiculosResults(visible, total) {
    const results = document.getElementById('vehiculos-results');
    if (!results) return;

    results.textContent = `Mostrando ${visible} de ${total} vehículos.`;
}

function renderVehiculosList() {
    const container = document.getElementById('vehiculos-list');
    if (!container) return;

    const filteredVehiculos = getFilteredVehiculos(APP.admin.vehiculos);
    updateVehiculosResults(filteredVehiculos.length, APP.admin.vehiculos.length);

    if (!APP.admin.vehiculos.length) {
        container.innerHTML = '<p class="empty-message">No hay vehículos registrados.</p>';
        return;
    }

    if (!filteredVehiculos.length) {
        container.innerHTML = '<p class="empty-message">No hay resultados con los filtros actuales.</p>';
        return;
    }

    container.innerHTML = filteredVehiculos.map((vehiculo) => `
        <article class="management-item">
            <div class="management-item-main">
                <p class="management-item-title">${vehiculo.placa}</p>
                <p class="management-item-subtitle">${vehiculo.marca} ${vehiculo.modelo} · ${vehiculo.año}</p>
                <p class="management-item-meta">Empresa: ${vehiculo.empresa || 'Sin asignar'}</p>
                <p class="management-item-meta">SOAT: ${formatVencimientoLabel(vehiculo.fecha_venc_soat)} · RTM: ${formatVencimientoLabel(vehiculo.fecha_venc_rtm)}</p>
            </div>
            <div class="management-item-actions">
                <span class="status-badge ${vehiculo.activo ? 'is-active' : 'is-inactive'}">${vehiculo.activo ? 'Activo' : 'Inactivo'}</span>
                <button type="button" class="btn-ghost btn-item" data-action="edit" data-id="${vehiculo.id}">Editar</button>
                <button type="button" class="btn-danger btn-item" data-action="deactivate" data-id="${vehiculo.id}" ${vehiculo.activo ? '' : 'disabled'}>Desactivar</button>
            </div>
        </article>
    `).join('');
}

function openVehiculoForm(vehiculo = null) {
    const title = document.getElementById('vehiculo-form-title');
    const form = document.getElementById('vehiculo-form');
    if (!title || !form) return;

    APP.admin.editingVehiculoId = vehiculo?.id || null;
    title.textContent = vehiculo ? 'Editar vehículo' : 'Nuevo vehículo';

    form.reset();
    if (vehiculo) {
        form.placa.value = vehiculo.placa || '';
        form.marca.value = vehiculo.marca || '';
        form.modelo.value = vehiculo.modelo || '';
        form['año'].value = vehiculo.año || '';
        form.empresa.value = vehiculo.empresa || '';
        form.fecha_venc_soat.value = vehiculo.fecha_venc_soat || '';
        form.fecha_venc_rtm.value = vehiculo.fecha_venc_rtm || '';
    }

    toggleModal('vehiculo-modal', true);
    form.placa.focus();
}

function closeVehiculoForm() {
    const form = document.getElementById('vehiculo-form');
    APP.admin.editingVehiculoId = null;

    if (form) {
        form.reset();
    }
    toggleModal('vehiculo-modal', false);
}

async function handleVehiculoSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    payload.año = parseInt(payload.año, 10);
    payload.fecha_venc_soat = payload.fecha_venc_soat || null;
    payload.fecha_venc_rtm = payload.fecha_venc_rtm || null;

    try {
        if (APP.admin.editingVehiculoId) {
            await API.updateVehiculo(APP.admin.editingVehiculoId, payload);
            setVehiculosFeedback('Vehículo actualizado correctamente.');
        } else {
            await API.createVehiculo(payload);
            setVehiculosFeedback('Vehículo creado correctamente.');
        }

        closeVehiculoForm();
        await loadVehiculosManagement();
    } catch (error) {
        setVehiculosFeedback(error.message || 'No se pudo guardar el vehículo.', true);
    }
}

async function handleVehiculosListClick(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const vehiculoId = parseInt(button.dataset.id, 10);
    const vehiculo = APP.admin.vehiculos.find((item) => item.id === vehiculoId);

    if (!vehiculo) return;

    if (button.dataset.action === 'edit') {
        openVehiculoForm(vehiculo);
        return;
    }

    if (button.dataset.action === 'deactivate') {
        const confirmed = await showAppConfirm(
            'Desactivar vehículo',
            `Se desactivará ${vehiculo.placa}. Podrás verlo como inactivo en la flota.`
        );
        if (!confirmed) return;

        try {
            await API.deleteVehiculo(vehiculoId);
            setVehiculosFeedback(`Vehículo ${vehiculo.placa} desactivado.`);
            await loadVehiculosManagement();
        } catch (error) {
            setVehiculosFeedback(error.message || 'No se pudo desactivar el vehículo.', true);
        }
    }
}

// ============ ADMIN CONDUCTORES ============

function setConductoresFeedback(message, isError = false) {
    const feedback = document.getElementById('conductores-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.toggle('is-error', isError);
}

function resetConductoresFilters() {
    APP.admin.conductoresFilters = {
        query: '',
        estado: 'todos',
        categoria: 'todas',
        orden: 'nombre_asc',
        licencia: ''
    };

    const conductoresSearch = document.getElementById('conductores-search');
    const conductoresEstado = document.getElementById('conductores-estado');
    const conductoresCategoria = document.getElementById('conductores-categoria');
    const conductoresOrden = document.getElementById('conductores-orden');
    const conductoresLicencia = document.getElementById('conductores-licencia');

    if (conductoresSearch) conductoresSearch.value = '';
    if (conductoresEstado) conductoresEstado.value = 'todos';
    if (conductoresCategoria) conductoresCategoria.value = 'todas';
    if (conductoresOrden) conductoresOrden.value = 'nombre_asc';
    if (conductoresLicencia) conductoresLicencia.value = '';

    renderConductoresList();
}

async function loadConductoresManagement() {
    try {
        setConductoresFeedback('Cargando conductores...');
        APP.admin.conductores = await API.getConductores();
        renderConductoresList();
        setConductoresFeedback(`${APP.admin.conductores.length} conductores cargados.`);
    } catch (error) {
        setConductoresFeedback(error.message || 'No se pudo cargar la lista de conductores.', true);
    }
}

function getFilteredConductores(conductores) {
    const filters = APP.admin.conductoresFilters;
    const query = normalizeText(filters.query).trim();
    const licenciaFilter = normalizeText(filters.licencia).trim();

    const filtered = conductores.filter((conductor) => {
        const estadoMatch =
            filters.estado === 'todos'
            || (filters.estado === 'activos' && conductor.activo)
            || (filters.estado === 'inactivos' && !conductor.activo);

        const categoriaMatch =
            filters.categoria === 'todas'
            || normalizeText(conductor.categoria) === normalizeText(filters.categoria);

        const licenciaMatch =
            !licenciaFilter
            || normalizeText(conductor.licencia).includes(licenciaFilter);

        if (!estadoMatch || !categoriaMatch || !licenciaMatch) {
            return false;
        }

        if (!query) {
            return true;
        }

        const searchable = [
            conductor.nombre,
            conductor.cedula,
            conductor.licencia,
            conductor.fecha_venc_licencia,
            conductor.categoria,
            conductor.activo ? 'activo' : 'inactivo'
        ]
            .map(normalizeText)
            .join(' ');

        return searchable.includes(query);
    });

    return filtered.sort((a, b) => {
        if (filters.orden === 'nombre_desc') {
            return normalizeText(b.nombre).localeCompare(normalizeText(a.nombre));
        }
        if (filters.orden === 'cedula_asc') {
            return normalizeText(a.cedula).localeCompare(normalizeText(b.cedula));
        }
        if (filters.orden === 'categoria_asc') {
            const byCategoria = normalizeText(a.categoria).localeCompare(normalizeText(b.categoria));
            if (byCategoria !== 0) return byCategoria;
            return normalizeText(a.nombre).localeCompare(normalizeText(b.nombre));
        }

        return normalizeText(a.nombre).localeCompare(normalizeText(b.nombre));
    });
}

function updateConductoresResults(visible, total) {
    const results = document.getElementById('conductores-results');
    if (!results) return;

    results.textContent = `Mostrando ${visible} de ${total} conductores.`;
}

function renderConductoresList() {
    const container = document.getElementById('conductores-list');
    if (!container) return;

    const filteredConductores = getFilteredConductores(APP.admin.conductores);
    updateConductoresResults(filteredConductores.length, APP.admin.conductores.length);

    if (!APP.admin.conductores.length) {
        container.innerHTML = '<p class="empty-message">No hay conductores registrados.</p>';
        return;
    }

    if (!filteredConductores.length) {
        container.innerHTML = '<p class="empty-message">No hay resultados con los filtros actuales.</p>';
        return;
    }

    container.innerHTML = filteredConductores.map((conductor) => `
        <article class="management-item">
            <div class="management-item-main">
                <p class="management-item-title">${conductor.nombre}</p>
                <p class="management-item-subtitle">Cédula: ${conductor.cedula} · Licencia: ${conductor.licencia}</p>
                <p class="management-item-meta">Categoría: ${conductor.categoria}</p>
                <p class="management-item-meta">Vence licencia: ${formatVencimientoLabel(conductor.fecha_venc_licencia)}</p>
            </div>
            <div class="management-item-actions">
                <span class="status-badge ${conductor.activo ? 'is-active' : 'is-inactive'}">${conductor.activo ? 'Activo' : 'Inactivo'}</span>
                <button type="button" class="btn-ghost btn-item" data-action="edit" data-id="${conductor.id}">Editar</button>
                <button type="button" class="btn-danger btn-item" data-action="deactivate" data-id="${conductor.id}" ${conductor.activo ? '' : 'disabled'}>Desactivar</button>
            </div>
        </article>
    `).join('');
}

function openConductorForm(conductor = null) {
    const title = document.getElementById('conductor-form-title');
    const form = document.getElementById('conductor-form');
    if (!title || !form) return;

    APP.admin.editingConductorId = conductor?.id || null;
    title.textContent = conductor ? 'Editar conductor' : 'Nuevo conductor';

    form.reset();
    if (conductor) {
        form.nombre.value = conductor.nombre || '';
        form.cedula.value = conductor.cedula || '';
        form.licencia.value = conductor.licencia || '';
        form.categoria.value = conductor.categoria || '';
        form.fecha_venc_licencia.value = conductor.fecha_venc_licencia || '';
    }

    toggleModal('conductor-modal', true);
    form.nombre.focus();
}

function closeConductorForm() {
    const form = document.getElementById('conductor-form');
    APP.admin.editingConductorId = null;

    if (form) {
        form.reset();
    }
    toggleModal('conductor-modal', false);
}

async function handleConductorSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    payload.fecha_venc_licencia = payload.fecha_venc_licencia || null;

    try {
        if (APP.admin.editingConductorId) {
            await API.updateConductor(APP.admin.editingConductorId, payload);
            setConductoresFeedback('Conductor actualizado correctamente.');
        } else {
            await API.createConductor(payload);
            setConductoresFeedback('Conductor creado correctamente.');
        }

        closeConductorForm();
        await loadConductoresManagement();
    } catch (error) {
        setConductoresFeedback(error.message || 'No se pudo guardar el conductor.', true);
    }
}

async function handleConductoresListClick(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const conductorId = parseInt(button.dataset.id, 10);
    const conductor = APP.admin.conductores.find((item) => item.id === conductorId);

    if (!conductor) return;

    if (button.dataset.action === 'edit') {
        openConductorForm(conductor);
        return;
    }

    if (button.dataset.action === 'deactivate') {
        const confirmed = await showAppConfirm(
            'Desactivar conductor',
            `Se desactivará ${conductor.nombre}. Continuará visible en el historial como inactivo.`
        );
        if (!confirmed) return;

        try {
            await API.deleteConductor(conductorId);
            setConductoresFeedback(`Conductor ${conductor.nombre} desactivado.`);
            await loadConductoresManagement();
        } catch (error) {
            setConductoresFeedback(error.message || 'No se pudo desactivar el conductor.', true);
        }
    }
}

// ============ ADMIN USUARIOS ============

function setUsuariosFeedback(message, isError = false) {
    const feedback = document.getElementById('usuarios-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.toggle('is-error', isError);
}

function rolLabel(rol) {
    if (rol === 'admin') return 'Admin';
    if (rol === 'operario_movimientos') return 'Operario Movimientos';
    if (rol === 'operario_chequeo') return 'Operario Chequeo';
    return rol || 'Sin rol';
}

function resetUsuariosFilters() {
    APP.admin.usuariosFilters = {
        query: '',
        estado: 'todos',
        rol: 'todos',
        orden: 'nombre_asc',
        emailDomain: ''
    };

    const usuariosSearch = document.getElementById('usuarios-search');
    const usuariosEstado = document.getElementById('usuarios-estado');
    const usuariosRol = document.getElementById('usuarios-rol');
    const usuariosOrden = document.getElementById('usuarios-orden');
    const usuariosEmailDomain = document.getElementById('usuarios-email-domain');

    if (usuariosSearch) usuariosSearch.value = '';
    if (usuariosEstado) usuariosEstado.value = 'todos';
    if (usuariosRol) usuariosRol.value = 'todos';
    if (usuariosOrden) usuariosOrden.value = 'nombre_asc';
    if (usuariosEmailDomain) usuariosEmailDomain.value = '';

    renderUsuariosList();
}

async function loadUsuariosManagement() {
    try {
        setUsuariosFeedback('Cargando usuarios...');
        APP.admin.usuarios = await API.getUsuarios();
        renderUsuariosList();
        setUsuariosFeedback(`${APP.admin.usuarios.length} usuarios cargados.`);
    } catch (error) {
        setUsuariosFeedback(error.message || 'No se pudo cargar la lista de usuarios.', true);
    }
}

function getFilteredUsuarios(usuarios) {
    const filters = APP.admin.usuariosFilters;
    const query = normalizeText(filters.query).trim();
    const emailDomain = normalizeText(filters.emailDomain).replace(/^@/, '').trim();

    const filtered = usuarios.filter((usuario) => {
        const estadoMatch =
            filters.estado === 'todos'
            || (filters.estado === 'activos' && usuario.activo)
            || (filters.estado === 'inactivos' && !usuario.activo);

        const rolMatch = filters.rol === 'todos' || usuario.rol === filters.rol;

        const emailDomainMatch =
            !emailDomain
            || normalizeText(usuario.email).endsWith(`@${emailDomain}`)
            || normalizeText(usuario.email).includes(emailDomain);

        if (!estadoMatch || !rolMatch || !emailDomainMatch) {
            return false;
        }

        if (!query) {
            return true;
        }

        const searchable = [
            usuario.nombre,
            usuario.email,
            usuario.rol,
            rolLabel(usuario.rol),
            usuario.activo ? 'activo' : 'inactivo'
        ]
            .map(normalizeText)
            .join(' ');

        return searchable.includes(query);
    });

    return filtered.sort((a, b) => {
        if (filters.orden === 'nombre_desc') {
            return normalizeText(b.nombre).localeCompare(normalizeText(a.nombre));
        }
        if (filters.orden === 'email_asc') {
            return normalizeText(a.email).localeCompare(normalizeText(b.email));
        }
        if (filters.orden === 'rol_asc') {
            const byRol = normalizeText(a.rol).localeCompare(normalizeText(b.rol));
            if (byRol !== 0) return byRol;
            return normalizeText(a.nombre).localeCompare(normalizeText(b.nombre));
        }

        return normalizeText(a.nombre).localeCompare(normalizeText(b.nombre));
    });
}

function updateUsuariosResults(visible, total) {
    const results = document.getElementById('usuarios-results');
    if (!results) return;

    results.textContent = `Mostrando ${visible} de ${total} usuarios.`;
}

function renderUsuariosList() {
    const container = document.getElementById('usuarios-list');
    if (!container) return;

    const filteredUsuarios = getFilteredUsuarios(APP.admin.usuarios);
    updateUsuariosResults(filteredUsuarios.length, APP.admin.usuarios.length);

    if (!APP.admin.usuarios.length) {
        container.innerHTML = '<p class="empty-message">No hay usuarios registrados.</p>';
        return;
    }

    if (!filteredUsuarios.length) {
        container.innerHTML = '<p class="empty-message">No hay resultados con los filtros actuales.</p>';
        return;
    }

    container.innerHTML = filteredUsuarios.map((usuario) => {
        const isSelf = APP.user?.id === usuario.id;
        return `
        <article class="management-item">
            <div class="management-item-main">
                <p class="management-item-title">${usuario.nombre}</p>
                <p class="management-item-subtitle">${usuario.email}</p>
                <p class="management-item-meta">Rol: ${rolLabel(usuario.rol)}</p>
            </div>
            <div class="management-item-actions">
                <span class="status-badge ${usuario.activo ? 'is-active' : 'is-inactive'}">${usuario.activo ? 'Activo' : 'Inactivo'}</span>
                <button type="button" class="btn-ghost btn-item" data-action="edit" data-id="${usuario.id}">Editar</button>
                <button type="button" class="btn-danger btn-item" data-action="deactivate" data-id="${usuario.id}" ${usuario.activo && !isSelf ? '' : 'disabled'}>${isSelf ? 'Tu sesión' : 'Desactivar'}</button>
            </div>
        </article>
    `;
    }).join('');
}

function openUsuarioForm(usuario = null) {
    const title = document.getElementById('usuario-form-title');
    const form = document.getElementById('usuario-form');
    const passwordInput = document.getElementById('usr-password');
    if (!title || !form || !passwordInput) return;

    APP.admin.editingUsuarioId = usuario?.id || null;
    title.textContent = usuario ? 'Editar usuario' : 'Nuevo usuario';

    form.reset();
    passwordInput.required = !usuario;
    passwordInput.placeholder = usuario ? 'Dejar vacío para conservar actual' : 'Mínimo 6 caracteres';

    if (usuario) {
        form.nombre.value = usuario.nombre || '';
        form.email.value = usuario.email || '';
        form.rol.value = usuario.rol || '';
    }

    toggleModal('usuario-modal', true);
    form.nombre.focus();
}

function closeUsuarioForm() {
    const form = document.getElementById('usuario-form');
    const passwordInput = document.getElementById('usr-password');
    APP.admin.editingUsuarioId = null;

    if (form) {
        form.reset();
    }
    if (passwordInput) {
        passwordInput.required = true;
        passwordInput.placeholder = 'Mínimo 6 caracteres';
    }

    toggleModal('usuario-modal', false);
}

async function handleUsuarioSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);

    if (!payload.password) {
        delete payload.password;
    }

    try {
        if (APP.admin.editingUsuarioId) {
            await API.updateUsuario(APP.admin.editingUsuarioId, payload);
            setUsuariosFeedback('Usuario actualizado correctamente.');
        } else {
            await API.createUsuario(payload);
            setUsuariosFeedback('Usuario creado correctamente.');
        }

        closeUsuarioForm();
        await loadUsuariosManagement();
    } catch (error) {
        setUsuariosFeedback(error.message || 'No se pudo guardar el usuario.', true);
    }
}

async function handleUsuariosListClick(e) {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const usuarioId = parseInt(button.dataset.id, 10);
    const usuario = APP.admin.usuarios.find((item) => item.id === usuarioId);

    if (!usuario) return;

    if (button.dataset.action === 'edit') {
        openUsuarioForm(usuario);
        return;
    }

    if (button.dataset.action === 'deactivate') {
        if (APP.user?.id === usuario.id) {
            await showAppAlert('Acción bloqueada', 'No puedes desactivar tu propio usuario.');
            return;
        }

        const confirmed = await showAppConfirm(
            'Desactivar usuario',
            `Se desactivará ${usuario.nombre}. El usuario no podrá volver a iniciar sesión.`
        );
        if (!confirmed) return;

        try {
            await API.deleteUsuario(usuarioId);
            setUsuariosFeedback(`Usuario ${usuario.nombre} desactivado.`);
            await loadUsuariosManagement();
        } catch (error) {
            setUsuariosFeedback(error.message || 'No se pudo desactivar el usuario.', true);
        }
    }
}

// Selectores, formularios operativos y listas recientes fueron modularizados en:
// - js/selectors.js
// - js/operations.js

// ============ LOADING ============

function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}
