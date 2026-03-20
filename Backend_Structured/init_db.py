"""
ASK ME AI - Database Model Registry
-----------------------------------
This module acts as the central registry for all SQLAlchemy models.
Importing models here allows Alembic to discover them via 
'Base.metadata' for generating database migrations.
"""

from app.models.base import Base
from app.models.user import User
from app.models.chat import ChatSession, Message
from app.models.log import UserLog

# All models share the same 'Base' metadata, allowing 
# for a unified schema representation.
__all__ = [
    "Base", 
    "User", 
    "ChatSession", 
    "Message", 
    "UserLog"
]