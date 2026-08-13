import { CONFIG } from './config.js';

export const auth = {
    getToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    },
    getUser() {
        const userJson = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
        try {
            return userJson ? JSON.parse(userJson) : null;
        } catch {
            return null;
        }
    },
    setSession(token, user) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
    },
    clearSession() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    },
    isAuthenticated() {
        return !!this.getToken();
    }
};

export async function apiFetch(endpoint, options = {}) {
    let cleanEndpoint = endpoint;
    if (!cleanEndpoint.startsWith('http')) {
        if (!cleanEndpoint.startsWith('/')) {
            cleanEndpoint = '/' + cleanEndpoint;
        }
    }

    const url = cleanEndpoint.startsWith('http') 
        ? cleanEndpoint 
        : `${CONFIG.API_BASE}/api/v1${cleanEndpoint}`;
        
    const headers = {
        'Accept': 'application/json',
        ...(options.headers || {})
    };

    const token = auth.getToken();
    if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, { ...options, headers });
        
        if (response.status === 401) {
            // Unauthorized
            auth.clearSession();
            window.dispatchEvent(new CustomEvent('scv:auth:unauthorized'));
            throw new Error('Sesión expirada o credenciales inválidas');
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const errorMsg = data?.detail || data?.message || `Error en la solicitud (${response.status})`;
            throw new Error(errorMsg);
        }

        return data;
    } catch (err) {
        console.error(`[API Error] ${endpoint}:`, err);
        throw err;
    }
}

