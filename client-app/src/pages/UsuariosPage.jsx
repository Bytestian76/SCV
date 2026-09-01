import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Plus, Search, ShieldCheck } from 'lucide-react';

export const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await api.getUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.warn('Cargando usuarios de prueba');
      setUsuarios([
        { id: 1, nombre: 'Administrador Principal', email: 'admin@normetales.com', rol: 'admin', estado_activo: true },
        { id: 2, nombre: 'Operario Despacho 1', email: 'despacho@normetales.com', rol: 'operario_movimientos', estado_activo: true },
        { id: 3, nombre: 'Carlos Rodríguez', email: 'carlos.chofer@normetales.com', rol: 'operario_chequeo', estado_activo: true },
        { id: 4, nombre: 'Juan Pérez', email: 'mecanico@normetales.com', rol: 'mecanico', estado_activo: true },
        { id: 5, nombre: 'Jefe de Taller', email: 'jefe.taller@normetales.com', rol: 'jefe_mecanicos', estado_activo: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div className="crud-table-container">
        <div className="table-header-bar">
          <h3>Usuarios y Permisos del Sistema</h3>
          <button className="btn-primary">
            <Plus size={16} />
            <span>Nuevo Usuario</span>
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>NOMBRE</th>
              <th>CORREO ELECTRÓNICO</th>
              <th>ROL / PERFIL</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: '700' }}>{u.nombre}</td>
                <td>{u.email}</td>
                <td>
                  <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                    {u.rol.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${u.estado_activo ? 'in-motion' : 'warning'}`}>
                    {u.estado_activo ? 'Activo' : 'Inactivo'}
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
