import { API } from "./api.js";
import { APP, Store } from "./store.js";
import { showScreen, showLoading, hideLoading, showAppAlert } from "./ui.js";

function showDashboard(rol) {
    const dashboardId = CONFIG.DASHBOARDS[rol];
    if (dashboardId) {
        showScreen(dashboardId);
        renderUserCredentialCards();
        configureAdminAutoRefresh(rol);
        loadDashboardData(rol);
    }
}

function getRoleCredentialMeta(rol) {
    if (rol === CONFIG.ROLES.ADMIN) {
        return {
            className: 'is-admin',
            icon: 'assets/icons/people.svg'
        };
    }

    if (rol === CONFIG.ROLES.OPERARIO_MOVIMIENTOS) {
        return {
            className: 'is-operario-movimientos',
            icon: 'assets/icons/truck.svg'
        };
    }

    if (rol === CONFIG.ROLES.OPERARIO_CHEQUEO) {
        return {
            className: 'is-operario-chequeo',
            icon: 'assets/icons/clipboard-check.svg'
        };
    }

    if (rol === CONFIG.ROLES.MECANICO) {
        return {
            className: 'is-mecanico',
            icon: 'assets/icons/wrench.svg'
        };
    }

    if (rol === CONFIG.ROLES.JEFE_MECANICOS) {
        return {
            className: 'is-jefe-mecanicos',
            icon: 'assets/icons/people.svg'
        };
    }

    return {
        className: 'is-admin',
        icon: 'assets/icons/people.svg'
    };
}

function renderUserCredentialCards() {
    const cards = document.querySelectorAll('[data-user-credential]');
    if (!cards.length) return;

    const user = APP.user || {};
    const roleMeta = getRoleCredentialMeta(user.rol);
    const roleText = rolLabel(user.rol);
    const userName = (user.nombre || 'Usuario no identificado').trim();
    const userEmail = (user.email || 'Sin correo registrado').trim();

    cards.forEach((card) => {
        card.classList.remove('is-admin', 'is-operario-movimientos', 'is-operario-chequeo');
        card.classList.add(roleMeta.className);

        const avatar = card.querySelector('[data-user-avatar]');
        const name = card.querySelector('[data-user-name]');
        const role = card.querySelector('[data-user-rol]');
        const email = card.querySelector('[data-user-email]');

        if (avatar) {
            avatar.src = roleMeta.icon;
            avatar.alt = `Perfil ${roleText}`;
        }
        if (name) name.textContent = userName;
        if (role) role.textContent = roleText;
        if (email) email.textContent = userEmail;
    });
}

function shouldRefreshAdminDashboard() {
    const rol = APP.user?.rol;
    const screen = APP.currentScreen;
    if (rol === CONFIG.ROLES.ADMIN && screen === 'dashboard-admin') return true;
    if (rol === CONFIG.ROLES.JEFE_MECANICOS && screen === 'dashboard-jefe-mecanicos') return true;
    if (rol === CONFIG.ROLES.MECANICO && screen === 'dashboard-mecanico') return true;
    return false;
}

function handleDashboardDataChangeEvent() {
    if (!shouldRefreshAdminDashboard()) return;
    loadDashboardData(APP.user?.rol);
}

function handleDashboardStorageSync(event) {
    if (event.key !== CONFIG.DASHBOARD_SYNC_KEY) return;
    if (!shouldRefreshAdminDashboard()) return;
    loadDashboardData(APP.user?.rol);
}

function handleDashboardVisibilityChange() {
    if (document.hidden) return;
    if (!shouldRefreshAdminDashboard()) return;
    loadDashboardData(APP.user?.rol);
}

function handleDashboardWindowFocus() {
    if (!shouldRefreshAdminDashboard()) return;
    loadDashboardData(APP.user?.rol);
}

function clearAdminAutoRefresh() {
    if (APP.ui.adminChartsInterval) {
        clearInterval(APP.ui.adminChartsInterval);
        APP.ui.adminChartsInterval = null;
    }
}

