import React, { useState } from 'react';
import { Bell, AlertTriangle, Clock, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const AlertasPage = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, tipo: 'critica', titulo: 'Vehículo NRM-023: SOAT Próximo a Vencer', desc: 'El documento obligatorio SOAT vence en menos de 15 días. Se debe renovar para evitar inmovilización.', tiempo: 'Hace 2 horas' },
    { id: 2, tipo: 'critica', titulo: 'Vehículo NRM-031: Falla Crítica en Frenos', desc: 'Reportado en chequeo preoperacional con pastillas desgastadas.', tiempo: 'Hace 3 horas' },
    { id: 3, tipo: 'advertencia', titulo: '5 Vehículos sin Inspección Preoperacional', desc: 'Vehículos con salida programada sin registro de chequeo del día.', tiempo: 'Hace 3 horas' },
    { id: 4, tipo: 'info', titulo: '3 Conductores Disponibles en Patio', desc: 'Personal operativo listo para asignación de ruta.', tiempo: 'Hace 5 horas' },
  ]);

  return (
    <div className="page-body">
      <div className="crud-table-container">
        <div className="table-header-bar">
          <h3>Centro de Alertas Operativas y de Seguridad</h3>
          <button className="btn-primary" style={{ background: '#f5f7f5', color: '#121d18', border: '1px solid #e8eee9' }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>Marcar Todas como Leídas</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.map((a) => (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '16px 20px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid #e8eee9',
                borderLeft: `4px solid ${a.tipo === 'critica' ? '#dc2626' : (a.tipo === 'advertencia' ? '#d97706' : '#2563eb')}`,
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: a.tipo === 'critica' ? '#fee2e2' : (a.tipo === 'advertencia' ? '#fef3c7' : '#dbeafe'),
                  color: a.tipo === 'critica' ? '#dc2626' : (a.tipo === 'advertencia' ? '#d97706' : '#2563eb'),
                  flexShrink: 0,
                }}
              >
                {a.tipo === 'critica' ? <AlertTriangle size={18} /> : (a.tipo === 'advertencia' ? <Clock size={18} /> : <UserCheck size={18} />)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#121d18' }}>{a.titulo}</h4>
                  <span style={{ fontSize: '11px', color: '#8a9c93' }}>{a.tiempo}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#576b61', marginTop: '4px' }}>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
