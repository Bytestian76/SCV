-- ===================================================================
-- SCV (Sistema de Control Vehicular) - DDL Schema Oficial PostgreSQL
-- Modelo de Datos Relacional v2.0 (Tabla Única de Usuarios e Integridad)
-- ===================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA UNIFICADA DE USUARIOS (Credenciales + Perfil Operativo)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'operario_movimientos', 'operario_chequeo', 'mecanico', 'jefe_mecanicos')),
    estado_activo BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Perfil operativo integrado (obligatorio o condicional para operarios/conductores)
    cedula VARCHAR(30) UNIQUE,
    licencia VARCHAR(50),
    categoria VARCHAR(10) CHECK (categoria IS NULL OR categoria IN ('A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3')),
    fecha_venc_licencia DATE,
    telefono VARCHAR(30),
    
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_cedula ON usuarios(cedula);

-- 2. REGISTRO MAESTRO DE VEHÍCULOS
CREATE TABLE IF NOT EXISTS vehiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    marca VARCHAR(60) NOT NULL,
    modelo VARCHAR(60) NOT NULL,
    año INTEGER CHECK (año > 1950 AND año < 2100),
    kilometraje INTEGER NOT NULL DEFAULT 0 CHECK (kilometraje >= 0),
    fecha_venc_soat DATE,
    fecha_venc_rtm DATE,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'en_taller', 'inactivo', 'baja')),
    observaciones TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado ON vehiculos(estado);

