from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from typing import List
from uuid import UUID

from app.api import deps
from app.models.chat import ChatSession, Message
from app.schemas.chat import ChatRequest, ChatSummary, MessageResponse, TitleUpdateRequest
from app.services.gemini_service import ai_service
from app.utils import log_activity

router = APIRouter()

# --- BACKGROUND UTILITIES ---

async def save_message_to_history(chat_id: UUID, role: str, text: str):
    """
    Persists AI response to the database after streaming is complete.
    Uses a fresh session to ensure background task reliability.
    """
    async with deps.SessionLocal() as db:
        new_msg = Message(chat_id=chat_id, role=role, message=text)
        db.add(new_msg)
        await db.commit()

# --- API ENDPOINTS ---

@router.get("/", response_model=List[ChatSummary])
async def list_sessions(
    user=Depends(deps.get_current_user), 
    db: AsyncSession = Depends(deps.get_db)
):
    """Retrieves all chat sessions for the authenticated user, ordered by most recent."""
    query = select(ChatSession).where(ChatSession.user_id == user.id).order_by(ChatSession.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=ChatSummary)
async def create_session(
    data: ChatRequest, 
    request: Request, 
    background_tasks: BackgroundTasks, 
    user=Depends(deps.get_current_user), 
    db: AsyncSession = Depends(deps.get_db)
):
    """
    Initializes a new chat session, generates an AI title, 
    saves the initial message, and returns a streaming response.
    """
    # 1. Generate context-aware title using AI
    generated_title = await ai_service.generate_chat_title(data.message)
    
    # 2. Create and persist new chat session
    new_chat = ChatSession(user_id=user.id, title=generated_title)
    db.add(new_chat)
    await db.commit()
    await db.refresh(new_chat)

    # 3. Store user's first message
    db.add(Message(chat_id=new_chat.id, role="user", message=data.message))
    await db.commit()

    async def stream_generator():
        full_response = ""
        async for chunk in ai_service.generate_ai_response_stream(data.message, data.history, data.model_name):
            # Extract clean text regardless of chunk format (dict or object)
            text_content = chunk.get("text", "") if isinstance(chunk, dict) else getattr(chunk, "text", str(chunk))
            
            if text_content:
                full_response += text_content
                yield text_content
        
        # Async background save once stream ends
        background_tasks.add_task(save_message_to_history, new_chat.id, "assistant", full_response)

    # 4. Audit Log
    background_tasks.add_task(
        log_activity,
        user_id=user.id,
        action="SESSION_CREATED",
        category="CHAT",
        status_code=200,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent"),
        path=str(request.url.path),
        meta={"chat_id": str(new_chat.id), "title": generated_title}
    )

    return StreamingResponse(
        stream_generator(), 
        media_type="text/plain",
        headers={
            "x-chat-id": str(new_chat.id),
            "Access-Control-Expose-Headers": "x-chat-id"
        }
    )


@router.post("/{chat_id}/messages")
async def send_message(
    chat_id: UUID, 
    data: ChatRequest, 
    request: Request, 
    background_tasks: BackgroundTasks, 
    user=Depends(deps.get_current_user), 
    db: AsyncSession = Depends(deps.get_db)
):
    """Sends a new message to an existing session and returns an AI stream with context."""
    
    # 1. Security Check: Verify session ownership
    chat_query = select(ChatSession).where(ChatSession.id == chat_id, ChatSession.user_id == user.id)
    chat_exists = await db.execute(chat_query)
    if not chat_exists.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Chat session not found")

    # --- NEW: HISTORY FETCH LOGIC ---
    # Fetch previous messages to give context to the AI
    history_query = (
        select(Message)
        .where(Message.chat_id == chat_id)
        .order_by(Message.created_at.asc())
        .limit(20) # Limit to last 20 messages for performance
    )
    history_result = await db.execute(history_query)
    db_messages = history_result.scalars().all()

    # Format history for Gemini SDK (Role mapping: assistant -> model)
    formatted_history = []
    for m in db_messages:
        formatted_history.append({
            "role": "user" if m.role == "user" else "model",
            "parts": [m.message]
        })
    # --------------------------------

    # 2. Persist user message (skip if it's an internal 'Continue' command)
    if not data.message.startswith("Continue exactly"):
        db.add(Message(chat_id=chat_id, role="user", message=data.message))
        await db.commit()

    async def stream_generator():
        full_response = ""
        try:
            # Pass the formatted_history instead of data.history if you want DB-backed context
            async for chunk in ai_service.generate_ai_response_stream(
                prompt=data.message, 
                history=formatted_history, 
                model_name=data.model_name
            ):
                # Standardize chunk extraction
                text_content = chunk.get("text", "") if isinstance(chunk, dict) else getattr(chunk, "text", str(chunk))
                
                if text_content:
                    full_response += text_content
                    yield text_content

            # Save AI response to DB in background
            background_tasks.add_task(save_message_to_history, chat_id, "assistant", full_response)
        except Exception as e:
            yield f"\n[Stream Error]: {str(e)}"

    # 3. Audit Log
    background_tasks.add_task(
        log_activity,
        user_id=user.id,
        action="MESSAGE_SENT",
        category="CHAT",
        status_code=200,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent"),
        path=str(request.url.path),
        meta={"chat_id": str(chat_id)}
    )
    
    return StreamingResponse(stream_generator(), media_type="text/plain")
@router.get("/{chat_id}/messages", response_model=List[MessageResponse])
async def get_history(
    chat_id: UUID, 
    user=Depends(deps.get_current_user), 
    db: AsyncSession = Depends(deps.get_db)
):
    """Fetches full message history for a specific session."""
    
    # Check ownership
    chat_query = select(ChatSession).where(ChatSession.id == chat_id, ChatSession.user_id == user.id)
    chat_check = await db.execute(chat_query)
    if not chat_check.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Unauthorized access to chat history")

    # Fetch ordered messages
    msg_query = select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at.asc())
    result = await db.execute(msg_query)
    return result.scalars().all()


@router.put("/{chat_id}/title")
async def rename_session(
    chat_id: UUID, 
    data: TitleUpdateRequest, 
    user=Depends(deps.get_current_user), 
    db: AsyncSession = Depends(deps.get_db)
):
    """Updates the title of a specific chat session."""
    query = select(ChatSession).where(ChatSession.id == chat_id, ChatSession.user_id == user.id)
    result = await db.execute(query)
    chat = result.scalar_one_or_none()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat.title = data.title
    await db.commit()
    await db.refresh(chat)
    
    return {"status": "success", "new_title": chat.title}


@router.delete("/{chat_id}")
async def delete_session(
    chat_id: UUID, 
    user=Depends(deps.get_current_user), 
    db: AsyncSession = Depends(deps.get_db)
):
    """Deletes a chat session and all associated messages."""
    # Delete messages first (Manual cascade to ensure DB integrity)
    await db.execute(delete(Message).where(Message.chat_id == chat_id))
    
    # Delete the session
    query = delete(ChatSession).where(ChatSession.id == chat_id, ChatSession.user_id == user.id)
    await db.execute(query)
    await db.commit()
    
    return {"status": "deleted", "id": chat_id}

