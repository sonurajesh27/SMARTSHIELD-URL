import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Lock, ShieldCheck, Clock, Database, RefreshCw, KeyRound, Activity, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, changePassword } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalUrls: 0, totalClicks: 0, safeUrls: 0, threatUrls: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoadingStats(true);
        const res = await api.get('/url/all');
        const urls = res.data.urls || [];
        setStats({
          totalUrls: urls.length,
          totalClicks: urls.reduce((s, u) => s + (u.clicks || 0), 0),
          safeUrls: urls.filter(u => u.scamStatus?.safe).length,
          threatUrls: urls.filter(u => !u.scamStatus?.safe).length,
        });
      } catch {} finally { setLoadingStats(false); }
    };
    fetch();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) { toast.error('All fields required'); return; }
    if (newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setUpdating(true);
    const ok = await changePassword(currentPassword, newPassword);
    setUpdating(false);
    if (ok) { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }
  };

  const InputField = ({ label, value, set, placeholder }) => (
    <div className="space-y-1.5">
      <label className="text-[9px] font-cyber text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3.5 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_12px_rgba(99,102,241,0.15)] transition-all">
        <Lock className="h-4 w-4 text-indigo-400/50 shrink-0" />
        <input type="password" value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
          className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-slate-600 font-cyber" />
      </div>
    </div>
  );

  const securityScore = stats.totalUrls === 0 ? 100 : Math.round((stats.safeUrls / stats.totalUrls) * 100);

  return (
    <div className="space-y-8 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Identity + Stats */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="cyber-panel rounded-2xl p-6 text-center relative overflow-hidden">
            <div className="absolute top-2 right-3 font-cyber text-[7px] text-indigo-400/30">AGENT_NODE_ID</div>
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/5 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl font-cyber mx-auto mb-5 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                {user?.username?.substring(0, 2).toUpperCase() || 'AG'}
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{user?.username || 'User'}</h3>
              <p className="text-[10px] font-cyber text-slate-400 mt-2 flex items-center justify-center gap-2">
                <Mail className="h-3.5 w-3.5 text-indigo-400" /> {user?.email || '—'}
              </p>
              <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-[9px] font-cyber text-slate-500 uppercase">
                <span>Status</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  <ShieldCheck className="h-3 w-3" /> Active
                </span>
              </div>
            </div>
          </div>

          {/* Security Score */}
          <div className="cyber-panel rounded-2xl p-6">
            <div className="absolute top-2 right-3 font-cyber text-[7px] text-indigo-400/30">SECURITY_SCORE</div>
            <h4 className="text-[9px] font-cyber text-slate-400 uppercase tracking-widest mb-4">Security Score</h4>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray={`${securityScore} ${100 - securityScore}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-white font-cyber">{securityScore}%</span>
                </div>
              </div>
              <div className="space-y-2 flex-1">
                {[
                  { label: 'Safe Links', value: loadingStats ? '—' : stats.safeUrls, color: 'emerald' },
                  { label: 'Threats Detected', value: loadingStats ? '—' : stats.threatUrls, color: 'red' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between text-[9px] font-cyber uppercase">
                    <span className="text-slate-500">{label}</span>
                    <span className={`font-black text-${color}-400`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="cyber-panel rounded-2xl p-6">
            <div className="absolute top-2 right-3 font-cyber text-[7px] text-indigo-400/30">USAGE_STATS</div>
            <h4 className="text-[9px] font-cyber text-slate-400 uppercase tracking-widest mb-5">Your Stats</h4>
            <div className="space-y-4 text-[10px] font-cyber uppercase">
              {[
                { icon: Database, label: 'Active Links', value: stats.totalUrls, color: 'indigo' },
                { icon: Activity, label: 'Total Clicks', value: stats.totalClicks, color: 'purple' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className={`flex items-center gap-2 text-slate-400`}><Icon className={`h-4 w-4 text-${color}-400`} />{label}</span>
                  <span className="font-black text-white">{loadingStats ? '—' : value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Password + Security Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Change Password */}
          <div className="cyber-panel rounded-2xl p-6">
            <div className="absolute top-2 right-3 font-cyber text-[7px] text-indigo-400/30">CREDENTIAL_VAULT</div>
            <div className="flex items-center gap-2.5 text-indigo-400 mb-2">
              <KeyRound className="h-5 w-5" />
              <h2 className="text-xs font-black tracking-widest uppercase">Change Password</h2>
            </div>
            <p className="text-[9px] font-cyber text-slate-500 uppercase tracking-wider mb-6">Update your credentials periodically to maintain account security.</p>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <InputField label="Current Password" value={currentPassword} set={setCurrentPassword} placeholder="Enter current password" />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="New Password" value={newPassword} set={setNewPassword} placeholder="Min 6 characters" />
                <InputField label="Confirm New" value={confirmPassword} set={setConfirmPassword} placeholder="Re-enter password" />
              </div>
              <button type="submit" disabled={updating}
                className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-cyber font-bold text-xs tracking-widest py-3.5 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 group">
                {updating ? <><RefreshCw className="h-4 w-4 animate-spin" /> Saving...</> : 'Save New Password'}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </form>
          </div>

          {/* Security Settings */}
          <div className="cyber-panel rounded-2xl p-6">
            <div className="absolute top-2 right-3 font-cyber text-[7px] text-indigo-400/30">NODE_HARDENING</div>
            <h4 className="text-[9px] font-cyber text-slate-400 uppercase tracking-widest mb-5">Security Settings</h4>
            <div className="space-y-3 font-cyber">
              {[
                { title: 'Account Trust Score', desc: 'Authentication reliability ratio assessed by the gateway controller', badge: '98% TRUSTED', badgeColor: 'indigo' },
                { title: 'Two-Factor Authentication (2FA)', desc: 'Verify credentials via external auth code during handshakes', badge: '[ CONFIGURE ]', badgeColor: 'slate', action: true },
                { title: 'Auto Session Timeout', desc: 'Automatic session invalidation after 30 days of inactivity', badge: 'ARMED', badgeColor: 'emerald' },
              ].map(({ title, desc, badge, badgeColor, action }) => (
                <div key={title} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800/60 hover:border-indigo-500/20 transition-all">
                  <div className="mr-4">
                    <h5 className="text-[11px] font-black text-white tracking-widest">{title}</h5>
                    <p className="text-[9px] text-slate-500 uppercase mt-1 leading-relaxed">{desc}</p>
                  </div>
                  <span className={`text-[9px] font-black shrink-0 px-2 py-1 rounded-lg border ${
                    badgeColor === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    badgeColor === 'indigo' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                    'bg-slate-800 text-slate-400 border-slate-700 hover:bg-indigo-500/10 hover:text-indigo-400 cursor-pointer'
                  } transition-all`}>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
