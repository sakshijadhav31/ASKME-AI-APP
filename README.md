# 🚀 ASKME AI -  Full-Stack Gemini Chat Application

**ASKME AI** is a professional-grade AI-powered chat platform built with a modern full-stack architecture. It uses Google’s **Gemini Models** for real-time streaming responses and provides a persistent, secure chat environment with a premium Obsidian dark UI.

---

## 🌟 Key Features

- ⚡ **Real-time AI Streaming** – Low-latency streaming using Google GenAI SDK  
- 🔁 **Multi Models Support** – Switch between Models like:
  - Gemini 1.5 Flash 
  - Gemini 1.5 Pro 
- 💾 **Persistent Chat Storage** – PostgreSQL-based chat history & logs  
- 🌑 **Obsidian Dark UI** – Built with Tailwind CSS v4  
- 🔐 **Secure Authentication** – Google OAuth + JWT session handling  
- 🧠 **Smart Title Generation** – Auto-generated chat titles using Gemma 2  

---

## 🛠 Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS v4
- Lucide Icons
- Framer Motion
- PrismJS
- React Hooks & Context API

### Backend
- FastAPI (Async)
- Google GenAI SDK (Gemini + Gemma)
- SQLAlchemy 2.0 (Async ORM)
- PostgreSQL (asyncpg)

---

## 📂 Project Architecture

```bash
/
├── frontend/           # React + Vite application
│   ├── src/components  # UI components (ChatHeader, Sidebar, etc.)
│   └── src/hooks       # Custom hooks (streaming, theme, etc.)
│
├── backend/            # FastAPI server
│   ├── app/models      # DB models (User, Chat, Message, Logs)
│   ├── app/services    # AI services (Gemini integration)
│   └── app/api         # API routes
│
└── README.md
```

---

## ⚙️ Setup & Installation

### ✅ Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL

---

## 🔧 Backend Setup

```bash
cd backend
python -m venv venv
```

Activate virtual environment:

```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 🔐 Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
GEMINI_API_KEY=your_google_ai_studio_key
SECRET_KEY=your_jwt_secret
```

Initialize database:

```bash
python init_db.py
```

Run server:

```bash
uvicorn main:app --reload
```

---

## 🎨 Frontend Setup

```bash
cd frontend
npm install
```

### 🌐 Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

### ▶️ Run the App

```bash
npm run dev
```

## 📖 API Reference & Documentation

All endpoints are secured using **Google OAuth 2.0 authentication**.

---

### 💬 Chat & AI Service (`/api/v1/chats`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all chat sessions (sorted by date) |
| POST | `/` | Create new session + generate AI title + stream response |
| POST | `/{chat_id}/messages` | Send message & stream AI response |
| GET | `/{chat_id}/messages` | Get full chat history |
| PUT | `/{chat_id}/title` | Update chat title |
| DELETE | `/{chat_id}` | Delete chat & cascade messages |

---

### 👤 User & Authentication (`/api/v1/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sync-user` | Verify Google token & sync user |

---

### 📊 Audit & Logs (`/api/v1/logs`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Fetch user activity logs |

---

## 🗄️ Database Models

The backend uses **SQLAlchemy 2.0 (Async ORM)** with PostgreSQL optimizations like `UUID`, `JSONB`, `INET`, and indexing for performance.

---

### 👤 User Model

Represents an authenticated user (via Google OAuth).

**Fields:**
- `id` (String) – Unique Google user ID (Primary Key)
- `name` (String) – User's display name
- `email` (String) – User email (unique)
- `created_at` (DateTime) – Account creation timestamp

**Relationships:**
- One-to-Many → ChatSession (`sessions`)
- One-to-Many → UserLog (`logs`)

**Key Features:**
- Synced using Google OAuth (`/api/v1/users/sync-user`)
- Root entity for all user data
- Cascade delete:
  - User → Chats → Messages

---

### 💬 ChatSession Model

Represents a conversation thread between user and AI.

**Fields:**
- `id` (UUID)
- `user_id` (String)
- `title` (String)
- `created_at` (DateTime)

**Relationships:**
- Many-to-One → User
- One-to-Many → Message

**Key Features:**
- Cascade delete enabled
- Indexed on `user_id`

---

### 📨 Message Model

Stores messages inside a chat session.

**Fields:**
- `id` (UUID)
- `chat_id` (UUID)
- `role` (user / assistant)
- `message` (Text)
- `created_at` (DateTime)

**Relationships:**
- Many-to-One → ChatSession

**Performance:**
- Composite index `(chat_id, created_at ASC)` for fast history retrieval

---

### 📊 UserLog Model

Tracks system activity and user behavior.

**Fields:**
- `id` (UUID)
- `user_id` (String)
- `request_id` (String)
- `action` (String)
- `category` (String)
- `status_code` (Integer)
- `is_success` (Boolean)
- `error_code` (String)
- `meta` (JSONB)
- `ip_address` (INET)
- `user_agent` (String)
- `path` (String)
- `created_at` (DateTime)

**Key Features:**
- JSONB for flexible metadata
- INET for IP tracking
- Full audit logging system

**Indexes:**
- `(user_id, created_at DESC)`
- `GIN(meta)` for JSON queries

---

## ⚡ Advanced Backend Implementation

- 🔄 **Async Streaming** – FastAPI `StreamingResponse`
- ⚙️ **Background Tasks** – Non-blocking DB writes
- 🧠 **Context Memory** – Last 20 messages used for AI context
- 🧹 **Manual Cascade Safety**
- 📊 **Audit Trail** – Tracks IP, user-agent, actions

---


## 📌 Future Improvements

- Multi-user collaboration
- File upload (PDF/Image chat)
- Voice interaction
- AI memory optimization
