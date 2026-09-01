import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Truck, Plus, Search, CheckCircle2, AlertCircle } from 'lucide-react';

export const VehiculosPage = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVehiculos();
  }, []);

  const loadVehiculos = async () => {
    try {
      setLoading(true);
      const data = await api.getVehiculos();
      setVehiculos(data);
    } catch (err) {
      console.warn('Cargando datos locales de prueba para vehículos');
      setVehiculos([
        { id: 1, placa: 'NRM-045', marca: 'Chevrolet', modelo: 'NPR Turbo', año: 2022, kilometraje: 45200, fecha_venc_soat: '2027-05-15', fecha_venc_rtm: '2027-04-10', estado: 'activo' },
        { id: 2, placa: 'NRM-012', marca: 'Hino', modelo: 'Dutro 300', año: 2023, kilometraje: 28150, fecha_venc_soat: '2027-08-20', fecha_venc_rtm: '2027-07-15', estado: 'activo' },
        { id: 3, placa: 'NRM-023', marca: 'Foton', modelo: 'Aumark S', año: 2021, kilometraje: 62400, fecha_venc_soat: '2026-09-10', fecha_venc_rtm: '2026-08-25', estado: 'en_taller' },
        { id: 4, placa: 'NRM-017', marca: 'Chevrolet', modelo: 'FVR', año: 2020, kilometraje: 89300, fecha_venc_soat: '2027-01-12', fecha_venc_rtm: '2026-12-05', estado: 'activo' },
        { id: 5, placa: 'NRM-031', marca: 'International', modelo: 'MV607', año: 2022, kilometraje: 38900, fecha_venc_soat: '2027-03-22', fecha_venc_rtm: '2027-02-18', estado: 'en_taller' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = vehiculos.filter(v => 
    v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-body">
      <div className="crud-table-container">
        <div className="table-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <input
                type="text"
                placeholder="Buscar por placa, marca o modelo..."
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
          </div>

          <button className="btn-primary">
            <Plus size={16} />
            <span>Nuevo Vehículo</span>
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>PLACA</th>
              <th>MARCA Y MODELO</th>
              <th>AÑO</th>
              <th>KILOMETRAJE</th>
              <th>VENC. SOAT</th>
              <th>VENC. RTM</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id}>
                <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{v.placa}</td>
                <td>{v.marca} {v.modelo}</td>
                <td>{v.año || 'N/D'}</td>
                <td>{Number(v.kilometraje).toLocaleString()} km</td>
                <td>{v.fecha_venc_soat || 'N/D'}</td>
                <td>{v.fecha_venc_rtm || 'N/D'}</td>
                <td>
                  <span className={`status-pill ${v.estado === 'activo' ? 'in-motion' : 'warning'}`}>
                    {v.estado === 'activo' ? 'Activo' : 'En taller'}
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
