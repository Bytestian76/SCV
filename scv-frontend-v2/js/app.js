import { auth } from './api.js';
import { renderAppShell, bindNavigationEvents, showToast } from './ui.js';
import { renderLoginView, initLoginView } from './views/login.js';
import { renderDashboardView, initDashboardView } from './views/dashboard.js';
import { renderGestionView, initGestionView } from './views/gestion.js';
import { renderMantenimientoView, initMantenimientoView } from './views/mantenimiento.js';
import { renderMovimientosView, initMovimientosView } from './views/movimientos.js';
import { renderChequeosView, initChequeosView } from './views/chequeos.js';
import { renderTurnosView, initTurnosView } from './views/turnos.js';
import { renderAuditoriaView, initAuditoriaView } from './views/auditoria.js';

class AppRouter {
    constructor() {
        this.currentRoute = '';
        this.currentParams = {};
        this.user = auth.getUser();

        window.addEventListener('hashchange', () => this.handleHashChange());
    }

    init() {
        if (!auth.isAuthenticated()) {
            this.navigate('login');
        } else {
            const hash = window.location.hash.replace('#', '') || 'dashboard';
            this.navigate(hash);
        }
    }

    navigate(route, params = {}) {
        this.currentRoute = route;
        this.currentParams = params;
        window.location.hash = route;
        this.render();
    }

    handleHashChange() {
        const hash = window.location.hash.replace('#', '') || (auth.isAuthenticated() ? 'dashboard' : 'login');
        if (hash !== this.currentRoute) {
            this.currentRoute = hash;
            this.render();
        }
    }

    render() {
        this.user = auth.getUser();
        const root = document.getElementById('app-root');
        if (!root) return;

        // Force login if not authenticated
        if (!auth.isAuthenticated() || this.currentRoute === 'login') {
            root.innerHTML = renderLoginView();
            initLoginView((user) => {
                this.user = user;
                this.navigate('dashboard');
            });
            return;
        }

        // Render standard app shell for authenticated users
        const activeNavKey = this.currentRoute.startsWith('gestion') ? 'gestion' : this.currentRoute;
        root.innerHTML = renderAppShell(this.user, activeNavKey);

        const contentEl = document.getElementById('app-content');
        if (!contentEl) return;

        // Render appropriate view inside app-content
        switch (this.currentRoute) {
            case 'dashboard':
                contentEl.innerHTML = renderDashboardView(this.user);
                initDashboardView(this.user, this);
                break;
            case 'gestion-vehiculos':
                contentEl.innerHTML = renderGestionView('vehiculos');
                initGestionView('vehiculos', this);
                break;
            case 'gestion-conductores':
                contentEl.innerHTML = renderGestionView('conductores');
                initGestionView('conductores', this);
                break;
            case 'gestion-usuarios':
                contentEl.innerHTML = renderGestionView('usuarios');
                initGestionView('usuarios', this);
                break;
            case 'mantenimiento':
                contentEl.innerHTML = renderMantenimientoView(this.currentParams?.tab || 'estadisticas');
                initMantenimientoView(this.currentParams?.tab || 'estadisticas', this);
                break;
            case 'movimientos':
                contentEl.innerHTML = renderMovimientosView();
                initMovimientosView(this);
                break;
            case 'chequeos':
                contentEl.innerHTML = renderChequeosView();
                initChequeosView(this);
                break;
            case 'turnos':
                contentEl.innerHTML = renderTurnosView();
                initTurnosView(this);
                break;
            case 'auditoria':
                contentEl.innerHTML = renderAuditoriaView();
                initAuditoriaView(this);
                break;
            default:
                contentEl.innerHTML = renderDashboardView(this.user);
                initDashboardView(this.user, this);
                break;
        }

        // Bind top-bar and sidebar actions
        bindNavigationEvents(
            (route) => this.navigate(route),
            () => {
                auth.clearSession();
                showToast('Sesión finalizada', 'info');
                this.navigate('login');
            }
        );
    }
}

// Bootstrap application on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    window.App = new AppRouter();
    window.App.init();

    // Registro del Service Worker (PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('[SCV] Service Worker registrado:', reg.scope))
            .catch(err => console.warn('[SCV] Service Worker no pudo registrarse:', err));
    }
});
