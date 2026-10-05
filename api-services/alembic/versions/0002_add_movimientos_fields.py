"""add auxiliar and proveedor to movimientos

Revision ID: 0002_add_movimientos_fields
Revises: 0001_initial_schema
Create Date: 2026-10-05 15:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0002_add_movimientos_fields'
down_revision: Union[str, None] = '0001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('movimientos', sa.Column('auxiliar', sa.String(length=150), nullable=True))
    op.add_column('movimientos', sa.Column('proveedor', sa.String(length=150), nullable=True))
    op.alter_column('movimientos', 'kilometraje', existing_type=sa.Integer(), nullable=True)


def downgrade() -> None:
    op.alter_column('movimientos', 'kilometraje', existing_type=sa.Integer(), nullable=False)
    op.drop_column('movimientos', 'proveedor')
    op.drop_column('movimientos', 'auxiliar')
