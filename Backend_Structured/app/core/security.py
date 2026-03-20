import jwt
from datetime import datetime, timedelta, timezone
from typing import Any, Union
from app.core.config import settings

"""
ASK ME AI - Security & JWT Utilities
------------------------------------
Handles the generation of secure JSON Web Tokens for local session 
management. Uses the HS256 algorithm with the application's SECRET_KEY.
"""

# Standard cryptographic algorithm for JWT signing
ALGORITHM = "HS256"

def create_access_token(
    subject: Union[str, Any], 
    expires_delta: timedelta = None
) -> str:
    """
    Generates a signed JWT access token for a specific user (subject).
    Defaults to a 24-hour expiration if no custom delta is provided.
    """
    
    # 1. Calculate the 'exp' (Expiration Time) claim
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Production Default: 24 hours
        expire = datetime.now(timezone.utc) + timedelta(minutes=60 * 24)
    
    # 2. Define the Token Payload
    # 'sub' (Subject) is typically the unique User ID
    to_encode = {
        "exp": expire, 
        "sub": str(subject),
        "iat": datetime.now(timezone.utc) # 'iat' (Issued At) for auditability
    }
    
    # 3. Encode and Sign the Token
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=ALGORITHM
    )
    
    return encoded_jwt