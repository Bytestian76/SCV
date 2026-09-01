import React from 'react';
import { Truck, Users, ClipboardCheck, BarChart3, ArrowUpRight, Minus } from 'lucide-react';

export const KpiGrid = ({ kpis }) => {
  const cards = [
    {
      title: 'Vehículos Activos',
      value: kpis?.vehiculos_activos ?? 46,
      delta: `↑ ${kpis?.vehiculos_activos_delta ?? 8}% vs ayer`,
      isUp: true,
      icon: Truck,
      colorClass: 'green',
    },
    {
      title: 'Conductores en línea',
      value: kpis?.conductores_en_linea ?? 23,
      delta: `↑ ${kpis?.conductores_delta ?? 5}% vs ayer`,
      isUp: true,
      icon: Users,
      colorClass: 'mint',
    },
    {
      title: 'Chequeos del día',
      value: kpis?.chequeos_hoy ?? 0,
      delta: `— ${kpis?.chequeos_delta ?? 0}% vs ayer`,
      isNeutral: true,
      icon: ClipboardCheck,
      colorClass: 'amber',
    },
    {
      title: 'Movimientos hoy',
      value: kpis?.movimientos_hoy ?? 128,
      delta: `↑ ${kpis?.movimientos_delta ?? 12}% vs ayer`,
      isUp: true,
      icon: BarChart3,
      colorClass: 'purple',
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="kpi-card">
            <div className={`kpi-icon-circle ${card.colorClass}`}>
              <Icon size={24} />
            </div>
            <div className="kpi-content">
              <div className="kpi-title">{card.title}</div>
              <div className="kpi-value">{card.value}</div>
              <div className={`kpi-delta ${card.isUp ? 'up' : 'neutral'}`}>
                {card.delta}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
