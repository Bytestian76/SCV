"""Schemas Pydantic - Push Subscriptions"""

from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class PushSubscriptionCreate(BaseModel):
    endpoint: str
    auth: str
    p256dh: str
    user_agent: Optional[str] = None


class PushSubscriptionResponse(BaseModel):
    id: int
    usuario_id: int
    endpoint: str
    user_agent: Optional[str] = None
    fecha_creacion: datetime

    class Config:
        from_attributes = True
