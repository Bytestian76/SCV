import React from 'react';
import { FileText, Download, Filter, Calendar } from 'lucide-react';

export const ReportesPage = () => {
  const reportCards = [
    { title: 'Reporte de Despacho y Báscula', desc: 'Consolidado de pesajes, kilometrajes y sacas por vehículo y fecha.', format: 'Excel / CSV' },
    { title: 'Bitácora de Inspecciones Preoperacionales', desc: 'Auditoría completa de listas de verificación y no-conformidades.', format: 'PDF / Excel' },
    { title: 'Informe Financiero de Taller y Mantenimiento', desc: 'Costos de repuestos, mano de obra e historial de órdenes de trabajo.', format: 'Excel' },
    { title: 'Trazabilidad y Auditoría de Flota', desc: 'Registro inmutable de cambios de estado, IP de usuarios y movimientos.', format: 'CSV' },
  ];

  return (
    <div className="page-body">
      <div className="crud-table-container">
        <div className="table-header-bar">
          <h3>Generación y Exportación de Reportes</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {reportCards.map((r, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #e8eee9',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e6f7f0', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={16} />
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#121d18' }}>{r.title}</h4>
                </div>
                <p style={{ fontSize: '13px', color: '#576b61', lineHeight: '1.4' }}>{r.desc}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f0f4f1', paddingTop: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#8a9c93' }}>Formato: {r.format}</span>
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  <Download size={14} />
                  <span>Descargar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
