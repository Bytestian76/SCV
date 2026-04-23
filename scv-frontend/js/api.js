/**
 * API Service - Comunicación con el backend
 */

const API = {
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
            headers: this.getHeaders()
        };
        
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(API_BASE + endpoint, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw {
                    status: response.status,
                    message: result.detail || 'Error en la petición'
                };
            }
            
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

    // ============ DASHBOARD ============

    async getDashboard(dias = 7) {
        return await this.request('GET', `/dashboard/?dias=${dias}`);
    }
};
