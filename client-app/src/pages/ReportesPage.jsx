import React, { useState } from 'react';
import {
  FileText, Download, FileSpreadsheet, Filter,
  Calendar, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  || '/api/v1';

const REPORTS = [
  {
    id: 'despacho',
    title: 'Reporte de Despacho y Báscula',
    desc: 'Consolidado de entradas/salidas, báscula, kilómetros y sacas por vehículo y conductor.',
    endpoint: '/reportes/despacho',
    formatos: ['xlsx', 'pdf'],
    filters: ['fecha_inicio', 'fecha_fin', 'tipo'],
  },
  {
    id: 'inspecciones',
    title: 'Bitácora de Inspecciones Preoperacionales',
    desc: 'Auditoría completa de chequeos, ítems no conformes y hallazgos generados.',
    endpoint: '/reportes/inspecciones',
    formatos: ['xlsx', 'pdf'],
    filters: ['fecha_inicio', 'fecha_fin'],
  },
  {
    id: 'financiero',
    title: 'Informe Financiero de Taller',
    desc: 'Costos de repuestos, mano de obra y servicios de las órdenes de trabajo.',
    endpoint: '/reportes/financiero',
    formatos: ['xlsx', 'pdf'],
    filters: ['fecha_inicio', 'fecha_fin'],
  },
  {
    id: 'auditoria',
    title: 'Trazabilidad y Auditoría de Flota',
    desc: 'Registro inmutable de cambios de estado, usuarios, IPs y valores anteriores/nuevos.',
    endpoint: '/reportes/auditoria',
    formatos: ['xlsx', 'pdf'],
    filters: ['fecha_inicio', 'fecha_fin'],
  },
];

// ── Descarga autenticada ────────────────────────────────────────────────────
async function downloadReport({ endpoint, params, filename }) {
  const token = localStorage.getItem('scv_token');
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  ).toString();
  const url = `${API_BASE}${endpoint}${qs ? `?${qs}` : ''}`;

  const response = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${response.status}`);
  }

  const blob = await response.blob();
  const objUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objUrl);
}

// ── Tarjeta individual de reporte ──────────────────────────────────────────
function ReportCard({ report }) {
  const [fmt, setFmt] = useState(report.formatos[0]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoMov, setTipoMov] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | ok | error
  const [errMsg, setErrMsg] = useState('');

  const handleDownload = async () => {
    setState('loading');
    setErrMsg('');
    try {
      const ts = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const ext = fmt;
      const filename = `SCV_${report.id}_${ts}.${ext}`;

      const params = { formato: fmt };
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;
      if (report.filters.includes('tipo') && tipoMov) params.tipo = tipoMov;

      await downloadReport({ endpoint: report.endpoint, params, filename });
      setState('ok');
      setTimeout(() => setState('idle'), 3000);
    } catch (err) {
      setErrMsg(err.message);
      setState('error');
      setTimeout(() => setState('idle'), 5000);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e8eee9',
        borderRadius: '14px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      {/* ── Título ── */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: '#e6f7f0', color: '#059669', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <FileText size={18} />
        </div>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#121d18', margin: 0 }}>
            {report.title}
          </h4>
          <p style={{ fontSize: '12px', color: '#576b61', marginTop: '4px', lineHeight: 1.5 }}>
            {report.desc}
          </p>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div
        style={{
          background: '#f5f8f6', borderRadius: '10px', padding: '14px',
          display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end',
        }}
      >
        {/* Fecha inicio */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 140px' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#576b61' }}>
            <Calendar size={11} style={{ marginRight: 4 }} />Desde
          </span>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            style={inputStyle}
          />
        </label>

        {/* Fecha fin */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 140px' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#576b61' }}>
            <Calendar size={11} style={{ marginRight: 4 }} />Hasta
          </span>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            style={inputStyle}
          />
        </label>

        {/* Filtro tipo movimiento (solo para despacho) */}
        {report.filters.includes('tipo') && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 110px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#576b61' }}>
              <Filter size={11} style={{ marginRight: 4 }} />Tipo
            </span>
            <select
              value={tipoMov}
              onChange={(e) => setTipoMov(e.target.value)}
              style={inputStyle}
            >
              <option value="">Todos</option>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
            </select>
          </label>
        )}

        {/* Selector de formato */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '0 0 auto' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#576b61' }}>Formato</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {report.formatos.map((f) => (
              <button
                key={f}
                onClick={() => setFmt(f)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: `1.5px solid ${fmt === f ? '#059669' : '#d1d9d4'}`,
                  background: fmt === f ? '#e6f7f0' : '#ffffff',
                  color: fmt === f ? '#059669' : '#576b61',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                {f === 'xlsx' ? <FileSpreadsheet size={13} /> : <FileText size={13} />}
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </label>
      </div>

      {/* ── Estado de error ── */}
      {state === 'error' && (
        <div
          style={{
            background: '#fee2e2', borderRadius: '8px', padding: '10px 14px',
            fontSize: '12px', color: '#dc2626', display: 'flex', gap: '8px', alignItems: 'center',
          }}
        >
          <AlertCircle size={14} />
          {errMsg || 'No se pudo generar el reporte.'}
        </div>
      )}

      {/* ── Botón de descarga ── */}
      <div style={{ borderTop: '1px solid #f0f4f1', paddingTop: '14px' }}>
        <button
          className="btn-primary"
          onClick={handleDownload}
          disabled={state === 'loading'}
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '10px',
            fontSize: '13px',
            fontWeight: '700',
            ...(state === 'ok' && { background: '#059669' }),
          }}
        >
          {state === 'loading' ? (
            <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /><span>Generando…</span></>
          ) : state === 'ok' ? (
            <><CheckCircle2 size={15} /><span>¡Descargado!</span></>
          ) : (
            <><Download size={15} /><span>Descargar {fmt.toUpperCase()}</span></>
          )}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '7px 10px',
  borderRadius: '8px',
  border: '1px solid #d1d9d4',
  fontSize: '12px',
  color: '#121d18',
  background: '#ffffff',
  width: '100%',
  outline: 'none',
};

// ── Página principal ────────────────────────────────────────────────────────
export const ReportesPage = () => {
  return (
    <div className="page-body">
      <div className="crud-table-container">
        <div className="table-header-bar">
          <h3>Generación y Exportación de Reportes</h3>
          <span style={{ fontSize: '12px', color: '#8a9c93' }}>
            Reportes disponibles en formato Excel (XLSX) y PDF
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))',
            gap: '20px',
          }}
        >
          {REPORTS.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
