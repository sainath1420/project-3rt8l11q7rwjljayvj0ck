import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Globe, Users, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { CompanyData, AnalysisData } from '@/pages/Index';
import { competitiveAPI, AnalysisProgress as ProgressType } from '@/lib/api';

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
    id: 'weakness_analysis',
    name: 'Weakness Analysis',
    description: 'Finding competitor weaknesses and market gaps',
    icon: Target,
    color: 'text-orange-600'
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
  const [stepProgress, setStepProgress] = useState<Record<string, ProgressType>>({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        // Set up progress callback
        competitiveAPI.setProgressCallback((progress) => {
          setStepProgress(prev => ({
            ...prev,
            [progress.step.toLowerCase().replace(' ', '_')]: progress
          }));

          // Update current step
          const stepIndex = analysisSteps.findIndex(step => 
            step.id === progress.step.toLowerCase().replace(' ', '_')
          );
          if (stepIndex !== -1) {
            setCurrentStep(stepIndex);
          }

          // Calculate overall progress
          const completedSteps = Object.values(stepProgress).filter(p => p.status === 'completed').length;
          const newOverallProgress = (completedSteps / analysisSteps.length) * 100;
          setOverallProgress(newOverallProgress);
        });

        // Run the analysis
        const result = await competitiveAPI.analyzeCompany(companyData);
        
        setIsComplete(true);
        setOverallProgress(100);
        
        // Wait a moment for the user to see completion, then proceed
        setTimeout(() => {
          onComplete(result);
        }, 2000);

      } catch (err) {
        console.error('Analysis failed:', err);
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
          const Icon = step.icon;

          return (
            <Card 
              key={step.id} 
              className={`border-0 shadow-md transition-all duration-300 ${
                status === 'in_progress' ? 'ring-2 ring-blue-200 bg-blue-50/50' : 'bg-white/60'
              } backdrop-blur-sm`}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    status === 'completed' ? 'bg-green-100' :
                    status === 'in_progress' ? 'bg-blue-100' :
                    status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{step.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(status)}>
                          {status.replace('_', ' ')}
                        </Badge>
                        {getStatusIcon(status)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                    
                    {status === 'in_progress' && (
                      <div className="space-y-1">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-gray-500">{progress}% complete</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Message */}
      {isComplete && (
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Analysis Complete!
            </h3>
            <p className="text-green-700">
              Redirecting to results dashboard...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};