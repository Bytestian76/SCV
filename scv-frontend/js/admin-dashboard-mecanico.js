const estadoLabels = {
  pendiente: 'Pendiente',
  asignada: 'Asignada',
  en_progreso: 'En progreso',
  completada: 'Completada',
  cancelada: 'Cancelada',
  pausada: 'Pausada'
};

function renderOrdenCard(item) {
  const estadoLabel = estadoLabels[item.estado] || item.estado;
  return `
<div class="management-item" data-id="${item.id}" style="cursor:pointer" onclick="navigate('admin-ordenes')">
  <div class="item-header">
    <span class="item-badge estado-${item.estado}">${estadoLabel}</span>
    <span class="item-badge prioridad-${item.prioridad}">${item.prioridad}</span>
    <span class="item-date">${formatApiDateTime(item.fecha_creacion)}</span>
  </div>
  <div class="item-body">
    <strong>#${item.id} - ${escapeHtml(item.vehiculo?.placa || 'Sin vehículo')}</strong>
    <p>${escapeHtml(item.descripcion || '')}</p>
  </div>
  <div class="item-footer">
    <span>${escapeHtml(item.responsable?.nombre || item.mecanico?.nombre || 'Sin asignar')}</span>
  </div>
</div>`;
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function countByEstado(ordenes, estados) {
  return ordenes.filter(o => estados.includes(o.estado)).length;
}

async function loadJefeMecanicosDashboard(silent = false) {
  try {
    if (!silent) showLoading();

    let hallazgos = [], ordenes = [], mecanicos = [];

    try {
      const hallazgosRes = await API.getHallazgos({ estado: 'abierto' });
      hallazgos = Array.isArray(hallazgosRes) ? hallazgosRes : hallazgosRes?.data || [];
    } catch (_) {}

    try {
      const ordenesRes = await API.getOrdenesTrabajo({ limit: 500 });
      ordenes = Array.isArray(ordenesRes) ? ordenesRes : ordenesRes?.data || [];
    } catch (_) {}

    try {
      const usuariosRes = await API.getMecanicos();
      const usuarios = Array.isArray(usuariosRes) ? usuariosRes : usuariosRes?.data || [];
      mecanicos = usuarios.filter(u => u.rol === 'mecanico');
    } catch (_) {
      mecanicos = [];
    }

    document.getElementById('jefe-stat-hallazgos-pendientes').textContent = hallazgos.length;

    const ordenesAbiertas = ordenes.filter(o => ['pendiente', 'asignada', 'en_progreso'].includes(o.estado));
    document.getElementById('jefe-stat-ordenes-abiertas').textContent = ordenesAbiertas.length;

    const ordenesHoy = ordenes.filter(o => (o.fecha_creacion || '').startsWith(getTodayStr()));
    document.getElementById('jefe-stat-ordenes-hoy').textContent = ordenesHoy.length;

    document.getElementById('jefe-stat-mecanicos-activos').textContent = mecanicos.length;

    const container = document.getElementById('jefe-resumen-ordenes');
    if (!ordenesAbiertas.length) {
      container.innerHTML = '<p class="empty-state">No hay órdenes de trabajo abiertas.</p>';
    } else {
      container.innerHTML = ordenesAbiertas.slice(0, 10).map(renderOrdenCard).join('');
    }
  } catch (err) {
    console.error('Error loading jefe mecanicos dashboard:', err);
    showAppAlert('Error', 'No se pudieron cargar los datos del dashboard.');
  } finally {
    if (!silent) hideLoading();
  }
}

async function loadMecanicoDashboard(silent = false) {
  try {
    if (!silent) showLoading();

    const userId = APP.user?.id;
    if (!userId) {
      showAppAlert('Error', 'No se encontró el usuario actual.');
      return;
    }

    const ordenesRes = await API.getOrdenesTrabajo({ responsable_id: userId, limit: 200 });
    const ordenes = Array.isArray(ordenesRes) ? ordenesRes : ordenesRes?.data || [];
    const today = getTodayStr();

    const pendientes = ordenes.filter(o => o.estado === 'pendiente');
    const enCurso = ordenes.filter(o => o.estado === 'en_progreso');
    const completadasHoy = ordenes.filter(o => o.estado === 'completada' && (o.fecha_creacion || '').startsWith(today));
    const activas = ordenes.filter(o => ['pendiente', 'asignada', 'en_progreso'].includes(o.estado));

    document.getElementById('mec-stat-pendientes').textContent = pendientes.length;
    document.getElementById('mec-stat-en-proceso').textContent = enCurso.length;
    document.getElementById('mec-stat-completadas-hoy').textContent = completadasHoy.length;

    const container = document.getElementById('mec-ordenes-activas');
    if (!activas.length) {
      container.innerHTML = '<p class="empty-state">No tienes órdenes de trabajo activas.</p>';
    } else {
      container.innerHTML = activas.slice(0, 10).map(renderOrdenCard).join('');
    }
  } catch (err) {
    console.error('Error loading mecanico dashboard:', err);
    showAppAlert('Error', 'No se pudieron cargar los datos del dashboard.');
  } finally {
    if (!silent) hideLoading();
  }
}
