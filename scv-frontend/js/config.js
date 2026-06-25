const API_HOST = window.location.hostname || 'localhost';
const API_PROTOCOL = window.location.protocol === 'https:' ? 'https:' : 'http:';

let api_port_str = '';
if (window.location.port) {
    if (window.location.port === '8082') {
        api_port_str = ':9000'; // Desarrollo local sin Docker (scripts)
    } else {
        api_port_str = ':' + window.location.port; // Vía Gateway (Docker local/prod)
    }
}

const CONFIG = {
    API_URL: `${API_PROTOCOL}//${API_HOST}${api_port_str}`,
    API_VERSION: '/api/v1',
    
    // Tiempos
    TOKEN_KEY: 'scv_token',
    USER_KEY: 'scv_user',
    REMEMBER_KEY: 'scv_remember',
    DASHBOARD_SYNC_KEY: 'scv_dashboard_sync_tick',
    ADMIN_REFRESH_INTERVAL_MS: 30000,
    
    // Roles
    ROLES: {
        ADMIN: 'admin',
        OPERARIO_MOVIMIENTOS: 'operario_movimientos',
        OPERARIO_CHEQUEO: 'operario_chequeo',
        MECANICO: 'mecanico',
        JEFE_MECANICOS: 'jefe_mecanicos'
    },
    
    // Rutas por rol
    DASHBOARDS: {
        'admin': 'dashboard-admin',
        'operario_movimientos': 'dashboard-movimientos',
        'operario_chequeo': 'dashboard-chequeo',
        'mecanico': 'dashboard-mecanico',
        'jefe_mecanicos': 'dashboard-jefe-mecanicos'
    },

    // Web Push (VAPID public key — es pública, segura para el frontend)
    VAPID_PUBLIC_KEY: 'BJpbFxN3FZBDCIgvdKUHS3nPCeMBwklO1yYeQW9vBBNrRQee8u9IMN7IBZULhwJdFhIOFNaVNF-3ySri8KEEdOA'
};

// URL completa de la API
const API_BASE = CONFIG.API_URL + CONFIG.API_VERSION;
