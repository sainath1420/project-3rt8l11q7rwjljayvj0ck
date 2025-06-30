import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText, Image, Volume2, Play, Download, RefreshCw } from 'lucide-react';
import { CompanyData, AnalysisData } from '@/pages/Index';
import { apiClient } from '@/lib/api';

interface AssetGenerationProps {
  companyData: CompanyData;
  analysisData: AnalysisData;
  onBack: () => void;
}

interface GeneratedAssets {
  script: string;
  images: Array<{url: string, prompt: string, timestamp: number}>;
  audioUrl?: string;
}

export const AssetGeneration: React.FC<AssetGenerationProps> = ({
  companyData,
  analysisData,
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState<'script' | 'images' | 'audio' | 'complete'>('script');
  const [progress, setProgress] = useState(0);
  const [assets, setAssets] = useState<GeneratedAssets>({
    script: '',
    images: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    generateAssets();
  }, []);

  const generateAssets = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Step 1: Generate Script
      setCurrentStep('script');
      setProgress(10);
      
      // For now, we'll use a mock analysis ID since we don't have one from the previous step
      // In a real implementation, this would be passed from the analysis results
      const mockAnalysisId = 'mock-analysis-id';
      setAnalysisId(mockAnalysisId);
      
      const scriptResult = await apiClient.generateScript({
        analysis_id: mockAnalysisId,
        style: 'professional',
        duration: 30
      });
      
      setAssets(prev => ({ ...prev, script: scriptResult.script }));
      setProgress(40);

      // Step 2: Generate Images
      setCurrentStep('images');
      
      const imagesResult = await apiClient.generateImages({
        script: scriptResult.script,
        company_name: companyData.name,
        style: 'professional'
      });
      
      setAssets(prev => ({ ...prev, images: imagesResult.images }));
      setProgress(70);

      // Step 3: Generate Audio
      setCurrentStep('audio');
      
      const audioResult = await apiClient.generateAudio({
        script: scriptResult.script,
        voice: 'professional_male'
      });
      
      setAssets(prev => ({ ...prev, audioUrl: audioResult.audio_url }));
      setProgress(100);
      setCurrentStep('complete');

    } catch (err) {
      console.error('Asset generation failed:', err);
      setError('Failed to generate assets. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateAssets = () => {
    setAssets({ script: '', images: [] });
    setProgress(0);
    generateAssets();
  };

  const getStepStatus = (step: string) => {
    if (currentStep === step && isGenerating) return 'in_progress';
    if (progress >= getStepProgress(step)) return 'completed';
    return 'pending';
  };

  const getStepProgress = (step: string) => {
    switch (step) {
      case 'script': return 40;
      case 'images': return 70;
      case 'audio': return 100;
      default: return 0;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={onBack} className="text-gray-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Results
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Marketing Asset Generation</h1>
          <p className="text-gray-600">Creating 30-second ad for {companyData.name}</p>
        </div>
        <Button 
          onClick={regenerateAssets}
          variant="outline"
          disabled={isGenerating}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate
        </Button>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center">
            {currentStep === 'complete' ? 'Assets Generated Successfully!' : 'Generating Assets...'}
          </CardTitle>
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <p className="text-center text-sm text-gray-600">
              {progress}% Complete
            </p>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Generation Steps */}
        <div className="space-y-6">
          {/* Script Generation */}
          <Card className={`border-0 shadow-md transition-all duration-300 ${
            getStepStatus('script') === 'in_progress' ? 'ring-2 ring-blue-200 bg-blue-50/50' : 'bg-white/60'
          } backdrop-blur-sm`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  getStepStatus('script') === 'completed' ? 'bg-green-100' :
                  getStepStatus('script') === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <span>Marketing Script</span>
                <Badge variant="outline" className={
                  getStepStatus('script') === 'completed' ? 'bg-green-100 text-green-700' :
                  getStepStatus('script') === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }>
                  {getStepStatus('script').replace('_', ' ')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assets.script ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">{assets.script}</p>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  {getStepStatus('script') === 'in_progress' ? 'Generating script...' : 'Script will appear here'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Generation */}
          <Card className={`border-0 shadow-md transition-all duration-300 ${
            getStepStatus('images') === 'in_progress' ? 'ring-2 ring-blue-200 bg-blue-50/50' : 'bg-white/60'
          } backdrop-blur-sm`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  getStepStatus('images') === 'completed' ? 'bg-green-100' :
                  getStepStatus('images') === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Image className="w-5 h-5 text-blue-600" />
                </div>
                <span>Visual Assets</span>
                <Badge variant="outline" className={
                  getStepStatus('images') === 'completed' ? 'bg-green-100 text-green-700' :
                  getStepStatus('images') === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }>
                  {getStepStatus('images').replace('_', ' ')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assets.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {assets.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image.url} 
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  {getStepStatus('images') === 'in_progress' ? 'Generating images...' : 'Images will appear here'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audio Generation */}
          <Card className={`border-0 shadow-md transition-all duration-300 ${
            getStepStatus('audio') === 'in_progress' ? 'ring-2 ring-blue-200 bg-blue-50/50' : 'bg-white/60'
          } backdrop-blur-sm`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  getStepStatus('audio') === 'completed' ? 'bg-green-100' :
                  getStepStatus('audio') === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Volume2 className="w-5 h-5 text-green-600" />
                </div>
                <span>Audio Narration</span>
                <Badge variant="outline" className={
                  getStepStatus('audio') === 'completed' ? 'bg-green-100 text-green-700' :
                  getStepStatus('audio') === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }>
                  {getStepStatus('audio').replace('_', ' ')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assets.audioUrl ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <audio controls className="w-full">
                    <source src={assets.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <div className="mt-3 flex justify-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(assets.audioUrl, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Audio
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  {getStepStatus('audio') === 'in_progress' ? 'Generating audio...' : 'Audio will appear here'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-red-600" />
                <span>Ad Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 'complete' ? (
                <div className="space-y-4">
                  <div className="bg-black rounded-lg p-4 text-white text-center">
                    <p className="text-sm opacity-75">30-Second Ad Preview</p>
                    <p className="text-lg font-semibold mt-2">{companyData.name}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Generated Assets:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Script: {assets.script ? '✓ Generated' : 'Pending'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Image className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Images: {assets.images.length} generated</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Audio: {assets.audioUrl ? '✓ Generated' : 'Pending'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Play className="w-4 h-4 mr-2" />
                      Play Full Ad
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Generating your marketing assets...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take a few minutes</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-700 text-sm">{error}</p>
                <Button 
                  onClick={regenerateAssets}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};