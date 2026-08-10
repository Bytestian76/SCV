import { API } from "./api.js";
import { APP, Store } from "./store.js";

function normalizeUiText(value = '') {
    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function resolveUnifiedButtonIcon(button, label) {
    if (button.classList.contains('btn-back')) return 'assets/icons/box-arrow-in-left.svg';
    if (label.includes('cerrar sesion')) return 'assets/icons/box-arrow-right.svg';
    if (label.includes('iniciar sesion')) return 'assets/icons/box-arrow-right.svg';
    if (label.includes('volver')) return 'assets/icons/box-arrow-in-left.svg';
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

function navigate(section) {
    if (![CONFIG.ROLES.ADMIN, CONFIG.ROLES.MECANICO, CONFIG.ROLES.JEFE_MECANICOS].includes(APP.user?.rol)) {
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

function goBack() {
    const current = APP.currentScreen;
    if (current.startsWith('form-')) {
        // Volver al dashboard según rol
        showDashboard(APP.user.rol);
        return;
    }

    if (current === 'admin-vehiculos') {
        closeVehiculoForm();
        showDashboard(APP.user?.rol);
        return;
    }

    if (current === 'admin-conductores') {
        closeConductorForm();
        showDashboard(APP.user?.rol);
        return;
    }

    if (current === 'admin-usuarios') {
        closeUsuarioForm();
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

function toggleModal(modalId, visible) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.toggle('active', visible);
    modal.setAttribute('aria-hidden', visible ? 'false' : 'true');

    if (visible) {
        document.body.classList.add('modal-open');
    } else {
        document.body.classList.remove('modal-open');
    }
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

    const hallazgoModal = document.getElementById('hallazgo-modal');
    if (hallazgoModal?.classList.contains('active')) {
        closeHallazgoForm();
        return;
    }

    const hallazgoEvaluarModal = document.getElementById('hallazgo-evaluar-modal');
    if (hallazgoEvaluarModal?.classList.contains('active')) {
        closeHallazgoEvaluarModal();
        return;
    }

    const ordenModal = document.getElementById('orden-modal');
    if (ordenModal?.classList.contains('active')) {
        closeOrdenForm();
        return;
    }

    const ordenDetalleModal = document.getElementById('orden-detalle-modal');
    if (ordenDetalleModal?.classList.contains('active')) {
        closeOrdenDetalleModal();
        return;
    }

    const actividadModal = document.getElementById('actividad-modal');
    if (actividadModal?.classList.contains('active')) {
        closeActividadForm();
        return;
    }

    const costoModal = document.getElementById('costo-modal');
    if (costoModal?.classList.contains('active')) {
        closeCostoForm();
    }
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

function showDialogHTML(title, html) {
    const dialog = document.getElementById('app-dialog');
    if (!dialog) return;
    document.getElementById('dialog-title').textContent = title;
    const msg = document.getElementById('dialog-message');
    const actions = dialog.querySelector('.dialog-actions');
    msg.innerHTML = html;
    msg.style.display = 'block';
    if (actions) actions.style.display = 'none';
    dialog.style.display = 'flex';
    document.body.classList.add('modal-open');

    const closeHandler = () => {
        dialog.style.display = 'none';
        document.body.classList.remove('modal-open');
        msg.innerHTML = '';
        msg.style.display = '';
        if (actions) actions.style.display = '';
        dialog.querySelector('#dialog-cancel')?.removeEventListener('click', closeHandler);
        dialog.querySelector('#dialog-confirm')?.removeEventListener('click', closeHandler);
        dialog.removeEventListener('click', overlayHandler);
    };
    const overlayHandler = (e) => {
        if (e.target === dialog) closeHandler();
    };
    dialog.querySelector('#dialog-cancel')?.addEventListener('click', closeHandler);
    dialog.querySelector('#dialog-confirm')?.addEventListener('click', closeHandler);
    dialog.addEventListener('click', overlayHandler);
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

function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
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

export { normalizeUiText, resolveUnifiedButtonIcon, getUnifiedIconClass, decorateButtonWithIcon, applyUnifiedButtonIcons, initAdaptiveButtonIcons, showScreen, navigate, goBack, toggleModal, handleEscapeKey, resolveDialog, showAppAlert, showDialogHTML, showAppConfirm, showLoading, hideLoading, normalizeText, normalizeSiNo, openChequeosPanel, openMovimientosPanel, showForm, closeChequeoForm, closeMovimientoForm };
window.normalizeUiText = normalizeUiText;
window.resolveUnifiedButtonIcon = resolveUnifiedButtonIcon;
window.getUnifiedIconClass = getUnifiedIconClass;
window.decorateButtonWithIcon = decorateButtonWithIcon;
window.applyUnifiedButtonIcons = applyUnifiedButtonIcons;
window.initAdaptiveButtonIcons = initAdaptiveButtonIcons;
window.showScreen = showScreen;
window.navigate = navigate;
window.goBack = goBack;
window.toggleModal = toggleModal;
window.handleEscapeKey = handleEscapeKey;
window.resolveDialog = resolveDialog;
window.showAppAlert = showAppAlert;
window.showDialogHTML = showDialogHTML;
window.showAppConfirm = showAppConfirm;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.normalizeText = normalizeText;
window.normalizeSiNo = normalizeSiNo;
window.openChequeosPanel = openChequeosPanel;
window.openMovimientosPanel = openMovimientosPanel;
window.showForm = showForm;
window.closeChequeoForm = closeChequeoForm;
window.closeMovimientoForm = closeMovimientoForm;
