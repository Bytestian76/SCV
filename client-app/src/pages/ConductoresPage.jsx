import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserCheck, Plus, Search } from 'lucide-react';

export const ConductoresPage = () => {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConductores();
  }, []);

  const loadConductores = async () => {
    try {
      setLoading(true);
      const data = await api.getUsuarios();
      const drivers = data.filter(u => u.rol === 'operario_chequeo' || u.rol === 'operario_movimientos');
      setConductores(drivers);
    } catch (err) {
      console.warn('Cargando conductores de prueba');
      setConductores([
        { id: 1, nombre: 'Carlos Rodríguez', cedula: '1020304050', licencia: 'LIC-987654', categoria: 'C2', fecha_venc_licencia: '2028-12-31', telefono: '3101234567', estado_activo: true },
        { id: 2, nombre: 'Andrés Morales', cedula: '1098765432', licencia: 'LIC-554433', categoria: 'C3', fecha_venc_licencia: '2027-09-15', telefono: '3157654321', estado_activo: true },
        { id: 3, nombre: 'Julián Gómez', cedula: '1011223344', licencia: 'LIC-112233', categoria: 'C1', fecha_venc_licencia: '2026-11-20', telefono: '3209876543', estado_activo: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = conductores.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.cedula && c.cedula.includes(searchTerm)) ||
    (c.licencia && c.licencia.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-body">
      <div className="crud-table-container">
        <div className="table-header-bar">
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Buscar conductor por nombre o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--surface-border)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8a9c93' }} />
          </div>

          <button className="btn-primary">
            <Plus size={16} />
            <span>Nuevo Conductor</span>
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>NOMBRE CONDUCTOR</th>
              <th>CÉDULA</th>
              <th>LICENCIA</th>
              <th>CATEGORÍA</th>
              <th>VENC. LICENCIA</th>
              <th>TELÉFONO</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{c.nombre}</td>
                <td>{c.cedula || 'N/D'}</td>
                <td>{c.licencia || 'N/D'}</td>
                <td>
                  <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '3px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '11px' }}>
                    {c.categoria || 'C2'}
                  </span>
                </td>
                <td>{c.fecha_venc_licencia || 'N/D'}</td>
                <td>{c.telefono || 'N/D'}</td>
                <td>
                  <span className={`status-pill ${c.estado_activo ? 'in-motion' : 'warning'}`}>
                    {c.estado_activo ? 'En línea' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
