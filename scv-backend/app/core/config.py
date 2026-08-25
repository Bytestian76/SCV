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
    ENV: str = "production"

    # Endpoints expuestos
    ENABLE_API_DOCS: bool = False
    ENABLE_TEST_DB_ENDPOINT: bool = False
    CORS_ALLOWED_ORIGINS: str = "*"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 360  # 6 horas
    LOGIN_RATE_LIMIT_MAX_ATTEMPTS: int = 5
    LOGIN_RATE_LIMIT_WINDOW_SECONDS: int = 60
    
    # Database
    DATABASE_URL: str

    # Web Push (VAPID)
    VAPID_PUBLIC_KEY: str = "BOf2u5sAS3d6w-kz84ZlKpn1RVouKuZtSrm4n_RhD3nfN6COIntgrvvYmB5V_p8wypfSL4BS_lbDEhokvCRa1e8"
    VAPID_PRIVATE_KEY: str
    VAPID_CLAIM_EMAIL: str = "admin@scv.normetales.xyz"
    
    class Config:
        env_file = ".env"
settings = Settings()
