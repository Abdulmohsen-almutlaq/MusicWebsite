import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add a request interceptor to include tokens
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // 1. Site Password (from SessionStorage or LocalStorage)
      const sitePassword = sessionStorage.getItem('site_password') || localStorage.getItem('site_password');
      if (sitePassword) {
        config.headers['x-site-password'] = sitePassword;
      }

      // 2. Auth Token (from LocalStorage)
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getCoverUrl = (coverPath) => {
  if (!coverPath) return null;
  // Default to empty string if env var is missing, but it really should be there.
  // We assume NEXT_PUBLIC_API_URL ends with /api, so we strip it to get the root.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const baseUrl = apiUrl.replace(/\/api\/?$/, ''); 
  return `${baseUrl}/covers/${coverPath}`;
};

export default api;
