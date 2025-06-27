import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText, Image, Volume2, Play, Download, RefreshCw } from 'lucide-react';
import { CompanyData, AnalysisData } from '@/pages/Index';
import { competitiveAPI } from '@/lib/api';

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
      
      const script = await competitiveAPI.generateMarketingScript(
        companyData.name,
        analysisData
      );
      
      setAssets(prev => ({ ...prev, script }));
      setProgress(40);

      // Step 2: Generate Images
      setCurrentStep('images');
      
      const images = await competitiveAPI.generateAdImages(script, companyData.name);
      setAssets(prev => ({ ...prev, images }));
      setProgress(70);

      // Step 3: Generate Audio (simulated for now)
      setCurrentStep('audio');
      
      // Simulate audio generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      const audioUrl = `https://example.com/audio/${companyData.name.toLowerCase()}-ad.mp3`;
      
      setAssets(prev => ({ ...prev, audioUrl }));
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
                    <div key={index} className="space-y-2">
                      <img 
                        src={image.url} 
                        alt={`Ad visual ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <p className="text-xs text-gray-500">{image.timestamp}s - {image.prompt}</p>
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
                <div className="space-y-4">
                  <audio controls className="w-full">
                    <source src={assets.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <p className="text-sm text-gray-600">30-second professional narration</p>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  {getStepStatus('audio') === 'in_progress' ? 'Generating audio...' : 'Audio will appear here'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview & Actions */}
        <div className="space-y-6">
          {/* Ad Preview */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>30-Second Ad Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 'complete' ? (
                <div className="space-y-4">
                  <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                    <div className="text-white text-center">
                      <Play className="w-12 h-12 mx-auto mb-2" />
                      <p>Click to preview your ad</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Preview Ad
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                  <div className="text-gray-500 text-center">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p>Generating your ad...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Asset Summary */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Generated Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span>Marketing Script</span>
                </div>
                <Badge variant={assets.script ? "default" : "secondary"}>
                  {assets.script ? "Ready" : "Pending"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Image className="w-5 h-5 text-blue-600" />
                  <span>Visual Assets ({assets.images.length}/4)</span>
                </div>
                <Badge variant={assets.images.length > 0 ? "default" : "secondary"}>
                  {assets.images.length > 0 ? "Ready" : "Pending"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-green-600" />
                  <span>Audio Narration</span>
                </div>
                <Badge variant={assets.audioUrl ? "default" : "secondary"}>
                  {assets.audioUrl ? "Ready" : "Pending"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-700">{error}</p>
                <Button 
                  onClick={regenerateAssets}
                  variant="outline" 
                  className="mt-2 border-red-300 text-red-700"
                >
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