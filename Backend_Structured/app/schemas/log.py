from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, Any

"""
ASK ME AI - Audit Log Schema Definitions
----------------------------------------
These Pydantic models handle the serialization of system activity 
and user audit logs for the frontend interface.
"""

class UserLogResponse(BaseModel):
    """
    Schema for displaying individual activity logs.
    Maps directly to the UserLog database model.
    """
    id: UUID = Field(..., description="Unique identifier for the log entry")
    action: str = Field(..., description="The specific event performed (e.g., LOGIN, CREATE_CHAT)")
    category: Optional[str] = Field(None, description="The module category (e.g., AUTH, CHAT, SYSTEM)")
    
    status_code: Optional[int] = Field(None, description="The HTTP response status code associated with the action")
    is_success: bool = Field(True, description="Whether the operation completed without errors")
    
    # Flexible metadata for additional context
    meta: Optional[dict] = Field(default_factory=dict, description="Additional context or event-specific data")
    
    created_at: datetime = Field(..., description="Timestamp of when the log was generated")
    
    # Enables Pydantic to read data directly from SQLAlchemy model instances
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "action": "CREATE_CHAT",
                "category": "CHAT",
                "status_code": 200,
                "is_success": True,
                "meta": {"model": "gemini-1.5-flash"},
                "created_at": "2026-03-20T18:15:00Z"
            }
        }
    )