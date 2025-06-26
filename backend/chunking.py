import json
import re

def split_into_paragraphs(text):
    return [p.strip() for p in re.split(r'\n\s*\n', text) if p.strip()]

def chunk_paragraphs(paragraphs, max_words=350, overlap_words=70):
    chunks = []
    current_chunk = []
    current_word_count = 0
    
    i = 0
    while i < len(paragraphs):
        para = paragraphs[i]
        words = para.split()
        
        if current_word_count + len(words) <= max_words or not current_chunk:
            current_chunk.append(para)
            current_word_count += len(words)
            i += 1
        else:
            chunks.append(current_chunk)
            
            overlap_count = 0
            j = len(current_chunk) - 1
            while j >= 0 and overlap_count < overlap_words:
                overlap_count += len(current_chunk[j].split())
                j -= 1
            
            current_chunk = current_chunk[j+1:]
            current_word_count = sum(len(p.split()) for p in current_chunk)
    
    if current_chunk:
        chunks.append(current_chunk)
    
    return ["\n\n".join(chunk) for chunk in chunks]

def main():
    with open("paul_graham_scraped.json", "r", encoding="utf-8") as f:
        docs = json.load(f)
    
    all_chunks = []
    
    for doc in docs:
        url = doc["url"]
        title = doc.get("title", url.split("/")[-1].replace(".html", ""))
        text = doc["text"]
        
        paragraphs = split_into_paragraphs(text)
        chunks = chunk_paragraphs(paragraphs, max_words=350, overlap_words=70)
        
        for idx, chunk in enumerate(chunks):
            all_chunks.append({
                "url": url,
                "title": title,
                "chunk_id": idx,
                "text": chunk
            })
    
    with open("paul_graham_chunks.json", "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)
    
    print(f"Chunked {len(docs)} documents into {len(all_chunks)} chunks.")

if __name__ == "__main__":
    main()