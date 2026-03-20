from fastapi import APIRouter
from app.api.v1.endpoints import chats, users, logs

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["User Profile"])
api_router.include_router(chats.router, prefix="/chats", tags=["Chat Engine"])
api_router.include_router(logs.router, prefix="/logs", tags=["Audit Logs"])