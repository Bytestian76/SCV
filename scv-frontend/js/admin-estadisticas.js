/**
 * Controlador de Estadísticas y Analíticas de Mantenimiento
 */

// Referencias a los objetos Chart para destruirlos antes de volver a dibujar
let chartCostosMensuales = null;
let chartCostosVehiculo = null;
let chartOrdenesEstado = null;
let chartOrdenesPrioridad = null;

async function loadMantenimientoStats() {
    const tableBody = document.getElementById('stats-mtbm-table-body');
    const costoTotalCard = document.getElementById('stats-costo-total');
    const mtbmGlobalCard = document.getElementById('stats-mtbm-global');
    const totalOrdenesCard = document.getElementById('stats-total-ordenes');

    if (tableBody) tableBody.innerHTML = '<tr><td colspan="4" class="helper-text" style="text-align:center; padding: 20px;">Cargando datos...</td></tr>';
    
    try {
        const stats = await API.getEstadisticasMantenimiento();
        if (!stats) return;

        // 1. Renderizar KPIs
        if (costoTotalCard) costoTotalCard.textContent = formatCurrency(stats.costo_total || 0);
        if (mtbmGlobalCard) {
            const dias = stats.tiempo_entre_mantenimiento?.promedio_global_dias || 0;
            mtbmGlobalCard.textContent = dias > 0 ? `${dias} días` : 'N/A';
        }
        
        // Sumar total de órdenes completadas
        const totalCompletadas = stats.ordenes_por_estado?.completada || 0;
        if (totalOrdenesCard) totalOrdenesCard.textContent = totalCompletadas;

        // 2. Renderizar Tabla de MTBM por Vehículo
        if (tableBody) {
            const vehiculos = stats.tiempo_entre_mantenimiento?.vehiculos || [];
            if (vehiculos.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="helper-text" style="text-align:center; padding: 20px;">No hay suficientes datos de mantenimiento para calcular intervalos.</td></tr>';
            } else {
                tableBody.innerHTML = vehiculos.map(v => `
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 12px 5px; font-weight: bold; color: var(--color-primary, #1f6a43);">${escapeHtml(v.placa)}</td>
                        <td style="padding: 12px 5px;">${escapeHtml(v.marca)} ${escapeHtml(v.modelo)}</td>
                        <td style="padding: 12px 5px; font-weight: bold;">${v.promedio_dias} días</td>
                        <td style="padding: 12px 5px; color: #666;">${v.promedio_horas} hrs</td>
                    </tr>
                `).join('');
            }
        }

        // 3. Renderizar Gráficos de Chart.js
        renderChartCostosMensuales(stats.costos_por_mes || []);
        renderChartCostosVehiculo(stats.costos_por_vehiculo || []);
        renderChartOrdenesEstado(stats.ordenes_por_estado || {});
        renderChartOrdenesPrioridad(stats.ordenes_por_prioridad || {});

    } catch (error) {
        console.error('Error cargando estadísticas de mantenimiento:', error);
        showAppAlert('Error', 'No se pudieron cargar las estadísticas de mantenimiento.');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="4" class="helper-text" style="text-align:center; padding: 20px; color: red;">Error al cargar datos.</td></tr>';
    }
}

function renderChartCostosMensuales(datos) {
    const ctx = document.getElementById('chart-costos-mensuales');
    if (!ctx) return;

    if (chartCostosMensuales) {
        chartCostosMensuales.destroy();
    }

    const labels = datos.map(d => d.mes);
    const valores = datos.map(d => d.total_gasto);

    chartCostosMensuales = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Costo Total ($)',
                data: valores,
                borderColor: '#1f6a43',
                backgroundColor: 'rgba(31, 106, 67, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function renderChartCostosVehiculo(datos) {
    const ctx = document.getElementById('chart-costos-vehiculo');
    if (!ctx) return;

    if (chartCostosVehiculo) {
        chartCostosVehiculo.destroy();
    }

    // Mostrar los top 10 vehículos con mayor costo
    const topDatos = datos.slice(0, 10);
    const labels = topDatos.map(d => d.placa);
    const valores = topDatos.map(d => d.total_gasto);

    chartCostosVehiculo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Costo de Mantenimiento ($)',
                data: valores,
                backgroundColor: 'rgba(0, 86, 179, 0.85)',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function renderChartOrdenesEstado(datos) {
    const ctx = document.getElementById('chart-ordenes-estado');
    if (!ctx) return;

    if (chartOrdenesEstado) {
        chartOrdenesEstado.destroy();
    }

    const labelsMap = {
        'pendiente': 'Pendientes',
        'asignada': 'Asignadas',
        'en_progreso': 'En Progreso',
        'pausada': 'Pausadas',
        'completada': 'Completadas',
        'cancelada': 'Canceladas'
    };

    const colorsMap = {
        'pendiente': '#6c757d',
        'asignada': '#0056b3',
        'en_progreso': '#ffc107',
        'pausada': '#fd7e14',
        'completada': '#1f6a43',
        'cancelada': '#dc3545'
    };

    const labels = Object.keys(datos).map(key => labelsMap[key] || key);
    const valores = Object.values(datos);
    const colores = Object.keys(datos).map(key => colorsMap[key] || '#cccccc');

    chartOrdenesEstado = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: colores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { boxWidth: 15 }
                }
            }
        }
    });
}

function renderChartOrdenesPrioridad(datos) {
    const ctx = document.getElementById('chart-ordenes-prioridad');
    if (!ctx) return;

    if (chartOrdenesPrioridad) {
        chartOrdenesPrioridad.destroy();
    }

    const labelsMap = {
        'urgente': 'Urgente',
        'alta': 'Alta',
        'media': 'Media',
        'baja': 'Baja'
    };

    const colorsMap = {
        'urgente': '#dc3545',
        'alta': '#fd7e14',
        'media': '#ffc107',
        'baja': '#28a745'
    };

    const labels = Object.keys(datos).map(key => labelsMap[key] || key);
    const valores = Object.values(datos);
    const colores = Object.keys(datos).map(key => colorsMap[key] || '#cccccc');

    chartOrdenesPrioridad = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: colores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { boxWidth: 15 }
                }
            }
        }
    });
}
