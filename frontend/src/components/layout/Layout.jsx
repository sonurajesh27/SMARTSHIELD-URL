import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BarChart3, User, LogOut, Menu, X,
  ShieldAlert, Bell, ChevronLeft, ChevronRight,
  Sun, Moon, Activity, Cpu, Database
} from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, num: '01' },
  { name: 'Analytics', path: '/analytics', icon: BarChart3, num: '02' },
  { name: 'Profile', path: '/profile', icon: User, num: '03' },
];

const NOTIFICATIONS = [
  { id: 1, type: 'threat', msg: 'Malicious TLD blocked: .xyz vector intercepted', time: 'Just Now', unread: true },
  { id: 2, type: 'info', msg: 'DB connection stabilized: 12ms latency', time: '5m ago', unread: true },
  { id: 3, type: 'alert', msg: 'Spoofing pattern matched: paypal lookalike', time: '20m ago', unread: false },
  { id: 4, type: 'success', msg: 'System integrity handshake completed', time: '1h ago', unread: false },
];

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const [cpuLoad, setCpuLoad] = useState('0.12%');

  useEffect(() => {
    const t = setInterval(() => setCpuLoad(`${(Math.random() * 0.15 + 0.05).toFixed(2)}%`), 4000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const pageTitle = navItems.find(n => location.pathname.startsWith(n.path))?.name || 'Dashboard';
  const hasUnread = notifs.some(n => n.unread);

  return (
    <div className="min-h-screen bg-[#05060A] text-slate-100 flex flex-col cyber-grid">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#05060A]/85 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2 text-indigo-400 hover:bg-slate-800 rounded-xl transition-all" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/25 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all">
              <ShieldAlert className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
            </div>
            <span className="font-display font-black text-sm tracking-widest hidden sm:block">
              SMART<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">SHIELD</span>
            </span>
            <span className="text-[8px] font-cyber text-indigo-400/50 border border-indigo-500/20 px-1.5 py-0.5 rounded hidden lg:block">v2.0</span>
          </div>
        </div>

        {/* Live telemetry — decorative labels kept as-is */}
        <div className="hidden lg:flex items-center gap-4 text-[9px] font-cyber text-slate-400">
          {[
            { icon: Activity, color: 'indigo', label: 'AUDIT ENGINE', value: 'Online' },
            { icon: Database, color: 'purple', label: 'DB ACCESS', value: 'Connected' },
            { icon: Cpu, color: 'cyan', label: 'CORE_LOAD', value: cpuLoad },
          ].map(({ icon: Icon, color, label, value }) => (
            <div key={label} className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-800/60">
              <Icon className={`h-3.5 w-3.5 text-${color}-400`} />
              <span>{label}: <span className={`text-${color}-400 font-bold`}>{value}</span></span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 rounded-xl border border-slate-800/50 hover:border-indigo-500/20 transition-all">
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          <div className="relative">
            <button onClick={() => { setShowNotif(!showNotif); if (!showNotif) setNotifs(n => n.map(x => ({ ...x, unread: false }))); }}
              className="relative p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 rounded-xl border border-slate-800/50 hover:border-indigo-500/20 transition-all">
              <Bell className="h-4.5 w-4.5" />
              {hasUnread && <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
            </button>
            <AnimatePresence>
              {showNotif && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2.5 w-76 bg-[#070B14] border border-indigo-500/20 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.15)] z-50 overflow-hidden font-cyber">
                    <div className="p-3 border-b border-slate-800 flex justify-between items-center">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Notifications</span>
                      <span className="text-[7px] text-slate-500 uppercase">Live</span>
                    </div>
                    {notifs.map(n => (
                      <div key={n.id} className="p-3 hover:bg-slate-900/40 transition-colors border-b border-slate-900/50 last:border-0">
                        <div className="flex justify-between mb-1">
                          <span className={`text-[8px] font-black uppercase ${n.type === 'threat' ? 'text-red-400' : n.type === 'alert' ? 'text-purple-400' : n.type === 'success' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                            {n.type === 'threat' ? '⚠ CRITICAL' : n.type === 'alert' ? '⚡ ALERT' : n.type === 'success' ? '✓ SECURE' : '◈ INFO'}
                          </span>
                          <span className="text-[7px] text-slate-600">{n.time}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-relaxed">{n.msg}</p>
                      </div>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2.5 border-l border-slate-800 pl-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-black text-xs text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]">
              {user?.username?.substring(0, 2).toUpperCase() || 'AG'}
            </div>
            <div className="hidden md:block">
              <p className="text-[8px] font-cyber text-slate-500 uppercase tracking-wider">Account</p>
              <p className="text-xs font-cyber text-slate-200 truncate max-w-[90px]">{user?.username || 'User'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Desktop Sidebar */}
        <motion.aside
          animate={{ width: sidebarOpen ? '240px' : '72px' }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="hidden md:flex flex-col bg-[#05060A] border-r border-white/5 z-10 overflow-hidden shrink-0">
          <div className="p-3 flex justify-end">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-slate-800/60 rounded-xl text-slate-500 hover:text-indigo-400 transition-colors">
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
          {sidebarOpen && <p className="px-4 text-[8px] font-cyber text-slate-600 uppercase tracking-widest mb-3">Navigation</p>}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map(({ name, path, icon: Icon, num }) => (
              <NavLink key={name} to={path}
                className={({ isActive }) => `flex items-center justify-between px-3 py-3 rounded-xl text-xs font-cyber transition-all border ${
                  isActive ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/25 shadow-[0_0_12px_rgba(99,102,241,0.1)]'
                  : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800/40 border-transparent'}`}>
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && <span className="tracking-widest whitespace-nowrap">{name}</span>}
                </div>
                {sidebarOpen && <span className="text-[8px] opacity-30">{num}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="p-3 border-t border-white/5">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-cyber text-red-400/70 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/15 transition-all">
              <LogOut className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span className="tracking-widest">Log Out</span>}
            </button>
          </div>
        </motion.aside>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-20 bg-[#05060A]/80 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
              <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.2 }}
                className="fixed left-0 top-16 bottom-0 z-30 w-64 bg-[#070B14] border-r border-white/5 flex flex-col md:hidden">
                <p className="px-4 py-4 text-[8px] font-cyber text-slate-600 uppercase tracking-widest">Navigation</p>
                <nav className="flex-1 p-3 space-y-1">
                  {navItems.map(({ name, path, icon: Icon }) => (
                    <NavLink key={name} to={path} onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-cyber border transition-all ${
                        isActive ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/25' : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800/40 border-transparent'}`}>
                      <Icon className="h-4.5 w-4.5" /> <span className="tracking-widest">{name}</span>
                    </NavLink>
                  ))}
                </nav>
                <div className="p-4 border-t border-white/5">
                  <button onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-cyber text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all">
                    <LogOut className="h-4.5 w-4.5" /> <span className="tracking-widest">Log Out</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#05060A] overflow-x-hidden relative">
          <div className="border-b border-white/5 py-5 px-6 md:px-8">
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 font-cyber text-[8px] text-slate-600">
              <span>NODE_ID: {user?._id?.substring(0, 12).toUpperCase() || '—'}</span>
              <span className="opacity-20">|</span>
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              <h1 className="text-base font-black tracking-widest text-white font-cyber">{pageTitle}</h1>
            </div>
            <p className="text-[9px] font-cyber text-slate-500 uppercase tracking-widest mt-0.5">SmartShield URL Manager</p>
          </div>
          <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
