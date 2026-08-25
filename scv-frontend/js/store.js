/**
 * Estado Global de la App - SCV (Store Centralizado con Encapsulación)
 */

const initialAppState = () => ({
    currentScreen: 'login-screen',
    user: null,
    token: null,
    formType: null, // 'salida', 'entrada', 'chequeo'
    admin: {
        vehiculos: [],
        editingVehiculoId: null,
        filters: {
            query: '',
            estado: 'todos',
            orden: 'placa_asc',
            anioMin: '',
            anioMax: ''
        },
        conductores: [],
        editingConductorId: null,
        conductoresFilters: {
            query: '',
            estado: 'todos',
            categoria: 'todas',
            orden: 'nombre_asc',
            licencia: ''
        },
        usuarios: [],
        editingUsuarioId: null,
        usuariosFilters: {
            query: '',
            estado: 'todos',
            rol: 'todos',
            orden: 'nombre_asc',
            emailDomain: ''
        },
        chequeos: [],
        chequeosFilters: {
            query: '',
            fechaInicio: '',
            fechaFin: '',
            orden: 'fecha_desc'
        },
        chequeosPagination: { page: 1, limit: 10 },
        movimientos: [],
        movimientosFilters: {
            query: '',
            tipo: 'todos',
            fechaInicio: '',
            fechaFin: '',
            orden: 'fecha_desc'
        },
        movimientosPagination: { page: 1, limit: 10 },
        hallazgos: [],
        hallazgosFilters: {
            query: '',
            estado: 'todas',
            prioridad: 'todas',
            categoria: 'todas'
        },
        ordenes: [],
        ordenesFilters: {
            query: '',
            estado: 'todas',
            prioridad: 'todas'
        },
        ordenesPagination: { page: 1, limit: 10 },
        ordenDetalleId: null
    },
    chequeo: {
        formulario: null,
        totalItems: 0,
        returnScreen: 'dashboard-chequeo'
    },
    movimiento: {
        returnScreen: 'dashboard-movimientos'
    },
    ui: {
        dialogResolver: null,
        adminChartsInterval: null,
        adminDashboardRequestSeq: 0
    },
    selectorSearchTimers: {},
    selectorOptions: {},
    selectorSelections: {}
});

const APP = initialAppState();

