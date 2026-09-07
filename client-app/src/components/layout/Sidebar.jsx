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
  LogOut,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab, currentUser, onLogout }) => {
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'operario_movimientos', 'operario_chequeo', 'mecanico', 'jefe_mecanicos'] },
    { id: 'vehiculos', label: 'Flota', icon: Truck, roles: ['admin', 'operario_movimientos', 'operario_chequeo', 'mecanico', 'jefe_mecanicos'] },
    { id: 'conductores', label: 'Conductores', icon: UserCheck, roles: ['admin', 'operario_movimientos'] },
    { id: 'usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
    { id: 'movimientos', label: 'Movimientos', icon: ArrowLeftRight, roles: ['admin', 'operario_movimientos'] },
    { id: 'chequeos', label: 'Chequeos', icon: ClipboardCheck, roles: ['admin', 'operario_chequeo'] },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench, roles: ['admin', 'mecanico', 'jefe_mecanicos'] },
    { id: 'reportes', label: 'Reportes', icon: FileText, roles: ['admin'] },
    { id: 'alertas', label: 'Alertas', icon: Bell, roles: ['admin', 'mecanico', 'jefe_mecanicos'] },
    { id: 'configuracion', label: 'Configuración', icon: Settings, roles: ['admin'] },
  ];

  const userRole = currentUser?.rol || 'admin';
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

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
        <LogOut 
          size={16} 
          style={{ color: 'var(--sidebar-text-muted)', cursor: 'pointer' }} 
          title="Cerrar Sesión"
          onClick={onLogout}
        />
      </div>
    </aside>
  );
};
