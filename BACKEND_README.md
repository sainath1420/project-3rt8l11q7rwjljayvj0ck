# CompeteIQ Backend API Documentation

## Overview
CompeteIQ is an AI-powered competitive intelligence platform that uses multiple specialized agents to analyze companies, identify market opportunities, and generate marketing assets. The backend integrates with sponsor tools: Tavily, Keywords AI, Mem0, Appwrite, and uses Agno for agent orchestration.

## Architecture Overview

### Multi-Agent System (Using Agno Framework)
The analysis process uses 4 specialized agents:

1. **Web Scraping Agent** - Extracts company data using Tavily
2. **Competitor Research Agent** - Finds and analyzes competitors
3. **Trend Prediction Agent** - Identifies market trends and opportunities
4. **Market Positioning Agent** - Develops positioning strategies

### Technology Stack
- **Framework**: Agno (for agent orchestration)
- **Database & Auth**: Appwrite
- **Web Search & Scraping**: Tavily API
- **LLM Monitoring**: Keywords AI
- **Memory & Context**: Mem0
- **Session Management**: Appwrite Sessions + Mem0

## Environment Variables

```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id

# Tavily API (Web Search & Scraping)
TAVILY_API_KEY=your_tavily_api_key

# Keywords AI (LLM Monitoring)
KEYWORDS_AI_API_KEY=your_keywords_ai_key

# Mem0 (Agent Memory)
MEM0_API_KEY=your_mem0_api_key

# OpenAI/LLM Provider
OPENAI_API_KEY=your_openai_key

# Agno Configuration
AGNO_API_KEY=your_agno_key
```

## Database Schema (Appwrite Collections)

### Companies Collection
```json
{
  "name": "companies",
  "attributes": [
    {"key": "name", "type": "string", "required": true},
    {"key": "website_url", "type": "string", "required": true},
    {"key": "product_description", "type": "string", "required": true},
    {"key": "market_category", "type": "string", "required": true},
    {"key": "analysis_status", "type": "string", "default": "pending"},
    {"key": "scraped_data", "type": "string"},
    {"key": "user_id", "type": "string", "required": true}
  ]
}
```

### Analyses Collection
```json
{
  "name": "analyses",
  "attributes": [
    {"key": "company_id", "type": "string", "required": true},
    {"key": "user_id", "type": "string", "required": true},
    {"key": "competitors", "type": "string"},
    {"key": "market_trends", "type": "string"},
    {"key": "market_gaps", "type": "string"},
    {"key": "positioning_strategy", "type": "string"},
    {"key": "competitive_advantages", "type": "string"},
    {"key": "status", "type": "string", "default": "pending"}
  ]
}
```

### Marketing Assets Collection
```json
{
  "name": "marketing_assets",
  "attributes": [
    {"key": "company_id", "type": "string", "required": true},
    {"key": "analysis_id", "type": "string", "required": true},
    {"key": "user_id", "type": "string", "required": true},
    {"key": "script_content", "type": "string"},
    {"key": "audio_url", "type": "string"},
    {"key": "images", "type": "string"},
    {"key": "duration", "type": "integer", "default": 30},
    {"key": "style", "type": "string"},
    {"key": "status", "type": "string", "default": "pending"}
  ]
}
```

## API Endpoints

### Authentication (Appwrite)
```
POST /auth/login
POST /auth/logout
GET /auth/user
POST /auth/register
```

### Company Analysis

#### 1. Start Analysis
```
POST /api/analyze-company
```

**Request Body:**
```json
{
  "name": "Slack",
  "website_url": "https://slack.com",
  "product_description": "Team communication platform",
  "market_category": "SaaS"
}
```

**Response:**
```json
{
  "analysis_id": "uuid",
  "company_id": "uuid",
  "status": "started",
  "estimated_duration": 120
}
```

#### 2. Get Analysis Progress
```
GET /api/analysis/{analysis_id}/progress
```