function configureAdminAutoRefresh(rol) {
    clearAdminAutoRefresh();
    if (rol === CONFIG.ROLES.ADMIN) {
        APP.ui.adminChartsInterval = setInterval(() => {
            if (!document.hidden && APP.currentScreen === 'dashboard-admin') {
                loadDashboardData(CONFIG.ROLES.ADMIN);
            }
        }, CONFIG.ADMIN_REFRESH_INTERVAL_MS || 30000);
    } else if (rol === CONFIG.ROLES.JEFE_MECANICOS) {
        APP.ui.adminChartsInterval = setInterval(() => {
            if (!document.hidden && APP.currentScreen === 'dashboard-jefe-mecanicos') {
                loadDashboardData(CONFIG.ROLES.JEFE_MECANICOS, true);
            }
        }, 30000);
    } else if (rol === CONFIG.ROLES.MECANICO) {
        APP.ui.adminChartsInterval = setInterval(() => {
            if (!document.hidden && APP.currentScreen === 'dashboard-mecanico') {
                loadDashboardData(CONFIG.ROLES.MECANICO, true);
            }
        }, 30000);
    }
}

async function loadDashboardData(rol, silent = false) {
    try {
        if (rol === CONFIG.ROLES.ADMIN) {
            const requestSeq = ++APP.ui.adminDashboardRequestSeq;
            const rangoSelect = document.getElementById('admin-chart-range');
            const dias = parseInt(rangoSelect?.value || '7', 10);
            const stats = await API.getDashboard(Number.isInteger(dias) ? dias : 7);
            if (requestSeq !== APP.ui.adminDashboardRequestSeq) return;
            document.getElementById('stat-vehiculos').textContent = stats.totales?.vehiculos_activos || 0;
            document.getElementById('stat-conductores').textContent = stats.totales?.conductores_activos || 0;
            document.getElementById('stat-movimientos').textContent = stats.totales?.movimientos_hoy || 0;
            document.getElementById('stat-chequeos').textContent = stats.totales?.chequeos_hoy || 0;
            renderAdminAnalytics(stats.analitica || null);
        } else if (rol === CONFIG.ROLES.JEFE_MECANICOS) {
            if (typeof loadJefeMecanicosDashboard === 'function') {
                loadJefeMecanicosDashboard(silent);
            }
        } else if (rol === CONFIG.ROLES.MECANICO) {
            if (typeof loadMecanicoDashboard === 'function') {
                loadMecanicoDashboard(silent);
            }
        } else if (rol === CONFIG.ROLES.OPERARIO_MOVIMIENTOS) {
            const movimientos = await API.getMovimientos();
            renderMovimientosRecientes(movimientos.slice(0, 5));
        } else if (rol === CONFIG.ROLES.OPERARIO_CHEQUEO) {
            const chequeos = await API.getChequeos();
            renderChequeosRecientes(chequeos.slice(0, 5));
        }
    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

function renderAdminTrendChart(series) {
    const container = document.getElementById('admin-trend-chart');
    if (!container) return;

    const labels = Array.isArray(series?.labels) ? series.labels : [];
    const movimientos = Array.isArray(series?.movimientos) ? series.movimientos : [];
    const chequeos = Array.isArray(series?.chequeos) ? series.chequeos : [];

    if (!labels.length || (!movimientos.length && !chequeos.length)) {
        container.innerHTML = '<p class="empty-message">Sin datos suficientes para graficar tendencia.</p>';
        return;
    }

    const width = 940;
    const height = 380;
    const plotArea = {
        x: 62,
        y: 22,
        width: width - 82,
        height: height - 76
    };

    const allValues = [...movimientos, ...chequeos].map((value) => Number(value || 0));
    const rawMin = Math.min(...allValues);
    const rawMax = Math.max(...allValues);
    const buffer = Math.max(2, Math.round((rawMax - rawMin) * 0.12));
    const minValue = rawMin === rawMax ? Math.max(0, rawMin - 5) : Math.max(0, rawMin - buffer);
    const maxValue = rawMin === rawMax ? rawMax + 5 : rawMax + buffer;

    const movPoints = getTrendPoints(movimientos, plotArea, minValue, maxValue);
    const chePoints = getTrendPoints(chequeos, plotArea, minValue, maxValue);
    const movPath = pointsToSmoothPath(movPoints);
    const chePath = pointsToSmoothPath(chePoints);

    const movAreaPath = `${movPath} L ${movPoints[movPoints.length - 1].x.toFixed(2)} ${(plotArea.y + plotArea.height).toFixed(2)} L ${movPoints[0].x.toFixed(2)} ${(plotArea.y + plotArea.height).toFixed(2)} Z`;

    const tickCount = 5;
    const ticks = Array.from({ length: tickCount + 1 }, (_, step) => {
        const ratio = step / tickCount;
        const y = plotArea.y + (plotArea.height * ratio);
        const value = maxValue - ((maxValue - minValue) * ratio);
        return {
            y,
            value: formatCompactNumber(value)
        };
    });

    const gridLines = ticks
        .map((tick) => `<line x1="${plotArea.x}" y1="${tick.y.toFixed(2)}" x2="${(plotArea.x + plotArea.width).toFixed(2)}" y2="${tick.y.toFixed(2)}" />`)
        .join('');

    const yLabels = ticks
        .map((tick) => `<text class="trend-y-label" x="${(plotArea.x - 8).toFixed(2)}" y="${(tick.y + 4).toFixed(2)}" text-anchor="end">${tick.value}</text>`)
        .join('');

    const pointsMarkup = movPoints.map((point, index) => {
        const label = labels[index] || '';
        const movValue = movimientos[index] ?? 0;
        const cheValue = chequeos[index] ?? 0;
        return `
            <circle class="trend-dot trend-dot-mov" cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="4.8">
                <title>${escapeHtml(label)} · Movimientos: ${movValue} · Chequeos: ${cheValue}</title>
            </circle>
            <circle class="trend-dot trend-dot-che" cx="${chePoints[index]?.x?.toFixed(2) || point.x.toFixed(2)}" cy="${chePoints[index]?.y?.toFixed(2) || point.y.toFixed(2)}" r="4.2">
                <title>${escapeHtml(label)} · Chequeos: ${cheValue} · Movimientos: ${movValue}</title>
            </circle>
        `;
    }).join('');

    const labelStep = Math.max(1, Math.ceil(labels.length / 6));
    const xLabels = labels
        .map((label, index) => ({ label, index }))
        .filter(({ index }) => index === 0 || index === labels.length - 1 || index % labelStep === 0)
        .map(({ label, index }) => {
            const point = movPoints[index];
            if (!point) return '';
            let anchor = 'middle';
            if (index === 0) anchor = 'start';
            if (index === labels.length - 1) anchor = 'end';
            return `<text class="trend-x-label" x="${point.x.toFixed(2)}" y="${(height - 10).toFixed(2)}" text-anchor="${anchor}">${escapeHtml(label)}</text>`;
        })
        .join('');

    container.innerHTML = `
        <svg class="trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Tendencia diaria de movimientos y chequeos">
            <defs>
                <linearGradient id="trendFillMov" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(43, 99, 240, 0.26)" />
                    <stop offset="100%" stop-color="rgba(43, 99, 240, 0.03)" />
                </linearGradient>
            </defs>
            <g class="trend-grid">${gridLines}</g>
            ${yLabels}
            <line class="trend-axis" x1="${plotArea.x}" y1="${(plotArea.y + plotArea.height).toFixed(2)}" x2="${(plotArea.x + plotArea.width).toFixed(2)}" y2="${(plotArea.y + plotArea.height).toFixed(2)}" />
            <line class="trend-axis" x1="${plotArea.x}" y1="${plotArea.y}" x2="${plotArea.x}" y2="${(plotArea.y + plotArea.height).toFixed(2)}" />
            <path class="trend-area trend-area-mov" d="${movAreaPath}" />
            <path class="trend-line trend-line-mov" d="${movPath}" />
            <path class="trend-line trend-line-che" d="${chePath}" />
            ${pointsMarkup}
            ${xLabels}
        </svg>
        <div class="trend-legend">
            <span><i class="legend-dot mov"></i>Movimientos</span>
            <span><i class="legend-dot che"></i>Chequeos</span>
        </div>
    `;
}

function renderAdminTipoChart(movimientosTipo) {
    const container = document.getElementById('admin-tipo-chart');
    if (!container) return;

    const entrada = Number(movimientosTipo?.entrada || 0);
    const salida = Number(movimientosTipo?.salida || 0);
    const total = entrada + salida;

    if (total <= 0) {
        container.innerHTML = '<p class="empty-message">Sin movimientos en el rango seleccionado.</p>';
        return;
    }

    const porcentajeEntrada = Math.round((entrada / total) * 100);

    container.innerHTML = `
        <div class="donut-visual" style="--entrada:${porcentajeEntrada}%">
            <div class="donut-center">
                <strong>${total}</strong>
                <span>movimientos</span>
            </div>
        </div>
        <div class="donut-legend">
            <p><i class="legend-dot entrada"></i>Entradas: ${entrada}</p>
            <p><i class="legend-dot salida"></i>Salidas: ${salida}</p>
        </div>
    `;
}

function renderAdminTopVehiculosChart(topVehiculos) {
    const container = document.getElementById('admin-top-vehiculos-chart');
    if (!container) return;

    const items = Array.isArray(topVehiculos) ? topVehiculos : [];
    if (!items.length) {
        container.innerHTML = '<p class="empty-message">Aun no hay vehiculos con actividad en este rango.</p>';
        return;
    }

    const maxValue = Math.max(1, ...items.map((item) => Number(item.total || 0)));
    container.innerHTML = items.map((item) => {
        const value = Number(item.total || 0);
        const width = Math.max(8, Math.round((value / maxValue) * 100));
        return `
            <div class="bar-item">
                <div class="bar-item-header">
                    <span>${escapeHtml(item.placa || 'Sin placa')}</span>
                    <strong>${value}</strong>
                </div>
                <div class="bar-track">
                    <div class="bar-fill" style="width:${width}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderAdminAnalytics(analitica) {
    renderAdminTrendChart(analitica?.series || null);
    renderAdminTipoChart(analitica?.movimientos_tipo || null);
    renderAdminTopVehiculosChart(analitica?.top_vehiculos || null);
}

export { showDashboard, getRoleCredentialMeta, renderUserCredentialCards, shouldRefreshAdminDashboard, handleDashboardDataChangeEvent, handleDashboardStorageSync, handleDashboardVisibilityChange, handleDashboardWindowFocus, clearAdminAutoRefresh, configureAdminAutoRefresh, loadDashboardData, renderAdminTrendChart, renderAdminTipoChart, renderAdminTopVehiculosChart, renderAdminAnalytics };
window.showDashboard = showDashboard;
window.getRoleCredentialMeta = getRoleCredentialMeta;
window.renderUserCredentialCards = renderUserCredentialCards;
window.shouldRefreshAdminDashboard = shouldRefreshAdminDashboard;
window.handleDashboardDataChangeEvent = handleDashboardDataChangeEvent;
window.handleDashboardStorageSync = handleDashboardStorageSync;
window.handleDashboardVisibilityChange = handleDashboardVisibilityChange;
window.handleDashboardWindowFocus = handleDashboardWindowFocus;
window.clearAdminAutoRefresh = clearAdminAutoRefresh;
window.configureAdminAutoRefresh = configureAdminAutoRefresh;
window.loadDashboardData = loadDashboardData;
window.renderAdminTrendChart = renderAdminTrendChart;
window.renderAdminTipoChart = renderAdminTipoChart;
window.renderAdminTopVehiculosChart = renderAdminTopVehiculosChart;
window.renderAdminAnalytics = renderAdminAnalytics;
