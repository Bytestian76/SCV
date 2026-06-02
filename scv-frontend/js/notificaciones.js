/**
 * Notificaciones - Panel, badge y Web Push para mecanicos
 */

let notificacionesInterval = null;
let pushRefreshInterval = null;

// ============ NOTIFICACIONES EN APP ============

async function cargarNotificaciones() {
    try {
        const data = await API.getNotificaciones();
        actualizarBadgeNotificaciones(data.total_no_leidas);
        return data;
    } catch (err) {
        console.warn('Error al cargar notificaciones:', err);
        return { notificaciones: [], total_no_leidas: 0 };
    }
}

function actualizarBadgeNotificaciones(total) {
    const badge = document.getElementById('notificaciones-badge');
    if (!badge) return;
    if (total > 0) {
        badge.textContent = total > 99 ? '99+' : total;
        badge.style.display = 'inline';
    } else {
        badge.style.display = 'none';
    }
}

async function toggleNotificacionesPanel() {
    const panel = document.getElementById('notificaciones-panel');
    if (!panel) return;
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
        return;
    }
    panel.style.display = 'block';
    const data = await cargarNotificaciones();
    renderNotificacionesList(data.notificaciones);
    renderPushToggle();
}

function renderNotificacionesList(notificaciones) {
    const lista = document.getElementById('notificaciones-lista');
    if (!lista) return;
    if (!notificaciones || notificaciones.length === 0) {
        lista.innerHTML = '<p class="helper-text">No hay notificaciones.</p>';
        return;
    }
    const tipoIcono = {
        nuevo_mantenimiento: 'clipboard-check.svg',
        cambio_estado: 'arrow-clockwise.svg',
        recordatorio: 'bar-chart-line.svg'
    };
    lista.innerHTML = notificaciones.map(n => `
        <div class="notificacion-item ${n.leida ? 'leida' : 'no-leida'}" data-id="${n.id}">
            <div class="notificacion-icon">
                <img src="assets/icons/${tipoIcono[n.tipo] || 'clipboard-check.svg'}" alt="" class="btn-inline-icon" aria-hidden="true">
            </div>
            <div class="notificacion-content">
                <p class="notificacion-titulo">${n.titulo}</p>
                ${n.mensaje ? `<p class="notificacion-mensaje">${n.mensaje}</p>` : ''}
                <p class="notificacion-fecha">${new Date(n.fecha_creacion).toLocaleString()}</p>
            </div>
            ${!n.leida ? `<button class="btn-item btn-item-ghost" onclick="marcarNotificacionLeida(${n.id})" title="Marcar como leída"><img src="assets/icons/clipboard-check.svg" alt="" class="btn-inline-icon" aria-hidden="true"></button>` : ''}
        </div>
    `).join('');
}

async function marcarNotificacionLeida(id) {
    try {
        await API.marcarNotificacionLeida(id);
        await cargarNotificaciones();
        const data = await API.getNotificaciones();
        renderNotificacionesList(data.notificaciones);
    } catch (err) {
        console.warn('Error al marcar notificación:', err);
    }
}

async function marcarTodasNotificacionesLeidas() {
    try {
        await API.marcarTodasNotificacionesLeidas();
        actualizarBadgeNotificaciones(0);
        const data = await API.getNotificaciones();
        renderNotificacionesList(data.notificaciones);
    } catch (err) {
        console.warn('Error al marcar todas:', err);
    }
}

// ============ WEB PUSH ============

function pushSoportado() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

function obtenerRegistroSW() {
    if (window.APP && window.APP.swRegistration) {
        return Promise.resolve(window.APP.swRegistration);
    }
    const timeout = new Promise(resolve => setTimeout(() => resolve(null), 3000));
    return Promise.race([navigator.serviceWorker.ready, timeout]);
}

async function gestionarSuscripcionPush() {
    if (!pushSoportado()) return;

    const permiso = Notification.permission;
    if (permiso === 'denied') return;

    if (permiso === 'default') {
        const resultado = await Notification.requestPermission();
        if (resultado !== 'granted') return;
    }

    try {
        const reg = await obtenerRegistroSW();
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
            await enviarSuscripcionBackend(existing);
            return;
        }

        const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
        });
        await enviarSuscripcionBackend(sub);
    } catch (err) {
        console.warn('Error al suscribir push:', err);
    }
}

