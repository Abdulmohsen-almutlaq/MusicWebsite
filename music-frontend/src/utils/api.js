import axios from 'axios';

// Ensure apiUrl ends with /api
let apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
if (apiUrl !== '/api' && !apiUrl.endsWith('/api')) {
  apiUrl = apiUrl.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: apiUrl,
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
  // We assume apiUrl ends with /api, so we strip it to get the root.
  const baseUrl = apiUrl.replace(/\/api\/?$/, ''); 
  return `${baseUrl}/covers/${coverPath}`;
};

export default api;
