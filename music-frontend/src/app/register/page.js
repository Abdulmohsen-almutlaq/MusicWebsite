'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { register, sitePassword, saveSitePassword } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    isPrivate: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await register(formData.email, formData.username, formData.password, formData.isPrivate);
    if (res.success) {
      router.push('/login');
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  if (!sitePassword) {
    return (
      <div className="min-h-screen bg-brand-dark text-brand-beige flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-brand-medium/30 p-8 rounded-2xl border border-brand-light/20 backdrop-blur-sm text-center">
          <h1 className="text-2xl font-bold mb-4">Private Access</h1>
          <p className="text-brand-light mb-6">Please enter the site password to continue.</p>
          <form onSubmit={(e) => { e.preventDefault(); saveSitePassword(e.target[0].value); }} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="Site Password" 
              className="w-full bg-brand-dark border border-brand-light/20 rounded-lg p-3 focus:border-brand-beige outline-none transition-colors text-center" 
              autoFocus
            />
            <button className="bg-brand-beige text-brand-dark font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-brand-beige flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-medium/30 p-8 rounded-2xl border border-brand-light/20 backdrop-blur-sm">
        <h1 className="text-3xl font-bold mb-6 text-center">Create Account</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-light mb-1">Email</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-brand-dark border border-brand-light/20 rounded-lg p-3 focus:border-brand-beige outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-light mb-1">Username</label>
            <input 
              type="text" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-brand-dark border border-brand-light/20 rounded-lg p-3 focus:border-brand-beige outline-none transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-brand-light mb-1">Password</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-brand-dark border border-brand-light/20 rounded-lg p-3 focus:border-brand-beige outline-none transition-colors"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})}
              className="rounded border-brand-light/20 bg-brand-dark text-brand-beige focus:ring-brand-beige"
            />
            <label htmlFor="isPrivate" className="text-sm text-brand-light">Private Account</label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-beige text-brand-dark font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-brand-light">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-beige hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
