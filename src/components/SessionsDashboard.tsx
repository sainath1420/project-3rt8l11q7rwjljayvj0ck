import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Save, Trash2, Clock, Building, Eye, Plus } from 'lucide-react';
import { Session } from '@/entities';
import { CompanyData, AnalysisData, AppState } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface SessionsDashboardProps {
  currentCompanyData: CompanyData | null;
  currentAnalysisData: AnalysisData | null;
  currentAppState: AppState;
  onLoadSession: (companyData: CompanyData | null, analysisData: AnalysisData | null, appState: AppState) => void;
  onBack: () => void;
}

interface SessionRecord {
  id: string;
  session_name: string;
  company_data: CompanyData;
  analysis_data: AnalysisData | null;
  app_state: AppState;
  last_accessed: string;
  is_active: boolean;
  created_at: string;
}

export const SessionsDashboard: React.FC<SessionsDashboardProps> = ({
  currentCompanyData,
  currentAnalysisData,
  currentAppState,
  onLoadSession,
  onBack
}) => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const sessionsList = await Session.list('-last_accessed', 50);
      setSessions(sessionsList);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentSession = async () => {
    if (!sessionName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a session name",
        variant: "destructive"
      });
      return;
    }

    if (!currentCompanyData) {
      toast({
        title: "Error",
        description: "No session data to save",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mark all other sessions as inactive
      const activeSessions = sessions.filter(s => s.is_active);
      for (const session of activeSessions) {
        await Session.update(session.id, { is_active: false });
      }

      // Create new session
      await Session.create({
        session_name: sessionName.trim(),
        company_data: currentCompanyData,
        analysis_data: currentAnalysisData,
        app_state: currentAppState,
        last_accessed: new Date().toISOString(),
        is_active: true
      });

      toast({
        title: "Success",
        description: "Session saved successfully"
      });

      setSessionName('');
      setSaveDialogOpen(false);
      loadSessions();
    } catch (error) {
      console.error('Failed to save session:', error);
      toast({
        title: "Error",
        description: "Failed to save session",
        variant: "destructive"
      });
    }
  };

  const loadSession = async (session: SessionRecord) => {
    try {
      // Mark all sessions as inactive
      const activeSessions = sessions.filter(s => s.is_active);
      for (const activeSession of activeSessions) {
        await Session.update(activeSession.id, { is_active: false });
      }

      // Mark this session as active and update last accessed
      await Session.update(session.id, {
        is_active: true,
        last_accessed: new Date().toISOString()
      });

      // Load the session data
      onLoadSession(session.company_data, session.analysis_data, session.app_state);

      toast({
        title: "Success",
        description: `Loaded session: ${session.session_name}`
      });
    } catch (error) {
      console.error('Failed to load session:', error);
      toast({
        title: "Error",
        description: "Failed to load session",
        variant: "destructive"
      });
    }
  };

  const deleteSession = async (sessionId: string, sessionName: string) => {
    if (!confirm(`Are you sure you want to delete "${sessionName}"?`)) {
      return;
    }

    try {
      await Session.delete(sessionId);
      toast({
        title: "Success",
        description: "Session deleted successfully"
      });
      loadSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStateColor = (state: AppState) => {
    switch (state) {
      case 'input': return 'bg-gray-100 text-gray-700';
      case 'analyzing': return 'bg-blue-100 text-blue-700';
      case 'results': return 'bg-green-100 text-green-700';
      case 'generating': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={onBack} className="text-gray-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Saved Sessions</h1>
          <p className="text-gray-600">Manage your competitive analysis sessions</p>
        </div>
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={!currentCompanyData}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Current Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Current Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Session Name</label>
                <Input
                  placeholder="Enter a name for this session..."
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="mt-1"
                />
              </div>
              {currentCompanyData && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Company:</strong> {currentCompanyData.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>State:</strong> {currentAppState}
                  </p>
                </div>
              )}
              <div className="flex space-x-2">
                <Button onClick={saveCurrentSession} className="flex-1">
                  Save Session
                </Button>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Sessions</h3>
            <p className="text-gray-600 mb-4">
              Start a competitive analysis and save it as a session to see it here.
            </p>
            <Button onClick={onBack} variant="outline">
              Start New Analysis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card 
              key={session.id} 
              className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
                session.is_active ? 'ring-2 ring-blue-200' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg truncate">{session.session_name}</CardTitle>
                  {session.is_active && (
                    <Badge variant="default" className="bg-blue-100 text-blue-700">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building className="w-4 h-4" />
                  <span className="truncate">{session.company_data.name}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant="outline" className={getStateColor(session.app_state)}>
                      {session.app_state}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="text-sm font-medium">{session.company_data.market_category}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Last accessed: {formatDate(session.last_accessed)}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={() => loadSession(session)}
                    className="flex-1 h-8 text-xs"
                    variant="outline"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Load
                  </Button>
                  <Button 
                    onClick={() => deleteSession(session.id, session.session_name)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};