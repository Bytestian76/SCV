from datetime import datetime
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class TokenRevocado(Base):
    __tablename__ = "tokens_revocados"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    jti: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    expiracion: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    fecha_revocacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
