import React from 'react';
import { ClipboardList } from 'lucide-react';

export const UpcomingMaintenanceCard = ({ maintenance = [], onNavigate }) => {
  return (
    <div className="dash-card">
      <div className="card-header">
        <h3>Mantenimientos próximos</h3>
        <span className="card-action-link" onClick={() => onNavigate && onNavigate('mantenimiento')}>
          Ver todos
        </span>
      </div>

      <div className="records-list">
        {maintenance.map((m, idx) => (
          <div key={m.id || idx} className="record-row">
            <div className="record-left">
              <div className="record-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <ClipboardList size={17} />
              </div>
              <div className="record-info">
                <h4>{m.placa}</h4>
                <p>{m.tarea}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span className="status-pill warning">
                {m.dias_restantes}
              </span>
              <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                {m.fecha}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
