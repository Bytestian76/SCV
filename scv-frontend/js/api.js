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
        if (!/^\/(movimientos|chequeos|vehiculos|conductores|hallazgos|ordenes-trabajo)\b/.test(endpoint)) return;

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

            if ((response.status === 401 || response.status === 403) && !isAuthLoginEndpoint && !isAuthLogoutEndpoint) {
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

    async getVehiculoHistorial(id) {
        return await this.request('GET', `/vehiculos/${id}/historial-mantenimientos`);
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

    async getMecanicos() {
        return await this.request('GET', '/mecanicos/');
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

    async getEstadisticasMantenimiento() {
        return await this.request('GET', `/dashboard/estadisticas-mantenimiento?_ts=${Date.now()}`);
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

    // ============ HALLAZGOS ============

    async getHallazgos(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const endpoint = params ? `/hallazgos/?${params}` : '/hallazgos/';
        return await this.request('GET', endpoint);
    },

    async getHallazgo(id) {
        return await this.request('GET', `/hallazgos/${id}`);
    },

    async createHallazgo(data) {
        return await this.request('POST', '/hallazgos/', data);
    },

    async updateHallazgo(id, data) {
        return await this.request('PUT', `/hallazgos/${id}`, data);
    },

    async evaluarHallazgo(id, data) {
        return await this.request('PUT', `/hallazgos/${id}/evaluar`, data);
    },

    async deleteHallazgo(id) {
        return await this.request('DELETE', `/hallazgos/${id}`);
    },

    // ============ ORDENES DE TRABAJO ============

    async getOrdenesTrabajo(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const endpoint = params ? `/ordenes-trabajo/?${params}` : '/ordenes-trabajo/';
        return await this.request('GET', endpoint);
    },

    async getOrdenTrabajo(id) {
        return await this.request('GET', `/ordenes-trabajo/${id}`);
    },

    async createOrdenTrabajo(data) {
        return await this.request('POST', '/ordenes-trabajo/', data);
    },

    async updateOrdenTrabajo(id, data) {
        return await this.request('PUT', `/ordenes-trabajo/${id}`, data);
    },

    async cambiarEstadoOrden(id, data) {
        return await this.request('PUT', `/ordenes-trabajo/${id}/estado`, data);
    },

    async deleteOrdenTrabajo(id) {
        return await this.request('DELETE', `/ordenes-trabajo/${id}`);
    },

    // ============ ORDENES - ACTIVIDADES ============

    async getOrdenActividades(ordenId, filters = {}) {
        const params = new URLSearchParams({ orden_id: ordenId, ...filters }).toString();
        return await this.request('GET', `/ordenes-actividades/?${params}`);
    },

    async createOrdenActividad(ordenId, data) {
        const payload = {
            orden_id: ordenId,
            titulo: data.titulo || data.nombre || data.descripcion || '',
            descripcion: data.descripcion || '',
            responsable_id: data.responsable_id || null
        };
        return await this.request('POST', `/ordenes-actividades/`, payload);
    },

    async updateOrdenActividad(ordenId, actividadId, data) {
        const payload = {
            titulo: data.titulo || data.nombre || undefined,
            descripcion: data.descripcion !== undefined ? data.descripcion : undefined,
            estado: data.estado || (data.completada ? 'completada' : 'pendiente'),
            responsable_id: data.responsable_id || undefined
        };
        return await this.request('PUT', `/ordenes-actividades/${actividadId}`, payload);
    },

    async deleteOrdenActividad(ordenId, actividadId) {
        return await this.request('DELETE', `/ordenes-actividades/${actividadId}`);
    },

    // ============ ORDENES - COSTOS ============

    async getOrdenCostos(ordenId, filters = {}) {
        const params = new URLSearchParams({ orden_id: ordenId, ...filters }).toString();
        return await this.request('GET', `/ordenes-costos/?${params}`);
    },

    async createOrdenCosto(ordenId, data) {
        const payload = {
            orden_id: ordenId,
            tipo_gasto: data.tipo_gasto || data.tipo || 'otro',
            proveedor: data.proveedor || null,
            numero_factura: data.numero_factura || null,
            descripcion: data.descripcion || data.concepto || '',
            cantidad: data.cantidad || 1,
            valor_unitario: data.valor_unitario !== undefined ? data.valor_unitario : (data.valor || 0),
            valor_total: data.valor_total !== undefined ? data.valor_total : (data.valor || 0)
        };
        return await this.request('POST', `/ordenes-costos/`, payload);
    },

    async updateOrdenCosto(ordenId, costoId, data) {
        const payload = {
            tipo_gasto: data.tipo_gasto || data.tipo || undefined,
            proveedor: data.proveedor !== undefined ? data.proveedor : undefined,
            numero_factura: data.numero_factura !== undefined ? data.numero_factura : undefined,
            descripcion: data.descripcion || data.concepto || undefined,
            cantidad: data.cantidad !== undefined ? data.cantidad : undefined,
            valor_unitario: data.valor_unitario !== undefined ? data.valor_unitario : (data.valor !== undefined ? data.valor : undefined),
            valor_total: data.valor_total !== undefined ? data.valor_total : (data.valor !== undefined ? data.valor : undefined)
        };
        return await this.request('PUT', `/ordenes-costos/${costoId}`, payload);
    },

    async deleteOrdenCosto(ordenId, costoId) {
        return await this.request('DELETE', `/ordenes-costos/${costoId}`);
    },

    // ============ ORDENES - EVIDENCIAS ============

    async getOrdenEvidencias(ordenId, filters = {}) {
        const params = new URLSearchParams({ orden_id: ordenId, ...filters }).toString();
        return await this.request('GET', `/ordenes-evidencias/?${params}`);
    },

    async createOrdenEvidencia(ordenId, data) {
        const payload = {
            orden_id: ordenId,
            actividad_id: data.actividad_id || null,
            tipo: data.tipo || 'foto',
            ruta_archivo: data.ruta_archivo || data.archivo_url || '',
            nombre_original: data.nombre_original || '',
            descripcion: data.descripcion || ''
        };
        return await this.request('POST', `/ordenes-evidencias/`, payload);
    },

    async deleteOrdenEvidencia(ordenId, evidenciaId) {
        return await this.request('DELETE', `/ordenes-evidencias/${evidenciaId}`);
    },

    // ============ ORDENES - HISTORIAL ============

    async getOrdenHistorial(ordenId, filters = {}) {
        const params = new URLSearchParams({ orden_id: ordenId, ...filters }).toString();
        return await this.request('GET', `/ordenes-historial/?${params}`);
    },
};

export { API };
window.API = API;
