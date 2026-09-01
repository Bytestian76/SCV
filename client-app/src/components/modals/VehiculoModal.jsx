import React, { useState } from 'react';
import { Modal } from './Modal';

export const VehiculoModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    kilometraje: 0,
    fecha_venc_soat: '',
    fecha_venc_rtm: '',
    estado: 'activo',
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
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nuevo Vehículo">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Placa *
            </label>
            <input
              type="text"
              name="placa"
              required
              placeholder="Ej. NRM-045"
              value={formData.placa}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            >
              <option value="activo">Activo</option>
              <option value="en_taller">En taller</option>
              <option value="inactivo">Inactivo</option>
              <option value="baja">Fuera de servicio</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Marca *
            </label>
            <input
              type="text"
              name="marca"
              required
              placeholder="Ej. Chevrolet"
              value={formData.marca}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Modelo *
            </label>
            <input
              type="text"
              name="modelo"
              required
              placeholder="Ej. NPR Turbo"
              value={formData.modelo}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Año
            </label>
            <input
              type="number"
              name="año"
              value={formData.año}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Kilometraje Actual
            </label>
            <input
              type="number"
              name="kilometraje"
              value={formData.kilometraje}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Vencimiento SOAT
            </label>
            <input
              type="date"
              name="fecha_venc_soat"
              value={formData.fecha_venc_soat}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Vencimiento RTM
            </label>
            <input
              type="date"
              name="fecha_venc_rtm"
              value={formData.fecha_venc_rtm}
              onChange={handleChange}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Observaciones
          </label>
          <textarea
            name="observaciones"
            rows="2"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Notas sobre el estado del vehículo..."
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
            Guardar Vehículo
          </button>
        </div>
      </form>
    </Modal>
  );
};
