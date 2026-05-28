// Configuración de la aplicación
const API_HOST = window.location.hostname || 'localhost';
const API_PROTOCOL = window.location.protocol === 'https:' ? 'https:' : 'http:';

const CONFIG = {
    API_URL: `${API_PROTOCOL}//${API_HOST}`,
    API_VERSION: '/api/v1',
    
    // Tiempos
    TOKEN_KEY: 'scv_token',
    USER_KEY: 'scv_user',
    REMEMBER_KEY: 'scv_remember',
    DASHBOARD_SYNC_KEY: 'scv_dashboard_sync_tick',
    ADMIN_REFRESH_INTERVAL_MS: 5000,
    
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
