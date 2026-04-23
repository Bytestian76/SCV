"""
Configuración de la aplicación
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configuración del proyecto"""
    
    # App
    APP_NAME: str = "SCV API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Endpoints expuestos
    ENABLE_API_DOCS: bool = False
    ENABLE_TEST_DB_ENDPOINT: bool = False
    
    # Security
    SECRET_KEY: str = "scv-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # 15 minutos
    LOGIN_RATE_LIMIT_MAX_ATTEMPTS: int = 5
    LOGIN_RATE_LIMIT_WINDOW_SECONDS: int = 60
    
    # Database
    DATABASE_URL: str = "sqlite:///./scv.db"
    
    class Config:
        env_file = ".env"
settings = Settings()
