from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)

"""
ASK ME AI - Google Authentication Service
-----------------------------------------
Provides server-side validation for Google ID Tokens (JWTs) generated 
by the frontend. Ensures the token is authentic, unexpired, and 
issued specifically for this application's Client ID.
"""

async def verify_google_token(token: str) -> dict:
    """
    Verifies the integrity and authenticity of a Google OAuth2 ID token.
    Returns the decoded token payload (idinfo) if successful.
    """
    try:
        # Verify the ID token using Google's official verification library.
        # This checks the signature, expiration, and 'aud' (audience) claim.
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )

        # Basic security check: Ensure the issuer is Google.
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        return idinfo

    except ValueError as ve:
        # Handle specific validation errors (expired, wrong audience, etc.)
        logger.warning(f"Google Token Validation Failed: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The provided authentication token is invalid or has expired."
        )
    except Exception as e:
        # Catch-all for unexpected transport or library errors
        logger.error(f"Unexpected Auth Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication service is currently unavailable."
        )