import { invokeLLM, generateImage } from '@/integrations/core';

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

  async analyzeCompany(input: CompanyInput): Promise<AnalysisResult> {
    try {
      // Step 1: Web Scraping
      this.updateProgress('Web Scraping', 0, 'in_progress', 'Analyzing company website...');
      const websiteData = await this.scrapeWebsite(input.website_url, input.name);
      this.updateProgress('Web Scraping', 100, 'completed');

      // Step 2: Competitor Research
      this.updateProgress('Competitor Research', 0, 'in_progress', 'Finding competitors...');
      const competitors = await this.findCompetitors(input, websiteData);
      this.updateProgress('Competitor Research', 100, 'completed');

      // Step 3: Trend Prediction
      this.updateProgress('Trend Prediction', 0, 'in_progress', 'Analyzing market trends...');
      const trends = await this.analyzeTrends(input, competitors);
      this.updateProgress('Trend Prediction', 100, 'completed');

      // Step 4: Weakness Analysis
      this.updateProgress('Weakness Analysis', 0, 'in_progress', 'Identifying opportunities...');
      const weaknesses = await this.analyzeWeaknesses(competitors);
      this.updateProgress('Weakness Analysis', 100, 'completed');

      // Step 5: Market Positioning
      this.updateProgress('Market Positioning', 0, 'in_progress', 'Developing strategy...');
      const positioning = await this.generatePositioning(input, competitors, trends);
      this.updateProgress('Market Positioning', 100, 'completed');

      return {
        competitors,
        market_trends: trends,
        market_gaps: weaknesses,
        positioning_strategy: positioning.strategy,
        competitive_advantages: positioning.advantages
      };
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }

  private async scrapeWebsite(url: string, companyName: string) {
    const prompt = `Analyze the website ${url} for ${companyName}. Extract key information about:
    - Main products/services
    - Target audience
    - Value propositions
    - Pricing strategy
    - Company size and market position
    
    Return structured data about the company.`;

    const response = await invokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          products: { type: "array", items: { type: "string" } },
          target_audience: { type: "string" },
          value_propositions: { type: "array", items: { type: "string" } },
          pricing_strategy: { type: "string" },
          company_size: { type: "string" },
          market_position: { type: "string" }
        }
      }
    });

    return response;
  }

  private async findCompetitors(input: CompanyInput, websiteData: any): Promise<CompetitorData[]> {
    const prompt = `Find the top 5-8 competitors for ${input.name} in the ${input.market_category} market. 
    Company description: ${input.product_description}
    
    For each competitor, provide:
    - Company name
    - Website URL
    - Estimated market share (as percentage)
    - Top 3 strengths
    - Top 3 weaknesses
    
    Focus on direct competitors offering similar products/services.`;

    const response = await invokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          competitors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                website: { type: "string" },
                market_share: { type: "number" },
                strengths: { type: "array", items: { type: "string" } },
                weaknesses: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    return response.competitors || [];
  }

  private async analyzeTrends(input: CompanyInput, competitors: CompetitorData[]): Promise<MarketTrend[]> {
    const competitorNames = competitors.map(c => c.name).join(', ');
    
    const prompt = `Analyze current and emerging trends in the ${input.market_category} market. 
    Focus on trends affecting ${input.name} and competitors: ${competitorNames}.
    
    Identify 5-7 key trends with:
    - Trend description
    - Impact on the market (positive/negative/neutral)
    - Confidence level (0-100)`;

    const response = await invokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          trends: {
            type: "array",
            items: {
              type: "object",
              properties: {
                trend: { type: "string" },
                impact: { type: "string" },
                confidence: { type: "number" }
              }
            }
          }
        }
      }
    });

    return response.trends || [];
  }

  private async analyzeWeaknesses(competitors: CompetitorData[]): Promise<string[]> {
    const competitorData = competitors.map(c => 
      `${c.name}: Weaknesses - ${c.weaknesses.join(', ')}`
    ).join('\n');

    const prompt = `Based on competitor weaknesses, identify market gaps and opportunities:
    
    ${competitorData}
    
    List 3-5 specific market gaps or opportunities that could be exploited.`;

    const response = await invokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          market_gaps: { type: "array", items: { type: "string" } }
        }
      }
    });

    return response.market_gaps || [];
  }

  private async generatePositioning(input: CompanyInput, competitors: CompetitorData[], trends: MarketTrend[]) {
    const prompt = `Generate a market positioning strategy for ${input.name} (${input.product_description}) 
    considering competitors and market trends.
    
    Competitors: ${competitors.map(c => c.name).join(', ')}
    Key trends: ${trends.map(t => t.trend).join(', ')}
    
    Provide:
    - Positioning strategy (2-3 sentences)
    - 3-5 competitive advantages to highlight`;

    const response = await invokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          strategy: { type: "string" },
          advantages: { type: "array", items: { type: "string" } }
        }
      }
    });

    return response;
  }

  async generateMarketingScript(companyName: string, analysis: AnalysisResult): Promise<string> {
    const prompt = `Create a compelling 30-second marketing script for ${companyName}.
    
    Use this competitive intelligence:
    - Positioning: ${analysis.positioning_strategy}
    - Competitive advantages: ${analysis.competitive_advantages.join(', ')}
    - Market gaps: ${analysis.market_gaps.join(', ')}
    
    The script should:
    - Be exactly 30 seconds when read aloud
    - Highlight unique value proposition
    - Address market gaps
    - Be persuasive and memorable
    - Include a clear call-to-action`;

    const response = await invokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          script: { type: "string" },
          key_messages: { type: "array", items: { type: "string" } },
          cta: { type: "string" }
        }
      }
    });

    return response.script || '';
  }

  async generateAdImages(script: string, companyName: string): Promise<Array<{url: string, prompt: string, timestamp: number}>> {
    // Generate 3-4 images for different parts of the 30-second ad
    const imagePrompts = [
      `Professional hero shot for ${companyName} - modern, clean, business-focused`,
      `Problem illustration - showing pain points that ${companyName} solves`,
      `Solution visualization - ${companyName} product in action, successful outcome`,
      `Call-to-action visual - encouraging engagement with ${companyName}`
    ];

    const images = [];
    for (let i = 0; i < imagePrompts.length; i++) {
      try {
        const imageResponse = await generateImage({
          prompt: imagePrompts[i]
        });
        
        images.push({
          url: imageResponse.url,
          prompt: imagePrompts[i],
          timestamp: (i * 7.5) // Distribute across 30 seconds
        });
      } catch (error) {
        console.error(`Failed to generate image ${i + 1}:`, error);
      }
    }

    return images;
  }
}

export const competitiveAPI = new CompetitiveIntelligenceAPI();