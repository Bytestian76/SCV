import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeftRight, Plus, Search, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { MovimientoModal } from '../components/modals/MovimientoModal';

export const MovimientosPage = ({ currentUser }) => {
  const [movimientos, setMovimientos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState('salida');

  useEffect(() => {
    loadMovimientos();
    loadAuxData();
  }, []);

  const loadAuxData = async () => {
    try {
      const [vList, uList] = await Promise.all([
        api.getVehiculos(),
        api.getUsuarios(),
      ]);
      setVehiculos(vList || []);
      setConductores(uList || []);
    } catch (e) {
      console.warn('Error cargando datos auxiliares para movimientos', e);
    }
  };

  const loadMovimientos = async () => {
    try {
      setLoading(true);
      const data = await api.getMovimientos();
      setMovimientos(data);
    } catch (err) {
      console.warn('Cargando movimientos de prueba');
      setMovimientos([
        { id: 1, tipo: 'salida', vehiculo: { placa: 'NRM-045' }, usuario: { nombre: 'Carlos Rodríguez' }, kilometraje: 45200, bascula_peso: 12450, cantidad_sacas: 48, estado_cajon: 'bueno', observaciones: 'Centro Logístico → Planta Norte', fecha_registro: '2026-08-27T12:45:00' },
        { id: 2, tipo: 'entrada', vehiculo: { placa: 'NRM-012' }, usuario: { nombre: 'Andrés Morales' }, kilometraje: 28150, bascula_peso: 18200, cantidad_sacas: 72, estado_cajon: 'bueno', observaciones: 'Planta Sur → Centro Logístico', fecha_registro: '2026-08-27T12:30:00' },
        { id: 3, tipo: 'entrada', vehiculo: { placa: 'NRM-023' }, usuario: { nombre: 'Julián Gómez' }, kilometraje: 62400, bascula_peso: 15100, cantidad_sacas: 60, estado_cajon: 'regular', observaciones: 'Planta Norte → Planta Sur', fecha_registro: '2026-08-27T12:15:00' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMovimiento = async (formData) => {
    try {
      await api.createMovimiento(formData);
      await loadMovimientos();
    } catch (err) {
      console.error('Error al registrar movimiento:', err);
      alert(err.message || 'Error al registrar movimiento');
    }
  };

  const openModal = (tipo) => {
    setModalTipo(tipo);
    setIsModalOpen(true);
  };

  const filtered = movimientos.filter(m => 
    (m.vehiculo?.placa && m.vehiculo.placa.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.usuario?.nombre && m.usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.observaciones && m.observaciones.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-body">
      <div className="crud-table-container">
        <div className="table-header-bar">
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Buscar movimiento por placa o conductor..."
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

          {['admin', 'operario_movimientos'].includes(currentUser?.rol) && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ background: '#059669' }}
                onClick={() => openModal('salida')}
              >
                <ArrowUpRight size={16} />
                <span>Registrar Salida</span>
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ background: '#2563eb' }}
                onClick={() => openModal('entrada')}
              >
                <ArrowDownLeft size={16} />
                <span>Registrar Entrada</span>
              </button>
            </div>
          )}
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>TIPO</th>
              <th>VEHÍCULO</th>
              <th>CONDUCTOR / OPERARIO</th>
              <th>KILOMETRAJE</th>
              <th>BÁSCULA (KG)</th>
              <th>SACAS</th>
              <th>ESTADO CAJÓN</th>
              <th>RUTA / OBSERVACIÓN</th>
              <th>FECHA Y HORA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const isSalida = m.tipo === 'salida';
              const dateStr = new Date(m.fecha_registro).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              return (
                <tr key={m.id}>
                  <td>
                    <span className={`status-pill ${isSalida ? 'in-motion' : 'completed'}`}>
                      {isSalida ? 'Salida' : 'Entrada'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{m.vehiculo?.placa}</td>
                  <td>{m.usuario?.nombre}</td>
                  <td>{Number(m.kilometraje).toLocaleString()} km</td>
                  <td>{m.bascula_peso ? `${Number(m.bascula_peso).toLocaleString()} kg` : 'N/D'}</td>
                  <td>{m.cantidad_sacas || 0}</td>
                  <td>{m.estado_cajon}</td>
                  <td>{m.observaciones || '—'}</td>
                  <td>{dateStr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <MovimientoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMovimiento}
        tipoDefault={modalTipo}
        vehiculos={vehiculos}
        conductores={conductores}
      />
    </div>
  );
};
