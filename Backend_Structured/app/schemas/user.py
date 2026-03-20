from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional

"""
ASK ME AI - User Schema Definitions
-----------------------------------
These Pydantic models handle user data validation, registration 
payloads, and secure serialization of user profile information.
"""

class UserBase(BaseModel):
    """Base user attributes shared across different schemas."""
    email: EmailStr = Field(..., description="The user's primary email address")
    name: Optional[str] = Field(None, description="The user's display name from Google")

class UserCreate(UserBase):
    """Schema for creating a new user record in the database."""
    id: str = Field(..., description="The unique Google 'sub' identifier")

class UserResponse(BaseModel):
    """
    Schema for returning user data via the API.
    Configured to handle SQLAlchemy models and ignore extra fields.
    """
    id: str
    email: EmailStr
    name: Optional[str] = None

    # Pydantic V2 Configuration
    model_config = ConfigDict(
        from_attributes=True,  # Allows reading directly from SQLAlchemy models
        extra="ignore",        # Safely ignore any database fields not defined here
        json_schema_extra={
            "example": {
                "id": "105678901234567890123",
                "email": "user@example.com",
                "name": "John Doe"
            }
        }
    )