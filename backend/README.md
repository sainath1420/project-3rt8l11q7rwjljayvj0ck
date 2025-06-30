# CompeteIQ Backend

A competitive intelligence platform backend built with FastAPI and Agno framework for intelligent agent orchestration.

## 🚀 Features

- **Agno Agent Orchestration**: Uses Agno framework for intelligent agent management
- **Web Scraping & Search**: Powered by Tavily tools for comprehensive web research
- **AI-Powered Analysis**: OpenAI integration for intelligent market analysis
- **Memory Management**: Mem0 integration for persistent context and memory
- **Asset Generation**: DALL-E for images, ElevenLabs for audio generation
- **Real-time Progress**: WebSocket support for live analysis progress
- **Authentication**: Appwrite integration for user management
- **Session Management**: Persistent session storage and retrieval

## 🏗️ Architecture

The backend uses a modern async architecture with the following components:

### Core Components

1. **Agent Orchestrator**: Manages the workflow of four specialized agents:
   - Web Scraping Agent (Tavily tools)
   - Competitor Research Agent (Tavily tools)
   - Trend Prediction Agent (Tavily tools)
   - Market Positioning Agent (OpenAI)

2. **Agno Framework Integration**: 
   - Uses `agent.run()` and `agent.arun()` methods
   - Leverages built-in tools: DALL-E, Tavily, ElevenLabs
   - Integrated memory management with Mem0

3. **Service Layer**:
   - AppwriteService: Authentication and database operations
   - AgentOrchestrator: Analysis workflow management

## 📋 Prerequisites

- Python 3.8+
- Appwrite account and project
- OpenAI API key
- Tavily API key
- ElevenLabs API key (optional but recommended)

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

## ⚙️ Configuration

### Required Environment Variables

```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_appwrite_project_id
APPWRITE_API_KEY=your_appwrite_api_key

# OpenAI Configuration (for Agno agents)
OPENAI_API_KEY=your_openai_api_key

# Tavily Configuration (for web search in Agno)
TAVILY_API_KEY=your_tavily_api_key

# ElevenLabs Configuration (for audio generation in Agno)
ELEVEN_LABS_API_KEY=your_elevenlabs_api_key
```

### Optional Environment Variables

```env
# Server Configuration
HOST=0.0.0.0
PORT=7000
DEBUG=true

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Logging Configuration
LOG_LEVEL=INFO
```

## 🚀 Running the Application

### Development Mode

```bash
python start.py
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 7000
```

### Using Docker

```bash
docker build -t competeiq-backend .
docker run -p 7000:7000 competeiq-backend
```

## 📚 API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/user` - Get current user
- `POST /auth/register` - User registration

### Company Analysis

- `POST /api/analyze-company` - Start company analysis
- `GET /api/analysis/{analysis_id}/progress` - Get analysis progress
- `GET /api/analysis/{analysis_id}` - Get analysis results

### Marketing Assets

- `POST /api/generate-script` - Generate marketing script
- `POST /api/generate-images` - Generate images using DALL-E
- `POST /api/generate-audio` - Generate audio using ElevenLabs

### Session Management

- `GET /api/sessions` - Get user sessions
- `POST /api/sessions` - Create new session

### WebSocket

- `WS /ws/analysis/{analysis_id}` - Real-time progress updates

## 🔧 Agno Framework Usage

The backend leverages Agno's powerful agent system:

### Agent Initialization

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.tavily import TavilyTools
from agno.tools.dalle import DalleTools
from agno.tools.eleven_labs import ElevenLabsTools

# Initialize agents with tools
agent = Agent(
    model=OpenAIChat(),
    tools=[TavilyTools()],
    name="web_scraping_agent"
)
```

### Running Agents

```python
# Async execution
response = await agent.arun("Your prompt here")

# Sync execution
response = agent.run("Your prompt here")
```

### Memory Integration

```python
from mem0 import MemoryClient

client = MemoryClient()
memory_context = client.get_all(user_id=user_id)

response = await agent.arun(
    prompt,
    context={"memory": memory_context},
    add_context=True
)
```

## 🧪 Testing

Run the test suite:

```bash
pytest
```

Run with coverage:

```bash
pytest --cov=.
```

## 📊 Monitoring

The application includes built-in monitoring:

- Progress tracking for analysis workflows
- WebSocket real-time updates
- Structured logging with structlog
- Error handling and recovery

## 🔒 Security

- CORS middleware for cross-origin requests
- Environment variable validation
- API key management
- User authentication via Appwrite

## 🚀 Deployment

### Environment Setup

1. Set all required environment variables
2. Configure CORS origins for production
3. Set up proper logging levels
4. Configure database connections

### Production Considerations

- Use a production ASGI server (Gunicorn + Uvicorn)
- Set up proper SSL/TLS certificates
- Configure rate limiting
- Set up monitoring and alerting
- Use environment-specific configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the documentation
- Open an issue on GitHub
- Contact the development team

## 🔄 Changelog

### v1.0.0
- Initial release with Agno framework integration
- Complete agent orchestration system
- Real-time progress tracking
- Marketing asset generation
- Session management 