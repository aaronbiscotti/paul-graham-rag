#!/usr/bin/env python3
"""
Startup script for Railway deployment
"""
import os
import sys

# Change to backend directory
os.chdir('backend')
print(f"Changed to directory: {os.getcwd()}")

# Add backend to Python path
sys.path.insert(0, '.')

# Start the FastAPI app
if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment (Railway sets this)
    port = int(os.environ.get("PORT", 8080))
    print(f"Starting FastAPI application on port {port}...")
    
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False) 