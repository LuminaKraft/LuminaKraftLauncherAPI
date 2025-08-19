from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Server settings
    PORT: int = 9374
    ENVIRONMENT: str = "production"
    
    # CORS settings
    ALLOWED_ORIGINS: Optional[str] = None
    
    # Rate limiting settings
    RATE_LIMIT_WINDOW_MS: int = 60_000  # 1 minute
    RATE_LIMIT_MAX: int = 180  # requests per window
    
    # CurseForge API settings
    CURSEFORGE_API_KEY: Optional[str] = None
    CURSEFORGE_API_URL: str = "https://api.curseforge.com/v1"
    MINECRAFT_GAME_ID: int = 432
    
    class Config:
        env_file = ".env"

settings = Settings()