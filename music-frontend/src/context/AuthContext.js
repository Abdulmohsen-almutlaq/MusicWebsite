'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sitePassword, setSitePassword] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Load stored data on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedSitePass = sessionStorage.getItem('site_password') || localStorage.getItem('site_password');

    if (storedSitePass) {
      setSitePassword(storedSitePass);
    }

    if (storedToken) {
      let userObj = null;

      // 1. Try to parse stored user
      if (storedUser && storedUser !== 'undefined') {
        try {
          userObj = JSON.parse(storedUser);
        } catch (e) {
          console.error("Error parsing stored user:", e);
          localStorage.removeItem('user');
        }
      }

      // 2. If user is missing or has invalid ID, try to recover from token
      if (!userObj || userObj.id === 'legacy' || userObj.id === 'unknown') {
        try {
          // Simple JWT decode to get userId
          const base64Url = storedToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const decoded = JSON.parse(jsonPayload);
          if (decoded.userId) {
            userObj = { 
              email: userObj?.email || 'User', 
              id: decoded.userId 
            };
            // Update storage to fix the issue permanently
            localStorage.setItem('user', JSON.stringify(userObj));
          }
        } catch (e) {
          console.error("Failed to recover user from token:", e);
        }
      }

      // 3. Set user state (or fallback)
      if (userObj) {
        setUser(userObj);
      } else {
        setUser({ email: 'User', id: 'legacy' });
      }
    }
    
    setLoading(false);
  }, []);

  const saveSitePassword = (password) => {
    sessionStorage.setItem('site_password', password);
    // Clear local storage to avoid confusion/persistence across sessions
    localStorage.removeItem('site_password');
    setSitePassword(password);
  };

  const login = async (username, password, globalPassword) => {
    try {
      // If global password is provided, save it first so it's used in the request header
      if (globalPassword) {
        saveSitePassword(globalPassword);
        // Small delay to ensure state/localStorage update propagates if needed, 
        // though axios interceptor usually reads from localStorage directly.
      }

      const { data } = await api.post('/auth/login', { username, password });
      
      // Robust handling: Ensure user object exists even if backend is old
      const userObj = data.user || { username, id: 'unknown' };
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
      
      router.push('/'); // Redirect to home after login
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (email, username, password, isPrivate, globalPassword) => {
    try {
      if (globalPassword) {
        saveSitePassword(globalPassword);
      }
      await api.post('/auth/register', { email, username, password, isPrivate });
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('site_password');
    localStorage.removeItem('site_password');
    setSitePassword(null);
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    if (!user || !user.id) return;
    try {
      const { data } = await api.get(`/users/${user.id}`);
      // data is the profile object
      const updatedUser = { ...user, ...data };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      sitePassword, 
      saveSitePassword, 
      login, 
      register, 
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
