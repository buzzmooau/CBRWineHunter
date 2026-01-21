"""
Configuration settings for CBR Wine Hunter
"""
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    database_url: str = Field(
        default="postgresql://wineuser:password@localhost:5432/cbr_wine_hunter",
        alias="DATABASE_URL"
    )
    
    # API
    api_host: str = Field(default="0.0.0.0", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")
    
    # Security
    secret_key: str = Field(default="your-secret-key-here", alias="SECRET_KEY")
    
    # CORS
    cors_origins: List[str] = Field(
        default=["http://localhost:5173", "http://192.168.50.121:5173"],
        alias="CORS_ORIGINS"
    )
    
    # Admin
    admin_username: str = Field(default="admin", alias="ADMIN_USERNAME")
    admin_password: str = Field(default="admin123", alias="ADMIN_PASSWORD")
    
    # Environment
    environment: str = Field(default="development", alias="ENVIRONMENT")
    
    class Config:
        env_file = ".env"
        populate_by_name = True  # Allow both field name and alias
        extra = "allow"  # Allow extra fields from .env that we don't define


settings = Settings()
