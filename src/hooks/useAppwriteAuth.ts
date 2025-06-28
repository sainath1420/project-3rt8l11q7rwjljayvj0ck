import { useState, useEffect } from 'react';
import { appwriteAuth, AppwriteUser } from '@/lib/appwrite/auth';

export const useAppwriteAuth = () => {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const currentUser = await appwriteAuth.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setAuthenticated(true);
      } else {
        setUser(null);
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    await checkAuth();
  };

  const logout = async () => {
    try {
      await appwriteAuth.logout();
      setUser(null);
      setAuthenticated(false);
      // Clear any local storage
      localStorage.removeItem('competeiq_session');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateProfile = async (name: string) => {
    try {
      await appwriteAuth.updateProfile(name);
      await checkAuth(); // Refresh user data
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    loading,
    authenticated,
    login,
    logout,
    updateProfile,
    checkAuth
  };
};