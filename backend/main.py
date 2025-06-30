from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime
import json

# Import our modules
from agents.agent_orchestrator import AgentOrchestrator
from services.appwrite_service import AppwriteService
from models.schemas import *

# Load environment variables
load_dotenv()

app = FastAPI(title="CompeteIQ Backend API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
appwrite_service = AppwriteService()
agent_orchestrator = AgentOrchestrator()

# WebSocket connections for real-time progress
websocket_connections: Dict[str, WebSocket] = {}

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "CompeteIQ Backend API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"message": "CompeteIQ Backend API is running", "status": "healthy"}

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        # Check if required environment variables are set
        required_vars = {
            "APPWRITE_API_KEY": os.getenv("APPWRITE_API_KEY"),
            "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
            "TAVILY_API_KEY": os.getenv("TAVILY_API_KEY")
        }
        
        missing_vars = [var for var, value in required_vars.items() if not value]
        
        if missing_vars:
            print("⚠️  Warning: Missing required environment variables:")
            for var in missing_vars:
                print(f"   - {var}")
            print("   Some features may not work properly.")
            print("   Please set these variables in your .env file.")
            return
        
        await appwrite_service.initialize()
        print("✅ Backend services initialized successfully")
        
    except Exception as e:
        print(f"❌ Failed to initialize backend services: {e}")
        print("   The server will start but some features may not work.")
        print("   Please check your environment variables and API keys.")

@app.websocket("/ws/analysis/{analysis_id}")
async def websocket_endpoint(websocket: WebSocket, analysis_id: str):
    await websocket.accept()
    websocket_connections[analysis_id] = websocket
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if analysis_id in websocket_connections:
            del websocket_connections[analysis_id]

async def send_progress_update(analysis_id: str, progress_data: dict):
    """Send progress update to connected WebSocket clients"""
    if analysis_id in websocket_connections:
        try:
            await websocket_connections[analysis_id].send_json(progress_data)
        except Exception as e:
            print(f"Failed to send progress update: {e}")

# Authentication endpoints (using Appwrite)
@app.post("/auth/login")
async def login(credentials: LoginRequest):
    try:
        session = await appwrite_service.login(credentials.email, credentials.password)
        return {"session": session, "message": "Login successful"}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/auth/logout")
async def logout():
    try:
        await appwrite_service.logout()
        return {"message": "Logout successful"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/auth/user")
async def get_user():
    try:
        user = await appwrite_service.get_current_user()
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/auth/register")
async def register(user_data: RegisterRequest):
    try:
        user = await appwrite_service.register(user_data.email, user_data.password, user_data.name)
        return {"user": user, "message": "Registration successful"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Company Analysis endpoints
@app.post("/api/analyze-company")
async def analyze_company(request: CompanyAnalysisRequest):
    try:
        print(f"Analysis requested by user: {request.user_name}")
        
        # Try to get current user, but don't require authentication
        # user = await appwrite_service.get_current_user()
        user = {"$id": request.user_name}
        if user is None:
            print("User not authenticated, using default user")
            # Use a default user ID for unauthenticated requests
            user = {"$id": "default_user"}

        # Create analysis ID
        analysis_id = str(uuid.uuid4())
        company_id = str(uuid.uuid4())

        # Store company data in Appwrite
        company_data = {
            "name": request.name,
            "website_url": request.website_url,
            "product_description": request.product_description,
            "market_category": request.market_category,
            "analysis_status": "pending",
            "user_id": user["$id"]
        }
        
        await appwrite_service.create_company(company_id, company_data)

        # Create analysis record
        analysis_data = {
            "company_id": company_id,
            "user_id": user["$id"],
            "status": "pending"
        }
        
        await appwrite_service.create_analysis(analysis_id, analysis_data)

        # Start analysis in background
        asyncio.create_task(run_analysis(analysis_id, company_data, user["$id"], request.user_name))

        return {
            "analysis_id": analysis_id,
            "company_id": company_id,
            "status": "started",
            "estimated_duration": 120
        }

    except Exception as e:
        print(f"Error in analyze_company: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def run_analysis(analysis_id: str, company_data: dict, user_id: str, user_name: str):
    """Run the complete analysis using Agno agent orchestration"""
    try:
        # Update status to in_progress
        await appwrite_service.update_analysis(analysis_id, {"status": "in_progress"})
        
        # Run analysis using Agno agent orchestrator
        result = await agent_orchestrator.run_analysis(
            analysis_id=analysis_id,
            company_data=company_data,
            user_id=user_id,
            user_name=user_name,
            progress_callback=lambda step, progress, status, message: 
                asyncio.create_task(send_progress_update(analysis_id, {
                    "step": step,
                    "progress": progress,
                    "status": status,
                    "message": message
                }))
        )

        # Store results in Appwrite
        # Convert Pydantic models to dictionaries and then to JSON
        def convert_to_json_serializable(obj):
            if isinstance(obj, (list, tuple)):
                return [convert_to_json_serializable(item) for item in obj]
            elif hasattr(obj, 'dict'):  # Check if it's a Pydantic model
                return obj.dict()
            return obj
            
        # Convert Pydantic models to dictionaries and then to JSON strings
        competitors_json = json.dumps(convert_to_json_serializable(result["competitors"]))
        market_trends_json = json.dumps(convert_to_json_serializable(result["market_trends"]))
        market_gaps_json = json.dumps(convert_to_json_serializable(result["market_gaps"]))
        competitive_advantages_json = json.dumps(convert_to_json_serializable(result["competitive_advantages"]))
        
        print(f"DEBUG: JSON lengths - competitors: {len(competitors_json)}, trends: {len(market_trends_json)}, gaps: {len(market_gaps_json)}, advantages: {len(competitive_advantages_json)}")
        
        try:
            await appwrite_service.update_analysis(analysis_id, {
                "status": "completed",
                "competitors": competitors_json,
                "market_trends": market_trends_json,
                "market_gaps": market_gaps_json,
                "positioning_strategy": result["positioning_strategy"][:250] if len(result["positioning_strategy"]) > 250 else result["positioning_strategy"],
                "competitive_advantages": competitive_advantages_json
            })
            print(f"DEBUG: Successfully stored analysis results for {analysis_id}")
        except Exception as storage_error:
            print(f"ERROR: Failed to store analysis results in Appwrite: {storage_error}")
            # Try to store a minimal version with just the status
            try:
                await appwrite_service.update_analysis(analysis_id, {
                    "status": "completed",
                    "competitors": "Analysis completed but data too large for storage",
                    "market_trends": "Analysis completed but data too large for storage",
                    "market_gaps": "Analysis completed but data too large for storage",
                    "positioning_strategy": result["positioning_strategy"][:200] if len(result["positioning_strategy"]) > 200 else result["positioning_strategy"],
                    "competitive_advantages": "Analysis completed but data too large for storage"
                })
                print(f"DEBUG: Stored minimal analysis results for {analysis_id}")
            except Exception as minimal_storage_error:
                print(f"ERROR: Failed to store even minimal analysis results: {minimal_storage_error}")
                raise Exception(f"Analysis completed but failed to store results: {storage_error}")

    except Exception as e:
        print(f"Analysis failed: {e}")
        # Try to update status to failed, but don't let this error propagate
        try:
            await appwrite_service.update_analysis(analysis_id, {"status": "failed"})
        except Exception as update_error:
            print(f"Failed to update analysis status to failed: {update_error}")
        raise

@app.get("/api/analysis/{analysis_id}/progress")
async def get_analysis_progress(analysis_id: str):
    try:
        analysis = await appwrite_service.get_analysis(analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")

        # Get progress from agent orchestrator
        progress = agent_orchestrator.get_progress(analysis_id)
        
        return {
            "analysis_id": analysis_id,
            "current_step": progress.get("current_step", "unknown"),
            "progress": progress.get("progress", 0),
            "status": analysis.get("status", "pending"),
            "steps": progress.get("steps", [])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analysis/{analysis_id}")
async def get_analysis_results(analysis_id: str):
    try:
        analysis = await appwrite_service.get_analysis(analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")

        company = await appwrite_service.get_company(analysis["company_id"])

        # Safely parse JSON fields with error handling
        def safe_json_loads(json_str, default_value):
            if not json_str:
                return default_value
            try:
                return json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"WARNING: Invalid JSON in analysis {analysis_id}: {e}")
                print(f"JSON string: {json_str}")
                return default_value

        return {
            "analysis_id": analysis_id,
            "company": {
                "name": company["name"],
                "website_url": company["website_url"]
            },
            "competitors": safe_json_loads(analysis.get("competitors"), []),
            "market_trends": safe_json_loads(analysis.get("market_trends"), []),
            "market_gaps": safe_json_loads(analysis.get("market_gaps"), []),
            "positioning_strategy": analysis.get("positioning_strategy", ""),
            "competitive_advantages": safe_json_loads(analysis.get("competitive_advantages"), [])
        }

    except Exception as e:
        print(f"ERROR: Failed to get analysis results for {analysis_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Marketing Asset Generation endpoints
@app.post("/api/generate-script")
async def generate_script(request: ScriptGenerationRequest):
    try:
        user = await appwrite_service.get_current_user()
        if not user:
            raise HTTPException(status_code=401, detail="User not authenticated")

        # Get analysis data
        analysis = await appwrite_service.get_analysis(request.analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")

        # Generate script using Agno agent orchestrator
        script = await agent_orchestrator.generate_marketing_script(
            analysis_id=request.analysis_id,
            style=request.style,
            duration=request.duration,
            user_id=user["$id"]
        )

        # Store marketing asset
        asset_id = str(uuid.uuid4())
        asset_data = {
            "company_id": analysis["company_id"],
            "analysis_id": request.analysis_id,
            "user_id": user["$id"],
            "script_content": script,
            "duration": request.duration,
            "style": request.style,
            "status": "script_generated"
        }
        
        await appwrite_service.create_marketing_asset(asset_id, asset_data)

        return {"script": script, "asset_id": asset_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-images")
async def generate_images(request: ImageGenerationRequest):
    try:
        user = await appwrite_service.get_current_user()
        if not user:
            raise HTTPException(status_code=401, detail="User not authenticated")

        # Generate images using Agno agent orchestrator
        images = await agent_orchestrator.generate_images(
            script=request.script,
            company_name=request.company_name,
            style=request.style
        )

        return {"images": images}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-audio")
async def generate_audio(request: AudioGenerationRequest):
    try:
        user = await appwrite_service.get_current_user()
        if not user:
            raise HTTPException(status_code=401, detail="User not authenticated")

        # Generate audio using Agno agent orchestrator
        audio_url = await agent_orchestrator.generate_audio(
            script=request.script,
            voice=request.voice
        )

        return {"audio_url": audio_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Session management endpoints - COMMENTED OUT TO FOCUS ON CORE FUNCTIONALITY
# @app.get("/api/sessions")
# async def get_user_sessions():
#     try:
#         user = await appwrite_service.get_current_user()
#         if not user:
#             raise HTTPException(status_code=401, detail="User not authenticated")
# 
#         sessions = await appwrite_service.get_user_sessions(user["$id"])
#         return {"sessions": sessions}
# 
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
# 
# @app.post("/api/sessions")
# async def create_session(session_data: SessionCreateRequest):
#     try:
#         user = await appwrite_service.get_current_user()
#         if not user:
#             raise HTTPException(status_code=401, detail="User not authenticated")
# 
#         session = await appwrite_service.create_session({
#             "session_name": session_data.session_name,
#             "company_data": session_data.company_data,
#             "analysis_data": session_data.analysis_data,
#             "app_state": session_data.app_state,
#             "user_id": user["$id"],
#             "is_active": True
#         })
# 
#         return {"session": session}
# 
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7000) 