"""initial schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-08-27 10:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. usuarios
    op.create_table(
        'usuarios',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('nombre', sa.String(length=150), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('rol', sa.String(length=50), nullable=False),
        sa.Column('estado_activo', sa.Boolean(), nullable=False, default=True),
        sa.Column('cedula', sa.String(length=30), nullable=True),
        sa.Column('licencia', sa.String(length=50), nullable=True),
        sa.Column('categoria', sa.String(length=10), nullable=True),
        sa.Column('fecha_venc_licencia', sa.Date(), nullable=True),
        sa.Column('telefono', sa.String(length=30), nullable=True),
        sa.Column('fecha_creacion', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('fecha_actualizacion', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cedula'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_usuarios_email'), 'usuarios', ['email'], unique=True)
    op.create_index(op.f('ix_usuarios_id'), 'usuarios', ['id'], unique=False)
    op.create_index(op.f('ix_usuarios_rol'), 'usuarios', ['rol'], unique=False)
    op.create_index(op.f('ix_usuarios_cedula'), 'usuarios', ['cedula'], unique=False)

    # 2. vehiculos
    op.create_table(
        'vehiculos',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('placa', sa.String(length=10), nullable=False),
        sa.Column('marca', sa.String(length=60), nullable=False),
        sa.Column('modelo', sa.String(length=60), nullable=False),
        sa.Column('año', sa.Integer(), nullable=True),
        sa.Column('kilometraje', sa.Integer(), nullable=False, default=0),
        sa.Column('fecha_venc_soat', sa.Date(), nullable=True),
        sa.Column('fecha_venc_rtm', sa.Date(), nullable=True),
        sa.Column('estado', sa.String(length=30), nullable=False, default='activo'),
        sa.Column('observaciones', sa.Text(), nullable=True),
        sa.Column('fecha_creacion', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('placa')
    )
    op.create_index(op.f('ix_vehiculos_id'), 'vehiculos', ['id'], unique=False)
    op.create_index(op.f('ix_vehiculos_placa'), 'vehiculos', ['placa'], unique=True)
    op.create_index(op.f('ix_vehiculos_estado'), 'vehiculos', ['estado'], unique=False)

    # 3. movimientos
    op.create_table(
        'movimientos',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('tipo', sa.String(length=20), nullable=False),
        sa.Column('vehiculo_id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), nullable=False),
        sa.Column('kilometraje', sa.Integer(), nullable=False),
        sa.Column('bascula_peso', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('cantidad_sacas', sa.Integer(), nullable=False, default=0),
        sa.Column('estado_cajon', sa.String(length=50), nullable=False, default='bueno'),
        sa.Column('observaciones', sa.Text(), nullable=True),
        sa.Column('fecha_registro', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['vehiculo_id'], ['vehiculos.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_movimientos_fecha_registro'), 'movimientos', ['fecha_registro'], unique=False)
    op.create_index(op.f('ix_movimientos_id'), 'movimientos', ['id'], unique=False)
    op.create_index(op.f('ix_movimientos_usuario_id'), 'movimientos', ['usuario_id'], unique=False)
    op.create_index(op.f('ix_movimientos_vehiculo_id'), 'movimientos', ['vehiculo_id'], unique=False)

    # 4. chequeos
    op.create_table(
        'chequeos',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('vehiculo_id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), nullable=False),
        sa.Column('kilometraje', sa.Integer(), nullable=False),
        sa.Column('fecha_venc_soat', sa.Date(), nullable=True),
        sa.Column('fecha_venc_rtm', sa.Date(), nullable=True),
        sa.Column('fecha_venc_extintor', sa.Date(), nullable=True),
        sa.Column('aprobado', sa.Boolean(), nullable=False, default=True),
        sa.Column('observaciones_generales', sa.Text(), nullable=True),
        sa.Column('fecha_registro', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['vehiculo_id'], ['vehiculos.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chequeos_fecha_registro'), 'chequeos', ['fecha_registro'], unique=False)
    op.create_index(op.f('ix_chequeos_id'), 'chequeos', ['id'], unique=False)
    op.create_index(op.f('ix_chequeos_usuario_id'), 'chequeos', ['usuario_id'], unique=False)
    op.create_index(op.f('ix_chequeos_vehiculo_id'), 'chequeos', ['vehiculo_id'], unique=False)

    # 5. chequeo_items
    op.create_table(
        'chequeo_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('chequeo_id', sa.Integer(), nullable=False),
        sa.Column('seccion', sa.String(length=60), nullable=False),
        sa.Column('item', sa.String(length=100), nullable=False),
        sa.Column('valor', sa.String(length=30), nullable=False),
        sa.Column('observacion', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['chequeo_id'], ['chequeos.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chequeo_items_chequeo_id'), 'chequeo_items', ['chequeo_id'], unique=False)
    op.create_index(op.f('ix_chequeo_items_id'), 'chequeo_items', ['id'], unique=False)

    # 6. hallazgos
    op.create_table(
        'hallazgos',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('vehiculo_id', sa.Integer(), nullable=False),
        sa.Column('usuario_reporta_id', sa.Integer(), nullable=False),
        sa.Column('chequeo_item_id', sa.Integer(), nullable=True),
        sa.Column('origen', sa.String(length=30), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=False),
        sa.Column('criticidad', sa.String(length=20), nullable=False, default='media'),
        sa.Column('estado', sa.String(length=30), nullable=False, default='abierto'),
        sa.Column('fecha_registro', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['chequeo_item_id'], ['chequeo_items.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['usuario_reporta_id'], ['usuarios.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['vehiculo_id'], ['vehiculos.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_hallazgos_criticidad'), 'hallazgos', ['criticidad'], unique=False)
    op.create_index(op.f('ix_hallazgos_estado'), 'hallazgos', ['estado'], unique=False)
    op.create_index(op.f('ix_hallazgos_id'), 'hallazgos', ['id'], unique=False)
    op.create_index(op.f('ix_hallazgos_vehiculo_id'), 'hallazgos', ['vehiculo_id'], unique=False)

    # 7. ordenes_trabajo
    op.create_table(
        'ordenes_trabajo',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('codigo', sa.String(length=30), nullable=False),
        sa.Column('vehiculo_id', sa.Integer(), nullable=False),
        sa.Column('hallazgo_id', sa.Integer(), nullable=True),
        sa.Column('creado_por_id', sa.Integer(), nullable=False),
        sa.Column('responsable_id', sa.Integer(), nullable=True),
        sa.Column('prioridad', sa.String(length=20), nullable=False, default='media'),
        sa.Column('estado', sa.String(length=30), nullable=False, default='pendiente'),
        sa.Column('descripcion', sa.Text(), nullable=False),
        sa.Column('fecha_inicio', sa.DateTime(timezone=True), nullable=True),
        sa.Column('fecha_cierre', sa.DateTime(timezone=True), nullable=True),
        sa.Column('fecha_creacion', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['creado_por_id'], ['usuarios.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['hallazgo_id'], ['hallazgos.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['responsable_id'], ['usuarios.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['vehiculo_id'], ['vehiculos.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('codigo')
    )
    op.create_index(op.f('ix_ordenes_trabajo_codigo'), 'ordenes_trabajo', ['codigo'], unique=True)
    op.create_index(op.f('ix_ordenes_trabajo_estado'), 'ordenes_trabajo', ['estado'], unique=False)
    op.create_index(op.f('ix_ordenes_trabajo_id'), 'ordenes_trabajo', ['id'], unique=False)
    op.create_index(op.f('ix_ordenes_trabajo_responsable_id'), 'ordenes_trabajo', ['responsable_id'], unique=False)
    op.create_index(op.f('ix_ordenes_trabajo_vehiculo_id'), 'ordenes_trabajo', ['vehiculo_id'], unique=False)

    # 8. ordenes_actividades
    op.create_table(
        'ordenes_actividades',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('orden_id', sa.Integer(), nullable=False),
        sa.Column('titulo', sa.String(length=150), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('estado', sa.String(length=30), nullable=False, default='pendiente'),
        sa.Column('completado_por_id', sa.Integer(), nullable=True),
        sa.Column('fecha_completado', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['completado_por_id'], ['usuarios.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['orden_id'], ['ordenes_trabajo.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ordenes_actividades_id'), 'ordenes_actividades', ['id'], unique=False)
    op.create_index(op.f('ix_ordenes_actividades_orden_id'), 'ordenes_actividades', ['orden_id'], unique=False)

    # 9. ordenes_costos
    op.create_table(
        'ordenes_costos',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('orden_id', sa.Integer(), nullable=False),
        sa.Column('tipo_gasto', sa.String(length=50), nullable=False),
        sa.Column('descripcion', sa.String(length=200), nullable=False),
        sa.Column('cantidad', sa.Numeric(precision=10, scale=2), nullable=False, default=1.0),
        sa.Column('valor_unitario', sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column('total_calculado', sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column('registrado_por_id', sa.Integer(), nullable=True),
        sa.Column('fecha_registro', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['orden_id'], ['ordenes_trabajo.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['registrado_por_id'], ['usuarios.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ordenes_costos_id'), 'ordenes_costos', ['id'], unique=False)
    op.create_index(op.f('ix_ordenes_costos_orden_id'), 'ordenes_costos', ['orden_id'], unique=False)

    # 10. ordenes_evidencias
    op.create_table(
        'ordenes_evidencias',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('orden_id', sa.Integer(), nullable=False),
        sa.Column('tipo', sa.String(length=50), nullable=False),
        sa.Column('ruta_archivo', sa.String(length=500), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('subido_por_id', sa.Integer(), nullable=True),
        sa.Column('fecha_registro', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['orden_id'], ['ordenes_trabajo.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['subido_por_id'], ['usuarios.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ordenes_evidencias_id'), 'ordenes_evidencias', ['id'], unique=False)
    op.create_index(op.f('ix_ordenes_evidencias_orden_id'), 'ordenes_evidencias', ['orden_id'], unique=False)

    # 11. ordenes_historial (Auditoría Inmutable)
    op.create_table(
        'ordenes_historial',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('orden_id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), nullable=True),
        sa.Column('accion', sa.String(length=60), nullable=False),
        sa.Column('campo_modificado', sa.String(length=100), nullable=True),
        sa.Column('valor_anterior', sa.Text(), nullable=True),
        sa.Column('valor_nuevo', sa.Text(), nullable=True),
        sa.Column('ip_usuario', sa.String(length=50), nullable=True),
        sa.Column('user_agent', sa.String(length=255), nullable=True),
        sa.Column('fecha_registro', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['orden_id'], ['ordenes_trabajo.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ordenes_historial_fecha_registro'), 'ordenes_historial', ['fecha_registro'], unique=False)
    op.create_index(op.f('ix_ordenes_historial_id'), 'ordenes_historial', ['id'], unique=False)
    op.create_index(op.f('ix_ordenes_historial_orden_id'), 'ordenes_historial', ['orden_id'], unique=False)

    # 12. tokens_revocados
    op.create_table(
        'tokens_revocados',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('jti', sa.String(length=255), nullable=False),
        sa.Column('expiracion', sa.DateTime(timezone=True), nullable=False),
        sa.Column('fecha_revocacion', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('jti')
    )
    op.create_index(op.f('ix_tokens_revocados_id'), 'tokens_revocados', ['id'], unique=False)
    op.create_index(op.f('ix_tokens_revocados_jti'), 'tokens_revocados', ['jti'], unique=True)


def downgrade() -> None:
    op.drop_table('tokens_revocados')
    op.drop_table('ordenes_historial')
    op.drop_table('ordenes_evidencias')
    op.drop_table('ordenes_costos')
    op.drop_table('ordenes_actividades')
    op.drop_table('ordenes_trabajo')
    op.drop_table('hallazgos')
    op.drop_table('chequeo_items')
    op.drop_table('chequeos')
    op.drop_table('movimientos')
    op.drop_table('vehiculos')
    op.drop_table('usuarios')
