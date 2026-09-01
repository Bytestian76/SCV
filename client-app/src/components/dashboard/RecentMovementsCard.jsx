import React from 'react';
import { Truck } from 'lucide-react';

export const RecentMovementsCard = ({ movements = [], onNavigate }) => {
  return (
    <div className="dash-card">
      <div className="card-header">
        <h3>Últimos movimientos</h3>
        <span className="card-action-link" onClick={() => onNavigate && onNavigate('movimientos')}>
          Ver todos
        </span>
      </div>

      <div className="records-list">
        {movements.map((mov, idx) => {
          const isInMotion = mov.estado === 'En movimiento';
          return (
            <div key={mov.id || idx} className="record-row">
              <div className="record-left">
                <div className="record-icon">
                  <Truck size={17} />
                </div>
                <div className="record-info">
                  <h4>{mov.placa}</h4>
                  <p>{mov.ruta}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span className={`status-pill ${isInMotion ? 'in-motion' : 'completed'}`}>
                  {mov.estado}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                  {mov.hora}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
