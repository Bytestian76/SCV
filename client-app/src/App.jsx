import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { VehiculosPage } from './pages/VehiculosPage';
import { ConductoresPage } from './pages/ConductoresPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { MovimientosPage } from './pages/MovimientosPage';
import { ChequeosPage } from './pages/ChequeosPage';
import { MantenimientoPage } from './pages/MantenimientoPage';
import { AlertasPage } from './pages/AlertasPage';
import { ReportesPage } from './pages/ReportesPage';
import { LoginPage } from './pages/LoginPage';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (api.token) {
        try {
          const user = await api.getMe();
          setCurrentUser(user);
        } catch (error) {
          console.error("Error validando sesión:", error);
        }
      }
      setLoadingAuth(false);
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (data) => {
    setCurrentUser({
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      id: data.user_id
    });
  };

  const handleLogout = () => {
    api.setToken(null);
    setCurrentUser(null);
  };

  if (loadingAuth) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>Cargando sesión...</div>;
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Centro de mando de movilidad', subtitle: 'Resumen general del estado operativo' };
      case 'vehiculos':
        return { title: 'Gestión de Flota Vehicular', subtitle: 'Parque automotor, kilometrajes y vigencias legales' };
      case 'conductores':
        return { title: 'Directorio de Conductores', subtitle: 'Conductores autorizados, licencias y categorías' };
      case 'usuarios':
        return { title: 'Control de Usuarios y Roles', subtitle: 'Gestión de accesos, credenciales y perfiles' };
      case 'movimientos':
        return { title: 'Control de Despacho y Patio', subtitle: 'Registro en tiempo real de entradas y salidas' };
      case 'chequeos':
        return { title: 'Inspecciones Preoperacionales', subtitle: 'Verificación diaria de seguridad técnico-mecánica' };
      case 'mantenimiento':
        return { title: 'Taller y Órdenes de Trabajo', subtitle: 'Mantenimiento correctivo, preventivo y costeo' };
      case 'reportes':
        return { title: 'Reportes y Analítica', subtitle: 'Exportación de métricas operativas y costos' };
      case 'alertas':
        return { title: 'Centro de Alertas y Notificaciones', subtitle: 'Vencimientos críticos y anomalías detectadas' };
      case 'configuracion':
        return { title: 'Configuración del Sistema', subtitle: 'Parámetros generales de la plataforma' };
      default:
        return { title: 'Centro de mando de movilidad', subtitle: 'Resumen general del estado operativo' };
    }
  };

  const headerInfo = getHeaderInfo();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} currentUser={currentUser} />;
      case 'vehiculos':
        return <VehiculosPage currentUser={currentUser} />;
      case 'conductores':
        return <ConductoresPage currentUser={currentUser} />;
      case 'usuarios':
        return <UsuariosPage currentUser={currentUser} />;
      case 'movimientos':
        return <MovimientosPage currentUser={currentUser} />;
      case 'chequeos':
        return <ChequeosPage currentUser={currentUser} />;
      case 'mantenimiento':
        return <MantenimientoPage currentUser={currentUser} />;
      case 'alertas':
        return <AlertasPage currentUser={currentUser} />;
      case 'reportes':
        return <ReportesPage currentUser={currentUser} />;
      default:
        return <DashboardPage onNavigate={setActiveTab} currentUser={currentUser} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar de Navegación */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Área de Trabajo */}
      <main className="main-content">
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          currentUser={currentUser}
        />
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
