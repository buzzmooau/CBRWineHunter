"""
Configuration management using Pydantic Settings
Loads configuration from environment variables
"""
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database Configuration
    database_url: str = Field(
        default="postgresql://wineuser:password@localhost:5432/cbr_wine_hunter",
        alias="DATABASE_URL"
    )
    database_host: str = Field(default="localhost", alias="DATABASE_HOST")
    database_port: int = Field(default=5432, alias="DATABASE_PORT")
    database_name: str = Field(default="cbr_wine_hunter", alias="DATABASE_NAME")
    database_user: str = Field(default="wineuser", alias="DATABASE_USER")
    database_password: str = Field(default="password", alias="DATABASE_PASSWORD")
    
    # API Configuration
    api_host: str = Field(default="0.0.0.0", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")
    api_reload: bool = Field(default=True, alias="API_RELOAD")
    secret_key: str = Field(
        default="change-this-in-production",
        alias="SECRET_KEY"
    )
    
    # Admin Configuration
    admin_username: str = Field(default="admin", alias="ADMIN_USERNAME")
    admin_password_hash: str = Field(
        default="", 
        alias="ADMIN_PASSWORD_HASH"
    )
    
    # Scraper Configuration
    scraper_schedule_hour: int = Field(default=3, alias="SCRAPER_SCHEDULE_HOUR")
    scraper_parallel_workers: int = Field(
        default=3, 
        alias="SCRAPER_PARALLEL_WORKERS"
    )
    scraper_request_timeout: int = Field(
        default=30, 
        alias="SCRAPER_REQUEST_TIMEOUT"
    )
    scraper_user_agent: str = Field(
        default="CBRWineHunter/1.0",
        alias="SCRAPER_USER_AGENT"
    )
    scraper_rate_limit_delay: int = Field(
        default=2,
        alias="SCRAPER_RATE_LIMIT_DELAY"
    )
    
    # External Services
    geocoding_service: str = Field(default="nominatim", alias="GEOCODING_SERVICE")
    geocoding_email: str = Field(
        default="your-email@example.com",
        alias="GEOCODING_EMAIL"
    )
    
    # Logging
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    log_file: str = Field(
        default="/var/log/cbr-wine-hunter/app.log",
        alias="LOG_FILE"
    )
    
    # CORS
    cors_origins: List[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000"],
        alias="CORS_ORIGINS"
    )
    
    # Environment
    environment: str = Field(default="development", alias="ENVIRONMENT")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Create global settings instance
settings = Settings()
