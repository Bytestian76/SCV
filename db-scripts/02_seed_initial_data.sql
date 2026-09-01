-- ===================================================================
-- SCV (Sistema de Control Vehicular) - Semillas y Datos de Prueba Iniciales
-- ===================================================================

-- Usuario Administrador Inicial
-- Email: admin@scv.local / Password: admin123
INSERT INTO usuarios (nombre, email, password_hash, rol, estado_activo, cedula, telefono)
VALUES 
('Administrador Principal', 'admin@scv.local', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin', TRUE, '1000000001', '3001234567'),
('Operario Despacho 1', 'despacho@scv.local', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'operario_movimientos', TRUE, '1000000002', '3002345678'),
('Carlos Rodríguez (Conductor)', 'carlos.chofer@scv.local', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'operario_chequeo', TRUE, '1000000003', '3003456789'),
('Juan Pérez (Mecánico)', 'mecanico@scv.local', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'mecanico', TRUE, '1000000004', '3004567890'),
('Jefe de Taller', 'jefe.taller@scv.local', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'jefe_mecanicos', TRUE, '1000000005', '3005678901')
ON CONFLICT (email) DO NOTHING;

-- Actualizar licencia del conductor
UPDATE usuarios 
SET licencia = 'LIC-987654321', categoria = 'C2', fecha_venc_licencia = '2028-12-31'
WHERE email = 'carlos.chofer@scv.local';

-- Vehículos Iniciales de Flota
INSERT INTO vehiculos (placa, marca, modelo, año, kilometraje, fecha_venc_soat, fecha_venc_rtm, estado)
VALUES
('TRK-101', 'Chevrolet', 'NPR Turbo', 2022, 45200, '2027-05-15', '2027-04-10', 'activo'),
('TRK-102', 'Hino', 'Dutro 300', 2023, 28150, '2027-08-20', '2027-07-15', 'activo'),
('TRK-103', 'Foton', 'Aumark S', 2021, 62400, '2026-11-30', '2026-10-25', 'activo')
ON CONFLICT (placa) DO NOTHING;
