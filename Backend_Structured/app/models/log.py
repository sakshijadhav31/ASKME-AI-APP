import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID, INET, JSONB
from sqlalchemy.orm import relationship
from app.models.base import Base

class UserLog(Base):
    """
    ASK ME AI - Audit & Activity Log Model
    --------------------------------------
    Tracks all user interactions, API requests, and system events.
    Utilizes PostgreSQL JSONB for flexible metadata and INET for 
    network-level auditing.
    """
    __tablename__ = "user_logs"

    # Identity & Linkage
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    request_id = Column(String(50), nullable=True, index=True)
    
    # Action Classification
    action = Column(String(64), nullable=False, index=True)      # e.g., 'CREATE_CHAT', 'LOGIN'
    category = Column(String(32), nullable=True, index=True)    # e.g., 'AUTH', 'CHAT', 'SYSTEM'
    
    # Result Tracking
    status_code = Column(Integer, nullable=True, index=True)    # HTTP status code
    is_success = Column(Boolean, default=True, index=True)
    error_code = Column(String(50), nullable=True)              # Specific internal error code
    
    # Request Context (PostgreSQL Specific Types)
    meta = Column(JSONB, nullable=True, server_default='{}')    # Flexible payload for additional data
    ip_address = Column(INET, nullable=True)                    # Stores IPv4 or IPv6
    user_agent = Column(String(512), nullable=True)
    path = Column(String(255), nullable=True)                   # API Endpoint path
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    user = relationship("User", back_populates="logs")


# PERFORMANCE INDEXES
# -------------------
# 1. Composite index for fast retrieval of a specific user's latest activity logs.
Index("idx_user_logs_query_flow", UserLog.user_id, UserLog.created_at.desc())

# 2. GIN Index for high-performance querying inside the JSONB 'meta' field.
Index("idx_user_logs_meta_gin", UserLog.meta, postgresql_using="gin")