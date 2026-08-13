// UI Helpers, Icons and Layout Shell Renderer

export const ICONS = {
    dashboard: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    vehiculos: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
    conductores: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    chequeos: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><polyline points="9 15 11 17 15 11"></polyline></svg>`,
    estadisticas: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
    mantenimiento: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
    ordenes: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 12h6"></path><path d="M9 16h6"></path></svg>`,
    hallazgos: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="11"></line><line x1="11" y1="14" x2="11.01" y2="14"></line></svg>`,
    usuarios: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    logout: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
    menu: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
    shield: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    search: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    plus: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    edit: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    trash: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    eye: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    arrowLeft: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
    close: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    check: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    arrowDown: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>`,
    arrowUp: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`,
    alert: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
};

export function normalizeRole(role = '') {
    const r = (role || '').toUpperCase().trim();
    if (r === 'ADMIN') return 'ADMIN';
    if (r === 'OPERARIO_MOVIMIENTOS' || r === 'OPERARIO_DESPACHO' || r === 'OPERADOR') return 'OPERARIO_DESPACHO';
    if (r === 'OPERARIO_CHEQUEO' || r === 'INSPECTOR') return 'OPERARIO_CHEQUEO';
    if (r === 'MECANICO') return 'MECANICO';
    if (r === 'JEFE_MECANICOS' || r === 'SUPERVISOR') return 'JEFE_MECANICOS';
    return 'ADMIN';
}

export function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconSvg = ICONS.check;
    if (type === 'error') iconSvg = ICONS.alert;
    if (type === 'warning') iconSvg = ICONS.alert;

    toast.innerHTML = `
        <div class="toast-icon">${iconSvg}</div>
        <div class="toast-msg">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

export function openModal(title, bodyHtml, footerButtons = []) {
    const container = document.getElementById('modal-container');
    if (!container) return;

    const footerHtml = footerButtons.map((btn, index) => {
        const id = btn.id || `modal-btn-${index}`;
        btn._tempId = id;
        return `
        <button class="${btn.className || 'btn-primary'}" id="${id}" ${btn.attrs || ''}>
            ${btn.icon ? ICONS[btn.icon] || '' : ''} ${btn.text}
        </button>
        `;
    }).join('');

    container.innerHTML = `
        <div class="modal-overlay" id="modal-overlay">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" id="modal-btn-close">${ICONS.close}</button>
                </div>
                <div class="modal-body">
                    ${bodyHtml}
                </div>
                <div class="modal-footer">
                    ${footerHtml}
                </div>
            </div>
        </div>
    `;

    // Bind close events
    document.getElementById('modal-btn-close')?.addEventListener('click', closeModal);
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') closeModal();
    });

    // Bind custom button actions
    footerButtons.forEach(btn => {
        if (btn.onClick) {
            const btnEl = document.getElementById(btn._tempId);
            if (btnEl) {
                btnEl.addEventListener('click', (e) => btn.onClick(e, closeModal));
            }
        }
    });
}

export function closeModal() {
    const container = document.getElementById('modal-container');
    if (container) container.innerHTML = '';
}

/**
 * Returns navigation links depending on user role
 */
export function getNavItemsForRole(role) {
    const norm = normalizeRole(role);
    switch (norm) {
        case 'ADMIN':
            return [
                { id: 'nav-dashboard', route: 'dashboard', label: 'Inicio', icon: ICONS.dashboard },
                { id: 'nav-vehiculos', route: 'gestion-vehiculos', label: 'Vehículos', icon: ICONS.vehiculos },
                { id: 'nav-conductores', route: 'gestion-conductores', label: 'Conductores', icon: ICONS.conductores },
                { id: 'nav-usuarios', route: 'gestion-usuarios', label: 'Usuarios', icon: ICONS.usuarios },
                { id: 'nav-mantenimiento', route: 'mantenimiento', label: 'Mantenimiento', icon: ICONS.mantenimiento },
                { id: 'nav-movimientos', route: 'movimientos', label: 'Movimientos', icon: ICONS.dashboard },
                { id: 'nav-chequeos', route: 'chequeos', label: 'Chequeos', icon: ICONS.chequeos }
            ];
        case 'OPERARIO_DESPACHO':
            return [
                { id: 'nav-dashboard', route: 'dashboard', label: 'Movimientos', icon: ICONS.dashboard }
            ];
        case 'OPERARIO_CHEQUEO':
            return [
                { id: 'nav-dashboard', route: 'dashboard', label: 'Inspección', icon: ICONS.chequeos }
            ];
        case 'MECANICO':
            return [
                { id: 'nav-dashboard', route: 'dashboard', label: 'Órdenes', icon: ICONS.mantenimiento },
                { id: 'nav-vehiculos', route: 'gestion-vehiculos', label: 'Vehículos', icon: ICONS.vehiculos }
            ];
        case 'JEFE_MECANICOS':
            return [
                { id: 'nav-dashboard', route: 'dashboard', label: 'Panel', icon: ICONS.dashboard },
                { id: 'nav-mantenimiento', route: 'mantenimiento', label: 'Mantenimiento', icon: ICONS.mantenimiento },
                { id: 'nav-vehiculos', route: 'gestion-vehiculos', label: 'Vehículos', icon: ICONS.vehiculos }
            ];
        default:
            return [
                { id: 'nav-dashboard', route: 'dashboard', label: 'Inicio', icon: ICONS.dashboard }
            ];
    }
}

