// API client for connecting to our backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000';

export interface CompanyInput {
  name: string;
  website_url: string;
  product_description: string;
  market_category: string;
}

export interface AnalysisProgress {
  step: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message?: string;
}

export interface CompetitorData {
  name: string;
  website: string;
  market_share: number;
  strengths: string[];
  weaknesses: string[];
}

export interface MarketTrend {
  trend: string;
  impact: string;
  confidence: number;
}

export interface AnalysisResult {
  competitors: CompetitorData[];
  market_trends: MarketTrend[];
  market_gaps: string[];
  positioning_strategy: string;
  competitive_advantages: string[];
}

export interface ScriptGenerationRequest {
  analysis_id: string;
  style: string;
  duration: number;
}

export interface ImageGenerationRequest {
  script: string;
  company_name: string;
  style: string;
}

export interface AudioGenerationRequest {
  script: string;
  voice: string;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`🌐 Making API request to: ${url}`);
    console.log(`📤 Request data:`, options.body ? JSON.parse(options.body as string) : 'No body');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      console.log(`📥 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API request failed: ${response.status} ${response.statusText}`);
        console.error(`❌ Error details:`, errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ API request successful:`, data);
      return data;
    } catch (error) {
      console.error('❌ API request error:', error);
      throw error;
    }
  }

  // Company Analysis
  async analyzeCompany(input: CompanyInput): Promise<{ analysis_id: string; company_id: string; status: string; estimated_duration: number }> {
    return this.request('/api/analyze-company', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getAnalysisProgress(analysisId: string): Promise<{
    analysis_id: string;
    current_step: string;
    progress: number;
    status: string;
    steps: Array<{ name: string; status: string; progress: number; agent: string }>;
  }> {
    return this.request(`/api/analysis/${analysisId}/progress`);
  }

  async getAnalysisResults(analysisId: string): Promise<{
    analysis_id: string;
    company: { name: string; website_url: string };
    competitors: CompetitorData[];
    market_trends: MarketTrend[];
    market_gaps: string[];
    positioning_strategy: string;
    competitive_advantages: string[];
  }> {
    return this.request(`/api/analysis/${analysisId}`);
  }

  // Marketing Assets
  async generateScript(request: ScriptGenerationRequest): Promise<{ script: string; asset_id: string }> {
    return this.request('/api/generate-script', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async generateImages(request: ImageGenerationRequest): Promise<{ images: Array<{ url: string; prompt: string; timestamp: number; source: string }> }> {
    return this.request('/api/generate-images', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async generateAudio(request: AudioGenerationRequest): Promise<{ audio_url: string }> {
    return this.request('/api/generate-audio', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Authentication
  async login(email: string, password: string): Promise<{ session: any; message: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<any> {
    return this.request('/auth/user');
  }

  async register(email: string, password: string, name: string): Promise<{ user: any; message: string }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }
}

// Export a singleton instance
export const apiClient = new APIClient();

// Legacy API class for backward compatibility
export class CompetitiveIntelligenceAPI {
  private progressCallback?: (progress: AnalysisProgress) => void;

  setProgressCallback(callback: (progress: AnalysisProgress) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(step: string, progress: number, status: AnalysisProgress['status'], message?: string) {
    if (this.progressCallback) {
      this.progressCallback({ step, progress, status, message });
    }
  }

  async analyzeCompany(input: CompanyInput): Promise<{ analysis_id: string; company_id: string; status: string; estimated_duration: number }> {
    return apiClient.analyzeCompany(input);
  }

  async getAnalysisProgress(analysisId: string) {
    return apiClient.getAnalysisProgress(analysisId);
  }

  async getAnalysisResults(analysisId: string) {
    return apiClient.getAnalysisResults(analysisId);
  }

  async generateMarketingScript(analysisId: string, style: string, duration: number): Promise<string> {
    const result = await apiClient.generateScript({ analysis_id: analysisId, style, duration });
    return result.script;
  }

  async generateAdImages(script: string, companyName: string, style: string = "professional"): Promise<Array<{url: string, prompt: string, timestamp: number}>> {
    const result = await apiClient.generateImages({ script, company_name: companyName, style });
    return result.images;
  }
}