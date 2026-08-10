/**
 * Módulo de Carga Dinámica de Vistas y Modales - SCV
 */

const TemplateLoader = {
    screens: {
        'login-screen': 'views/screens/login-screen.html',
        'dashboard-admin': 'views/screens/dashboard-admin.html',
        'dashboard-movimientos': 'views/screens/dashboard-movimientos.html',
        'dashboard-jefe-mecanicos': 'views/screens/dashboard-jefe-mecanicos.html',
        'dashboard-mecanico': 'views/screens/dashboard-mecanico.html',
        'dashboard-chequeo': 'views/screens/dashboard-chequeo.html',
        'admin-vehiculos': 'views/screens/admin-vehiculos.html',
        'admin-conductores': 'views/screens/admin-conductores.html',
        'admin-chequeos': 'views/screens/admin-chequeos.html',
        'admin-movimientos': 'views/screens/admin-movimientos.html',
        'admin-usuarios': 'views/screens/admin-usuarios.html',
        'admin-hallazgos': 'views/screens/admin-hallazgos.html',
        'admin-estadisticas': 'views/screens/admin-estadisticas.html',
        'admin-ordenes': 'views/screens/admin-ordenes.html'
    },

    modals: [
        'views/modals/vehiculo-modal.html',
        'views/modals/conductor-modal.html',
        'views/modals/usuario-modal.html',
        'views/modals/movimiento-modal.html',
        'views/modals/chequeo-modal.html',
        'views/modals/hallazgo-modal.html',
        'views/modals/orden-modal.html',
        'views/modals/common-dialogs.html'
    ],

    templateCache: new Map(),
    loadedScreens: new Set(),
    loadedModals: false,

    async loadTemplate(url) {
        if (this.templateCache.has(url)) {
            return this.templateCache.get(url);
        }
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} cargando template ${url}`);
            }
            const html = await response.text();
            this.templateCache.set(url, html);
            return html;
        } catch (error) {
            console.error(`Error al obtener plantilla ${url}:`, error);
            throw error;
        }
    },

    async loadAllModals() {
        if (this.loadedModals) return;
        const container = document.getElementById('app-modals') || document.body;
        const contents = await Promise.all(
            this.modals.map(url => this.loadTemplate(url).catch(() => ''))
        );

        contents.forEach(html => {
            if (html && html.trim()) {
                const temp = document.createElement('div');
                temp.innerHTML = html.trim();
                while (temp.firstChild) {
                    container.appendChild(temp.firstChild);
                }
            }
        });
        this.loadedModals = true;
    },

    async loadAllScreens() {
        const container = document.getElementById('app-screens') || document.getElementById('app-container') || document.body;
        const screenEntries = Object.entries(this.screens);
        const results = await Promise.all(
            screenEntries.map(async ([screenId, url]) => {
                try {
                    const html = await this.loadTemplate(url);
                    return { screenId, html };
                } catch {
                    return null;
                }
            })
        );

        results.forEach(res => {
            if (res && res.html) {
                const temp = document.createElement('div');
                temp.innerHTML = res.html.trim();
                while (temp.firstChild) {
                    container.appendChild(temp.firstChild);
                }
                this.loadedScreens.add(res.screenId);
            }
        });
    },

    async ensureScreenLoaded(screenId) {
        if (document.getElementById(screenId)) return true;
        const url = this.screens[screenId];
        if (!url) return false;

        try {
            const html = await this.loadTemplate(url);
            const container = document.getElementById('app-screens') || document.getElementById('app-container') || document.body;
            const temp = document.createElement('div');
            temp.innerHTML = html.trim();
            while (temp.firstChild) {
                container.appendChild(temp.firstChild);
            }
            this.loadedScreens.add(screenId);
            return true;
        } catch (err) {
            console.error(`No se pudo cargar la vista ${screenId}:`, err);
            return false;
        }
    },

    async init() {
        await Promise.all([
            this.loadAllScreens(),
            this.loadAllModals()
        ]);
    }
};

window.TemplateLoader = TemplateLoader;
