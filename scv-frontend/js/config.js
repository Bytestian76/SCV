// Configuración de la aplicación
const API_HOST = window.location.hostname || 'localhost';
const API_PROTOCOL = window.location.protocol === 'https:' ? 'https:' : 'http:';
const IS_LOCAL_HOST = API_HOST === 'localhost' || API_HOST === '127.0.0.1';
const API_ORIGIN_OVERRIDE = window.__SCV_API_ORIGIN;

const DEFAULT_API_ORIGIN = IS_LOCAL_HOST
    ? `${API_PROTOCOL}//${API_HOST}:8000`
    : `${API_PROTOCOL}//${API_HOST}`;

const CONFIG = {
    API_URL: API_ORIGIN_OVERRIDE || DEFAULT_API_ORIGIN,
    API_VERSION: '/api/v1',
    
    // Tiempos
    TOKEN_KEY: 'scv_token',
    USER_KEY: 'scv_user',
    REMEMBER_KEY: 'scv_remember',
    
    // Roles
    ROLES: {
        ADMIN: 'admin',
        OPERARIO_MOVIMIENTOS: 'operario_movimientos',
        OPERARIO_CHEQUEO: 'operario_chequeo'
    },
    
    // Rutas por rol
    DASHBOARDS: {
        'admin': 'dashboard-admin',
        'operario_movimientos': 'dashboard-movimientos',
        'operario_chequeo': 'dashboard-chequeo'
    }
};

// URL completa de la API
const API_BASE = CONFIG.API_URL + CONFIG.API_VERSION;