async function cancelarSuscripcionPush() {
    if (!pushSoportado()) return;
    try {
        const reg = await obtenerRegistroSW();
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
            const endpoint = sub.endpoint;
            await API.pushUnsubscribe(endpoint);
            await sub.unsubscribe();
        }
    } catch (err) {
        console.warn('Error al cancelar push:', err);
    }
}

async function enviarSuscripcionBackend(sub) {
    try {
        const json = sub.toJSON();
        await API.pushSubscribe({
            endpoint: json.endpoint,
            auth: json.keys.auth,
            p256dh: json.keys.p256dh,
        });
    } catch (err) {
        console.warn('Error al registrar suscripción push en backend:', err);
    }
}

async function verificarEstadoPush() {
    if (!pushSoportado()) return 'no-soportado';
    const permiso = Notification.permission;
    if (permiso !== 'granted') return permiso;
    try {
        const reg = await obtenerRegistroSW();
        if (!reg) return 'no-suscrito';
        const sub = await reg.pushManager.getSubscription();
        return sub ? 'suscrito' : 'no-suscrito';
    } catch {
        return 'error';
    }
}

function renderPushToggle() {
    const container = document.getElementById('push-toggle-container');
    if (!container) return;

    const soportado = pushSoportado();

    if (!soportado) {
        const seguro = window.isSecureContext;
        container.innerHTML = `
            <div class="push-toggle-row is-disabled" title="${seguro ? 'Navegador no compatible' : 'Se requiere HTTPS para notificaciones push'}">
                <span class="push-toggle-label">
                    <img src="assets/icons/bell.svg" alt="" class="btn-inline-icon" aria-hidden="true">
                    Notificaciones push
                </span>
                <span class="push-toggle-nota">${seguro ? 'No disponible' : 'Requiere HTTPS'}</span>
            </div>
        `;
        return;
    }

    verificarEstadoPush().then(estado => {
        const activo = estado === 'suscrito';
        container.innerHTML = `
            <div class="push-toggle-row">
                <span class="push-toggle-label">
                    <img src="assets/icons/bell.svg" alt="" class="btn-inline-icon" aria-hidden="true">
                    Notificaciones push
                </span>
                <label class="switch">
                    <input type="checkbox" id="push-toggle-checkbox" ${activo ? 'checked' : ''} onchange="alternarPush(this.checked)">
                    <span class="switch-slider"></span>
                </label>
            </div>
        `;
    });
}

async function alternarPush(activar) {
    if (activar) {
        await gestionarSuscripcionPush();
    } else {
        await cancelarSuscripcionPush();
    }
    renderPushToggle();
}

// ============ INICIALIZACIÓN ============

async function iniciarNotificaciones(user) {
    detenerNotificaciones();
    await iniciarAutoRefreshNotificaciones();
    if (user.rol === CONFIG.ROLES.MECANICO || user.rol === CONFIG.ROLES.ADMIN) {
        gestionarSuscripcionPush();
    }
}

function detenerNotificaciones() {
    detenerAutoRefreshNotificaciones();
    cancelarSuscripcionPush();
}

// Auto-refresh notifications
function iniciarAutoRefreshNotificaciones() {
    if (notificacionesInterval) clearInterval(notificacionesInterval);
    cargarNotificaciones();
    notificacionesInterval = setInterval(cargarNotificaciones, 30000);
    return Promise.resolve();
}

function detenerAutoRefreshNotificaciones() {
    if (notificacionesInterval) {
        clearInterval(notificacionesInterval);
        notificacionesInterval = null;
    }
}

// Close panel when clicking outside
document.addEventListener('click', (e) => {
    const panel = document.getElementById('notificaciones-panel');
    const btn = document.querySelector('.btn-notificaciones');
    if (panel && panel.style.display === 'block' && !panel.contains(e.target) && !btn?.contains(e.target)) {
        panel.style.display = 'none';
    }
});

// ============ UTILIDADES ============

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
