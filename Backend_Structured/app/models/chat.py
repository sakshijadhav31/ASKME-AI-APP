# import uuid
# from datetime import datetime, timezone
# from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Index
# from sqlalchemy.dialects.postgresql import UUID
# from sqlalchemy.orm import relationship
# from app.models.base import Base

# class ChatSession(Base):
#     __tablename__ = "chat_sessions"

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
#     title = Column(String, nullable=False)
#     created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

#     user = relationship("User", back_populates="sessions")
#     messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")

# class Message(Base):
#     __tablename__ = "messages"

#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     chat_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
#     role = Column(String, nullable=False) # 'user' or 'assistant'
#     message = Column(Text, nullable=False)
#     created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

#     session = relationship("ChatSession", back_populates="messages")

# # मेसेजचा क्रम वेगाने मिळवण्यासाठी इंडेक्स
# Index("idx_message_chat_order", Message.chat_id, Message.created_at.asc())



import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base

class ChatSession(Base):
    """
    ASK ME AI - Chat Session Model
    ------------------------------
    Represents a unique conversation thread between a user and the AI.
    Features automated cascading deletes to clean up messages when a 
    session is removed.
    """
    __tablename__ = "chat_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="sessions")
    messages = relationship(
        "Message", 
        back_populates="session", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )


class Message(Base):
    """
    ASK ME AI - Message Model
    -------------------------
    Stores individual exchanges within a chat session. 
    'role' defines whether the message was sent by the 'user' or the 'assistant'.
    """
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("chat_sessions.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    role = Column(String, nullable=False)  # Expected: 'user' or 'assistant'
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    session = relationship("ChatSession", back_populates="messages")


# Composite index to optimize historical message retrieval in chronological order
Index("idx_message_chat_order", Message.chat_id, Message.created_at.asc())