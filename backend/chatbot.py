import os
from typing import List, Dict, Any
from dotenv import load_dotenv
import google.generativeai as genai
from supabase import create_client, Client

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not all([GEMINI_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("Missing required environment variables")

genai.configure(api_key=GEMINI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class PaulGrahamChatbot:
    def __init__(self):
        self.embedding_model = "models/embedding-001"
        self.chat_model = "gemini-1.5-flash"

    def get_query_embedding(self, query: str) -> List[float]:
        response = genai.embed_content(
            model=self.embedding_model,
            content=query,
            task_type="RETRIEVAL_QUERY"
        )
        return response["embedding"]

    def find_relevant_chunks(self, query_embedding: List[float], top_k: int = 5) -> List[Dict]:
        embedding_str = str(query_embedding)
        
        response = supabase.rpc('match_chunks', {
            'query_embedding': embedding_str,
            'match_count': top_k
        }).execute()
        
        return response.data if response.data else []

    def generate_response(self, query: str, context_chunks: List[Dict]) -> str:
        context_text = "\n\n".join([
            f"From '{chunk['title']}':\n{chunk['content']}"
            for chunk in context_chunks
        ])

        prompt = f"""You are answering questions based on Paul Graham's essays. 
Use ONLY the provided context to answer the question. 
Answer in Paul Graham's writing style - thoughtful, direct, and with concrete examples.

Context from Paul Graham's essays:
{context_text}

Question: {query}

Answer:"""

        model = genai.GenerativeModel(self.chat_model)
        response = model.generate_content(prompt)
        return response.text

    def chat(self, query: str) -> Dict[str, Any]:
        try:
            query_embedding = self.get_query_embedding(query)
            relevant_chunks = self.find_relevant_chunks(query_embedding, top_k=5)
            
            if not relevant_chunks:
                return {
                    "response": "I don't have any relevant information to answer that question based on Paul Graham's essays.",
                    "sources": [],
                    "error": None
                }
            
            response_text = self.generate_response(query, relevant_chunks)
            
            sources = [
                {
                    "title": chunk["title"],
                    "url": chunk["url"],
                    "similarity": chunk["similarity"]
                }
                for chunk in relevant_chunks
            ]
            
            return {
                "response": response_text,
                "sources": sources,
                "error": None
            }
            
        except Exception as e:
            return {
                "response": "I'm sorry, I encountered an error processing your question.",
                "sources": [],
                "error": str(e)
            }

if __name__ == "__main__":
    chatbot = PaulGrahamChatbot()
    
    while True:
        query = input("\nAsk a question (or 'quit' to exit): ")
        if query.lower() in ['quit', 'exit']:
            break
        
        result = chatbot.chat(query)
        print(f"\n{result['response']}")
        
        if result['sources']:
            print(f"\nSources:")
            for source in result['sources']:
                print(f"- {source['title']} (similarity: {source['similarity']:.3f})")