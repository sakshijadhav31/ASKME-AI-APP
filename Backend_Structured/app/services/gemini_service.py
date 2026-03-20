import asyncio
import logging
from typing import AsyncGenerator, List, Dict
from google import genai
from google.genai import types
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    """
    ASK ME AI - Gemini Service Provider
    -----------------------------------
    Handles all interactions with Google's GenAI SDK, including 
    real-time response streaming and context-aware title generation.
    """
    def __init__(self):
        # Initialize the GenAI Client using the project's API key
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        # Standard safety configurations for production
        # Thresholds are set to BLOCK_NONE to allow full model flexibility,
        # adjust these based on your specific content policy requirements.
        self.safety_settings = [
            types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_NONE"),
            types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_NONE"),
            types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_NONE"),
            types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_NONE"),
        ]
    async def generate_ai_response_stream(
        self, 
        prompt: str, 
        history: List[Dict], 
        model_name: str = "gemini-1.5-flash"
    ) -> AsyncGenerator[str, None]:
        """
        Generates a continuous stream of text responses from the specified model.
        Handles context formatting and provides a safety fallback for errors.
        """
        try:
            # 1. Standardize model identifier
            clean_model = model_name.replace("models/", "")
            logger.info(f"Initiating stream with model: {clean_model}")

            # 2. Format chat history for SDK compatibility
            formatted_contents = []
            for h in history:
                role = "user" if h["role"] == "user" else "model"
                # Ensure parts is always a list of strings
                parts_list = h["parts"] if isinstance(h["parts"], list) else [h["parts"]]
                
                formatted_contents.append(
                    types.Content(
                        role=role, 
                        parts=[types.Part(text=str(p)) for p in parts_list]
                    )
                )

            # Append current user prompt to the sequence
            formatted_contents.append(
                types.Content(role="user", parts=[types.Part(text=prompt)])
            )

            # 3. Configure generation parameters
            config_kwargs = {
                "safety_settings": self.safety_settings,
                "temperature": 0.7,
            }

            # Define System Instructions
            sys_instruct = (
                "You are ASK ME AI, a highly capable, professional, and helpful assistant. "
                "Provide clear, accurate, and concise responses."
            )

          
            if "gemini" in clean_model.lower():
                config_kwargs["system_instruction"] = sys_instruct
            else:
                if formatted_contents:
                    # Inject system instruction into the first message for non-Gemini models
                    first_text = formatted_contents[0].parts[0].text
                    formatted_contents[0].parts[0].text = f"Instruction: {sys_instruct}\n\n{first_text}"

            config = types.GenerateContentConfig(**config_kwargs)

            # 4. Execute Streaming API Call
            response_stream = self.client.models.generate_content_stream(
                model=clean_model,
                contents=formatted_contents,
                config=config
            )

            # 5. Yield text chunks to the response stream
            for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
                
                # Brief sleep to allow the async event loop to handle other tasks
                await asyncio.sleep(0.01)
                    
        except Exception as e:
            logger.error(f"Gemini SDK Execution Error: {str(e)}")
            yield f"Error: Context processing failed. {str(e)}"

    async def generate_chat_title(self, message: str) -> str:
        """
        Generates a concise (3-5 words) title for a new chat session 
        based on the initial user message.
        """
        try:
            title_prompt = (
                f"Identify the core topic of this message and create a 3-5 word title: '{message}'. "
                "Return only the plain text title without quotes, periods, or markdown formatting."
            )
            
            # Use a lightweight model for fast title generation
            response = self.client.models.generate_content(
                model="gemma-3-1b-it", 
                contents=title_prompt,
                config=types.GenerateContentConfig(temperature=0.5)
            )
            
            if response.text:
                # Clean up the response to ensure a pure string title
                return response.text.strip().replace('"', '').replace("'", "")
            
            return "New Conversation"
            
        except Exception as e:
            logger.warning(f"Title Generation Failed: {e}. Falling back to message snippet.")
            # Fallback: Use the first few words of the message as a title
            words = message.split()
            return " ".join(words[:4]) + "..." if len(words) > 4 else message 

# Global singleton instance for application-wide use
ai_service = GeminiService()