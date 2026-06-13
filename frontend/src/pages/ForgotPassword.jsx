import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Mail, ArrowLeft, CheckCircle, Loader2, Send } from 'lucide-react';

export default function ForgotPassword() {
  const { forgotPassword } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (result.success) {
      setSent(true);
      if (result.data?.resetUrl) setDevUrl(result.data.resetUrl);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060A] cyber-grid flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
          </div>
          <span className="font-display font-black text-lg tracking-widest text-white">
            SMART<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">SHIELD</span>
          </span>
        </div>

        <div className="cyber-panel rounded-2xl p-8">
          {!sent ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-[9px] font-cyber text-indigo-400 tracking-widest uppercase">Reset Password</span>
                </div>
                <h1 className="text-xl font-black text-white tracking-tight mb-2">Recover Access</h1>
                <p className="text-xs font-cyber text-slate-400 leading-relaxed">
                  Enter your registered email. We'll send a secure reset link to your inbox.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-cyber text-slate-400 tracking-widest uppercase">Registered Email</label>
                  <div className={`flex items-center gap-3 bg-slate-900/60 border rounded-xl px-4 py-3.5 transition-all focus-within:border-indigo-500/60 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.15)] ${error ? 'border-red-500/50' : 'border-slate-700/50'}`}>
                    <Mail className="h-4 w-4 text-indigo-400/60 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="agent@smartshield.io"
                      className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-slate-600 font-cyber"
                      disabled={loading}
                    />
                  </div>
                  {error && <p className="text-[9px] font-cyber text-red-400 uppercase tracking-wider">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-cyber font-bold text-xs tracking-widest py-3.5 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending reset link...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Send Reset Link</>
                  )}
                  {/* Shine effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div className="relative inline-flex mb-6">
                <div className="h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(57,255,136,0.2)]">
                  <CheckCircle className="h-10 w-10 text-emerald-400" />
                </div>
                <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" />
              </div>
              <h2 className="text-lg font-black text-white mb-2 tracking-tight">Reset Link Sent</h2>
              <p className="text-xs font-cyber text-slate-400 mb-4 leading-relaxed">
                If <span className="text-cyan-400">{email}</span> is registered, a reset link is on its way.
              </p>
              {devUrl && (
                <div className="bg-slate-900/80 border border-yellow-500/30 rounded-xl p-4 mb-4 text-left">
                  <p className="text-[8px] font-cyber text-yellow-400/60 uppercase tracking-widest mb-2">DEV MODE — Reset URL</p>
                  <a href={devUrl} className="text-[9px] font-cyber text-cyan-400 break-all hover:underline">{devUrl}</a>
                </div>
              )}
              <p className="text-[9px] font-cyber text-slate-500">Check your spam folder if you don't see it.</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-cyber text-slate-400 hover:text-cyan-400 transition-colors tracking-widest uppercase">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
