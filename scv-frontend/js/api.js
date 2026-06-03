/**
 * API Service - Comunicación con el backend
 */

const API = {
    normalizeErrorMessage(detail) {
        if (Array.isArray(detail)) {
            return detail.map((item) => item?.msg || JSON.stringify(item)).join(' | ');
        }
        if (typeof detail === 'string') return detail;
        if (detail && typeof detail === 'object') return detail.msg || JSON.stringify(detail);
        return 'Error en la petición';
    },

    notifyDashboardDataChanged(method, endpoint) {
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return;
        if (!/^\/(movimientos|chequeos|vehiculos|conductores|mantenimientos|fallas)\b/.test(endpoint)) return;

        const detail = {
            method,
            endpoint,
            ts: Date.now()
        };

        window.dispatchEvent(new CustomEvent('scv:data-changed', { detail }));
        try {
            localStorage.setItem(CONFIG.DASHBOARD_SYNC_KEY, JSON.stringify(detail));
        } catch (error) {
            console.warn('No se pudo sincronizar evento de dashboard entre pestañas:', error);
        }
    },

    /**
     * Headers base para todas las peticiones
     */
    getHeaders() {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    /**
     * Hacer una petición HTTP
     */
    async request(method, endpoint, data = null) {
        const options = {
            method: method,
            headers: this.getHeaders(),
            cache: 'no-store'
        };
        const isAuthLoginEndpoint = endpoint === '/auth/login';
        const isAuthLogoutEndpoint = endpoint === '/auth/logout';
        
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(API_BASE + endpoint, options);
            let result = {};
            try {
                result = await response.json();
            } catch (_) {
                result = {};
            }

            if (response.status === 401 && !isAuthLoginEndpoint && !isAuthLogoutEndpoint) {
                if (typeof window.forceLogoutByExpiredSession === 'function') {
                    window.forceLogoutByExpiredSession();
                } else {
                    localStorage.removeItem(CONFIG.TOKEN_KEY);
                    localStorage.removeItem(CONFIG.USER_KEY);
                    localStorage.removeItem(CONFIG.REMEMBER_KEY);
                    window.location.reload();
                }
            }
            
            if (!response.ok) {
                throw {
                    status: response.status,
                    message: this.normalizeErrorMessage(result.detail)
                };
            }

            this.notifyDashboardDataChanged(method, endpoint);
            
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // ============ AUTH ============
    
    async login(email, password) {
        return await this.request('POST', '/auth/login', { email, password });
    },

    async getCurrentUser() {
        return await this.request('GET', '/auth/me');
    },

    async refreshToken() {
        return await this.request('POST', '/auth/refresh');
    },

    async logout() {
        return await this.request('POST', '/auth/logout');
    },

    // ============ VEHÍCULOS ============

    async getVehiculos() {
        return await this.request('GET', '/vehiculos/');
    },

    async getVehiculo(id) {
        return await this.request('GET', `/vehiculos/${id}`);
    },

    async createVehiculo(data) {
        return await this.request('POST', '/vehiculos/', data);
    },

    async updateVehiculo(id, data) {
        return await this.request('PUT', `/vehiculos/${id}`, data);
    },

    async deleteVehiculo(id) {
        return await this.request('DELETE', `/vehiculos/${id}`);
    },

    async activateVehiculo(id) {
        return await this.request('PUT', `/vehiculos/${id}`, { activo: true });
    },

    // ============ CONDUCTORES ============

    async getConductores() {
        return await this.request('GET', '/conductores/');
    },

    async getConductor(id) {
        return await this.request('GET', `/conductores/${id}`);
    },

    async createConductor(data) {
        return await this.request('POST', '/conductores/', data);
    },

    async updateConductor(id, data) {
        return await this.request('PUT', `/conductores/${id}`, data);
    },

    async deleteConductor(id) {
        return await this.request('DELETE', `/conductores/${id}`);
    },

    async activateConductor(id) {
        return await this.request('PUT', `/conductores/${id}`, { activo: true });
    },

    // ============ USUARIOS ============

    async getUsuarios() {
        return await this.request('GET', '/usuarios/');
    },

    async getUsuario(id) {
        return await this.request('GET', `/usuarios/${id}`);
    },

    async createUsuario(data) {
        return await this.request('POST', '/usuarios/', data);
    },

    async updateUsuario(id, data) {
        return await this.request('PUT', `/usuarios/${id}`, data);
    },

    async deleteUsuario(id) {
        return await this.request('DELETE', `/usuarios/${id}`);
    },

    async activateUsuario(id) {
        return await this.request('PUT', `/usuarios/${id}`, { activo: true });
    },

    // ============ MOVIMIENTOS ============

    async getMovimientos(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const endpoint = params ? `/movimientos/?${params}` : '/movimientos/';
        return await this.request('GET', endpoint);
    },

    async createMovimiento(data) {
        return await this.request('POST', '/movimientos/', data);
    },

    async getMovimiento(id) {
        return await this.request('GET', `/movimientos/${id}`);
    },

    // ============ CHEQUEOS ============

    async getChequeos(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const endpoint = params ? `/chequeos/?${params}` : '/chequeos/';
        return await this.request('GET', endpoint);
    },

    async getChequeo(id) {
        return await this.request('GET', `/chequeos/${id}`);
    },

    async getFormularioChequeo() {
        return await this.request('GET', '/chequeos/formulario');
    },

    async createChequeoCabecera(data) {
        return await this.request('POST', '/chequeos/', data);
    },

    async createChequeoItems(chequeoId, items) {
        return await this.request('POST', `/chequeos/${chequeoId}/items`, { items });
    },

    // ============ SELECTORES ============

    async getSelectorVehiculos(search = '', limit = 100) {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (limit) params.set('limit', String(limit));
        const query = params.toString();
        const endpoint = query ? `/selectores/vehiculos?${query}` : '/selectores/vehiculos';
        return await this.request('GET', endpoint);
    },

    async getSelectorConductores(search = '', limit = 100) {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (limit) params.set('limit', String(limit));
        const query = params.toString();
        const endpoint = query ? `/selectores/conductores?${query}` : '/selectores/conductores';
        return await this.request('GET', endpoint);
    },

    // ============ MANTENIMIENTOS ============

    async getMantenimientos(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const endpoint = params ? `/mantenimientos/?${params}` : '/mantenimientos/';
        return await this.request('GET', endpoint);
    },

    async getMantenimiento(id) {
        return await this.request('GET', `/mantenimientos/${id}`);
    },

    async createMantenimiento(data) {
        return await this.request('POST', '/mantenimientos/', data);
    },

    async updateMantenimiento(id, data) {
        return await this.request('PUT', `/mantenimientos/${id}`, data);
    },

    async updateEstadoMantenimiento(id, estado) {
        return await this.request('PUT', `/mantenimientos/${id}/estado`, { estado });
    },

    async deleteMantenimiento(id) {
        return await this.request('DELETE', `/mantenimientos/${id}`);
    },

    async addMantenimientoItems(id, items) {
        return await this.request('POST', `/mantenimientos/${id}/items`, items);
    },

    async getKanbanBoard() {
        return await this.request('GET', '/mantenimientos/kanban/board');
    },

    // ============ ACTIVIDADES ============

    async getActividades(mantenimientoId) {
        return await this.request('GET', `/mantenimientos/${mantenimientoId}/actividades`);
    },

    async createActividad(mantenimientoId, data) {
        return await this.request('POST', `/mantenimientos/${mantenimientoId}/actividades`, data);
    },

    async updateActividad(actividadId, data) {
        return await this.request('PUT', `/mantenimientos/actividades/${actividadId}`, data);
    },

    async deleteActividad(actividadId) {
        return await this.request('DELETE', `/mantenimientos/actividades/${actividadId}`);
    },

    // ============ EVIDENCIAS ============

    async createEvidencia(actividadId, data) {
        return await this.request('POST', `/mantenimientos/actividades/${actividadId}/evidencias`, data);
    },

    async getEvidencias(actividadId) {
        return await this.request('GET', `/mantenimientos/actividades/${actividadId}/evidencias`);
    },

    async deleteEvidencia(evidenciaId) {
        return await this.request('DELETE', `/mantenimientos/evidencias/${evidenciaId}`);
    },

    // ============ COSTOS ============

    async getCostos(mantenimientoId) {
        return await this.request('GET', `/mantenimientos/${mantenimientoId}/costos`);
    },

    async createCosto(mantenimientoId, data) {
        return await this.request('POST', `/mantenimientos/${mantenimientoId}/costos`, data);
    },

    async deleteCosto(costoId) {
        return await this.request('DELETE', `/mantenimientos/costos/${costoId}`);
    },

    // ============ AUDITORIA ============

    async getAuditoria(mantenimientoId) {
        return await this.request('GET', `/mantenimientos/${mantenimientoId}/auditoria`);
    },

    // ============ NOTIFICACIONES ============

    async getNotificaciones() {
        return await this.request('GET', '/notificaciones/');
    },

    async marcarNotificacionLeida(id) {
        return await this.request('PUT', `/notificaciones/${id}/leer`);
    },

    async marcarTodasNotificacionesLeidas() {
        return await this.request('PUT', '/notificaciones/leer-todas');
    },

    // ============ DASHBOARD ============

    async getDashboard(dias = 7) {
        return await this.request('GET', `/dashboard/?dias=${dias}&_ts=${Date.now()}`);
    },

    async getDashboardMecanico() {
        return await this.request('GET', `/dashboard/mecanico?_ts=${Date.now()}`);
    },

    // ============ WEB PUSH ============

    async pushSubscribe(subscription) {
        return await this.request('POST', '/push/subscribe', {
            endpoint: subscription.endpoint,
            auth: subscription.auth,
            p256dh: subscription.p256dh,
            user_agent: navigator.userAgent,
        });
    },

    async pushUnsubscribe(endpoint) {
        return await this.request('DELETE', `/push/unsubscribe?endpoint=${encodeURIComponent(endpoint)}`);
    },

    // ============ FALLAS ============

    async getFallas(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const endpoint = params ? `/fallas/?${params}` : '/fallas/';
        return await this.request('GET', endpoint);
    },

    async getFalla(id) {
        return await this.request('GET', `/fallas/${id}`);
    },

    async createFalla(data) {
        return await this.request('POST', '/fallas/', data);
    },

    async updateFalla(id, data) {
        return await this.request('PUT', `/fallas/${id}`, data);
    },

    async updateEstadoFalla(id, estado) {
        return await this.request('PUT', `/fallas/${id}/estado`, { estado });
    },

    async deleteFalla(id) {
        return await this.request('DELETE', `/fallas/${id}`);
    }
};
