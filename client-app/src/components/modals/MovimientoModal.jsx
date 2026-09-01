import React, { useState } from 'react';
import { Modal } from './Modal';

export const MovimientoModal = ({ isOpen, onClose, onSave, tipoDefault = 'salida', vehiculos = [], conductores = [] }) => {
  const [formData, setFormData] = useState({
    tipo: tipoDefault,
    vehiculo_id: vehiculos[0]?.id || 1,
    usuario_id: conductores[0]?.id || 1,
    kilometraje: 45000,
    bascula_peso: 15000,
    cantidad_sacas: 40,
    estado_cajon: 'bueno',
    observaciones: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Registrar ${formData.tipo === 'salida' ? 'Salida' : 'Entrada'} de Patio`}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Tipo de Movimiento
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            >
              <option value="salida">Salida</option>
              <option value="entrada">Entrada</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Vehículo (Placa) *
            </label>
            <select
              name="vehiculo_id"
              value={formData.vehiculo_id}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            >
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>{v.placa} - {v.marca} {v.modelo}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Conductor Responsable *
            </label>
            <select
              name="usuario_id"
              value={formData.usuario_id}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            >
              {conductores.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} ({c.cedula || 'Conductor'})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Kilometraje Odómetro *
            </label>
            <input
              type="number"
              name="kilometraje"
              required
              value={formData.kilometraje}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Peso Báscula (kg)
            </label>
            <input
              type="number"
              step="0.01"
              name="bascula_peso"
              value={formData.bascula_peso}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Cantidad Sacas
            </label>
            <input
              type="number"
              name="cantidad_sacas"
              value={formData.cantidad_sacas}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Estado Cajón
            </label>
            <select
              name="estado_cajon"
              value={formData.estado_cajon}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            >
              <option value="bueno">Bueno</option>
              <option value="regular">Regular</option>
              <option value="sucio">Sucio</option>
              <option value="dañado">Dañado</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Ruta / Observaciones
          </label>
          <input
            type="text"
            name="observaciones"
            placeholder="Ej. Centro Logístico → Planta Norte"
            value={formData.observaciones}
            onChange={handleChange}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #e8eee9', background: '#fff', fontSize: '13px', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            style={{ background: formData.tipo === 'salida' ? '#059669' : '#2563eb' }}
          >
            Confirmar {formData.tipo === 'salida' ? 'Salida' : 'Entrada'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
