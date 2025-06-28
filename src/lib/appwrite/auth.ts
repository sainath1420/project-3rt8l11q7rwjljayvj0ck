import { account } from './client';
import { ID } from 'appwrite';

export interface AppwriteUser {
  $id: string;
  name: string;
  email: string;
  emailVerification: boolean;
  prefs: Record<string, any>;
}

export class AppwriteAuth {
  // Login with Google OAuth
  async loginWithGoogle() {
    try {
      return await account.createOAuth2Session('google', 
        window.location.origin, // Success URL
        window.location.origin  // Failure URL
      );
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  }

  // Login with email and password
  async loginWithEmail(email: string, password: string) {
    try {
      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      console.error('Email login failed:', error);
      throw error;
    }
  }

  // Register with email and password
  async registerWithEmail(email: string, password: string, name: string) {
    try {
      const user = await account.create(ID.unique(), email, password, name);
      // Auto-login after registration
      await this.loginWithEmail(email, password);
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AppwriteUser | null> {
    try {
      const user = await account.get();
      return user as AppwriteUser;
    } catch (error) {
      console.log('No authenticated user');
      return null;
    }
  }

  // Logout
  async logout() {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  // Get user sessions
  async getSessions() {
    try {
      return await account.listSessions();
    } catch (error) {
      console.error('Failed to get sessions:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(name: string) {
    try {
      return await account.updateName(name);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }

  // Send password recovery email
  async recoverPassword(email: string) {
    try {
      return await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );
    } catch (error) {
      console.error('Password recovery failed:', error);
      throw error;
    }
  }
}

export const appwriteAuth = new AppwriteAuth();