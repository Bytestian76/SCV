import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Wrench, Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const MantenimientoPage = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [hallazgos, setHallazgos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ots, hal] = await Promise.all([api.getOrdenes(), api.getHallazgos()]);
      setOrdenes(ots);
      setHallazgos(hal);
    } catch (err) {
      console.warn('Cargando órdenes de prueba');
      setOrdenes([
        { id: 1, codigo: 'OT-2026-001', vehiculo: { placa: 'NRM-023' }, descripcion: 'Cambio de aceite y filtros', prioridad: 'alta', estado: 'en_progreso', responsable: { nombre: 'Juan Pérez' } },
        { id: 2, codigo: 'OT-2026-002', vehiculo: { placa: 'NRM-017' }, descripcion: 'Revisión general de frenos y suspensión', prioridad: 'media', estado: 'pendiente', responsable: { nombre: 'Juan Pérez' } },
        { id: 3, codigo: 'OT-2026-003', vehiculo: { placa: 'NRM-031' }, descripcion: 'Ajuste de embrague y calibración', prioridad: 'baja', estado: 'completada', responsable: { nombre: 'Juan Pérez' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div className="crud-table-container">
        <div className="table-header-bar">
          <h3>Órdenes de Trabajo de Taller y Mantenimiento</h3>
          <button className="btn-primary">
            <Plus size={16} />
            <span>Nueva Orden de Trabajo</span>
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>CÓDIGO OT</th>
              <th>VEHÍCULO</th>
              <th>DESCRIPCIÓN DE LA TAREA</th>
              <th>MECÁNICO RESPONSABLE</th>
              <th>PRIORIDAD</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((ot) => (
              <tr key={ot.id}>
                <td style={{ fontWeight: '700', color: '#059669' }}>{ot.codigo}</td>
                <td style={{ fontWeight: '700' }}>{ot.vehiculo?.placa}</td>
                <td>{ot.descripcion}</td>
                <td>{ot.responsable?.nombre || 'Sin asignar'}</td>
                <td>
                  <span style={{ 
                    padding: '3px 8px', 
                    borderRadius: '6px', 
                    fontSize: '11px', 
                    fontWeight: '700',
                    background: ot.prioridad === 'alta' ? '#fee2e2' : '#fef3c7',
                    color: ot.prioridad === 'alta' ? '#dc2626' : '#d97706'
                  }}>
                    {ot.prioridad.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${ot.estado === 'completada' ? 'in-motion' : (ot.estado === 'en_progreso' ? 'completed' : 'warning')}`}>
                    {ot.estado === 'en_progreso' ? 'En Progreso' : (ot.estado === 'completada' ? 'Completada' : 'Pendiente')}
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
