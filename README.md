# Nexus AI - Full Stack Chat Application

Nexus AI is an advanced, high-performance AI chat platform designed to provide a seamless conversational experience using cutting-edge Large Language Models (LLMs). The application features a robust FastAPI backend and a responsive React frontend with real-time streaming capabilities.

## 🚀 Key Features

- **Real-time Streaming:** AI responses are rendered instantly as they are generated for a "typing" effect.
- **Markdown & Code Support:** Full rendering for Markdown, including tables, lists, and formatted text.
- **Syntax Highlighting:** Professional-grade code blocks with language-specific coloring and a **Copy to Clipboard** feature.
- **Control Mechanism:** Integrated **Stop** and **Resume** functionality for AI text generation.
- **Secure Authentication:** User login synchronization powered by **Google OAuth**.
- **Persistent UI:** Persistent theme toggling (Light/Dark mode) that stays consistent across different routes.
- **Action Logging:** Backend tracking of user interactions (Logins, Messages, etc.) using SQLAlchemy.

## 🛠️ Technical Stack

### Frontend
- **React.js**: Functional components and hooks for state management.
- **React-Markdown**: For converting raw AI output into formatted UI.
- **Prism / SyntaxHighlighter**: For beautiful code block rendering.
- **Tailwind CSS**: For a modern, responsive design.

### Backend
- **FastAPI**: High-performance Python framework for building APIs.
- **SQLAlchemy**: ORM for database management and user logging.
- **Pydantic**: For data validation and settings management.
- **Gemini & Gemma SDKs**: Integration with Google’s latest AI models.

## 📂 Project Structure Installation & Setup
1. Backend Setup
Navigate to the backend directory, create a virtual environment, and install dependencies:

Bash
cd AI_CHAT_BACKEND
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

2. Frontend Setup
Navigate to the frontend directory and start the development server:

Bash
cd AI_CHAT_FRONTEND
npm install
npm start
🔧 Environment Variables
Ensure you have a .env file in your backend folder with the following:

GOOGLE_API_KEY: Your Gemini API key.

DATABASE_URL: Your local or cloud SQL connection string.

GOOGLE_CLIENT_ID: For OAuth integration.

📜 License
This project is for personal development and educational purposes.



```text
AI_CHAT_APP/
├── AI_CHAT_BACKEND/       # FastAPI server, database models, and AI logic
│   ├── main.py            # API Entry point
│   ├── models.py          # SQLAlchemy User & Log models
│   └── database.py        # Connection and Session logic
└── AI_CHAT_FRONTEND/      # React components and frontend assets
    ├── src/               # Application logic (App.js, Components)
    ├── public/            # Static assets
    └── package.json       # Dependencies and scripts
