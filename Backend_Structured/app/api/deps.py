# from typing import AsyncGenerator
# from fastapi import Depends, HTTPException, status, Security
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select

# # इम्पॉर्ट पाथ तुझ्या प्रोजेक्ट स्ट्रक्चरनुसार तपासा
# from app.db.session import SessionLocal 
# from app.models.user import User
# from app.services.google_auth import verify_google_token

# # १. Security Scheme
# security = HTTPBearer()

# # २. Database Session Generator
# async def get_db() -> AsyncGenerator[AsyncSession, None]:
#     """
#     प्रत्येक रिक्वेस्टसाठी नवीन DB सेशन तयार करते.
#     """
#     # session.py मध्ये 'autoficit' ऐवजी 'autoflush' केल्याची खात्री करा
#     async with SessionLocal() as session:
#         try:
#             yield session
#             # commit() इथे करणे ऐच्छिक आहे, सहसा आपण endpoints मध्ये करतो
#         except Exception:
#             await session.rollback()
#             raise
#         finally:
#             await session.close()


# # ३. Current User Dependency
# async def get_current_user(
#     auth: HTTPAuthorizationCredentials = Security(security),
#     db: AsyncSession = Depends(get_db)
# ) -> User:
#     """
#     Token व्हेरिफाय करून युजरला डेटाबेसमध्ये शोधते किंवा नवीन युजर बनवते.
#     """
#     token = auth.credentials
    
#     # अ. गुगल टोकन व्हेरिफाय करा
#     user_info = await verify_google_token(token)
#     if not user_info:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid or expired Google token",
#         )

#     # गुगल 'sub' हा युजरचा युनिक आयडी असतो
#     user_id = str(user_info.get("sub"))
    
#     # ब. डेटाबेसमध्ये युजर शोधा
#     result = await db.execute(select(User).where(User.id == user_id))
#     user = result.scalar_one_or_none()
    
#     # क. जर युजर नसेल, तर Auto-Register करा
#     if not user:
#         try:
#             user = User(
#                 id=user_id,
#                 email=user_info.get("email"),
#                 name=user_info.get("name"),
#                 picture=user_info.get("picture")
#             )
#             db.add(user)
#             await db.commit()
#             await db.refresh(user)
#         except Exception as e:
#             await db.rollback()
#             print(f"Sync Error: {e}") # सर्व्हर लॉगसाठी
#             raise HTTPException(
#                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#                 detail="Could not create user in database"
#             )
            
#     return user

# # ४. Google User Info (Optional)
# async def get_google_user(
#     auth: HTTPAuthorizationCredentials = Security(security)
# ) -> dict:
#     token = auth.credentials
#     user_info = await verify_google_token(token)
#     if not user_info:
#         raise HTTPException(status_code=401, detail="Invalid token")
#     return user_info


from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

# Ensure these paths match your project structure
from app.db.session import SessionLocal 
from app.models.user import User
from app.services.google_auth import verify_google_token

# 1. Security Scheme Definition
security = HTTPBearer()

# 2. Database Session Dependency
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Generates a new asynchronous database session for each request.
    Ensures the session is closed and rolled back in case of errors.
    """
    async with SessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# 3. Current User Injection Dependency
async def get_current_user(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Authenticates the user via Google ID Token and retrieves or 
    auto-registers the user in the local ASK ME AI database.
    """
    token = auth.credentials
    
    # A. Validate Google Token via External Service
    user_info = await verify_google_token(token)
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="Invalid or expired Google authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Use the Google unique 'sub' claim as the primary user ID
    user_id = str(user_info.get("sub"))
    
    # B. Locate user in the local database
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    # C. Auto-Registration Logic
    if not user:
        try:
            user = User(
                id=user_id,
                email=user_info.get("email"),
                name=user_info.get("name"),
                picture=user_info.get("picture")
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        except Exception as e:
            await db.rollback()
            # Log error internally for debugging
            print(f"[AUTH ERROR] Failed to auto-register user: {e}") 
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User synchronization failed during database write."
            )
            
    return user

# 4. Raw Google Identity Dependency 
async def get_google_user(
    auth: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """
    Returns the raw Google token payload without database interaction.
    """
    token = auth.credentials
    user_info = await verify_google_token(token)
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Authentication failed"
        )
    return user_info