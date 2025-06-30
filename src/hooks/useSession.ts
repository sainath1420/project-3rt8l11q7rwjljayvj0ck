import { useState, useEffect } from 'react';

interface SessionData {
  appState?: string;
  companyData?: any;
  analysisData?: any;
  timestamp?: number;
}

export const useSession = () => {
  const [user, setUser] = useState<any>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const saveSession = (data: SessionData) => {
    if (user) {
      const session = {
        ...data,
        timestamp: Date.now(),
        userId: user.id
      };
      localStorage.setItem('competeiq_session', JSON.stringify(session));
    }
  };

  const loadSession = (): SessionData | null => {
    try {
      const savedSession = localStorage.getItem('competeiq_session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        
        // Check if session is not older than 24 hours
        const isValid = session.timestamp && 
          (Date.now() - session.timestamp) < 24 * 60 * 60 * 1000;
        
        if (isValid && session.userId === user?.id) {
          return session;
        } else {
          // Clear expired or invalid session
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
      // For now, just return the localStorage session
      // In the future, this could be enhanced to sync with backend
      return loadSession();
    } catch (error) {
      console.error('Failed to load active session:', error);
      // Don't throw error, just return null to prevent app crash
    }
    return null;
  };

  const clearSession = () => {
    localStorage.removeItem('competeiq_session');
  };

  const initializeSession = async () => {
    try {
      // For now, just set session as loaded
      // In the future, this could check Appwrite authentication
      setSessionLoaded(true);
    } catch (error) {
      console.log('Session initialization failed:', error);
      setSessionLoaded(true);
    }
  };

  useEffect(() => {
    initializeSession();
  }, []);

  return {
    user,
    sessionLoaded,
    saveSession,
    loadSession,
    loadActiveSession,
    clearSession
  };
};