"""
Configuración de la aplicación
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuración del proyecto"""
    
    # App
    APP_NAME: str = "SCV API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Endpoints expuestos
    ENABLE_API_DOCS: bool = False
    ENABLE_TEST_DB_ENDPOINT: bool = False
    CORS_ALLOWED_ORIGINS: str = "*"
    
    # Security
    SECRET_KEY: str = "scv-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 360  # 6 horas
    LOGIN_RATE_LIMIT_MAX_ATTEMPTS: int = 5
    LOGIN_RATE_LIMIT_WINDOW_SECONDS: int = 60
    
    # Database
    DATABASE_URL: str = "sqlite:///./data/scv.db"

    # Web Push (VAPID)
    VAPID_PUBLIC_KEY: str = "BJpbFxN3FZBDCIgvdKUHS3nPCeMBwklO1yYeQW9vBBNrRQee8u9IMN7IBZULhwJdFhIOFNaVNF-3ySri8KEEdOA"
    VAPID_PRIVATE_KEY: str = "********"
    VAPID_CLAIM_EMAIL: str = "admin@scv.normetales.xyz"
    
    class Config:
        env_file = ".env"
settings = Settings()
