import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, User, Loader2, Zap } from 'lucide-react';

const Field = ({ id, label, icon: Icon, type = 'text', placeholder, value, onChange, error, extra, autoComplete = 'off', disabled }) => (
  <div className="space-y-1.5">
    <label className="block text-[9px] font-cyber text-slate-400 tracking-widest uppercase mb-1">{label}</label>
    <div className={`flex items-center gap-3 bg-slate-900/60 border rounded-xl px-4 py-3.5 transition-all focus-within:border-indigo-500/60 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.15)] ${error ? 'border-red-500/50' : 'border-slate-700/50'}`}>
      <Icon className="h-4 w-4 text-indigo-400/60 shrink-0" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        spellCheck={false}
        className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-slate-600 font-cyber [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:text-white"
        style={{ WebkitBoxShadow: '0 0 0 1000px transparent inset', WebkitTextFillColor: '#fff', caretColor: '#fff' }}
        disabled={disabled}
      />
      {extra}
    </div>
    {error && <p className="text-[9px] font-cyber text-red-400 uppercase tracking-wide">{error}</p>}
  </div>
);

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.username.trim() || form.username.length < 5) e.username = 'Username must be at least 5 characters';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters required';
    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const ok = await signup(form.username, form.email, form.password);
    setLoading(false);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#05060A] cyber-grid flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-purple-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] bg-indigo-600/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 mb-10 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <ShieldCheck className="h-6 w-6 text-purple-400" />
          </div>
          <span className="font-display font-black text-lg tracking-widest text-white">
            SMART<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">SHIELD</span>
          </span>
        </div>

        <div className="cyber-panel rounded-2xl p-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full mb-4">
              <Zap className="h-3 w-3 text-purple-400" />
              <span className="text-[9px] font-cyber text-purple-400 tracking-widest uppercase">Create Account</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mb-1">Sign Up</h1>
            <p className="text-xs font-cyber text-slate-400">Create your secure account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <Field id="username" label="Username" icon={User} placeholder="agent_x7" value={form.username} onChange={set('username')} error={errors.username} autoComplete="username" disabled={loading} />
            <Field id="email" label="Email" icon={Mail} type="email" placeholder="agent@smartshield.io" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" disabled={loading} />
            <Field id="password" label="Password" icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={set('password')} error={errors.password} autoComplete="new-password" disabled={loading}
              extra={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-purple-400 transition-colors">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>} />
            <Field id="confirm" label="Confirm Password" icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} autoComplete="new-password" disabled={loading} />

            <button type="submit" disabled={loading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-cyber font-bold text-xs tracking-widest py-3.5 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 group mt-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
            <p className="text-[10px] font-cyber text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold transition-colors tracking-wider">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
