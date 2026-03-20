"""
ASK ME AI - Global Metadata Registry
------------------------------------
This module acts as the central source of truth for the database schema.
By importing all models here, SQLAlchemy's 'Base.metadata' becomes 
aware of every table.
"""

from app.models.base import Base
from app.models.user import User
from app.models.chat import ChatSession, Message
from app.models.log import UserLog

# No new class definition is needed here because 'Base' is already 
# imported from 'app.models.base'. 

# Re-exporting Base ensures that app.db.base.Base.metadata 
# contains the complete schema for the entire application.
__all__ = ["Base", "User", "ChatSession", "Message", "UserLog"]