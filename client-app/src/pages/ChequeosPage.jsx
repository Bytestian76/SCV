import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ClipboardCheck, Plus, Search, CheckCircle, AlertTriangle } from 'lucide-react';

export const ChequeosPage = () => {
  const [chequeos, setChequeos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChequeos();
  }, []);

  const loadChequeos = async () => {
    try {
      setLoading(true);
      const data = await api.getChequeos();
      setChequeos(data);
    } catch (err) {
      console.warn('Cargando chequeos de prueba');
      setChequeos([
        { id: 1, vehiculo: { placa: 'NRM-045' }, usuario: { nombre: 'Carlos Rodríguez' }, kilometraje: 45200, aprobado: true, fecha_registro: '2026-08-27T07:15:00', observaciones_generales: 'Sin novedades. Inspección 100% conforme.' },
        { id: 2, vehiculo: { placa: 'NRM-012' }, usuario: { nombre: 'Andrés Morales' }, kilometraje: 28150, aprobado: true, fecha_registro: '2026-08-27T07:30:00', observaciones_generales: 'Todo operativo.' },
        { id: 3, vehiculo: { placa: 'NRM-023' }, usuario: { nombre: 'Julián Gómez' }, kilometraje: 62400, aprobado: false, fecha_registro: '2026-08-27T08:00:00', observaciones_generales: 'Desgaste severo en pastillas de freno delanteras.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div className="crud-table-container">
        <div className="table-header-bar">
          <h3>Inspecciones Preoperacionales del Día</h3>
          <button className="btn-primary">
            <Plus size={16} />
            <span>Nuevo Chequeo Preoperacional</span>
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>VEHÍCULO</th>
              <th>INSPECTOR / CONDUCTOR</th>
              <th>KILOMETRAJE</th>
              <th>ESTADO INSPECCIÓN</th>
              <th>OBSERVACIONES</th>
              <th>FECHA Y HORA</th>
            </tr>
          </thead>
          <tbody>
            {chequeos.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: '700' }}>{c.vehiculo?.placa}</td>
                <td>{c.usuario?.nombre}</td>
                <td>{Number(c.kilometraje).toLocaleString()} km</td>
                <td>
                  <span className={`status-pill ${c.aprobado ? 'in-motion' : 'warning'}`}>
                    {c.aprobado ? 'Aprobado' : 'No Conforme (Alerta)'}
                  </span>
                </td>
                <td>{c.observaciones_generales || '—'}</td>
                <td>{new Date(c.fecha_registro).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
