

from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.models.base import Base

class User(Base):
    """
    ASK ME AI - Core User Model
    ---------------------------
    Stores identity information synchronized from Google OAuth.
    Acts as the primary anchor for all user-generated content including 
    chat sessions and system activity logs.
    """
    __tablename__ = "users"

    # Identity Information
    # 'id' maps directly to the unique Google 'sub' claim (Subject Identifier)
    id = Column(String, primary_key=True, index=True) 
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True)
    

    # Relationships
    # 'sessions' links to ChatSession. Includes cascading deletes to purge 
    # data if an account is removed.
    sessions = relationship(
        "ChatSession", 
        back_populates="user", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    # 'logs' links to UserLog for a full audit trail of user activity.
    logs = relationship(
        "UserLog", 
        back_populates="user", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )