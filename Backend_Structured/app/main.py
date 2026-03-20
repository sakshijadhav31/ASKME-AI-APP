from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router 
from app.core.config import settings
from app.db.session import engine
from app.models.base import Base  # Ensure this points to your modern DeclarativeBase

"""
ASK ME AI - Primary Application Entry Point
-------------------------------------------
This module initializes the FastAPI application, manages the 
database lifecycle, configures CORS security, and registers 
all versioned API routes.
"""

# 1. Database & Lifecycle Management
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown events.
    In development, this ensures all tables are synchronized with the models.
    """
    async with engine.begin() as conn:
        # Automatically create tables if they do not exist (Development Mode)
        # Note: For production, using Alembic migrations is recommended over create_all.
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    # Clean up resources (e.g., closing connections) can go here if needed.

# 2. Application Initialization
app = FastAPI(
    title="ASK ME AI",
    version="1.0.0",
    description="A high-performance AI chat engine powered by Gemini and FastAPI.",
    lifespan=lifespan,
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# 3. CORS Configuration
# Ensures the React frontend can securely communicate with the backend.
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# 4. API Router Registration
# Mounts all v1 endpoints under the configured prefix (e.g., /api/v1)
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health Check"])
async def health_check():
    """
    Verifies the operational status of the ASK ME AI backend.
    """
    return {
        "status": "online",
        "service": "ASK ME AI Backend",
        "version": "1.0.0",
        "api_documentation": f"{settings.API_V1_STR}/docs"
    }