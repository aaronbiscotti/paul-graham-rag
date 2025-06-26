import json
import os
import time
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=GEMINI_API_KEY)

EMBEDDING_MODEL = "models/embedding-001"
BATCH_SIZE = 10
DELAY_SECONDS = 1

def generate_embeddings(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        chunks = json.load(f)
    
    embeddings_data = []
    total_batches = (len(chunks) - 1) // BATCH_SIZE + 1
    
    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i:i+BATCH_SIZE]
        texts = [item["text"] for item in batch]
        
        response = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=texts,
            task_type="RETRIEVAL_DOCUMENT"
        )
        
        for j, item in enumerate(batch):
            embedding_record = item.copy()
            embedding_record["embedding"] = response["embedding"][j]
            embeddings_data.append(embedding_record)
        
        current_batch = i // BATCH_SIZE + 1
        print(f"Processed batch {current_batch}/{total_batches}")
        
        if current_batch < total_batches:
            time.sleep(DELAY_SECONDS)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(embeddings_data, f, ensure_ascii=False, indent=2)
    
    print(f"Generated embeddings for {len(embeddings_data)} chunks")

if __name__ == "__main__":
    generate_embeddings("paul_graham_chunks.json", "paul_graham_embeddings.json")