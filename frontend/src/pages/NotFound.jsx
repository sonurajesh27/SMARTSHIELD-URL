import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#05060A] cyber-grid flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[20rem] font-black text-slate-900/30 leading-none">404</span>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-md">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-red-500/10 border border-red-500/30 mb-8 shadow-[0_0_40px_rgba(255,59,92,0.2)] mx-auto">
          <ShieldOff className="h-12 w-12 text-red-400" />
        </div>
        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-[9px] font-cyber text-red-400 tracking-widest uppercase">Route Not Found — 404</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
          Page Not <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Found</span>
        </h1>
        <p className="text-sm font-cyber text-slate-400 mb-8 leading-relaxed">
          The route you're looking for doesn't exist or has been terminated. Return to the home page.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-cyber font-bold text-xs tracking-widest px-6 py-3 rounded-xl border border-slate-600/50 hover:border-slate-500 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back Home
        </button>
      </div>
    </div>
  );
}