**Response:**
```json
{
  "analysis_id": "uuid",
  "current_step": "competitor_research",
  "progress": 45,
  "status": "in_progress",
  "steps": [
    {
      "name": "web_scraping",
      "status": "completed",
      "progress": 100,
      "agent": "web_scraping_agent"
    },
    {
      "name": "competitor_research", 
      "status": "in_progress",
      "progress": 45,
      "agent": "competitor_research_agent"
    }
  ]
}
```

#### 3. Get Analysis Results
```
GET /api/analysis/{analysis_id}
```

**Response:**
```json
{
  "analysis_id": "uuid",
  "company": {
    "name": "Slack",
    "website_url": "https://slack.com"
  },
  "competitors": [
    {
      "name": "Microsoft Teams",
      "website": "https://teams.microsoft.com",
      "market_share": 35,
      "strengths": ["Enterprise integration", "Office 365 bundle"],
      "weaknesses": ["Complex interface", "Performance issues"]
    }
  ],
  "market_trends": [
    {
      "trend": "Remote work acceleration",
      "impact": "Positive - increased demand for collaboration tools",
      "confidence": 85
    }
  ],
  "market_gaps": [
    "SMB-focused pricing tiers",
    "Industry-specific templates"
  ],
  "positioning_strategy": "Position as the most user-friendly...",
  "competitive_advantages": [
    "Superior user experience",
    "Extensive app ecosystem"
  ]
}
```

### Marketing Asset Generation

#### 1. Generate Marketing Script
```
POST /api/generate-script
```

**Request Body:**
```json
{
  "analysis_id": "uuid",
  "style": "professional",
  "duration": 30
}
```

#### 2. Generate Images
```
POST /api/generate-images
```

**Request Body:**
```json
{
  "script": "Your 30-second script...",
  "company_name": "Slack",
  "style": "professional"
}
```

#### 3. Generate Audio
```
POST /api/generate-audio
```

**Request Body:**
```json
{
  "script": "Your 30-second script...",
  "voice": "professional_male"
}
```

## Agent Implementation (Agno Framework)

### 1. Web Scraping Agent
```python
from agno import Agent
from tavily import TavilyClient

class WebScrapingAgent(Agent):
    def __init__(self):
        super().__init__(name="web_scraping_agent")
        self.tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
    
    async def execute(self, company_data):
        # Use Tavily to scrape company website
        search_results = await self.tavily.search(
            query=f"site:{company_data['website_url']} company information",
            search_depth="advanced"
        )
        
        # Extract structured data
        extracted_data = self.extract_company_info(search_results)
        
        # Store in Mem0 for context
        await self.store_memory(company_data['id'], extracted_data)
        
        return extracted_data
```

### 2. Competitor Research Agent
```python
class CompetitorResearchAgent(Agent):
    def __init__(self):
        super().__init__(name="competitor_research_agent")
        self.tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
    
    async def execute(self, company_data, context):
        # Search for competitors using Tavily
        competitors_query = f"{company_data['market_category']} competitors {company_data['name']}"
        
        search_results = await self.tavily.search(
            query=competitors_query,
            search_depth="advanced",
            max_results=10
        )
        
        # Analyze each competitor
        competitors = []
        for result in search_results:
            competitor_analysis = await self.analyze_competitor(result)
            competitors.append(competitor_analysis)
        
        return competitors
```

### 3. Trend Prediction Agent
```python
class TrendPredictionAgent(Agent):
    def __init__(self):
        super().__init__(name="trend_prediction_agent")
        self.keywords_ai = KeywordsAI(api_key=os.getenv("KEYWORDS_AI_API_KEY"))
    
    async def execute(self, company_data, competitors):
        # Use Keywords AI for trend analysis
        trend_prompt = f"""
        Analyze market trends for {company_data['market_category']} industry.
        Company: {company_data['name']}
        Competitors: {[c['name'] for c in competitors]}
        """
        
        # Monitor LLM usage with Keywords AI
        response = await self.keywords_ai.generate(
            prompt=trend_prompt,
            model="gpt-4",
            track_usage=True
        )
        
        return self.parse_trends(response)
```