// Encapsulación y Helpers de Gestión de Estado
const Store = {
    getState() {
        return APP;
    },
    getUser() {
        return APP.user;
    },
    setUser(user) {
        APP.user = user;
        this.notify('user', user);
    },
    getToken() {
        return APP.token;
    },
    setToken(token) {
        APP.token = token;
        this.notify('token', token);
    },
    setAuth(user, token) {
        APP.user = user;
        APP.token = token;
        this.notify('auth', { user, token });
    },
    clearAuth() {
        APP.user = null;
        APP.token = null;
        this.notify('auth', { user: null, token: null });
    },
    isAuthenticated() {
        return Boolean(APP.token && APP.user);
    },
    hasRole(role) {
        return Boolean(APP.user && APP.user.rol === role);
    },
    getFormType() {
        return APP.formType;
    },
    setFormType(type) {
        APP.formType = type;
        this.notify('formType', type);
    },
    getCurrentScreen() {
        return APP.currentScreen;
    },
    setCurrentScreen(screenId) {
        APP.currentScreen = screenId;
        this.notify('screen', screenId);
    },
    getAdmin(key) {
        return key ? APP.admin[key] : APP.admin;
    },
    setAdmin(key, value) {
        APP.admin[key] = value;
        this.notify(`admin.${key}`, value);
    },
    // ---- Vehículos Domain ----
    getVehiculos() {
        return APP.admin.vehiculos || [];
    },
    setVehiculos(list) {
        APP.admin.vehiculos = Array.isArray(list) ? list : [];
        this.notify('admin.vehiculos', APP.admin.vehiculos);
    },
    getVehiculoById(id) {
        return (APP.admin.vehiculos || []).find(v => v.id === id) || null;
    },
    getVehiculoEditingId() {
        return APP.admin.editingVehiculoId;
    },
    setVehiculoEditingId(id) {
        APP.admin.editingVehiculoId = id;
        this.notify('admin.editingVehiculoId', id);
    },
    getVehiculosFilters() {
        return APP.admin.filters;
    },
    setVehiculosFilters(filters) {
        APP.admin.filters = { ...APP.admin.filters, ...filters };
        this.notify('admin.filters', APP.admin.filters);
    },
    // ---- Conductores Domain ----
    getConductores() {
        return APP.admin.conductores || [];
    },
    setConductores(list) {
        APP.admin.conductores = Array.isArray(list) ? list : [];
        this.notify('admin.conductores', APP.admin.conductores);
    },
    getConductorById(id) {
        return (APP.admin.conductores || []).find(c => c.id === id) || null;
    },
    getConductorEditingId() {
        return APP.admin.editingConductorId;
    },
    setConductorEditingId(id) {
        APP.admin.editingConductorId = id;
        this.notify('admin.editingConductorId', id);
    },
    getConductoresFilters() {
        return APP.admin.conductoresFilters;
    },
    setConductoresFilters(filters) {
        APP.admin.conductoresFilters = { ...APP.admin.conductoresFilters, ...filters };
        this.notify('admin.conductoresFilters', APP.admin.conductoresFilters);
    },
    // ---- Usuarios Domain ----
    getUsuarios() {
        return APP.admin.usuarios || [];
    },
    setUsuarios(list) {
        APP.admin.usuarios = Array.isArray(list) ? list : [];
        this.notify('admin.usuarios', APP.admin.usuarios);
    },
    getUsuarioById(id) {
        return (APP.admin.usuarios || []).find(u => u.id === id) || null;
    },
    getUsuarioEditingId() {
        return APP.admin.editingUsuarioId;
    },
    setUsuarioEditingId(id) {
        APP.admin.editingUsuarioId = id;
        this.notify('admin.editingUsuarioId', id);
    },
    getUsuariosFilters() {
        return APP.admin.usuariosFilters;
    },
    setUsuariosFilters(filters) {
        APP.admin.usuariosFilters = { ...APP.admin.usuariosFilters, ...filters };
        this.notify('admin.usuariosFilters', APP.admin.usuariosFilters);
    },
    // ---- Chequeos Domain ----
    getChequeos() {
        return APP.admin.chequeos || [];
    },
    setChequeos(list) {
        APP.admin.chequeos = Array.isArray(list) ? list : [];
        this.notify('admin.chequeos', APP.admin.chequeos);
    },
    getChequeosFilters() {
        return APP.admin.chequeosFilters;
    },
    setChequeosFilters(filters) {
        APP.admin.chequeosFilters = { ...APP.admin.chequeosFilters, ...filters };
        this.notify('admin.chequeosFilters', APP.admin.chequeosFilters);
    },
    getChequeosPagination() {
        return APP.admin.chequeosPagination || { page: 1, limit: 10 };
    },
    setChequeosPagination(pagination) {
        APP.admin.chequeosPagination = { ...APP.admin.chequeosPagination, ...pagination };
        this.notify('admin.chequeosPagination', APP.admin.chequeosPagination);
    },
    getChequeosTotal() {
        return APP.admin.chequeosTotal || 0;
    },
    setChequeosTotal(total) {
        APP.admin.chequeosTotal = total;
        this.notify('admin.chequeosTotal', total);
    },
    // ---- Movimientos Domain ----
    getMovimientos() {
        return APP.admin.movimientos || [];
    },
    setMovimientos(list) {
        APP.admin.movimientos = Array.isArray(list) ? list : [];
        this.notify('admin.movimientos', APP.admin.movimientos);
    },
    getMovimientosFilters() {
        return APP.admin.movimientosFilters;
    },
    setMovimientosFilters(filters) {
        APP.admin.movimientosFilters = { ...APP.admin.movimientosFilters, ...filters };
        this.notify('admin.movimientosFilters', APP.admin.movimientosFilters);
    },
    getMovimientosPagination() {
        return APP.admin.movimientosPagination || { page: 1, limit: 10 };
    },
    setMovimientosPagination(pagination) {
        APP.admin.movimientosPagination = { ...APP.admin.movimientosPagination, ...pagination };
        this.notify('admin.movimientosPagination', APP.admin.movimientosPagination);
    },
    getMovimientosTotal() {
        return APP.admin.movimientosTotal || 0;
    },
    setMovimientosTotal(total) {
        APP.admin.movimientosTotal = total;
        this.notify('admin.movimientosTotal', total);
    },
    // ---- Hallazgos Domain ----
    getHallazgos() {
        return APP.admin.hallazgos || [];
    },
    setHallazgos(list) {
        APP.admin.hallazgos = Array.isArray(list) ? list : [];
        this.notify('admin.hallazgos', APP.admin.hallazgos);
    },
    getHallazgosFilters() {
        return APP.admin.hallazgosFilters;
    },
    setHallazgosFilters(filters) {
        APP.admin.hallazgosFilters = { ...APP.admin.hallazgosFilters, ...filters };
        this.notify('admin.hallazgosFilters', APP.admin.hallazgosFilters);
    },
    // ---- Órdenes de Trabajo Domain ----
    getOrdenes() {
        return APP.admin.ordenes || [];
    },
    setOrdenes(list) {
        APP.admin.ordenes = Array.isArray(list) ? list : [];
        this.notify('admin.ordenes', APP.admin.ordenes);
    },
    getOrdenesFilters() {
        return APP.admin.ordenesFilters;
    },
    setOrdenesFilters(filters) {
        APP.admin.ordenesFilters = { ...APP.admin.ordenesFilters, ...filters };
        this.notify('admin.ordenesFilters', APP.admin.ordenesFilters);
    },
    getOrdenesPagination() {
        return APP.admin.ordenesPagination || { page: 1, limit: 10 };
    },
    setOrdenesPagination(pagination) {
        APP.admin.ordenesPagination = { ...APP.admin.ordenesPagination, ...pagination };
        this.notify('admin.ordenesPagination', APP.admin.ordenesPagination);
    },
    getOrdenDetalleId() {
        return APP.admin.ordenDetalleId;
    },
    setOrdenDetalleId(id) {
        APP.admin.ordenDetalleId = id;
        this.notify('admin.ordenDetalleId', id);
    },
    getActiveOrden() {
        return APP.admin.activeOrden || null;
    },
    setActiveOrden(orden) {
        APP.admin.activeOrden = orden;
        this.notify('admin.activeOrden', orden);
    },
    reset() {
        const fresh = initialAppState();
        Object.keys(APP).forEach(k => delete APP[k]);
        Object.assign(APP, fresh);
        this.notify('reset', fresh);
    },
    listeners: new Set(),
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    },
    notify(mutation, payload) {
        this.listeners.forEach(cb => {
            try { cb(mutation, payload, APP); } catch (e) { console.error('Error en suscriptor Store:', e); }
        });
        window.dispatchEvent(new CustomEvent('scv:store-mutation', { detail: { mutation, payload } }));
    }
};

window.APP = APP;
window.Store = Store;

export { APP, Store };
