import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, Loader2, Zap } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Valid email required';
    if (!password) e.password = 'Password required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#05060A] cyber-grid flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-indigo-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-purple-600/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600/30 to-cyan-600/30 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
          </div>
          <span className="font-display font-black text-lg tracking-widest text-white">
            SMART<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">SHIELD</span>
          </span>
        </div>

        <div className="cyber-panel rounded-2xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full mb-4">
              <Zap className="h-3 w-3 text-indigo-400" />
              <span className="text-[9px] font-cyber text-indigo-400 tracking-widest uppercase">Welcome Back</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mb-1">Log In</h1>
            <p className="text-xs font-cyber text-slate-400">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-cyber text-slate-400 tracking-widest uppercase">Email</label>
              <div className={`flex items-center gap-3 bg-slate-900/60 border rounded-xl px-4 py-3.5 transition-all focus-within:border-indigo-500/60 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.15)] ${errors.email ? 'border-red-500/50' : 'border-slate-700/50'}`}>
                <Mail className="h-4 w-4 text-indigo-400/60 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
                  placeholder="agent@smartshield.io"
                  autoComplete="email"
                  spellCheck={false}
                  style={{ WebkitBoxShadow: '0 0 0 1000px transparent inset', WebkitTextFillColor: '#fff', caretColor: '#fff' }}
                  className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-slate-600 font-cyber"
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="text-[9px] font-cyber text-red-400 uppercase">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-cyber text-slate-400 tracking-widest uppercase">Password</label>
              <div className={`flex items-center gap-3 bg-slate-900/60 border rounded-xl px-4 py-3.5 transition-all focus-within:border-indigo-500/60 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.15)] ${errors.password ? 'border-red-500/50' : 'border-slate-700/50'}`}>
                <Lock className="h-4 w-4 text-indigo-400/60 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  style={{ WebkitBoxShadow: '0 0 0 1000px transparent inset', WebkitTextFillColor: '#fff', caretColor: '#fff' }}
                  className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-slate-600 font-cyber"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-indigo-400 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[9px] font-cyber text-red-400 uppercase">{errors.password}</p>}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-[10px] font-cyber text-indigo-400/70 hover:text-indigo-400 transition-colors tracking-wider">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-cyber font-bold text-xs tracking-widest py-3.5 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 group"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Logging in...</> : 'Log In'}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
            <p className="text-[10px] font-cyber text-slate-500">
              No account?{' '}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors tracking-wider">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
