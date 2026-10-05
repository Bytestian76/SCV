const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('scv_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('scv_token', token);
    } else {
      localStorage.removeItem('scv_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`[API] Error en petición a ${url}:`, error.message);
      throw error;
    }
  }

  // Auth
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Dashboard
  async getDashboardSummary() {
    return this.request('/dashboard/summary');
  }

  // Vehiculos
  async getVehiculos() {
    return this.request('/vehiculos/');
  }

  async createVehiculo(data) {
    return this.request('/vehiculos/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Usuarios
  async getUsuarios() {
    return this.request('/usuarios/');
  }

  // Movimientos
  async getMovimientos() {
    return this.request('/movimientos/');
  }

  async createMovimiento(data) {
    return this.request('/movimientos/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Chequeos
  async getChequeos() {
    return this.request('/chequeos/');
  }

  async createChequeo(data) {
    return this.request('/chequeos/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Mantenimiento
  async getHallazgos() {
    return this.request('/mantenimiento/hallazgos');
  }

  async createHallazgo(data) {
    return this.request('/mantenimiento/hallazgos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrdenes() {
    return this.request('/mantenimiento/ordenes');
  }

  async createOrden(data) {
    return this.request('/mantenimiento/ordenes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Alertas
  async getAlertas() {
    return this.request('/alertas/');
  }

  // Reportes (descarga autenticada — devuelve blob URL)
  getReporteUrl(endpoint, params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString();
    return `/api/v1${endpoint}${qs ? `?${qs}` : ''}`;
  }
}

export const api = new ApiService();
