import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Users, TrendingUp, Target, Lightbulb, Play, Download, Share } from 'lucide-react';
import { CompanyData, AnalysisData } from '@/pages/Index';

interface ResultsDashboardProps {
  companyData: CompanyData;
  analysisData: AnalysisData;
  onGenerateAssets: () => void;
  onBack: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  companyData,
  analysisData,
  onGenerateAssets,
  onBack
}) => {
  const totalCompetitors = analysisData.competitors.length;
  const totalTrends = analysisData.market_trends.length;
  const totalGaps = analysisData.market_gaps.length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={onBack} className="text-gray-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          New Analysis
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{companyData.name}</h1>
          <p className="text-gray-600">Competitive Intelligence Report</p>
        </div>
        <Button 
          onClick={onGenerateAssets}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Play className="w-4 h-4 mr-2" />
          Generate Marketing Assets
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{totalCompetitors}</div>
            <div className="text-sm text-blue-700">Competitors Found</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{totalTrends}</div>
            <div className="text-sm text-green-700">Market Trends</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-900">{totalGaps}</div>
            <div className="text-sm text-orange-700">Market Gaps</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6 text-center">
            <Lightbulb className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">{analysisData.competitive_advantages.length}</div>
            <div className="text-sm text-purple-700">Advantages</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Competitors */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Key Competitors</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisData.competitors.slice(0, 5).map((competitor, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{competitor.name}</h4>
                  <Badge variant="outline">{competitor.market_share}% market share</Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-green-700 mb-1">Strengths:</p>
                    <ul className="text-gray-600 space-y-1">
                      {competitor.strengths.slice(0, 2).map((strength, i) => (
                        <li key={i}>• {strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-red-700 mb-1">Weaknesses:</p>
                    <ul className="text-gray-600 space-y-1">
                      {competitor.weaknesses.slice(0, 2).map((weakness, i) => (
                        <li key={i}>• {weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Market Trends */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Market Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisData.market_trends.map((trend, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{trend.trend}</h4>
                  <div className="flex items-center space-x-2">
                    <Progress value={trend.confidence} className="w-16 h-2" />
                    <span className="text-xs text-gray-500">{trend.confidence}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{trend.impact}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Market Positioning */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <span>Recommended Positioning Strategy</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg mb-6">
              <p className="text-gray-800 leading-relaxed">{analysisData.positioning_strategy}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Competitive Advantages</h4>
                <ul className="space-y-2">
                  {analysisData.competitive_advantages.map((advantage, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Market Opportunities</h4>
                <ul className="space-y-2">
                  {analysisData.market_gaps.map((gap, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-8">
        <Button variant="outline" className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2">
          <Share className="w-4 h-4" />
          <span>Share Results</span>
        </Button>
        <Button 
          onClick={onGenerateAssets}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>Create Marketing Assets</span>
        </Button>
      </div>
    </div>
  );
};