export function getHeaderTitle(route, role) {
    const norm = normalizeRole(role);
    if (route === 'dashboard') {
        if (norm === 'ADMIN') return 'DESPACHO DE VEHÍCULOS';
        if (norm === 'OPERARIO_DESPACHO') return 'REGISTRO DE MOVIMIENTOS';
        if (norm === 'OPERARIO_CHEQUEO') return 'INSPECCIÓN DE FLOTA';
        if (norm === 'MECANICO') return 'PANEL MECÁNICO';
        if (norm === 'JEFE_MECANICOS') return 'SUPERVISIÓN DE MANTENIMIENTO';
        return 'DESPACHO DE VEHÍCULOS';
    }
    if (route.startsWith('gestion-vehiculos')) return 'GESTIÓN DE VEHÍCULOS';
    if (route.startsWith('gestion-conductores')) return 'GESTIÓN DE CONDUCTORES';
    if (route.startsWith('gestion-usuarios')) return 'GESTIÓN DE USUARIOS';
    if (route.startsWith('gestion')) return 'GESTIÓN OPERATIVA';
    if (route === 'mantenimiento') return 'MANTENIMIENTO Y ANALÍTICA';
    if (route === 'movimientos') return 'REGISTRO DE MOVIMIENTOS';
    if (route === 'chequeos') return 'CHEQUEOS PREOPERACIONALES';
    if (route === 'turnos') return 'GESTIÓN DE TURNOS';
    if (route === 'auditoria') return 'AUDITORÍA DE SEGURIDAD';
    return 'CONTROL VEHICULAR';
}

/**
 * Standard App Shell conforming 1:1 to Mockups
 */
export function renderAppShell(user, activeRoute = 'dashboard') {
    const role = normalizeRole(user?.rol);
    const navItems = getNavItemsForRole(role);
    const headerTitle = getHeaderTitle(activeRoute, role);
    const isExpanded = localStorage.getItem('scv_sidebar_expanded') === 'true';

    const navHtml = navItems.map(item => {
        const isActive = activeRoute.startsWith(item.route) || (item.route === 'gestion-vehiculos' && activeRoute.startsWith('gestion'));
        return `
            <a href="#${item.route}" 
               class="nav-item ${isActive ? 'active' : ''}" 
               data-route="${item.route}" 
               data-tooltip="${item.label}"
               title="${item.label}">
               <span class="nav-icon">${item.icon}</span>
               <span class="nav-label">${item.label}</span>
            </a>
        `;
    }).join('');

    return `
        <div class="app-layout ${isExpanded ? 'sidebar-expanded' : ''}">
            <!-- SIDEBAR -->
            <aside class="sidebar ${isExpanded ? 'expanded' : ''}" id="app-sidebar">
                <div class="sidebar-top">
                    <button class="menu-btn" id="btn-toggle-sidebar" title="Alternar menú lateral">${ICONS.menu}</button>
                    <span class="sidebar-brand-title">SCV Flota</span>
                </div>
                <nav class="nav-list">
                    ${navHtml}
                </nav>
            </aside>

            <!-- MAIN CONTENT AREA -->
            <main class="main-content">
                <header class="app-header">
                    <h1>${headerTitle}</h1>
                    <div class="header-actions">
                        <div class="user-badge">
                            <strong>${user?.nombre || user?.email || 'Usuario'}</strong>
                            <span class="role-pill">${role}</span>
                        </div>
                        <button class="btn-logout" id="btn-logout-global">
                            ${ICONS.logout}
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </header>

                <div id="app-content">
                    <!-- Dynamic View Content Injected Here -->
                </div>
            </main>

            <!-- MODAL CONTAINER -->
            <div id="modal-container"></div>
        </div>
    `;
}

export function bindNavigationEvents(onNavigate, onLogout) {
    // Sidebar expand/collapse toggle button
    const toggleBtn = document.getElementById('btn-toggle-sidebar') || document.querySelector('.menu-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const layout = document.querySelector('.app-layout');
            const sidebar = document.querySelector('.sidebar');
            if (!layout || !sidebar) return;

            const isExpanded = layout.classList.toggle('sidebar-expanded');
            sidebar.classList.toggle('expanded', isExpanded);
            localStorage.setItem('scv_sidebar_expanded', isExpanded ? 'true' : 'false');
        });
    }

    document.querySelectorAll('.nav-item[data-route]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = link.getAttribute('data-route');
            if (onNavigate) onNavigate(route);
        });
    });

    document.getElementById('btn-logout-global')?.addEventListener('click', () => {
        if (onLogout) onLogout();
    });
}
