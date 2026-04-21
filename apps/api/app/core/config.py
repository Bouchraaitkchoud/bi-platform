# apps/api/app/core/config.py
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator
import json


class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "BI Platform API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str
    ENCRYPTION_KEY: str
    ALGORITHM: str = "HS256"
    # Token expiry times are now hardcoded in security.py (24h access, 7d refresh)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # Deprecated - kept for backward compat
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "test"
    POSTGRES_DB: str = "bi_platform"
    DATABASE_URL: Optional[str] = None
    
    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict) -> str:
        if isinstance(v, str):
            return v
        return f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}/{values.get('POSTGRES_DB')}"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str):
            # Handle JSON array strings
            if v.startswith("["):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    return [i.strip() for i in v.split(",")]
            # Handle comma-separated strings
            else:
                return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return []
    
    # Storage
    STORAGE_TYPE: str = "local"  # local, s3
    STORAGE_PATH: str = "./storage"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_BUCKET_NAME: Optional[str] = None
    AWS_REGION: str = "eu-west-1"
    
    # Email/SMTP
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@biplatform.com"
    SMTP_TLS: bool = True
    
    # Allowed hosts
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = 'allow'


settings = Settings()
