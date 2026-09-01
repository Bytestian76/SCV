from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SCV - Sistema de Control Vehicular API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    ENABLE_API_DOCS: bool = True

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://scv_user:scv_password_2026@localhost:5432/scv_database"

    # Security
    SECRET_KEY: str = "scv_super_secret_jwt_key_2026_default_replace_in_prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 horas

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost",
        "http://localhost:80",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = SettingsConfigDict(
        env_file=(".env", "api-services/.env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()
