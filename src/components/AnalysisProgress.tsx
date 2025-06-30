import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Globe, Users, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { CompanyData, AnalysisData } from '@/pages/Index';
import { apiClient, AnalysisProgress as ProgressType } from '@/lib/api';

interface AnalysisProgressProps {
  companyData: CompanyData;
  onComplete: (data: AnalysisData) => void;
  onBack: () => void;
}

const analysisSteps = [
  {
    id: 'web_scraping',
    name: 'Web Scraping',
    description: 'Analyzing company website and extracting key information',
    icon: Globe,
    color: 'text-blue-600'
  },
  {
    id: 'competitor_research',
    name: 'Competitor Research',
    description: 'Finding and analyzing direct competitors',
    icon: Users,
    color: 'text-purple-600'
  },
  {
    id: 'trend_prediction',
    name: 'Trend Analysis',
    description: 'Identifying market trends and opportunities',
    icon: TrendingUp,
    color: 'text-green-600'
  },
  {
    id: 'market_positioning',
    name: 'Market Positioning',
    description: 'Developing optimal positioning strategy',
    icon: Lightbulb,
    color: 'text-yellow-600'
  }
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  companyData,
  onComplete,
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState<Record<string, any>>({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        console.log('🚀 Starting analysis for company:', companyData);
        
        // Start the analysis
        const result = await apiClient.analyzeCompany(companyData);
        console.log('✅ Analysis started successfully:', result);
        setAnalysisId(result.analysis_id);
        
        // Start polling for progress
        const progressInterval = setInterval(async () => {
          try {
            console.log('📊 Polling for progress...');
            const progress = await apiClient.getAnalysisProgress(result.analysis_id);
            console.log('📈 Progress update:', progress);
            
            // Update step progress
            const newStepProgress: Record<string, any> = {};
            progress.steps.forEach((step: any) => {
              newStepProgress[step.name] = {
                step: step.name,
                progress: step.progress,
                status: step.status,
                message: step.agent
              };
            });
            
            setStepProgress(newStepProgress);
            
            // Update current step
            const currentStepIndex = analysisSteps.findIndex(step => 
              step.id === progress.current_step
            );
            if (currentStepIndex !== -1) {
              setCurrentStep(currentStepIndex);
            }
            
            // Calculate overall progress
            const completedSteps = progress.steps.filter((step: any) => step.status === 'completed').length;
            const newOverallProgress = (completedSteps / analysisSteps.length) * 100;
            setOverallProgress(newOverallProgress);
            
            // Check if analysis is complete
            if (progress.status === 'completed') {
              console.log('🎉 Analysis completed!');
              clearInterval(progressInterval);
              setIsComplete(true);
              setOverallProgress(100);
              
              // Get final results
              console.log('📋 Fetching final results...');
              const results = await apiClient.getAnalysisResults(result.analysis_id);
              console.log('📊 Final results:', results);
              
              // Wait a moment for the user to see completion, then proceed
              setTimeout(() => {
                onComplete({
                  competitors: results.competitors,
                  market_trends: results.market_trends,
                  market_gaps: results.market_gaps,
                  positioning_strategy: results.positioning_strategy,
                  competitive_advantages: results.competitive_advantages
                });
              }, 2000);
            } else if (progress.status === 'failed') {
              console.error('❌ Analysis failed');
              clearInterval(progressInterval);
              setError('Analysis failed. Please try again.');
            }
            
          } catch (err) {
            console.error('❌ Progress polling failed:', err);
          }
        }, 2000); // Poll every 2 seconds
        
        // Cleanup interval on unmount
        return () => clearInterval(progressInterval);

      } catch (err) {
        console.error('❌ Analysis failed:', err);
        setError('Analysis failed. Please try again.');
      }
    };

    runAnalysis();
  }, [companyData, onComplete]);

  const getStepStatus = (stepId: string) => {
    const progress = stepProgress[stepId];
    if (!progress) return 'pending';
    return progress.status;
  };

  const getStepProgress = (stepId: string) => {
    const progress = stepProgress[stepId];
    return progress?.progress || 0;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <AlertCircle className="w-6 h-6" />
              <span>Analysis Failed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={onBack} className="text-gray-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          Analyzing {companyData.name}
        </Badge>
      </div>

      {/* Overall Progress */}
      <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center">
            {isComplete ? 'Analysis Complete!' : 'Analysis in Progress'}
          </CardTitle>
          <div className="space-y-2">
            <Progress value={overallProgress} className="h-3" />
            <p className="text-center text-sm text-gray-600">
              {Math.round(overallProgress)}% Complete
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Step Details */}
      <div className="space-y-4">
        {analysisSteps.map((step, index) => {
          const status = getStepStatus(step.id);
          const progress = getStepProgress(step.id);
          const IconComponent = step.icon;

          return (
            <Card key={step.id} className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${step.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{step.name}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24">
                      <Progress value={progress} className="h-2" />
                    </div>
                    <Badge className={getStatusColor(status)}>
                      {getStatusIcon(status)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analysis ID for debugging */}
      {analysisId && (
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">Analysis ID: {analysisId}</p>
        </div>
      )}
    </div>
  );
};