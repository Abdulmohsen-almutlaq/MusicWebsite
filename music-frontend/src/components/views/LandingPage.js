import React from 'react';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-brand-dark text-brand-beige flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-medium/20 to-brand-dark/20 z-0"></div>
      
      <div className="z-10 text-center max-w-2xl">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-light to-brand-medium rounded-full mx-auto mb-8 shadow-2xl animate-pulse"></div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">6rabyat</h1>
        <p className="text-lg md:text-xl text-brand-light mb-10">Stream, Connect, and Discover the future of music.</p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/login" className="bg-brand-beige text-brand-dark px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">Login</Link>
          <Link href="/register" className="bg-transparent border border-brand-beige/20 text-brand-beige px-8 py-3 rounded-full font-bold hover:bg-brand-beige/10 transition-colors">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
