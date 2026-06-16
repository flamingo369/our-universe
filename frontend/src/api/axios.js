import axios from 'axios';
import supabase from '../lib/supabase';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  async (config) => {
    // Get token from Supabase session
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - log errors but don't auto-redirect
// Supabase AuthContext handles authentication state
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors for debugging but don't auto-redirect
    // The AuthContext and ProtectedRoute handle authentication
    if (error.response?.status === 401) {
      console.warn('API 401 error - authentication may have expired');
      // Don't redirect here - let AuthContext handle it
    }
    
    return Promise.reject(error);
  }
);

export default api;