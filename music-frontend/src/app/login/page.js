'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sitePassword, setSitePassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await login(username, password, sitePassword);
    if (!res.success) {
      setError(res.message);
      setLoading(false);
    }
    // If success, AuthContext handles redirect
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-beige flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-medium/30 p-8 rounded-2xl border border-brand-light/20 backdrop-blur-sm">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome Back</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-light mb-1">Site Password</label>
            <input 
              type="password" 
              value={sitePassword}
              onChange={(e) => setSitePassword(e.target.value)}
              className="w-full bg-brand-dark border border-brand-light/20 rounded-lg p-3 focus:border-brand-beige outline-none transition-colors"
              placeholder="Enter site access password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-light mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-brand-dark border border-brand-light/20 rounded-lg p-3 focus:border-brand-beige outline-none transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-brand-light mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brand-dark border border-brand-light/20 rounded-lg p-3 focus:border-brand-beige outline-none transition-colors"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-beige text-brand-dark font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-brand-light">
          Don't have an account?{' '}
          <Link href="/register" className="text-brand-beige hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
