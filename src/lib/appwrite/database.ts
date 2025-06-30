import { databases } from './client';
import { ID, Query } from 'appwrite';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'competeiq';
const SESSIONS_COLLECTION_ID = 'sessions';

export interface AppwriteSession {
  $id?: string;
  session_name: string;
  company_data: any;
  analysis_data: any;
  app_state: string;
  last_accessed: string;
  is_active: boolean;
  user_id: string;
  $createdAt?: string;
  $updatedAt?: string;
}

// Local storage keys
const SESSIONS_KEY = 'competeiq_sessions';
const ACTIVE_SESSION_KEY = 'competeiq_active_session';

export class AppwriteDatabase {
  // Get all sessions from localStorage
  private getSessionsFromStorage(): AppwriteSession[] {
    try {
      const sessions = localStorage.getItem(SESSIONS_KEY);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Failed to get sessions from storage:', error);
      return [];
    }
  }

  // Save sessions to localStorage
  private saveSessionsToStorage(sessions: AppwriteSession[]) {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save sessions to storage:', error);
    }
  }

  // Create session
  async createSession(session: Omit<AppwriteSession, '$id' | '$createdAt' | '$updatedAt'>) {
    try {
      const newSession: AppwriteSession = {
        ...session,
        $id: ID.unique(),
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString()
      };

      const sessions = this.getSessionsFromStorage();
      sessions.push(newSession);
      this.saveSessionsToStorage(sessions);

      return newSession;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  // Get user sessions
  async getUserSessions(userId: string, limit = 50) {
    try {
      const sessions = this.getSessionsFromStorage();
      const userSessions = sessions
        .filter(session => session.user_id === userId)
        .sort((a, b) => new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime())
        .slice(0, limit);
      
      return userSessions;
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }

  // Get active session
  async getActiveSession(userId: string) {
    try {
      const sessions = this.getSessionsFromStorage();
      const activeSession = sessions.find(session => 
        session.user_id === userId && session.is_active
      );
      
      return activeSession || null;
    } catch (error) {
      console.error('Failed to get active session:', error);
      return null;
    }
  }

  // Update session
  async updateSession(sessionId: string, updates: Partial<AppwriteSession>) {
    try {
      const sessions = this.getSessionsFromStorage();
      const sessionIndex = sessions.findIndex(session => session.$id === sessionId);
      
      if (sessionIndex !== -1) {
        sessions[sessionIndex] = {
          ...sessions[sessionIndex],
          ...updates,
          $updatedAt: new Date().toISOString()
        };
        this.saveSessionsToStorage(sessions);
        return sessions[sessionIndex];
      }
      
      throw new Error('Session not found');
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  }

  // Delete session
  async deleteSession(sessionId: string) {
    try {
      const sessions = this.getSessionsFromStorage();
      const filteredSessions = sessions.filter(session => session.$id !== sessionId);
      this.saveSessionsToStorage(filteredSessions);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  }

  // Set session as active (and deactivate others)
  async setActiveSession(userId: string, sessionId: string) {
    try {
      const sessions = this.getSessionsFromStorage();
      
      // Deactivate all user sessions
      sessions.forEach(session => {
        if (session.user_id === userId) {
          session.is_active = false;
          session.$updatedAt = new Date().toISOString();
        }
      });

      // Activate the selected session
      const targetSession = sessions.find(session => session.$id === sessionId);
      if (targetSession) {
        targetSession.is_active = true;
        targetSession.last_accessed = new Date().toISOString();
        targetSession.$updatedAt = new Date().toISOString();
      }

      this.saveSessionsToStorage(sessions);
      return targetSession;
    } catch (error) {
      console.error('Failed to set active session:', error);
      throw error;
    }
  }
}

export const appwriteDB = new AppwriteDatabase();