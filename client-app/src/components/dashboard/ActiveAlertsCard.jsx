import React from 'react';
import { AlertTriangle, Clock, UserCheck } from 'lucide-react';

export const ActiveAlertsCard = ({ alerts = [], onNavigate }) => {
  return (
    <div className="dash-card">
      <div className="card-header">
        <h3>Alertas activas</h3>
        <span className="card-action-link" onClick={() => onNavigate && onNavigate('alertas')}>
          Ver todas
        </span>
      </div>

      <div className="alerts-list">
        {alerts.map((alert, idx) => {
          let Icon = AlertTriangle;
          let severityClass = 'advertencia';

          if (alert.severidad === 'critica') {
            Icon = AlertTriangle;
            severityClass = 'critica';
          } else if (alert.tipo === 'conductor_disponible') {
            Icon = UserCheck;
            severityClass = 'info';
          } else if (alert.tipo === 'chequeo_pendiente') {
            Icon = Clock;
            severityClass = 'advertencia';
          }

          return (
            <div key={alert.id || idx} className={`alert-item ${severityClass}`}>
              <div className={`alert-icon ${severityClass}`}>
                <Icon size={16} />
              </div>
              <div className="alert-info">
                <h4>{alert.titulo}</h4>
                <p>{alert.descripcion}</p>
              </div>
              <span className="alert-time">{alert.tiempo_relativo}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
