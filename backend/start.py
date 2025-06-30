#!/usr/bin/env python3
"""
Startup script for CompeteIQ Backend
"""

import os
import sys
import uvicorn
from dotenv import load_dotenv

def main():
    """Main startup function"""
    # Load environment variables
    load_dotenv()
    
    # Check required environment variables
    required_vars = [
        # "APPWRITE_ENDPOINT",
        # "APPWRITE_PROJECT_ID",
        "APPWRITE_API_KEY",
        "OPENAI_API_KEY",
        "TAVILY_API_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease check your .env file and ensure all required variables are set.")
        sys.exit(1)
    
    # Optional but recommended variables
    optional_vars = ["ELEVEN_LABS_API_KEY"]
    for var in optional_vars:
        if not os.getenv(var):
            print(f"⚠️  Warning: {var} not set. Some features may not work.")
    
    print("🚀 Starting CompeteIQ Backend...")
    print(f"   - Host: {os.getenv('HOST', '0.0.0.0')}")
    print(f"   - Port: {os.getenv('PORT', '7000')}")
    print(f"   - Debug: {os.getenv('DEBUG', 'false')}")
    
    # Start the server
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "7000")),
        reload=os.getenv("DEBUG", "false").lower() == "true",
        log_level=os.getenv("LOG_LEVEL", "info").lower()
    )

if __name__ == "__main__":
    main() 