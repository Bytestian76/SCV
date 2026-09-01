import React from 'react';

export const VehicleStatusDonut = ({ data }) => {
  const total = data?.total ?? 46;
  const activos = data?.activos ?? 46;
  const activosPct = data?.activos_pct ?? 65;
  const enMantenimiento = data?.en_mantenimiento ?? 12;
  const enMantenimientoPct = data?.en_mantenimiento_pct ?? 17;
  const inactivos = data?.inactivos ?? 8;
  const inactivosPct = data?.inactivos_pct ?? 11;
  const fueraServicio = data?.fuera_de_servicio ?? 4;
  const fueraServicioPct = data?.fuera_de_servicio_pct ?? 7;

  // Parámetros para el círculo SVG (circunferencia = 2 * PI * r)
  // r = 60 -> C = 377
  const radius = 55;
  const circ = 2 * Math.PI * radius;

  // Calculo de offsets para cada sector
  const offset1 = 0;
  const len1 = (activosPct / 100) * circ;

  const offset2 = -len1;
  const len2 = (enMantenimientoPct / 100) * circ;

  const offset3 = -(len1 + len2);
  const len3 = (inactivosPct / 100) * circ;

  const offset4 = -(len1 + len2 + len3);
  const len4 = (fueraServicioPct / 100) * circ;

  const legend = [
    { label: 'Activos', count: `${activos} (${activosPct}%)`, color: '#059669' },
    { label: 'En mantenimiento', count: `${enMantenimiento} (${enMantenimientoPct}%)`, color: '#f59e0b' },
    { label: 'Inactivos', count: `${inactivos} (${inactivosPct}%)`, color: '#9ca3af' },
    { label: 'Fuera de servicio', count: `${fueraServicio} (${fueraServicioPct}%)`, color: '#ef4444' },
  ];

  return (
    <div className="dash-card">
      <div className="card-header">
        <h3>Vehículos por estado</h3>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '100%' }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
          <svg viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            {/* Activos (Verde) */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#059669"
              strokeWidth="20"
              strokeDasharray={`${len1} ${circ}`}
              strokeDashoffset={offset1}
            />
            {/* En Mantenimiento (Ámbar) */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="20"
              strokeDasharray={`${len2} ${circ}`}
              strokeDashoffset={offset2}
            />
            {/* Inactivos (Gris) */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#9ca3af"
              strokeWidth="20"
              strokeDasharray={`${len3} ${circ}`}
              strokeDashoffset={offset3}
            />
            {/* Fuera de Servicio (Rojo) */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="20"
              strokeDasharray={`${len4} ${circ}`}
              strokeDashoffset={offset4}
            />
          </svg>

          {/* Texto Central */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#121d18', lineHeight: '1' }}>{total}</div>
            <div style={{ fontSize: '11px', color: '#8a9c93', marginTop: '2px' }}>Total</div>
          </div>
        </div>

        {/* Leyenda a la derecha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {legend.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }}></span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{item.label}</span>
              </div>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
