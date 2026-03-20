
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union

class Settings(BaseSettings):
    """
    ASK ME AI - Global Application Settings
    ---------------------------------------
    Handles environment variables and application constants using 
    Pydantic Settings. Values are automatically loaded from the .env file.
    """
    
    # --- Project Metadata ---
    PROJECT_NAME: str = "ASK ME AI"
    API_V1_STR: str = "/api/v1"
    
    # --- Database Configuration ---
    # Default to a local PostgreSQL instance if no DATABASE_URL is provided
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://postgres:postgres@localhost:5432/ask_me_ai_db"
    )
    
    # --- External API Integrations ---
    # Required for Google One-Tap / Social Login
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    
    # Required for Google GenAI SDK (Gemini/Gemma Models)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # --- Security & Authentication ---
    # Used for signing session cookies or internal JWTs if applicable
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", 
        "PROD_SECRET_CHANGE_THIS_IN_ENV_FILE"
    )
    
    # --- Cross-Origin Resource Sharing (CORS) ---
    # Origins allowed to communicate with this API (React/Vite defaults included)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]

    # Pydantic V2 Configuration for Environment Management
    model_config = SettingsConfigDict(
        case_sensitive=True, 
        env_file=".env",
        extra="ignore"
    )

# Global settings instance to be imported across the application
settings = Settings()