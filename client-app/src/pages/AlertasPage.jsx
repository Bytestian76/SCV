import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Clock, UserCheck, CheckCircle2, RefreshCw, BellOff } from 'lucide-react';
import { api } from '../services/api';

const TIPO_ICON = {
  critica: AlertTriangle,
  advertencia: Clock,
  info: UserCheck,
};

const TIPO_COLOR = {
  critica:     { border: '#dc2626', bg: '#fee2e2', icon: '#dc2626' },
  advertencia: { border: '#d97706', bg: '#fef3c7', icon: '#d97706' },
  info:        { border: '#2563eb', bg: '#dbeafe', icon: '#2563eb' },
};

function AlertCard({ alerta, leida }) {
  const sev     = alerta.severidad || 'info';
  const colors  = TIPO_COLOR[sev] || TIPO_COLOR.info;
  const Icon    = TIPO_ICON[sev]  || UserCheck;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '16px 20px',
        borderRadius: '12px',
        background: '#ffffff',
        border: '1px solid #e8eee9',
        borderLeft: `4px solid ${colors.border}`,
        opacity: leida ? 0.45 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        style={{
          width: '36px', height: '36px', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: colors.bg, color: colors.icon, flexShrink: 0,
        }}
      >
        <Icon size={18} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#121d18' }}>
            {alerta.titulo}
          </h4>
          <span style={{ fontSize: '11px', color: '#8a9c93', whiteSpace: 'nowrap' }}>
            {alerta.tiempo_relativo}
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#576b61', marginTop: '4px' }}>
          {alerta.descripcion}
        </p>
      </div>
    </div>
  );
}

export const AlertasPage = () => {
  const [alertas, setAlertas]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [leidas, setLeidas]       = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlertas = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await api.request('/alertas/');
      setAlertas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las alertas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Carga inicial + refresco automático cada 60 s
  useEffect(() => {
    fetchAlertas();
    const interval = setInterval(() => fetchAlertas(true), 60_000);
    return () => clearInterval(interval);
  }, [fetchAlertas]);

  const marcarTodasLeidas = () => {
    setLeidas(new Set(alertas.map((a) => a.id)));
  };

  const pendientes = alertas.filter((a) => !leidas.has(a.id)).length;

  return (
    <div className="page-body">
      <div className="crud-table-container">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="table-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3>Centro de Alertas Operativas y de Seguridad</h3>
            {pendientes > 0 && (
              <span
                style={{
                  background: '#dc2626', color: '#fff', borderRadius: '999px',
                  fontSize: '11px', fontWeight: '700',
                  padding: '2px 8px', lineHeight: 1.4,
                }}
              >
                {pendientes}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Botón de refrescar */}
            <button
              className="btn-primary"
              style={{ background: '#f5f7f5', color: '#121d18', border: '1px solid #e8eee9' }}
              onClick={() => fetchAlertas(true)}
              disabled={refreshing}
              title="Actualizar alertas"
            >
              <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              <span>{refreshing ? 'Actualizando…' : 'Actualizar'}</span>
            </button>

            {/* Marcar todas */}
            <button
              className="btn-primary"
              style={{ background: '#f5f7f5', color: '#121d18', border: '1px solid #e8eee9' }}
              onClick={marcarTodasLeidas}
              disabled={pendientes === 0}
            >
              <CheckCircle2 size={16} color="#059669" />
              <span>Marcar Todas como Leídas</span>
            </button>
          </div>
        </div>

        {/* ── Contenido ───────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#8a9c93' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
            <p style={{ fontSize: '14px' }}>Cargando alertas…</p>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: 'center', padding: '48px', color: '#dc2626',
              background: '#fee2e2', borderRadius: '12px',
            }}
          >
            <AlertTriangle size={28} style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', fontWeight: '600' }}>Error al cargar alertas</p>
            <p style={{ fontSize: '12px', marginTop: '4px', color: '#7f1d1d' }}>{error}</p>
            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => fetchAlertas()}>
              Reintentar
            </button>
          </div>
        ) : alertas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: '#8a9c93' }}>
            <BellOff size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#576b61' }}>
              Sin alertas activas
            </p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              Todos los vehículos y documentos están en orden.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alertas.map((a) => (
              <AlertCard key={a.id} alerta={a} leida={leidas.has(a.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Estilos de la animación de spin */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
