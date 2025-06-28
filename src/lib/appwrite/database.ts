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

export class AppwriteDatabase {
  // Create session
  async createSession(session: Omit<AppwriteSession, '$id' | '$createdAt' | '$updatedAt'>) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        SESSIONS_COLLECTION_ID,
        ID.unique(),
        session
      );
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  // Get user sessions
  async getUserSessions(userId: string, limit = 50) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SESSIONS_COLLECTION_ID,
        [
          Query.equal('user_id', userId),
          Query.orderDesc('last_accessed'),
          Query.limit(limit)
        ]
      );
      return response.documents as AppwriteSession[];
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      throw error;
    }
  }

  // Get active session
  async getActiveSession(userId: string) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SESSIONS_COLLECTION_ID,
        [
          Query.equal('user_id', userId),
          Query.equal('is_active', true),
          Query.limit(1)
        ]
      );
      return response.documents[0] as AppwriteSession || null;
    } catch (error) {
      console.error('Failed to get active session:', error);
      return null;
    }
  }

  // Update session
  async updateSession(sessionId: string, updates: Partial<AppwriteSession>) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        SESSIONS_COLLECTION_ID,
        sessionId,
        updates
      );
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  }

  // Delete session
  async deleteSession(sessionId: string) {
    try {
      return await databases.deleteDocument(
        DATABASE_ID,
        SESSIONS_COLLECTION_ID,
        sessionId
      );
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  }

  // Set session as active (and deactivate others)
  async setActiveSession(userId: string, sessionId: string) {
    try {
      // First, deactivate all user sessions
      const userSessions = await this.getUserSessions(userId);
      const updatePromises = userSessions.map(session => 
        this.updateSession(session.$id!, { is_active: false })
      );
      await Promise.all(updatePromises);

      // Then activate the selected session
      return await this.updateSession(sessionId, { 
        is_active: true,
        last_accessed: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to set active session:', error);
      throw error;
    }
  }
}

export const appwriteDB = new AppwriteDatabase();