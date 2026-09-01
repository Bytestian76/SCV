import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  UserCheck, 
  ArrowLeftRight, 
  ClipboardCheck, 
  Wrench, 
  FileText, 
  Bell, 
  Settings,
  MoreVertical,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab, currentUser }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vehiculos', label: 'Vehículos', icon: Truck },
    { id: 'conductores', label: 'Conductores', icon: UserCheck },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'movimientos', label: 'Movimientos', icon: ArrowLeftRight },
    { id: 'chequeos', label: 'Chequeos', icon: ClipboardCheck },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench },
    { id: 'reportes', label: 'Reportes', icon: FileText },
    { id: 'alertas', label: 'Alertas', icon: Bell },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Section */}
      <div className="brand-section">
        <div className="brand-logo-icon">
          <span>N</span>
        </div>
        <div className="brand-info">
          <h2>Normetales</h2>
          <span>Movilidad</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className="user-profile-card">
        <div className="user-avatar">
          <Users size={18} />
        </div>
        <div className="user-details">
          <div className="user-name">{currentUser?.nombre || 'Administrador'}</div>
          <div className="user-email">{currentUser?.email || 'admin@normetales.com'}</div>
        </div>
        <MoreVertical size={16} style={{ color: 'var(--sidebar-text-muted)', cursor: 'pointer' }} />
      </div>
    </aside>
  );
};
