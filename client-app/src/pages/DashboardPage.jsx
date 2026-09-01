import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { KpiGrid } from '../components/dashboard/KpiGrid';
import { HourlyMovementsChart } from '../components/dashboard/HourlyMovementsChart';
import { VehicleStatusDonut } from '../components/dashboard/VehicleStatusDonut';
import { ActiveAlertsCard } from '../components/dashboard/ActiveAlertsCard';
import { RealTimeMapCard } from '../components/dashboard/RealTimeMapCard';
import { RecentMovementsCard } from '../components/dashboard/RecentMovementsCard';
import { UpcomingMaintenanceCard } from '../components/dashboard/UpcomingMaintenanceCard';

export const DashboardPage = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const summary = await api.getDashboardSummary();
      setData(summary);
    } catch (err) {
      console.warn('Usando datos de respaldo para el dashboard:', err);
      // Fallback con la información visual oficial del mockup
      setData({
        kpis: {
          vehiculos_activos: 46,
          vehiculos_activos_delta: 8,
          conductores_en_linea: 23,
          conductores_delta: 5,
          chequeos_hoy: 0,
          chequeos_delta: 0,
          movimientos_hoy: 128,
          movimientos_delta: 12,
        },
        movimientos_por_hora: [
          { hora: '00:00', movimientos: 3 },
          { hora: '04:00', movimientos: 11 },
          { hora: '08:00', movimientos: 28 },
          { hora: '12:00', movimientos: 42 },
          { hora: '16:00', movimientos: 26 },
          { hora: '20:00', movimientos: 18 },
          { hora: '24:00', movimientos: 6 },
        ],
        vehiculos_por_estado: {
          total: 46,
          activos: 46,
          activos_pct: 65,
          en_mantenimiento: 12,
          en_mantenimiento_pct: 17,
          inactivos: 8,
          inactivos_pct: 11,
          fuera_de_servicio: 4,
          fuera_de_servicio_pct: 7,
        },
        alertas_activas: [
          {
            id: '1',
            tipo: 'mantenimiento_vencido',
            titulo: 'Vehículo NRM-023',
            descripcion: 'Mantenimiento vencido',
            tiempo_relativo: 'Hace 2h',
            severidad: 'critica',
          },
          {
            id: '2',
            tipo: 'chequeo_pendiente',
            titulo: 'Chequeos pendientes',
            descripcion: '5 vehículos sin chequeo',
            tiempo_relativo: 'Hace 3h',
            severidad: 'advertencia',
          },
          {
            id: '3',
            tipo: 'conductor_disponible',
            titulo: 'Conductor sin asignación',
            descripcion: '3 conductores disponibles',
            tiempo_relativo: 'Hace 5h',
            severidad: 'info',
          },
        ],
        ultimos_movimientos: [
          { id: 1, placa: 'NRM-045', ruta: 'Centro Logístico → Planta Norte', estado: 'En movimiento', hora: '12:45' },
          { id: 2, placa: 'NRM-012', ruta: 'Planta Sur → Centro Logístico', estado: 'Completado', hora: '12:30' },
          { id: 3, placa: 'NRM-023', ruta: 'Planta Norte → Planta Sur', estado: 'Completado', hora: '12:15' },
        ],
        mantenimientos_proximos: [
          { id: 1, placa: 'NRM-023', tarea: 'Cambio de aceite y filtros', dias_restantes: 'En 2 días', fecha: '28 May' },
          { id: 2, placa: 'NRM-017', tarea: 'Revisión general', dias_restantes: 'En 5 días', fecha: '31 May' },
          { id: 3, placa: 'NRM-031', tarea: 'Inspección de frenos', dias_restantes: 'En 7 días', fecha: '02 Jun' },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      {/* 1. KPIs Fila Superior */}
      <KpiGrid kpis={data?.kpis} />

      {/* 2. Fila Principal: Gráfica de Área + Dona de Estado + Alertas */}
      <div className="dashboard-main-grid">
        <HourlyMovementsChart data={data?.movimientos_por_hora} />
        <VehicleStatusDonut data={data?.vehiculos_por_estado} />
        <ActiveAlertsCard alerts={data?.alertas_activas} onNavigate={onNavigate} />
      </div>

      {/* 3. Fila Inferior: Últimos Movimientos + Próximos Mantenimientos + Mapa Real-time */}
      <div className="dashboard-bottom-grid">
        <RecentMovementsCard movements={data?.ultimos_movimientos} onNavigate={onNavigate} />
        <UpcomingMaintenanceCard maintenance={data?.mantenimientos_proximos} onNavigate={onNavigate} />
        <RealTimeMapCard inMotionCount={18} />
      </div>
    </div>
  );
};