### 4. Market Positioning Agent
```python
class MarketPositioningAgent(Agent):
    def __init__(self):
        super().__init__(name="market_positioning_agent")
        self.mem0 = Mem0Client(api_key=os.getenv("MEM0_API_KEY"))
    
    async def execute(self, analysis_data):
        # Retrieve context from Mem0
        context = await self.mem0.get_memories(
            user_id=analysis_data['user_id'],
            agent_id=self.id
        )
        
        # Generate positioning strategy
        positioning = await self.generate_positioning(analysis_data, context)
        
        # Store insights in Mem0 for future use
        await self.mem0.add_memory(
            user_id=analysis_data['user_id'],
            memory=positioning,
            metadata={"type": "positioning_strategy"}
        )
        
        return positioning
```

## Session Management & Memory

### Mem0 Integration
```python
from mem0 import MemoryClient

class SessionManager:
    def __init__(self):
        self.mem0 = MemoryClient(api_key=os.getenv("MEM0_API_KEY"))
        self.appwrite = AppwriteClient()
    
    async def create_session(self, user_id, analysis_data):
        # Create Appwrite session
        session = await self.appwrite.account.create_session(user_id)
        
        # Initialize Mem0 context for this analysis
        await self.mem0.add_memory(
            user_id=user_id,
            memory=f"Started analysis for {analysis_data['company_name']}",
            metadata={
                "session_id": session['$id'],
                "analysis_type": "competitive_intelligence"
            }
        )
        
        return session
    
    async def get_user_context(self, user_id):
        # Retrieve user's analysis history from Mem0
        memories = await self.mem0.get_memories(
            user_id=user_id,
            limit=10
        )
        
        return memories
```

## WebSocket Implementation (Real-time Progress)

```python
from fastapi import WebSocket
import asyncio

class ProgressWebSocket:
    def __init__(self):
        self.connections = {}
    
    async def connect(self, websocket: WebSocket, analysis_id: str):
        await websocket.accept()
        self.connections[analysis_id] = websocket
    
    async def send_progress(self, analysis_id: str, progress_data):
        if analysis_id in self.connections:
            await self.connections[analysis_id].send_json(progress_data)
    
    async def disconnect(self, analysis_id: str):
        if analysis_id in self.connections:
            del self.connections[analysis_id]
```

## Error Handling & Monitoring

### Keywords AI Integration for Monitoring
```python
class LLMMonitor:
    def __init__(self):
        self.keywords_ai = KeywordsAI(api_key=os.getenv("KEYWORDS_AI_API_KEY"))
    
    async def track_llm_usage(self, agent_name, prompt, response, tokens_used):
        await self.keywords_ai.log_completion(
            agent=agent_name,
            prompt=prompt,
            completion=response,
            tokens=tokens_used,
            metadata={
                "timestamp": datetime.now().isoformat(),
                "service": "competitive_analysis"
            }
        )
```

## Deployment Considerations

1. **Rate Limiting**: Implement rate limiting for API calls
2. **Caching**: Cache analysis results in Appwrite for 24 hours
3. **Queue System**: Use background tasks for long-running analysis
4. **Error Recovery**: Implement retry logic for failed agent executions
5. **Monitoring**: Use Keywords AI dashboard for LLM usage tracking

## Testing Strategy

1. **Unit Tests**: Test each agent individually
2. **Integration Tests**: Test agent orchestration with Agno
3. **API Tests**: Test all endpoints with mock data
4. **Load Tests**: Test concurrent analysis requests
5. **Memory Tests**: Verify Mem0 context persistence

This backend architecture provides a robust foundation for your hackathon project, integrating all sponsor tools effectively while maintaining scalability and monitoring capabilities.