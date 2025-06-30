import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Info } from 'lucide-react';
import { CompanyData, AnalysisData, AppState } from '@/pages/Index';

interface SessionsDashboardProps {
  currentCompanyData: CompanyData | null;
  currentAnalysisData: AnalysisData | null;
  currentAppState: AppState;
  onLoadSession: (companyData: CompanyData | null, analysisData: AnalysisData | null, appState: AppState) => void;
  onBack: () => void;
}

export const SessionsDashboard: React.FC<SessionsDashboardProps> = ({
  currentCompanyData,
  currentAnalysisData,
  currentAppState,
  onLoadSession,
  onBack
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={onBack} className="text-gray-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
          <p className="text-gray-600">Session management coming soon</p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            Session Management
          </CardTitle>
          <p className="text-gray-600">
            Session management features are currently being developed and will be available soon.
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Coming Soon</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Save and restore analysis sessions</li>
              <li>• Share sessions with team members</li>
              <li>• Session history and versioning</li>
              <li>• Export session data</li>
            </ul>
          </div>
          
          {currentCompanyData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Current Session</h3>
              <p className="text-sm text-green-800">
                You have an active analysis session for <strong>{currentCompanyData.name}</strong>
              </p>
              <Button 
                onClick={() => onLoadSession(currentCompanyData, currentAnalysisData, currentAppState)}
                className="mt-2 bg-green-600 hover:bg-green-700"
              >
                Continue Current Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};