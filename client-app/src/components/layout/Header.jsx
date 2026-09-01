import React from 'react';
import { Calendar, Bell, ChevronDown } from 'lucide-react';

export const Header = ({ title = "Centro de mando de movilidad", subtitle = "Resumen general del estado operativo", currentUser }) => {
  const todayFormatted = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="top-header">
      <div className="header-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="header-actions">
        {/* Date Picker Button */}
        <div className="date-pill">
          <Calendar size={15} color="var(--text-secondary)" />
          <span>Hoy, {todayFormatted}</span>
          <ChevronDown size={14} color="var(--text-secondary)" />
        </div>

        {/* Notifications */}
        <button className="header-btn" title="Notificaciones">
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>

        {/* User Avatar Badge */}
        <div className="avatar-badge">
          {currentUser?.nombre ? currentUser.nombre.charAt(0).toUpperCase() : 'A'}
        </div>
      </div>
    </header>
  );
};
