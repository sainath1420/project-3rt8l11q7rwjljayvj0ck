import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto">
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
        <div></div>
      </div>

      {/* No Sessions Message */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Management</h3>
          <p className="text-gray-600 mb-4">
            Session storage and management features will be available soon. For now, you can use the application without persistent sessions.
          </p>
          <Button onClick={onBack} variant="outline">
            Start New Analysis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};