/**
 * Módulo de Enrutamiento y Navegación - SCV
 */

function showScreen(screenId) {
    if (!document.getElementById(screenId) && window.TemplateLoader) {
        window.TemplateLoader.ensureScreenLoaded(screenId);
    }

    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar la pantalla deseada
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        if (window.Store && typeof window.Store.setCurrentScreen === 'function') {
            window.Store.setCurrentScreen(screenId);
        } else {
            APP.currentScreen = screenId;
        }
    }

    // Toggle Sidebar para el layout modular
    const sidebar = document.getElementById('app-sidebar');
    const mainContent = document.getElementById('app-screens');
    if (sidebar && mainContent) {
        if (screenId === 'login-screen') {
            sidebar.style.display = 'none';
            mainContent.style.marginLeft = '0';
        } else {
            sidebar.style.display = 'flex';
            mainContent.style.marginLeft = 'var(--sidebar-width, 80px)';
        }
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

    if (rol === CONFIG.ROLES.MECANICO) {
        return {
            className: 'is-mecanico',
            icon: 'assets/icons/wrench.svg'
        };
    }

    if (rol === CONFIG.ROLES.JEFE_MECANICOS) {
        return {
            className: 'is-jefe-mecanicos',
            icon: 'assets/icons/people.svg'
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

    const user = (window.Store ? window.Store.getUser() : APP.user) || {};
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

function shouldRefreshAdminDashboard() {
    const user = window.Store ? window.Store.getUser() : APP.user;
    const currentScreen = window.Store ? window.Store.getCurrentScreen() : APP.currentScreen;
    const rol = user?.rol;
    if (rol === CONFIG.ROLES.ADMIN && currentScreen === 'dashboard-admin') return true;
    if (rol === CONFIG.ROLES.JEFE_MECANICOS && currentScreen === 'dashboard-jefe-mecanicos') return true;
    if (rol === CONFIG.ROLES.MECANICO && currentScreen === 'dashboard-mecanico') return true;
    return false;
}

function handleDashboardDataChangeEvent() {
    if (!shouldRefreshAdminDashboard()) return;
    loadDashboardData(APP.user?.rol);
}

function handleDashboardStorageSync(event) {
    if (event.key !== CONFIG.DASHBOARD_SYNC_KEY) return;
    if (!shouldRefreshAdminDashboard()) return;
    loadDashboardData(APP.user?.rol);
}

function handleDashboardVisibilityChange() {
    if (document.hidden) return;
    if (!shouldRefreshAdminDashboard()) return;
    loadDashboardData(APP.user?.rol);
}

function handleDashboardWindowFocus() {
    if (!shouldRefreshAdminDashboard()) return;
    loadDashboardData(APP.user?.rol);
}

function clearAdminAutoRefresh() {
    if (APP.ui.adminChartsInterval) {
        clearInterval(APP.ui.adminChartsInterval);
        APP.ui.adminChartsInterval = null;
    }
}

function configureAdminAutoRefresh(rol) {
    clearAdminAutoRefresh();
    if (rol === CONFIG.ROLES.ADMIN) {
        APP.ui.adminChartsInterval = setInterval(() => {
            if (!document.hidden && APP.currentScreen === 'dashboard-admin') {
                loadDashboardData(CONFIG.ROLES.ADMIN);
            }
        }, CONFIG.ADMIN_REFRESH_INTERVAL_MS || 30000);
    } else if (rol === CONFIG.ROLES.JEFE_MECANICOS) {
        APP.ui.adminChartsInterval = setInterval(() => {
            if (!document.hidden && APP.currentScreen === 'dashboard-jefe-mecanicos') {
                loadDashboardData(CONFIG.ROLES.JEFE_MECANICOS, true);
            }
        }, 30000);
    } else if (rol === CONFIG.ROLES.MECANICO) {
        APP.ui.adminChartsInterval = setInterval(() => {
            if (!document.hidden && APP.currentScreen === 'dashboard-mecanico') {
                loadDashboardData(CONFIG.ROLES.MECANICO, true);
            }
        }, 30000);
    }
}

async function loadDashboardData(rol, silent = false) {
    try {
        if (rol === CONFIG.ROLES.ADMIN) {
            const requestSeq = ++APP.ui.adminDashboardRequestSeq;
            const rangoSelect = document.getElementById('admin-chart-range');
            const dias = parseInt(rangoSelect?.value || '7', 10);
            const stats = await API.getDashboard(Number.isInteger(dias) ? dias : 7);
            if (requestSeq !== APP.ui.adminDashboardRequestSeq) return;
            document.getElementById('stat-vehiculos').textContent = stats.totales?.vehiculos_activos || 0;
            document.getElementById('stat-conductores').textContent = stats.totales?.conductores_activos || 0;
            document.getElementById('stat-movimientos').textContent = stats.totales?.movimientos_hoy || 0;
            document.getElementById('stat-chequeos').textContent = stats.totales?.chequeos_hoy || 0;
            renderAdminAnalytics(stats.analitica || null);
        } else if (rol === CONFIG.ROLES.JEFE_MECANICOS) {
            if (typeof loadJefeMecanicosDashboard === 'function') {
                loadJefeMecanicosDashboard(silent);
            }
        } else if (rol === CONFIG.ROLES.MECANICO) {
            if (typeof loadMecanicoDashboard === 'function') {
                loadMecanicoDashboard(silent);
            }
        } else if (rol === CONFIG.ROLES.OPERARIO_MOVIMIENTOS) {
            const movimientos = await API.getMovimientos();
            renderMovimientosRecientes(movimientos.items || movimientos.slice(0, 5));
        } else if (rol === CONFIG.ROLES.OPERARIO_CHEQUEO) {
            const chequeos = await API.getChequeos();
            renderChequeosRecientes(chequeos.items || chequeos.slice(0, 5));
        }
    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

function navigate(section) {
    if (![CONFIG.ROLES.ADMIN, CONFIG.ROLES.MECANICO, CONFIG.ROLES.JEFE_MECANICOS].includes(APP.user?.rol)) {
        return;
    }

    if (typeof closeChequeoForm === 'function') closeChequeoForm();
    if (typeof closeMovimientoForm === 'function') closeMovimientoForm();

    if (section === 'vehiculos') {
        showScreen('admin-vehiculos');
        if (typeof closeVehiculoForm === 'function') closeVehiculoForm();
        if (typeof closeConductorForm === 'function') closeConductorForm();
        if (typeof closeUsuarioForm === 'function') closeUsuarioForm();
        if (typeof loadVehiculosManagement === 'function') loadVehiculosManagement();
        return;
    }

    if (section === 'conductores') {
        showScreen('admin-conductores');
        if (typeof closeVehiculoForm === 'function') closeVehiculoForm();
        if (typeof closeConductorForm === 'function') closeConductorForm();
        if (typeof closeUsuarioForm === 'function') closeUsuarioForm();
        if (typeof loadConductoresManagement === 'function') loadConductoresManagement();
        return;
    }

    if (section === 'usuarios') {
        showScreen('admin-usuarios');
        if (typeof closeVehiculoForm === 'function') closeVehiculoForm();
        if (typeof closeConductorForm === 'function') closeConductorForm();
        if (typeof closeUsuarioForm === 'function') closeUsuarioForm();
        if (typeof loadUsuariosManagement === 'function') loadUsuariosManagement();
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

    if (section === 'admin-hallazgos') {
        if (![CONFIG.ROLES.ADMIN, CONFIG.ROLES.JEFE_MECANICOS].includes(APP.user?.rol)) {
            showAppAlert('Acceso denegado', 'No tienes permisos para ver hallazgos.');
            return;
        }
        showScreen('admin-hallazgos');
        if (typeof loadHallazgosManagement === 'function') {
            loadHallazgosManagement();
        }
        return;
    }

    if (section === 'admin-ordenes') {
        if (![CONFIG.ROLES.ADMIN, CONFIG.ROLES.JEFE_MECANICOS, CONFIG.ROLES.MECANICO].includes(APP.user?.rol)) {
            showAppAlert('Acceso denegado', 'No tienes permisos para ver órdenes.');
            return;
        }
        showScreen('admin-ordenes');
        if (typeof loadOrdenesManagement === 'function') {
            loadOrdenesManagement();
        }
        return;
    }

    if (section === 'admin-estadisticas') {
        if (![CONFIG.ROLES.ADMIN, CONFIG.ROLES.JEFE_MECANICOS].includes(APP.user?.rol)) {
            showAppAlert('Acceso denegado', 'No tienes permisos para ver estadísticas.');
            return;
        }
        showScreen('admin-estadisticas');
        if (typeof loadMantenimientoStats === 'function') {
            loadMantenimientoStats();
        }
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
    if (typeof closeVehiculoForm === 'function') closeVehiculoForm();
    if (typeof closeConductorForm === 'function') closeConductorForm();
    if (typeof closeUsuarioForm === 'function') closeUsuarioForm();
    if (typeof closeChequeoForm === 'function') closeChequeoForm();
    if (typeof loadChequeosManagement === 'function') loadChequeosManagement();
}

function openMovimientosPanel() {
    if (![CONFIG.ROLES.ADMIN, CONFIG.ROLES.OPERARIO_MOVIMIENTOS].includes(APP.user?.rol)) {
        showAppAlert('Acceso denegado', 'No tienes permisos para ver el historial de movimientos.');
        return;
    }

    showScreen('admin-movimientos');
    if (typeof closeVehiculoForm === 'function') closeVehiculoForm();
    if (typeof closeConductorForm === 'function') closeConductorForm();
    if (typeof closeUsuarioForm === 'function') closeUsuarioForm();
    if (typeof closeChequeoForm === 'function') closeChequeoForm();
    if (typeof closeMovimientoForm === 'function') closeMovimientoForm();
    if (typeof closeChequeoDetalleModal === 'function') closeChequeoDetalleModal();
    if (typeof closeMovimientoDetalleModal === 'function') closeMovimientoDetalleModal();
    if (typeof resetMovimientosFilters === 'function') resetMovimientosFilters();
}

function showForm(type) {
    if (window.Store && typeof window.Store.setFormType === 'function') {
        window.Store.setFormType(type);
    } else {
        APP.formType = type;
    }
    
    if (type === 'salida' || type === 'entrada') {
        APP.movimiento.returnScreen = (window.Store ? window.Store.getCurrentScreen() : APP.currentScreen) || 'dashboard-movimientos';
        document.getElementById('form-title').textContent =
            type === 'salida' ? 'Registro de Salida' : 'Registro de Entrada';
        if (typeof loadSelectores === 'function') loadSelectores();
        toggleModal('movimiento-modal', true);
    } else if (type === 'chequeo') {
        APP.chequeo.returnScreen = (window.Store ? window.Store.getCurrentScreen() : APP.currentScreen) || 'dashboard-chequeo';
        if (typeof loadSelectores === 'function') loadSelectores();
        if (typeof loadFormularioChequeo === 'function') loadFormularioChequeo();
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
        if (typeof closeVehiculoForm === 'function') closeVehiculoForm();
        showDashboard(APP.user?.rol);
        return;
    }

    if (current === 'admin-conductores') {
        if (typeof closeConductorForm === 'function') closeConductorForm();
        showDashboard(APP.user?.rol);
        return;
    }

    if (current === 'admin-usuarios') {
        if (typeof closeUsuarioForm === 'function') closeUsuarioForm();
        showDashboard(APP.user?.rol);
        return;
    }

    if (current === 'admin-chequeos') {
        showDashboard(APP.user?.rol);
        return;
    }

    if (current === 'admin-movimientos') {
        showDashboard(APP.user?.rol);
        return;
    }

    if (current === 'admin-hallazgos' || current === 'admin-ordenes' || current === 'admin-estadisticas') {
        showDashboard(APP.user?.rol);
        return;
    }
}

// Hacer las funciones globales
window.showScreen = showScreen;
window.showDashboard = showDashboard;
window.getRoleCredentialMeta = getRoleCredentialMeta;
window.renderUserCredentialCards = renderUserCredentialCards;
window.shouldRefreshAdminDashboard = shouldRefreshAdminDashboard;
window.handleDashboardDataChangeEvent = handleDashboardDataChangeEvent;
window.handleDashboardStorageSync = handleDashboardStorageSync;
window.handleDashboardVisibilityChange = handleDashboardVisibilityChange;
window.handleDashboardWindowFocus = handleDashboardWindowFocus;
window.clearAdminAutoRefresh = clearAdminAutoRefresh;
window.configureAdminAutoRefresh = configureAdminAutoRefresh;
window.loadDashboardData = loadDashboardData;
window.navigate = navigate;
window.openChequeosPanel = openChequeosPanel;
window.openMovimientosPanel = openMovimientosPanel;
window.showForm = showForm;
window.goBack = goBack;
