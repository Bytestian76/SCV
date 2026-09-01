import React, { useState } from 'react';
import { Modal } from './Modal';
import { CheckCircle2, XCircle } from 'lucide-react';

export const ChequeoModal = ({ isOpen, onClose, onSave, vehiculos = [], conductores = [] }) => {
  const [vehiculoId, setVehiculoId] = useState(vehiculos[0]?.id || 1);
  const [conductorId, setConductorId] = useState(conductores[0]?.id || 1);
  const [kilometraje, setKilometraje] = useState(45200);
  const [observaciones, setObservaciones] = useState('');

  const [items, setItems] = useState([
    { seccion: 'frenos', item: 'Nivel líquido y pedal de frenos', valor: 'conforme', observacion: '' },
    { seccion: 'frenos', item: 'Freno de estacionamiento (emergencia)', valor: 'conforme', observacion: '' },
    { seccion: 'luces', item: 'Luces principales (bajas y altas)', valor: 'conforme', observacion: '' },
    { seccion: 'luces', item: 'Direccionales y luces de parqueo', valor: 'conforme', observacion: '' },
    { seccion: 'luces', item: 'Luces de freno y reversa', valor: 'conforme', observacion: '' },
    { seccion: 'llantas', item: 'Profundidad de labrado y presión', valor: 'conforme', observacion: '' },
    { seccion: 'llantas', item: 'Llanta de repuesto y tuercas', valor: 'conforme', observacion: '' },
    { seccion: 'fluidos', item: 'Nivel de aceite de motor', valor: 'conforme', observacion: '' },
    { seccion: 'fluidos', item: 'Líquido refrigerante', valor: 'conforme', observacion: '' },
    { seccion: 'cabina', item: 'Cinturones de seguridad y espejos', valor: 'conforme', observacion: '' },
    { seccion: 'cabina', item: 'Extintor vigente y botiquín', valor: 'conforme', observacion: '' },
  ]);

  const handleItemToggle = (index, nuevoValor) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index].valor = nuevoValor;
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      vehiculo_id: Number(vehiculoId),
      usuario_id: Number(conductorId),
      kilometraje: Number(kilometraje),
      observaciones_generales: observaciones,
      items,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Inspección Preoperacional de Seguridad">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Vehículo *
            </label>
            <select
              value={vehiculoId}
              onChange={(e) => setVehiculoId(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            >
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>{v.placa} - {v.marca} {v.modelo}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Conductor / Inspector *
            </label>
            <select
              value={conductorId}
              onChange={(e) => setConductorId(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
            >
              {conductores.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Kilometraje Actual *
          </label>
          <input
            type="number"
            required
            value={kilometraje}
            onChange={(e) => setKilometraje(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8eee9', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>
            Lista de Verificación Técnico-Mecánica
          </label>
          <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #e8eee9', borderRadius: '8px', padding: '8px' }}>
            {items.map((item, idx) => {
              const isConforme = item.valor === 'conforme';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderBottom: idx < items.length - 1 ? '1px solid #f0f4f1' : 'none',
                    background: isConforme ? '#ffffff' : '#fff5f5',
                    borderRadius: '6px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.item}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.seccion}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleItemToggle(idx, 'conforme')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: isConforme ? '#e6f7f0' : '#f0f4f1',
                        color: isConforme ? '#059669' : '#8a9c93',
                      }}
                    >
                      Conforme
                    </button>
                    <button
                      type="button"
                      onClick={() => handleItemToggle(idx, 'no_conforme')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: !isConforme ? '#fee2e2' : '#f0f4f1',
                        color: !isConforme ? '#dc2626' : '#8a9c93',
                      }}
                    >
                      No Conforme
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Observaciones Generales
          </label>
          <textarea
            rows="2"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Novedades u observaciones de la inspección..."
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
            Completar Inspección
          </button>
        </div>
      </form>
    </Modal>
  );
};