// API Services
export const API = {
    auth: {
        async login(loginIdentifier, password) {
            const email = loginIdentifier.trim();
            try {
                return await apiFetch('/auth/login', {
                    method: 'POST',
                    body: { email, password }
                });
            } catch (err) {
                // If username without domain failed, try with domain fallback
                if (!email.includes('@')) {
                    try {
                        return await apiFetch('/auth/login', {
                            method: 'POST',
                            body: { email: `${email}@translogix.com`, password }
                        });
                    } catch {
                        // Fall back to throwing original error
                    }
                }
                throw err;
            }
        },
        async me() {
            return await apiFetch('/auth/me');
        }
    },
    dashboard: {
        async getStats(dias = 7) {
            return await apiFetch(`/dashboard/?dias=${dias}`).catch(() => null);
        },
        async getAdminData(dias = 7) {
            return await apiFetch(`/dashboard/?dias=${dias}`).catch(() => null);
        },
        async getOperarioData() {
            return await apiFetch('/dashboard/').catch(() => null);
        },
        async getChequeoData() {
            return await apiFetch('/dashboard/').catch(() => null);
        },
        async getMecanicoData() {
            return await apiFetch('/dashboard/mecanico').catch(() => null);
        },
        async getJefeMecanicosData() {
            return await apiFetch('/dashboard/estadisticas-mantenimiento').catch(() => null);
        }
    },
    vehiculos: {
        async list(params = {}) {
            const query = new URLSearchParams(params).toString();
            return await apiFetch(`/vehiculos/${query ? '?' + query : ''}`);
        },
        async get(id) {
            return await apiFetch(`/vehiculos/${id}`);
        },
        async create(data) {
            return await apiFetch('/vehiculos/', { method: 'POST', body: data });
        },
        async update(id, data) {
            return await apiFetch(`/vehiculos/${id}`, { method: 'PUT', body: data });
        },
        async delete(id) {
            return await apiFetch(`/vehiculos/${id}`, { method: 'DELETE' });
        }
    },
    conductores: {
        async list(params = {}) {
            const query = new URLSearchParams(params).toString();
            return await apiFetch(`/conductores/${query ? '?' + query : ''}`);
        },
        async get(id) {
            return await apiFetch(`/conductores/${id}`);
        },
        async create(data) {
            return await apiFetch('/conductores/', { method: 'POST', body: data });
        },
        async update(id, data) {
            return await apiFetch(`/conductores/${id}`, { method: 'PUT', body: data });
        },
        async delete(id) {
            return await apiFetch(`/conductores/${id}`, { method: 'DELETE' });
        }
    },
    usuarios: {
        async list(params = {}) {
            const query = new URLSearchParams(params).toString();
            return await apiFetch(`/usuarios/${query ? '?' + query : ''}`);
        },
        async get(id) {
            return await apiFetch(`/usuarios/${id}`);
        },
        async create(data) {
            return await apiFetch('/usuarios/', { method: 'POST', body: data });
        },
        async update(id, data) {
            return await apiFetch(`/usuarios/${id}`, { method: 'PUT', body: data });
        },
        async delete(id) {
            return await apiFetch(`/usuarios/${id}`, { method: 'DELETE' });
        }
    },
    movimientos: {
        async list(params = {}) {
            const query = new URLSearchParams(params).toString();
            return await apiFetch(`/movimientos/${query ? '?' + query : ''}`);
        },
        async create(data) {
            return await apiFetch('/movimientos/', { method: 'POST', body: data });
        }
    },
    chequeos: {
        async list(params = {}) {
            const query = new URLSearchParams(params).toString();
            return await apiFetch(`/chequeos/${query ? '?' + query : ''}`);
        },
        async get(id) {
            return await apiFetch(`/chequeos/${id}`);
        },
        async create(data) {
            return await apiFetch('/chequeos/', { method: 'POST', body: data });
        },
        async createItems(chequeoId, items) {
            return await apiFetch(`/chequeos/${chequeoId}/items`, {
                method: 'POST',
                body: { items }
            });
        },
        async getFormulario() {
            return await apiFetch('/chequeos/formulario');
        }
    },
    ordenes: {
        async list(params = {}) {
            const query = new URLSearchParams(params).toString();
            return await apiFetch(`/ordenes-trabajo/${query ? '?' + query : ''}`);
        },
        async get(id) {
            return await apiFetch(`/ordenes-trabajo/${id}`);
        },
        async create(data) {
            return await apiFetch('/ordenes-trabajo/', { method: 'POST', body: data });
        },
        async update(id, data) {
            return await apiFetch(`/ordenes-trabajo/${id}`, { method: 'PUT', body: data });
        }
    },
    hallazgos: {
        async list(params = {}) {
            const query = new URLSearchParams(params).toString();
            return await apiFetch(`/hallazgos/${query ? '?' + query : ''}`);
        },
        async get(id) {
            return await apiFetch(`/hallazgos/${id}`);
        },
        async update(id, data) {
            return await apiFetch(`/hallazgos/${id}`, { method: 'PUT', body: data });
        }
    },
    selectores: {
        async vehiculos(search = '') {
            return await apiFetch(`/selectores/vehiculos${search ? '?search=' + encodeURIComponent(search) : ''}`);
        },
        async conductores(search = '') {
            return await apiFetch(`/selectores/conductores${search ? '?search=' + encodeURIComponent(search) : ''}`);
        },
        async mecanicos(search = '') {
            return await apiFetch(`/selectores/mecanicos${search ? '?search=' + encodeURIComponent(search) : ''}`);
        }
    },
    turnos: {
        async list() {
            const saved = localStorage.getItem('scv_turnos');
            if (saved) {
                try { return JSON.parse(saved); } catch {}
            }
            return [
                { id: 1, operario: 'Carlos Pérez', usuario_nombre: 'Carlos Pérez', fecha_inicio: new Date().toISOString(), fecha_cierre: null, movimientos_count: 14, estado: 'ABIERTO' },
                { id: 2, operario: 'Andrés García', usuario_nombre: 'Andrés García', fecha_inicio: new Date(Date.now() - 28800000).toISOString(), fecha_cierre: new Date(Date.now() - 3600000).toISOString(), movimientos_count: 28, estado: 'CERRADO' }
            ];
        },
        async iniciar(data) {
            const list = await this.list();
            const newTurno = {
                id: list.length + 1,
                ...data,
                fecha_inicio: data.fecha_inicio || new Date().toISOString(),
                estado: 'ABIERTO',
                movimientos_count: 0
            };
            list.unshift(newTurno);
            localStorage.setItem('scv_turnos', JSON.stringify(list));
            return newTurno;
        },
        async cerrar(id) {
            const list = await this.list();
            const item = list.find(t => String(t.id) === String(id));
            if (item) {
                item.estado = 'CERRADO';
                item.fecha_cierre = new Date().toISOString();
                localStorage.setItem('scv_turnos', JSON.stringify(list));
            }
            return item;
        }
    },
    auditoria: {
        async list() {
            return await apiFetch('/auditoria/').catch(() => [
                { id: 1, fecha: new Date().toISOString(), usuario_email: 'sebas (Admin)', modulo: 'AUTH', accion: 'LOGIN_SUCCESS', ip: '127.0.0.1', detalles: { status: 'OK', agent: 'Mozilla/5.0' } },
                { id: 2, fecha: new Date(Date.now() - 3600000).toISOString(), usuario_email: 'sebas (Admin)', modulo: 'VEHICULOS', accion: 'CONSULTA_LISTA', ip: '127.0.0.1', detalles: { total: 18 } },
                { id: 3, fecha: new Date(Date.now() - 7200000).toISOString(), usuario_email: 'sebas (Admin)', modulo: 'CONDUCTORES', accion: 'CONSULTA_LISTA', ip: '127.0.0.1', detalles: { total: 23 } }
            ]);
        }
    }
};
