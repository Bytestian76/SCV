import React, { useState } from 'react';
import { Modal } from './Modal';

export const OrdenTrabajoModal = ({ isOpen, onClose, onSave, vehiculos = [], mecanicos = [] }) => {
  const nextCode = `OT-2026-${Math.floor(100 + Math.random() * 900)}`;
  const [formData, setFormData] = useState({
    codigo: nextCode,
    vehiculo_id: vehiculos[0]?.id || 1,
    responsable_id: mecanicos[0]?.id || 1,
    prioridad: 'media',
    estado: 'pendiente',
    descripcion: '',
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
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Orden de Trabajo (Taller)">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Código OT *
            </label>
            <input
              type="text"
              name="codigo"
              required
              value={formData.codigo}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px', background: '#fafbfa', fontWeight: '700' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Prioridad *
            </label>
            <select
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Vehículo Afectado *
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

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Mecánico Asignado
            </label>
            <select
              name="responsable_id"
              value={formData.responsable_id}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            >
              {mecanicos.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Descripción de la Falla o Tarea Requerida *
          </label>
          <textarea
            name="descripcion"
            required
            rows="3"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Detalle los trabajos a ejecutar, repuestos o inspección a realizar..."
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px', resize: 'none' }}
          ></textarea>
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
          >
            Asignar Orden de Trabajo
          </button>
        </div>
      </form>
    </Modal>
  );
};
