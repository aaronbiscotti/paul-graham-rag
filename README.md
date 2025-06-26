# Paul Graham RAG Chatbot

A complete RAG system that creates embeddings from Paul Graham's essays and provides an AI interface.

## What This Does

1. Aggregates PG's essays from his website
2. Chunks the text into manageable pieces 
3. Creates embeddings using Google's Gemini AI
4. Stores embeddings in Supabase vector database `pgvector`
5. Provides chatbot API and web interface

## Quick Start

### Prerequisites
- Python 3.8+ (preferred)
- Node.js 18+ (preferred)
- Google Gemini API key
- Supabase account

### 1. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run these queries

```sql
-- Creates table for embeddings
CREATE TABLE paul_graham_chunks (
    id SERIAL PRIMARY KEY,
    url TEXT,
    title TEXT,
    chunk_id INTEGER,
    content TEXT,
    embedding vector(768)
);

-- Creates function for similarity search
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(768),
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id bigint,
  content text,
  title text,
  url text,
  chunk_id integer,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    paul_graham_chunks.id,
    paul_graham_chunks.content,
    paul_graham_chunks.title,
    paul_graham_chunks.url,
    paul_graham_chunks.chunk_id,
    1 - (paul_graham_chunks.embedding <=> query_embedding) AS similarity
  FROM paul_graham_chunks
  ORDER BY paul_graham_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

3. Get your Supabase URL and service role key from Settings > API

### 2. Setup Backend

```bash
cd backend

pip install -r requirements.txt
```

### 3. Create Embeddings (Only need to run this once)

```bash
# 1. Get the PG essays

# 2. Split into chunks
python chunking.py

# 3. Create embeddings with Gemini embed model
python generate_embeddings.py

# 4. Store in Supabase
python insert_embeddings.py
```

### 4. Start Backend Server

```bash
python main.py
```

Backend runs at `http://localhost:8080`

### 5. Setup Frontend

```bash
cd ../frontend
npm install
echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env.local
npm run dev
```

Frontend runs at `http://localhost:3000`

## Customization

### Use Your Own Data Source

You can create your own script to insert data to the database. Postgres, Pinecone, etc. work as well, I just chose to use Supabase for simplicity.
1. **Modify `chunking.py`**: Adjust chunk size for your content type
2. **Update `chatbot.py`**: Change the prompt to match your domain
