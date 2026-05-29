/**
 * Notificaciones - Panel y badge para mecanicos
 */

let notificacionesInterval = null;

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

// Auto-refresh notifications for mecanico role every 30 seconds
function iniciarAutoRefreshNotificaciones() {
    if (notificacionesInterval) clearInterval(notificacionesInterval);
    cargarNotificaciones();
    notificacionesInterval = setInterval(cargarNotificaciones, 30000);
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
