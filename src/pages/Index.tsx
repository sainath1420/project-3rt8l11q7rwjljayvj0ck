import React, { useState, useEffect } from 'react';
import { CompanyAnalysisForm } from '@/components/CompanyAnalysisForm';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { AssetGeneration } from '@/components/AssetGeneration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, Zap } from 'lucide-react';
import { useSession } from '@/hooks/useSession';

export type AppState = 'input' | 'analyzing' | 'results' | 'generating';

export interface CompanyData {
  name: string;
  website_url: string;
  product_description: string;
  market_category: string;
}

export interface AnalysisData {
  competitors: any[];
  market_trends: any[];
  market_gaps: string[];
  positioning_strategy: string;
  competitive_advantages: string[];
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>('input');
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  
  const { user, sessionLoaded, saveSession, loadSession, clearSession } = useSession();

  // Restore session when user is loaded
  useEffect(() => {
    if (sessionLoaded && user) {
      const session = loadSession();
      if (session) {
        if (session.companyData) setCompanyData(session.companyData);
        if (session.analysisData) setAnalysisData(session.analysisData);
        if (session.appState) setAppState(session.appState as AppState);
      }
    }
  }, [sessionLoaded, user]);

  // Save session whenever state changes
  useEffect(() => {
    if (sessionLoaded && user) {
      saveSession({
        appState,
        companyData,
        analysisData
      });
    }
  }, [appState, companyData, analysisData, sessionLoaded, user]);

  const handleAnalysisStart = (data: CompanyData) => {
    setCompanyData(data);
    setAppState('analyzing');
  };

  const handleAnalysisComplete = (data: AnalysisData) => {
    setAnalysisData(data);
    setAppState('results');
  };

  const handleGenerateAssets = () => {
    setAppState('generating');
  };

  const handleBackToInput = () => {
    setAppState('input');
    setCompanyData(null);
    setAnalysisData(null);
    clearSession();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CompeteIQ</h1>
                <p className="text-sm text-gray-500">AI-Powered Competitive Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Zap className="w-3 h-3 mr-1" />
                Enterprise Ready
              </Badge>
              {user && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {user.full_name || user.email}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {appState === 'input' && (
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Outsmart Your Competition with AI
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Get instant competitive intelligence, market insights, and generate compelling marketing content in minutes.
              </p>
              
              {/* Feature Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <CardTitle className="text-lg">Competitor Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">
                      Identify competitors, analyze strengths & weaknesses
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <CardTitle className="text-lg">Market Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">
                      Predict trends and identify market opportunities
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <Brain className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <CardTitle className="text-lg">AI Marketing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">
                      Generate scripts, audio, and visuals for ads
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <CompanyAnalysisForm onSubmit={handleAnalysisStart} />
          </div>
        )}

        {appState === 'analyzing' && companyData && (
          <AnalysisProgress 
            companyData={companyData}
            onComplete={handleAnalysisComplete}
            onBack={handleBackToInput}
          />
        )}

        {appState === 'results' && analysisData && companyData && (
          <ResultsDashboard 
            companyData={companyData}
            analysisData={analysisData}
            onGenerateAssets={handleGenerateAssets}
            onBack={handleBackToInput}
          />
        )}

        {appState === 'generating' && analysisData && companyData && (
          <AssetGeneration 
            companyData={companyData}
            analysisData={analysisData}
            onBack={() => setAppState('results')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">Powered by Advanced AI Technology</p>
            <p className="text-sm">Enterprise-grade competitive intelligence platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;