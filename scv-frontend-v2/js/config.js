// Configuration & Constants for SCV
export const CONFIG = {
    // Relative path so requests use the current host and port (proxied by Nginx)
    API_BASE: '',
    ROLES: {
        ADMIN: 'ADMIN',
        OPERARIO_DESPACHO: 'OPERARIO_DESPACHO',
        OPERARIO_CHEQUEO: 'OPERARIO_CHEQUEO',
        MECANICO: 'MECANICO',
        JEFE_MECANICOS: 'JEFE_MECANICOS'
    },
    STORAGE_KEYS: {
        TOKEN: 'scv_token',
        USER: 'scv_user'
    }
};
