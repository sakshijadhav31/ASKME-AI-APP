from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.core.config import settings

"""
ASK ME AI - Database Session Management
---------------------------------------
Configures the asynchronous SQLAlchemy engine and session factory.
Uses the asyncpg driver to handle non-blocking database operations.
"""

# 1. Initialize the Asynchronous Database Engine
# Using settings.DATABASE_URL (ensure it starts with 'postgresql+asyncpg://')
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,                # Set to True only during local debugging to see raw SQL
    future=True,              # Standard for SQLAlchemy 2.0 compatibility
    pool_pre_ping=True,       # Automatically checks & recovers "stale" connections
    pool_size=10,             # Maintains a base pool of 10 connections for speed
    max_overflow=20           # Allows up to 20 extra connections during traffic spikes
)

# 2. Configure the Session Factory (SessionLocal)
# This factory generates AsyncSession instances for each API request.
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,   # Critical: Prevents 'lazy loading' errors in async code
)