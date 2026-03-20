import logging
from typing import Optional, Any, Dict
from app.db.session import SessionLocal
from app.models.log import UserLog

logger = logging.getLogger(__name__)

"""
ASK ME AI - Global Utilities
----------------------------
Centralized utility functions for the application. 
Primarily handles asynchronous background logging and 
system auditing.
"""

async def log_activity(
    user_id: str,
    action: str,
    category: str = "GENERAL",
    status_code: int = 200,
    is_success: bool = True,
    meta: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    path: Optional[str] = None
):
    """
    Asynchronously logs application actions and audit events to the database.
    Designed to be used with FastAPI's BackgroundTasks to ensure 
    logging does not delay the primary API response.
    """
    
    # Use a fresh session for background tasks to avoid sharing 
    # state with the request's main database session.
    async with SessionLocal() as db:
        try:
            new_log = UserLog(
                user_id=user_id,
                action=action,
                category=category,
                status_code=status_code,
                is_success=is_success,
                meta=meta or {},
                ip_address=ip_address,
                user_agent=user_agent,
                path=path
            )
            db.add(new_log)
            await db.commit()
            
        except Exception as e:
            # Crucial: Rollback the session to maintain DB integrity
            await db.rollback()
            
            # Fallback: If DB logging fails, ensure the event is captured 
            # in the server's standard logs so the audit trail isn't lost.
            logger.error(
                f"AUDIT LOG FAILURE: Could not write to DB. "
                f"Action: {action}, User: {user_id}, Error: {str(e)}"
            )