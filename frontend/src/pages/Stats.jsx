import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BASE_URL } from '../utils/config';
import { ShieldCheck, ShieldAlert, BarChart3, Clock, Calendar, ExternalLink, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Stats() {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/url/stats/${shortCode}`);
      setStats(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load public stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05060A] flex items-center justify-center font-cyber">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-[10px] text-slate-500 tracking-widest uppercase">Fetching Telemetry...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#05060A] flex items-center justify-center p-4 font-cyber">
        <div className="w-full max-w-md cyber-panel rounded-2xl p-8 text-center space-y-6">
          <ShieldAlert className="h-12 w-12 text-red-500/80 mx-auto animate-pulse" />
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">Stats Not Found</h1>
            <p className="text-[9px] text-slate-500 uppercase mt-2">The shortened code does not exist or has expired.</p>
          </div>
          <button onClick={() => navigate('/')} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs tracking-widest py-3 rounded-xl">
            RETURN TO SHELL
          </button>
        </div>
      </div>
    );
  }

  const isSafe = stats.scamStatus?.safe;
  const fullShortUrl = `${BASE_URL}/${stats.shortCode}`;

  return (
    <div className="min-h-screen bg-[#05060A] cyber-grid flex items-center justify-center px-4 py-12 relative overflow-hidden font-cyber">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-indigo-600/8 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[10px] text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </button>
          <span className="text-[8px] text-indigo-400/50 border border-indigo-500/25 px-2 py-0.5 rounded">PUBLIC_ACCESS_NODE</span>
        </div>

        {/* Panel */}
        <div className="cyber-panel rounded-2xl p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/60">
            <div>
              <h1 className="text-lg font-black text-white tracking-widest uppercase">Link Audit</h1>
              <p className="text-[9px] text-slate-500 uppercase mt-0.5">Public traffic telemetry and safety record</p>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${isSafe ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {isSafe ? <ShieldCheck className="h-4 w-4 text-emerald-400" /> : <ShieldAlert className="h-4 w-4 text-red-400" />}
              <span className="text-[9px] font-bold tracking-widest uppercase">{isSafe ? 'VERIFIED SAFE' : 'MALICIOUS_THREAT'}</span>
            </div>
          </div>

          {/* Grid info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-[8px] text-slate-500 uppercase tracking-widest block mb-1">Destination Address</span>
                <a href={stats.originalUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline font-bold break-all flex items-center gap-1">
                  {stats.originalUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
              <div>
                <span className="text-[8px] text-slate-500 uppercase tracking-widest block mb-1">Shortened URL</span>
                <span className="text-xs text-white font-bold select-all break-all">{fullShortUrl}</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-[8px] text-slate-500 uppercase tracking-widest mb-2">Total Clicks</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-white">{stats.clicks || 0}</span>
                  <BarChart3 className="h-4 w-4 text-indigo-400/50" />
                </div>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-[8px] text-slate-500 uppercase tracking-widest mb-2">Threat Index</span>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-black ${stats.scamStatus?.riskScore > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {stats.scamStatus?.riskScore ?? 0}
                  </span>
                  <span className="text-[8px] text-slate-500">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="pt-6 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-4 text-[9px] text-slate-400 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-indigo-400/60" />
              <span>Created: {new Date(stats.createdAt).toLocaleDateString()}</span>
            </div>
            {stats.expiresAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-indigo-400/60" />
                <span>Expires: {new Date(stats.expiresAt).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Scam status details if threat */}
          {!isSafe && stats.scamStatus?.reason && (
            <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 space-y-1.5 text-[9px] uppercase tracking-wide">
              <span className="text-red-400 font-bold block">Scam Audit Reason:</span>
              <p className="text-slate-300 leading-relaxed font-cyber">{stats.scamStatus.reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
