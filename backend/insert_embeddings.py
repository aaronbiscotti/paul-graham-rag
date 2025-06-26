import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def insert_embeddings(input_file, table_name="paul_graham_chunks", batch_size=100):
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    total_batches = (len(data) - 1) // batch_size + 1
    
    for i in range(0, len(data), batch_size):
        batch = data[i:i+batch_size]
        rows = [
            {
                "url": item["url"],
                "title": item["title"],
                "chunk_id": item["chunk_id"],
                "content": item["text"],
                "embedding": item["embedding"],
            }
            for item in batch
        ]
        
        response = supabase.table(table_name).insert(rows).execute()
        current_batch = i // batch_size + 1
        print(f"Inserted batch {current_batch}/{total_batches}: {len(response.data)} records")
    
    print(f"Successfully inserted {len(data)} embeddings into {table_name}")

if __name__ == "__main__":
    insert_embeddings("paul_graham_embeddings.json")