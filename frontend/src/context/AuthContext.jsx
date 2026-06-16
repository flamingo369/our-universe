import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabase';
import api from '../api/axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Fetch user profile
  const fetchProfile = useCallback(async (userId, authUser = null) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profile fetch error (using auth data as fallback):', error.message);
        // Use auth user data as fallback if profile doesn't exist
        if (authUser) {
          const fallbackUser = {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
            profile_photo_url: authUser.user_metadata?.avatar_url || null,
          };
          setUser(fallbackUser);
          setProfile(fallbackUser);
          setLoading(false);
          return fallbackUser;
        }
        return null;
      }

      setUser(data);
      setProfile(data);
      setLoading(false);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
      return null;
    }
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id, currentSession.user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        
        if (newSession?.user) {
          await fetchProfile(newSession.user.id, newSession.user);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Login function
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message || 'Login failed');
      }

      // The onAuthStateChange listener will handle updating the user state
      // We just need to wait a bit for the profile to be fetched
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw to let the caller handle it
    }
  };

  // Signup function
  const signup = async (name, username, email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            username
          }
        }
      });

      if (error) throw error;

      // The onAuthStateChange listener will handle updating the user state
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Signup error:', error);
      throw error; // Re-throw to let the caller handle it
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      
      // Also invalidate backend session if needed
      try {
        await api.post('/auth/logout');
      } catch (e) {
        // Ignore backend logout errors
      }
    } catch (error) {
      console.error('Logout error:', error);
    }

    setUser(null);
    setProfile(null);
    setSession(null);
    setLoading(false);
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      if (!user?.id) {
        throw new Error('No user logged in');
      }

      const { data: updatedData, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUser(updatedData);
      setProfile(updatedData);

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update profile'
      };
    }
  };

  // Upload profile photo
  const uploadProfilePhoto = async (file) => {
    try {
      if (!user?.id) {
        throw new Error('No user logged in');
      }

      const filePath = `public/${user.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      // Update profile with new photo URL
      const { data: updatedData, error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setUser(updatedData);
      setProfile(updatedData);

      return { success: true, profilePhoto: publicUrl };
    } catch (error) {
      console.error('Upload photo error:', error);
      return {
        success: false,
        message: error.message || 'Failed to upload photo'
      };
    }
  };

  // Get current session
  const getSession = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    return currentSession;
  };

  // Get access token
  const getAccessToken = async () => {
    const { data: { currentSession } } = await supabase.auth.getSession();
    return currentSession?.access_token || null;
  };

  const contextData = {
    user,
    profile,
    session,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    uploadProfilePhoto,
    isAuthenticated: !!user,
    getSession,
    getAccessToken
  };

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;