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
        },
        hallazgos: [],
        hallazgosFilters: {
            query: '',
            estado: 'todas',
            prioridad: 'todas',
            categoria: 'todas'
        },
        ordenes: [],
        ordenesFilters: {
            query: '',
            estado: 'todas',
            prioridad: 'todas'
        },
        ordenDetalleId: null
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
        adminChartsInterval: null,
        adminDashboardRequestSeq: 0
    },
    selectorSearchTimers: {},
    selectorOptions: {},
    selectorSelections: {}
};

// ============ INICIALIZACIÓN ============

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    setupEventListeners();
    initAdaptiveButtonIcons();
    await registerServiceWorker();
});


/* Extracted normalizeUiText */



/* Extracted resolveUnifiedButtonIcon */



/* Extracted getUnifiedIconClass */



/* Extracted decorateButtonWithIcon */



/* Extracted applyUnifiedButtonIcons */



/* Extracted initAdaptiveButtonIcons */


// ============ SERVICE WORKER ============

async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        APP.swRegistration = reg;
    } catch (err) {
        console.warn('Error al registrar Service Worker:', err);
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
    const adminRefreshBtn = document.getElementById('admin-refresh-btn');
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

    if (adminRefreshBtn) {
        adminRefreshBtn.addEventListener('click', () => {
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

    window.addEventListener('scv:data-changed', handleDashboardDataChangeEvent);
    window.addEventListener('storage', handleDashboardStorageSync);
    document.addEventListener('visibilitychange', handleDashboardVisibilityChange);
    window.addEventListener('focus', handleDashboardWindowFocus);

    window.addEventListener('scv:hallazgo-edit', (e) => openHallazgoForm(e.detail));
    window.addEventListener('scv:hallazgo-evaluar', (e) => openHallazgoEvaluarModal(e.detail));
    window.addEventListener('scv:orden-edit', (e) => openOrdenForm(e.detail));
    window.addEventListener('scv:orden-detalle', (e) => openOrdenDetalleModal(e.detail));

    const hallazgoNuevoBtn = document.getElementById('hallazgo-nuevo-btn');
    const hallazgoCancelBtn = document.getElementById('hallazgo-cancel-btn');
    const hallazgoCloseBtn = document.getElementById('hallazgo-close-btn');
    const hallazgoForm = document.getElementById('hallazgo-form');
    const hallazgoEvaluarCancelBtn = document.getElementById('hallazgo-evaluar-cancel-btn');
    const hallazgoEvaluarCloseBtn = document.getElementById('hallazgo-evaluar-close-btn');
    const hallazgoEvaluarForm = document.getElementById('hallazgo-evaluar-form');
    const ordenNuevoBtn = document.getElementById('orden-nuevo-btn');
    const ordenCancelBtn = document.getElementById('orden-cancel-btn');
    const ordenCloseBtn = document.getElementById('orden-close-btn');
    const ordenForm = document.getElementById('orden-form');
    const ordenDetalleClose = document.getElementById('orden-detalle-close');
    const ordenDetalleAccept = document.getElementById('orden-detalle-accept');
    const actividadNuevoBtn = document.getElementById('actividad-nuevo-btn');
    const actividadCancelBtn = document.getElementById('actividad-cancel-btn');
    const actividadCloseBtn = document.getElementById('actividad-close-btn');
    const actividadForm = document.getElementById('actividad-form');
    const costoNuevoBtn = document.getElementById('costo-nuevo-btn');
    const costoCancelBtn = document.getElementById('costo-cancel-btn');
    const costoCloseBtn = document.getElementById('costo-close-btn');
    const costoForm = document.getElementById('costo-form');

    const hallazgoExportPdfSingleBtn = document.getElementById('hallazgo-export-pdf-single-btn');
    const hallazgoExportExcelSingleBtn = document.getElementById('hallazgo-export-excel-single-btn');
    const ordenExportPdfSingleBtn = document.getElementById('orden-export-pdf-single-btn');
    const ordenExportExcelSingleBtn = document.getElementById('orden-export-excel-single-btn');

    if (hallazgoNuevoBtn) hallazgoNuevoBtn.addEventListener('click', () => openHallazgoForm(null));
    if (hallazgoCancelBtn) hallazgoCancelBtn.addEventListener('click', closeHallazgoForm);
    if (hallazgoCloseBtn) hallazgoCloseBtn.addEventListener('click', closeHallazgoForm);
    if (hallazgoForm) hallazgoForm.addEventListener('submit', handleHallazgoSubmit);
    if (hallazgoEvaluarCancelBtn) hallazgoEvaluarCancelBtn.addEventListener('click', closeHallazgoEvaluarModal);
    if (hallazgoEvaluarCloseBtn) hallazgoEvaluarCloseBtn.addEventListener('click', closeHallazgoEvaluarModal);
    if (hallazgoEvaluarForm) hallazgoEvaluarForm.addEventListener('submit', handleHallazgoEvaluarSubmit);
    if (ordenNuevoBtn) ordenNuevoBtn.addEventListener('click', () => openOrdenForm(null));
    if (ordenCancelBtn) ordenCancelBtn.addEventListener('click', closeOrdenForm);
    if (ordenCloseBtn) ordenCloseBtn.addEventListener('click', closeOrdenForm);
    if (ordenForm) ordenForm.addEventListener('submit', handleOrdenSubmit);
    if (ordenDetalleClose) ordenDetalleClose.addEventListener('click', closeOrdenDetalleModal);
    if (ordenDetalleAccept) ordenDetalleAccept.addEventListener('click', closeOrdenDetalleModal);
    if (actividadNuevoBtn) actividadNuevoBtn.addEventListener('click', () => openActividadForm(null));
    if (actividadCancelBtn) actividadCancelBtn.addEventListener('click', closeActividadForm);
    if (actividadCloseBtn) actividadCloseBtn.addEventListener('click', closeActividadForm);
    if (actividadForm) actividadForm.addEventListener('submit', handleActividadSubmit);
    if (costoNuevoBtn) costoNuevoBtn.addEventListener('click', () => openCostoForm(null));
    if (costoCancelBtn) costoCancelBtn.addEventListener('click', closeCostoForm);
    if (costoCloseBtn) costoCloseBtn.addEventListener('click', closeCostoForm);
    if (costoForm) costoForm.addEventListener('submit', handleCostoSubmit);

    if (hallazgoExportPdfSingleBtn) {
        hallazgoExportPdfSingleBtn.addEventListener('click', () => {
            const id = parseInt(document.getElementById('hallazgo-id').value, 10);
            if (id && typeof exportSingleHallazgoPdf === 'function') exportSingleHallazgoPdf(id);
        });
    }
    if (hallazgoExportExcelSingleBtn) {
        hallazgoExportExcelSingleBtn.addEventListener('click', () => {
            const id = parseInt(document.getElementById('hallazgo-id').value, 10);
            if (id && typeof exportSingleHallazgoExcel === 'function') exportSingleHallazgoExcel(id);
        });
    }
    if (ordenExportPdfSingleBtn) {
        ordenExportPdfSingleBtn.addEventListener('click', () => {
            const id = APP.admin.ordenDetalleId;
            if (id && typeof exportSingleOrdenPdf === 'function') exportSingleOrdenPdf(id);
        });
    }
    if (ordenExportExcelSingleBtn) {
        ordenExportExcelSingleBtn.addEventListener('click', () => {
            const id = APP.admin.ordenDetalleId;
            if (id && typeof exportSingleOrdenExcel === 'function') exportSingleOrdenExcel(id);
        });
    }

    const hallazgoModal = document.getElementById('hallazgo-modal');
    const hallazgoEvaluarModal = document.getElementById('hallazgo-evaluar-modal');
    const ordenModal = document.getElementById('orden-modal');
    const ordenDetalleModal = document.getElementById('orden-detalle-modal');
    const actividadModal = document.getElementById('actividad-modal');
    const costoModal = document.getElementById('costo-modal');

    if (hallazgoModal) {
        hallazgoModal.addEventListener('click', (e) => { if (e.target === hallazgoModal) closeHallazgoForm(); });
    }
    if (hallazgoEvaluarModal) {
        hallazgoEvaluarModal.addEventListener('click', (e) => { if (e.target === hallazgoEvaluarModal) closeHallazgoEvaluarModal(); });
    }
    if (ordenModal) {
        ordenModal.addEventListener('click', (e) => { if (e.target === ordenModal) closeOrdenForm(); });
    }
    if (ordenDetalleModal) {
        ordenDetalleModal.addEventListener('click', (e) => { if (e.target === ordenDetalleModal) closeOrdenDetalleModal(); });
    }
    if (actividadModal) {
        actividadModal.addEventListener('click', (e) => { if (e.target === actividadModal) closeActividadForm(); });
    }
    if (costoModal) {
        costoModal.addEventListener('click', (e) => { if (e.target === costoModal) closeCostoForm(); });
    }

    const hallazgosList = document.getElementById('hallazgos-list');
    const ordenesList = document.getElementById('ordenes-list');
    const ordenActividadesList = document.getElementById('orden-actividades-list');
    const ordenCostosList = document.getElementById('orden-costos-list');

    if (hallazgosList) hallazgosList.addEventListener('click', handleHallazgosListClick);
    if (ordenesList) ordenesList.addEventListener('click', handleOrdenesListClick);
    if (ordenActividadesList) ordenActividadesList.addEventListener('click', handleActividadesListClick);
    if (ordenCostosList) ordenCostosList.addEventListener('click', handleCostosListClick);

    const hallazgosSearch = document.getElementById('hallazgos-search');
    const hallazgosEstado = document.getElementById('hallazgos-filtro-estado');
    const hallazgosPrioridad = document.getElementById('hallazgos-filtro-prioridad');
    const hallazgosCategoria = document.getElementById('hallazgos-filtro-categoria');
    const hallazgosClearFilters = document.getElementById('hallazgos-clear-filters');
    const ordenesSearch = document.getElementById('ordenes-search');
    const ordenesEstado = document.getElementById('ordenes-filtro-estado');
    const ordenesPrioridad = document.getElementById('ordenes-filtro-prioridad');
    const hallazgosExportBtn = document.getElementById('hallazgos-export-btn');
    const hallazgosExportPdfBtn = document.getElementById('hallazgos-export-pdf-btn');
    const ordenesExportBtn = document.getElementById('ordenes-export-btn');
    const ordenesExportPdfBtn = document.getElementById('ordenes-export-pdf-btn');
    const ordenesClearFilters = document.getElementById('ordenes-clear-filters');

    if (hallazgosSearch) {
        hallazgosSearch.addEventListener('input', (e) => {
            APP.admin.hallazgosFilters.query = e.target.value || '';
            renderHallazgosList();
        });
    }
    if (hallazgosEstado) {
        hallazgosEstado.addEventListener('change', (e) => {
            APP.admin.hallazgosFilters.estado = e.target.value;
            renderHallazgosList();
        });
    }
    if (hallazgosPrioridad) {
        hallazgosPrioridad.addEventListener('change', (e) => {
            APP.admin.hallazgosFilters.prioridad = e.target.value;
            renderHallazgosList();
        });
    }
    if (hallazgosCategoria) {
        hallazgosCategoria.addEventListener('change', (e) => {
            APP.admin.hallazgosFilters.categoria = e.target.value;
            renderHallazgosList();
        });
    }
    if (hallazgosClearFilters) {
        hallazgosClearFilters.addEventListener('click', resetHallazgosFilters);
    }

    if (ordenesSearch) {
        ordenesSearch.addEventListener('input', (e) => {
            APP.admin.ordenesFilters.query = e.target.value || '';
            renderOrdenesList();
        });
    }
    if (ordenesEstado) {
        ordenesEstado.addEventListener('change', (e) => {
            APP.admin.ordenesFilters.estado = e.target.value;
            renderOrdenesList();
        });
    }
    if (ordenesPrioridad) {
        ordenesPrioridad.addEventListener('change', (e) => {
            APP.admin.ordenesFilters.prioridad = e.target.value;
            renderOrdenesList();
        });
    }
    if (ordenesClearFilters) {
        ordenesClearFilters.addEventListener('click', resetOrdenesFilters);
    }

    if (hallazgosExportBtn) {
        hallazgosExportBtn.addEventListener('click', function() {
            if (typeof exportHallazgosReport === 'function') exportHallazgosReport();
            else console.warn('exportHallazgosReport no definida');
        });
    }

    if (hallazgosExportPdfBtn) {
        hallazgosExportPdfBtn.addEventListener('click', function() {
            if (typeof exportHallazgosPdfReport === 'function') exportHallazgosPdfReport();
            else console.warn('exportHallazgosPdfReport no definida');
        });
    }

    if (ordenesExportBtn) {
        ordenesExportBtn.addEventListener('click', function() {
            if (typeof exportOrdenesReport === 'function') exportOrdenesReport();
            else console.warn('exportOrdenesReport no definida');
        });
    }

    if (ordenesExportPdfBtn) {
        ordenesExportPdfBtn.addEventListener('click', function() {
            if (typeof exportOrdenesPdfReport === 'function') exportOrdenesPdfReport();
            else console.warn('exportOrdenesPdfReport no definida');
        });
    }

    document.addEventListener('keydown', handleEscapeKey);
}

// ============ AUTENTICACIÓN ============


/* Extracted showScreen */



/* Extracted showDashboard */



/* Extracted getRoleCredentialMeta */



/* Extracted renderUserCredentialCards */



/* Extracted shouldRefreshAdminDashboard */



/* Extracted handleDashboardDataChangeEvent */



/* Extracted handleDashboardStorageSync */



/* Extracted handleDashboardVisibilityChange */



/* Extracted handleDashboardWindowFocus */



/* Extracted clearAdminAutoRefresh */



/* Extracted configureAdminAutoRefresh */



/* Extracted loadDashboardData */



/* Extracted navigate */



/* Extracted openChequeosPanel */



/* Extracted openMovimientosPanel */



/* Extracted showForm */



/* Extracted goBack */


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

function parseApiDateTime(value) {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw) return null;

    const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(raw);
    const normalized = hasTimezone ? raw : `${raw}Z`;
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
}

function getApiTimestamp(value) {
    const parsed = parseApiDateTime(value);
    return parsed ? parsed.getTime() : 0;
}

function formatApiDateTime(value, locale = 'es-CO') {
    const parsed = parseApiDateTime(value);
    if (!parsed) return 'No disponible';
    return parsed.toLocaleString(locale);
}

function formatApiDate(value, locale = 'es-CO') {
    const parsed = parseApiDateTime(value);
    if (!parsed) return 'No disponible';
    return parsed.toLocaleDateString(locale);
}

function formatApiTime(value, locale = 'es-CO') {
    const parsed = parseApiDateTime(value);
    if (!parsed) return 'No disponible';
    return parsed.toLocaleTimeString(locale);
}


/* Extracted renderAdminTrendChart */



/* Extracted renderAdminTipoChart */



/* Extracted renderAdminTopVehiculosChart */



/* Extracted renderAdminAnalytics */



/* Extracted closeChequeoForm */



/* Extracted closeMovimientoForm */



/* Extracted toggleModal */



/* Extracted handleEscapeKey */


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


/* Extracted resolveDialog */



/* Extracted showAppAlert */



/* Extracted showDialogHTML */



/* Extracted showAppConfirm */



/* Extracted normalizeText */



/* Extracted normalizeSiNo */


function syncVehiculoFechasToFields(vehiculo, { kilometrajeFieldId, soatFieldId, rtmFieldId }) {
    const kilometrajeField = document.getElementById(kilometrajeFieldId || '');
    const soatField = document.getElementById(soatFieldId);
    const rtmField = document.getElementById(rtmFieldId);
    if (!soatField || !rtmField) return;

    if (!vehiculo || !vehiculo.id) {
        if (kilometrajeField) kilometrajeField.value = '';
        soatField.value = '';
        rtmField.value = '';
        return;
    }

    if (kilometrajeField) kilometrajeField.value = vehiculo.kilometraje ?? 0;
    soatField.value = vehiculo.fecha_venc_soat || '';
    rtmField.value = vehiculo.fecha_venc_rtm || '';
}

function formatVencimientoLabel(value) {
    if (!value) return 'No registrado';
    const parsedDate = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return value;
    return parsedDate.toLocaleDateString();
}

// Selectores, formularios operativos y listas recientes fueron modularizados en:
// - js/selectors.js
// - js/operations.js

// ============ LOADING ============


/* Extracted showLoading */



/* Extracted hideLoading */

