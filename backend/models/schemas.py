from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Authentication schemas
class LoginRequest(BaseModel):
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")

class RegisterRequest(BaseModel):
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")
    name: str = Field(..., description="User name")

# Company Analysis schemas
class CompanyAnalysisRequest(BaseModel):
    name: str = Field(..., description="Company name")
    website_url: str = Field(..., description="Company website URL")
    product_description: str = Field(..., description="Product description")
    market_category: str = Field(..., description="Market category")
    user_name: Optional[str] = Field(None, description="Logged-in user's name")

class CompetitorData(BaseModel):
    name: str = Field(..., description="Competitor name")
    website: str = Field(..., description="Competitor website")
    market_share: float = Field(..., description="Market share percentage")
    strengths: List[str] = Field(..., description="Competitor strengths")
    weaknesses: List[str] = Field(..., description="Competitor weaknesses")

class MarketTrend(BaseModel):
    trend: str = Field(..., description="Trend description")
    impact: str = Field(..., description="Impact on market")
    confidence: int = Field(..., ge=0, le=100, description="Confidence level")

class AnalysisResult(BaseModel):
    analysis_id: str = Field(..., description="Analysis ID")
    company: Dict[str, str] = Field(..., description="Company information")
    competitors: List[CompetitorData] = Field(..., description="Competitor analysis")
    market_trends: List[MarketTrend] = Field(..., description="Market trends")
    market_gaps: List[str] = Field(..., description="Market gaps")
    positioning_strategy: str = Field(..., description="Positioning strategy")
    competitive_advantages: List[str] = Field(..., description="Competitive advantages")

class AnalysisProgress(BaseModel):
    analysis_id: str = Field(..., description="Analysis ID")
    current_step: str = Field(..., description="Current analysis step")
    progress: int = Field(..., ge=0, le=100, description="Progress percentage")
    status: str = Field(..., description="Analysis status")
    steps: List[Dict[str, Any]] = Field(..., description="Analysis steps")

# Marketing Asset Generation schemas
class ScriptGenerationRequest(BaseModel):
    analysis_id: str = Field(..., description="Analysis ID")
    style: str = Field(default="professional", description="Script style")
    duration: int = Field(default=30, ge=15, le=60, description="Script duration in seconds")

class ImageGenerationRequest(BaseModel):
    script: str = Field(..., description="Marketing script")
    company_name: str = Field(..., description="Company name")
    style: str = Field(default="professional", description="Image style")

class AudioGenerationRequest(BaseModel):
    script: str = Field(..., description="Script to convert to audio")
    voice: str = Field(default="professional_male", description="Voice type")

class GeneratedImage(BaseModel):
    url: str = Field(..., description="Image URL")
    prompt: str = Field(..., description="Image generation prompt")
    timestamp: float = Field(..., description="Timestamp in seconds")

# Session management schemas
class SessionCreateRequest(BaseModel):
    session_name: str = Field(..., description="Session name")
    company_data: Optional[Dict[str, Any]] = Field(None, description="Company data")
    analysis_data: Optional[Dict[str, Any]] = Field(None, description="Analysis data")
    app_state: str = Field(..., description="Application state")

class SessionData(BaseModel):
    session_id: str = Field(..., description="Session ID")
    session_name: str = Field(..., description="Session name")
    company_data: Optional[Dict[str, Any]] = Field(None, description="Company data")
    analysis_data: Optional[Dict[str, Any]] = Field(None, description="Analysis data")
    app_state: str = Field(..., description="Application state")
    last_accessed: datetime = Field(..., description="Last accessed timestamp")
    is_active: bool = Field(..., description="Whether session is active")

# Appwrite database schemas
class CompanyDocument(BaseModel):
    id: str = Field(..., description="Document ID")
    name: str = Field(..., description="Company name")
    website_url: str = Field(..., description="Company website URL")
    product_description: str = Field(..., description="Product description")
    market_category: str = Field(..., description="Market category")
    analysis_status: str = Field(default="pending", description="Analysis status")
    scraped_data: Optional[str] = Field(None, description="Scraped data")
    user_id: str = Field(..., description="User ID")
    createdAt: datetime = Field(..., description="Creation timestamp")
    updatedAt: datetime = Field(..., description="Update timestamp")

class AnalysisDocument(BaseModel):
    id: str = Field(..., description="Document ID")
    company_id: str = Field(..., description="Company ID")
    user_id: str = Field(..., description="User ID")
    competitors: Optional[str] = Field(None, description="Competitors data (JSON)")
    market_trends: Optional[str] = Field(None, description="Market trends data (JSON)")
    market_gaps: Optional[str] = Field(None, description="Market gaps data (JSON)")
    positioning_strategy: Optional[str] = Field(None, description="Positioning strategy")
    competitive_advantages: Optional[str] = Field(None, description="Competitive advantages (JSON)")
    status: str = Field(default="pending", description="Analysis status")
    createdAt: datetime = Field(..., description="Creation timestamp")
    updatedAt: datetime = Field(..., description="Update timestamp")

class MarketingAssetDocument(BaseModel):
    id: str = Field(..., description="Document ID")
    company_id: str = Field(..., description="Company ID")
    analysis_id: str = Field(..., description="Analysis ID")
    user_id: str = Field(..., description="User ID")
    script_content: Optional[str] = Field(None, description="Script content")
    audio_url: Optional[str] = Field(None, description="Audio URL")
    images: Optional[str] = Field(None, description="Images data (JSON)")
    duration: int = Field(default=30, description="Duration in seconds")
    style: Optional[str] = Field(None, description="Style")
    status: str = Field(default="pending", description="Asset status")
    createdAt: datetime = Field(..., description="Creation timestamp")
    updatedAt: datetime = Field(..., description="Update timestamp")

# Response schemas
class StandardResponse(BaseModel):
    success: bool = Field(..., description="Success status")
    message: str = Field(..., description="Response message")
    data: Optional[Dict[str, Any]] = Field(None, description="Response data")

class ErrorResponse(BaseModel):
    success: bool = Field(default=False, description="Success status")
    error: str = Field(..., description="Error message")
    details: Optional[str] = Field(None, description="Error details")

# Agent Response Models
class WebScrapingResponse(BaseModel):
    """Response model for web scraping agent"""
    company_overview: str = Field(..., description="Comprehensive overview of the company")
    products: List[str] = Field(..., description="List of key products and services")
    target_audience: str = Field(..., description="Primary target audience and market segments")
    pricing: str = Field(..., description="Pricing strategy and model")
    features: List[str] = Field(..., description="Key features and capabilities")
    technology: str = Field(..., description="Technology stack and infrastructure")

class CompetitorInfoResponse(BaseModel):
    """Response model for competitor information"""
    name: str = Field(..., description="Competitor company name")
    website: str = Field(..., description="Competitor website URL")
    market_share: float = Field(..., description="Estimated market share percentage")
    strengths: List[str] = Field(..., description="Key strengths and competitive advantages")
    weaknesses: List[str] = Field(..., description="Weaknesses and areas of opportunity")

class MarketTrendResponse(BaseModel):
    """Response model for market trend information"""
    trend: str = Field(..., description="Trend name and description")
    impact: str = Field(..., description="Impact level and description (High/Medium/Low)")
    confidence: float = Field(..., ge=0, le=100, description="Confidence level (0-100)")

class MarketPositioningResponse(BaseModel):
    """Response model for market positioning strategy"""
    strategy: str = Field(..., description="Clear positioning statement and strategy")
    market_gaps: List[str] = Field(..., description="Identified gaps in the market that the company can fill")
    advantages: List[str] = Field(..., description="Unique competitive advantages over competitors")