import { useState, useEffect } from 'react';
import { Session } from '@/entities';

interface SessionData {
  appState?: string;
  companyData?: any;
  analysisData?: any;
  timestamp?: number;
}

export const useSession = () => {
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const saveSession = (data: SessionData) => {
    const session = {
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem('competeiq_session', JSON.stringify(session));
  };

  const loadSession = (): SessionData | null => {
    try {
      const savedSession = localStorage.getItem('competeiq_session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        
        // Check if session is not older than 24 hours
        const isValid = session.timestamp && 
          (Date.now() - session.timestamp) < 24 * 60 * 60 * 1000;
        
        if (isValid) {
          return session;
        } else {
          // Clear expired session
          clearSession();
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
    return null;
  };

  const loadActiveSession = async () => {
    try {
      const activeSessions = await Session.filter({ is_active: true }, '-last_accessed', 1);
      if (activeSessions.length > 0) {
        const session = activeSessions[0];
        return {
          appState: session.app_state,
          companyData: session.company_data,
          analysisData: session.analysis_data
        };
      }
    } catch (error) {
      console.error('Failed to load active session:', error);
    }
    return null;
  };

  const clearSession = () => {
    localStorage.removeItem('competeiq_session');
  };

  useEffect(() => {
    setSessionLoaded(true);
  }, []);

  return {
    sessionLoaded,
    saveSession,
    loadSession,
    loadActiveSession,
    clearSession
  };
};