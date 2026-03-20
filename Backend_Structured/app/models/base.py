from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """
    ASK ME AI - Unified Declarative Base
    -----------------------------------
    All database models (User, Chat, Log) must inherit from this class.
    It serves as the registry for SQLAlchemy 2.0's mapping metadata,
    enabling Alembic to track schema changes and generate migrations.
    """
    pass