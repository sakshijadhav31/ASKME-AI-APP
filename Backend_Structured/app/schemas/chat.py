from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import datetime

"""
ASK ME AI - Chat Schema Definitions
-----------------------------------
These Pydantic models handle request validation and response 
serialization for all AI chat-related endpoints.
"""

# --- REQUEST SCHEMAS ---

class ChatRequest(BaseModel):
    """Payload for sending a new message or starting a session."""
    message: str = Field(..., min_length=1, description="The user's input prompt")
    history: Optional[List[dict]] = Field(default_factory=list, description="Previous conversation context")
    model_name: Optional[str] = Field(default="gemini-1.5-flash", description="Target Gemini model version")

class TitleUpdateRequest(BaseModel):
    """Payload for renaming a chat session."""
    title: str = Field(..., min_length=1, max_length=100, description="The new display title for the session")


# --- RESPONSE SCHEMAS ---

class MessageResponse(BaseModel):
    """Schema representing a single message in a thread."""
    id: UUID
    role: str = Field(..., pattern="^(user|assistant)$", description="Speaker role: user or assistant")
    message: str
    created_at: datetime
    
    # Enables compatibility with SQLAlchemy models
    model_config = ConfigDict(from_attributes=True)

class ChatSummary(BaseModel):
    """Lightweight schema for sidebar listings and session creation responses."""
    id: UUID
    title: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ChatDetailResponse(ChatSummary):
    """Full session object including all historical messages."""
    messages: List[MessageResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
