import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

try:
    from chatbot import PaulGrahamChatbot
    chatbot = PaulGrahamChatbot()
    chatbot_available = True
except Exception as e:
    print(f"Warning: Could not initialize chatbot: {e}")
    chatbot = None
    chatbot_available = False

app = FastAPI(
    title="Paul Graham RAG API",
    description="API for RAG chat",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class Source(BaseModel):
    title: str
    url: str
    similarity: float

class ChatResponse(BaseModel):
    response: str
    sources: List[Source]
    query: str

@app.get("/")
async def root():
    return {
        "message": "Paul Graham RAG API", 
        "status": "ok",
        "chatbot_ready": chatbot_available
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy" if chatbot_available else "degraded",
        "chatbot_initialized": chatbot_available
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not chatbot_available:
        raise HTTPException(status_code=503, detail="Chatbot not available")
    
    user_message = request.message.strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    try:
        result = chatbot.chat(user_message)
        if result.get("error"):
            raise HTTPException(status_code=500, detail=result["error"])
        
        return ChatResponse(
            response=result['response'], 
            sources=result['sources'], 
            query=user_message
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)