-- 3. MOVIMIENTOS (Logística de Despacho: Entradas y Salidas)
CREATE TABLE IF NOT EXISTS movimientos (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'salida')),
    vehiculo_id INTEGER NOT NULL REFERENCES vehiculos(id) ON DELETE RESTRICT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    kilometraje INTEGER NOT NULL CHECK (kilometraje >= 0),
    bascula_peso NUMERIC(10, 2),
    cantidad_sacas INTEGER DEFAULT 0 CHECK (cantidad_sacas >= 0),
    estado_cajon VARCHAR(50) DEFAULT 'bueno' CHECK (estado_cajon IN ('bueno', 'regular', 'sucio', 'dañado')),
    observaciones TEXT,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_movimientos_vehiculo ON movimientos(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_usuario ON movimientos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(fecha_registro);

-- 4. CHEQUEOS PREOPERACIONALES (Cabecera de Inspección de Seguridad)
CREATE TABLE IF NOT EXISTS chequeos (
    id SERIAL PRIMARY KEY,
    vehiculo_id INTEGER NOT NULL REFERENCES vehiculos(id) ON DELETE RESTRICT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    kilometraje INTEGER NOT NULL CHECK (kilometraje >= 0),
    fecha_venc_soat DATE,
    fecha_venc_rtm DATE,
    fecha_venc_extintor DATE,
    aprobado BOOLEAN NOT NULL DEFAULT TRUE,
    observaciones_generales TEXT,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chequeos_vehiculo ON chequeos(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_chequeos_usuario ON chequeos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_chequeos_fecha ON chequeos(fecha_registro);

-- 5. DETALLE DE ÍTEMS DE INSPECCIÓN PREOPERACIONAL
CREATE TABLE IF NOT EXISTS chequeo_items (
    id SERIAL PRIMARY KEY,
    chequeo_id INTEGER NOT NULL REFERENCES chequeos(id) ON DELETE CASCADE,
    seccion VARCHAR(60) NOT NULL,
    item VARCHAR(100) NOT NULL,
    valor VARCHAR(30) NOT NULL CHECK (valor IN ('conforme', 'no_conforme', 'no_aplica')),
    observacion TEXT
);

CREATE INDEX IF NOT EXISTS idx_chequeo_items_chequeo ON chequeo_items(chequeo_id);

-- 6. BANDEJA DE HALLAZGOS Y ANOMALÍAS MECÁNICAS
CREATE TABLE IF NOT EXISTS hallazgos (
    id SERIAL PRIMARY KEY,
    vehiculo_id INTEGER NOT NULL REFERENCES vehiculos(id) ON DELETE RESTRICT,
    usuario_reporta_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    chequeo_item_id INTEGER REFERENCES chequeo_items(id) ON DELETE SET NULL,
    origen VARCHAR(30) NOT NULL CHECK (origen IN ('chequeo', 'movimiento', 'manual')),
    descripcion TEXT NOT NULL,
    criticidad VARCHAR(20) NOT NULL DEFAULT 'media' CHECK (criticidad IN ('baja', 'media', 'alta', 'critica')),
    estado VARCHAR(30) NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_orden', 'resuelto', 'descartado')),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hallazgos_vehiculo ON hallazgos(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_hallazgos_estado ON hallazgos(estado);
CREATE INDEX IF NOT EXISTS idx_hallazgos_criticidad ON hallazgos(criticidad);

-- 7. ÓRDENES DE TRABAJO (Mantenimiento y Reparación de Flota)
CREATE TABLE IF NOT EXISTS ordenes_trabajo (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    vehiculo_id INTEGER NOT NULL REFERENCES vehiculos(id) ON DELETE RESTRICT,
    hallazgo_id INTEGER REFERENCES hallazgos(id) ON DELETE SET NULL,
    creado_por_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    responsable_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    prioridad VARCHAR(20) NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'cancelada')),
    descripcion TEXT NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ordenes_codigo ON ordenes_trabajo(codigo);
CREATE INDEX IF NOT EXISTS idx_ordenes_vehiculo ON ordenes_trabajo(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_responsable ON ordenes_trabajo(responsable_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes_trabajo(estado);

-- 8. ACTIVIDADES DE LA ORDEN DE TRABAJO
CREATE TABLE IF NOT EXISTS ordenes_actividades (
    id SERIAL PRIMARY KEY,
    orden_id INTEGER NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada')),
    completado_por_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_completado TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_actividades_orden ON ordenes_actividades(orden_id);

-- 9. CONTROL DE COSTOS DE MANTENIMIENTO
CREATE TABLE IF NOT EXISTS ordenes_costos (
    id SERIAL PRIMARY KEY,
    orden_id INTEGER NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    tipo_gasto VARCHAR(50) NOT NULL CHECK (tipo_gasto IN ('repuesto', 'mano_obra', 'servicio_externo', 'herramienta', 'otro')),
    descripcion VARCHAR(200) NOT NULL,
    cantidad NUMERIC(10, 2) NOT NULL DEFAULT 1.0 CHECK (cantidad > 0),
    valor_unitario NUMERIC(14, 2) NOT NULL CHECK (valor_unitario >= 0),
    total_calculado NUMERIC(14, 2) NOT NULL CHECK (total_calculado >= 0),
    registrado_por_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_costos_orden ON ordenes_costos(orden_id);

-- 10. EVIDENCIAS FOTOGRÁFICAS Y DOCUMENTALES
CREATE TABLE IF NOT EXISTS ordenes_evidencias (
    id SERIAL PRIMARY KEY,
    orden_id INTEGER NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('foto_antes', 'foto_durante', 'foto_despues', 'factura', 'documento', 'otro')),
    ruta_archivo VARCHAR(500) NOT NULL,
    descripcion TEXT,
    subido_por_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evidencias_orden ON ordenes_evidencias(orden_id);

-- 11. AUDITORÍA INMUTABLE (Bitácora Forense de Cambios)
CREATE TABLE IF NOT EXISTS ordenes_historial (
    id SERIAL PRIMARY KEY,
    orden_id INTEGER NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(60) NOT NULL,
    campo_modificado VARCHAR(100),
    valor_anterior TEXT,
    valor_nuevo TEXT,
    ip_usuario VARCHAR(50),
    user_agent VARCHAR(255),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_historial_orden ON ordenes_historial(orden_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON ordenes_historial(fecha_registro);

-- 12. SEGURIDAD: CONTROL DE TOKENS REVOCADOS (Blacklist JWT)
CREATE TABLE IF NOT EXISTS tokens_revocados (
    id SERIAL PRIMARY KEY,
    jti VARCHAR(255) UNIQUE NOT NULL,
    expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_revocacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tokens_revocados_jti ON tokens_revocados(jti);
