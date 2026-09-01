import React from 'react';
import { Truck, Plus, Minus, Navigation, ChevronRight } from 'lucide-react';

export const RealTimeMapCard = ({ inMotionCount = 18 }) => {
  return (
    <div className="dash-card">
      <div className="card-header">
        <h3>Actividad en tiempo real</h3>
        <span className="card-action-link">Ver mapa</span>
      </div>

      <div className="map-placeholder">
        {/* SVG Cuadrícula de calles de fondo */}
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.25 }}>
          <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22c55e" strokeWidth="0.8" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#city-grid)" />
          
          {/* Avenidas principales */}
          <line x1="0" y1="60" x2="300" y2="240" stroke="#34d399" strokeWidth="2.5" />
          <line x1="40" y1="20" x2="280" y2="100" stroke="#34d399" strokeWidth="2" />
          <line x1="160" y1="0" x2="200" y2="240" stroke="#34d399" strokeWidth="2" />
        </svg>

        {/* Pines GPS de Vehículos */}
        <div style={{ position: 'absolute', top: '35%', left: '20%', transform: 'translate(-50%, -50%)' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 12px rgba(5,150,105,0.8)' }}>
            <Truck size={13} />
          </div>
        </div>

        <div style={{ position: 'absolute', top: '48%', left: '80%', transform: 'translate(-50%, -50%)' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 12px rgba(5,150,105,0.8)' }}>
            <Truck size={13} />
          </div>
        </div>

        <div style={{ position: 'absolute', top: '70%', left: '65%', transform: 'translate(-50%, -50%)' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 12px rgba(5,150,105,0.8)' }}>
            <Truck size={13} />
          </div>
        </div>

        <div style={{ position: 'absolute', top: '78%', left: '35%', transform: 'translate(-50%, -50%)' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 12px rgba(5,150,105,0.8)' }}>
            <Truck size={13} />
          </div>
        </div>

        {/* Controles de Zoom */}
        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            <Plus size={14} color="#121d18" />
          </button>
          <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            <Minus size={14} color="#121d18" />
          </button>
          <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            <Navigation size={13} color="#121d18" />
          </button>
        </div>

        {/* Badge inferior */}
        <div className="map-footer-badge">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={15} color="#059669" />
            <span>Vehículos en movimiento</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ background: '#e6f7f0', color: '#059669', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
              {inMotionCount}
            </span>
            <ChevronRight size={14} color="#8a9c93" />
          </div>
        </div>
      </div>
    </div>
  );
};
