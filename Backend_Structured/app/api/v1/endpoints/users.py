from fastapi import APIRouter, Depends, Request, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.models.user import User
from app.schemas.user import UserResponse
from app.utils import log_activity

router = APIRouter()

"""
ASK ME AI - User Profile Router
-------------------------------
Handles user synchronization and profile management following 
successful Google OAuth authentication.
"""

@router.post("/sync-user", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def sync_user_profile(
    request: Request, 
    background_tasks: BackgroundTasks, 
    user_info=Depends(deps.verify_google_token), 
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Synchronizes the authenticated Google user with the local database.
    If the user does not exist, a new record is created.
    """
    user_id = str(user_info.get('sub'))
    
    # 1. Check if user already exists in the system
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    is_new_user = False
    
    if not user:
        # 2. Register a new user if not found
        user = User(
            id=user_id, 
            email=user_info.get('email'), 
            name=user_info.get('name')
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        is_new_user = True

    # 3. Audit Logging
    background_tasks.add_task(
        log_activity,
        user_id=user.id,
        action="USER_SYNC_SUCCESS" if not is_new_user else "USER_REGISTERED",
        category="AUTH",
        status_code=200,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent"),
        path=str(request.url.path),
        meta={"is_new": is_new_user, "email": user.email}
    )
    
    return user