import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { BASE_URL } from '../utils/config';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import {
  ShieldCheck, ShieldAlert, Link2, Eye, Copy, Edit3, Trash2, Search,
  Plus, Calendar, ExternalLink, Loader2, AlertOctagon, BrainCircuit,
  CheckCircle, HelpCircle, QrCode, Terminal, X, Save, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── QR Customizer Modal ────────────────────────────────────────────────────
const QrModal = ({ urlItem, onClose }) => {
  const [fg, setFg] = useState('#6366f1');
  const [bg, setBg] = useState('#05060A');
  const [margin, setMargin] = useState(1);
  const [size, setSize] = useState(300);
  const [qrUrl, setQrUrl] = useState('');
  const [gen, setGen] = useState(false);
  const full = `${BASE_URL}/${urlItem.shortCode}`;

  const fgs = ['#6366f1','#a855f7','#06b6d4','#39FF88','#f59e0b','#ef4444'];
  const bgs = ['#05060A','#070B14','#ffffff'];

  useEffect(() => {
    const gen = async () => {
      setGen(true);
      try {
        const url = await QRCode.toDataURL(full, { errorCorrectionLevel: 'H', margin, width: size, color: { dark: fg, light: bg } });
        setQrUrl(url);
      } catch { toast.error('QR generation failed'); }
      setGen(false);
    };
    gen();
  }, [fg, bg, margin, size, full]);

  const download = () => {
    const a = document.createElement('a');
    a.href = qrUrl; a.download = `qr-${urlItem.shortCode}.png`; a.click();
    toast.success('QR code downloaded');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05060A]/90 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg cyber-panel rounded-2xl p-6 relative">
        <div className="absolute top-2 right-3 font-cyber text-[7px] text-indigo-400/30">QR_DECK_v2</div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-black text-white tracking-widest">QR GENERATOR</h3>
            <p className="text-[9px] font-cyber text-slate-500 uppercase mt-0.5">Customize your secure QR vector</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Preview */}
          <div className="flex flex-col items-center gap-3">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 flex items-center justify-center min-h-[160px] w-full">
              {gen ? <Loader2 className="h-6 w-6 animate-spin text-indigo-400" /> :
                qrUrl ? <img src={qrUrl} alt="QR" className="h-36 w-36 rounded" style={{ backgroundColor: bg }} /> : null}
            </div>
            <p className="text-[8px] font-cyber text-slate-500 truncate max-w-full select-all">{full}</p>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="text-[8px] font-cyber text-slate-400 uppercase tracking-widest block mb-2">Foreground</label>
              <div className="flex flex-wrap gap-2">
                {fgs.map(c => <button key={c} type="button" onClick={() => setFg(c)} className={`h-6 w-6 rounded border-2 transition-all ${fg === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}
              </div>
            </div>
            <div>
              <label className="text-[8px] font-cyber text-slate-400 uppercase tracking-widest block mb-2">Background</label>
              <div className="flex gap-2">
                {bgs.map(c => <button key={c} type="button" onClick={() => setBg(c)} className={`h-6 w-6 rounded border-2 transition-all ${bg === c ? 'border-indigo-400 scale-110' : 'border-slate-700'}`} style={{ backgroundColor: c }} />)}
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[8px] font-cyber text-slate-400 mb-1"><span className="uppercase">Padding</span><span>{margin}</span></div>
              <input type="range" min="0" max="4" value={margin} onChange={e => setMargin(+e.target.value)} className="w-full accent-indigo-500 h-1" />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[300, 600, 1200].map(s => (
                <button key={s} type="button" onClick={() => setSize(s)}
                  className={`py-1.5 rounded-lg text-[9px] font-cyber border transition-colors ${size === s ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'}`}>
                  {s}px
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={download} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-cyber font-bold text-xs tracking-widest py-3 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]">Download QR Code</button>
          <button onClick={onClose} className="flex-1 border border-slate-700 text-slate-400 hover:text-white font-cyber text-xs tracking-widest py-3 rounded-xl transition-all">DISMISS</button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Threat Warning Modal ───────────────────────────────────────────────────
const ThreatModal = ({ urlItem, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05060A]/90 backdrop-blur-md">
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      className="w-full max-w-md bg-[#070B14] border border-red-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(239,68,68,0.15)]">
      <div className="flex items-center gap-3 text-red-400 mb-4">
        <AlertOctagon className="h-6 w-6 animate-pulse" />
        <h3 className="text-sm font-black tracking-widest uppercase">THREAT VECTOR DETECTED</h3>
      </div>
      <p className="text-[10px] font-cyber text-slate-400 uppercase leading-relaxed mb-5">
        This URL triggered threat detection. Visitors will be warned before redirecting.
      </p>
      <div className="bg-slate-900/60 border border-red-500/15 rounded-xl p-4 space-y-2 font-cyber text-[10px] text-slate-300 mb-5">
        <p><span className="text-red-400 font-bold">TARGET:</span> {urlItem?.originalUrl}</p>
        <p><span className="text-red-400 font-bold">SHORT:</span> {BASE_URL}/{urlItem?.shortCode}</p>
        <p><span className="text-red-400 font-bold">RISK SCORE:</span> {urlItem?.scamStatus?.riskScore ?? 0}/100</p>
        <p><span className="text-red-400 font-bold">REASON:</span> {urlItem?.scamStatus?.reason}</p>
      </div>
      <button onClick={onClose} className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-cyber font-bold text-xs tracking-widest py-3 rounded-xl transition-all">
        ACKNOWLEDGE
      </button>
    </motion.div>
  </div>
);

// ── Edit Modal ─────────────────────────────────────────────────────────────
const EditModal = ({ urlItem, onClose, onSave, saving }) => {
  const [originalUrl, setOriginalUrl] = useState(urlItem.originalUrl);
  const [customAlias, setCustomAlias] = useState(urlItem.customAlias || '');
  const [expiryDate, setExpiryDate] = useState(urlItem.expiresAt ? urlItem.expiresAt.substring(0, 16) : '');

  const handleSave = () => onSave(urlItem._id, { originalUrl, customAlias: customAlias || undefined, expiryDate: expiryDate || null });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05060A]/90 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md cyber-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-black text-white tracking-widest">EDIT ROUTE</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Target URL', value: originalUrl, set: setOriginalUrl, type: 'url', placeholder: 'https://...' },
            { label: 'Custom Alias', value: customAlias, set: setCustomAlias, type: 'text', placeholder: 'my-alias' },
          ].map(({ label, value, set, type, placeholder }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-[9px] font-cyber text-slate-400 uppercase tracking-widest">{label}</label>
              <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white font-cyber focus:outline-none focus:border-indigo-500/60 transition-all" />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="text-[9px] font-cyber text-slate-400 uppercase tracking-widest">Expiry Date</label>
            <input type="datetime-local" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white font-cyber focus:outline-none focus:border-indigo-500/60 transition-all" />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-cyber font-bold text-xs tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> SAVING...</> : <><Save className="h-4 w-4" /> SAVE CHANGES</>}
          </button>
          <button onClick={onClose} className="flex-1 border border-slate-700 text-slate-400 hover:text-white font-cyber text-xs tracking-widest py-3 rounded-xl transition-all">CANCEL</button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [threatInfo, setThreatInfo] = useState(null);
  const [selectedQr, setSelectedQr] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);

  const fetchUrls = async () => {
    try { setLoading(true); const res = await api.get('/url/all'); setUrls(res.data.urls || []); }
    catch { toast.error('Failed to load URLs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUrls(); }, []);

  useEffect(() => {
    const load = async () => {
      if (!urls.length) return;
      const top = urls.reduce((a, b) => (a.clicks > b.clicks ? a : b), urls[0]);
      try { const res = await api.get(`/analytics/${top._id}`); setAiInsights(res.data.analytics?.insights || []); } catch {}
    };
    load();
  }, [urls]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;
    try {
      setIsScanning(true);
      const steps = [
        [15, 'INITIALIZING ROUTING BRIDGE...'],
        [35, 'AUDITING TLD INTEGRITY...'],
        [60, 'SCANNING PHISHING MARKERS...'],
        [80, 'EVALUATING HEURISTIC RISK...'],
        [95, 'MAPPING EXPOSURE TUNNEL...'],
        [100, 'Link created successfully'],
      ];
      const payload = { originalUrl };
      if (customAlias.trim()) payload.customAlias = customAlias.trim();
      if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();
      const apiPromise = api.post('/url/create', payload);
      for (const [p, s] of steps) {
        setScanProgress(p); setScanStep(s);
        await new Promise(r => setTimeout(r, 350 + Math.random() * 250));
      }
      const res = await apiPromise;
      const newUrl = res.data.url;
      setUrls([newUrl, ...urls]);
      setOriginalUrl(''); setCustomAlias(''); setExpiresAt('');
      toast.success('Link created successfully');
      if (newUrl.scamStatus && !newUrl.scamStatus.safe) { setThreatInfo(newUrl); setShowWarning(true); }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create URL');
    } finally { setIsScanning(false); setScanProgress(0); setScanStep(''); }
  };

  const handleBulkCsv = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l !== '');
        
        const parsed = [];
        let startIndex = 0;
        if (lines.length > 0 && (lines[0].toLowerCase().includes('url') || lines[0].toLowerCase().includes('originalurl'))) {
          startIndex = 1;
        }

        for (let i = startIndex; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (!cols[0]) continue;
          
          const item = { originalUrl: cols[0] };
          if (cols[1]) item.customAlias = cols[1];
          if (cols[2]) {
            const date = new Date(cols[2]);
            if (!isNaN(date.getTime())) {
              item.expiresAt = date.toISOString();
            }
          }
          parsed.push(item);
        }

        if (parsed.length === 0) {
          toast.error('No valid URLs found in CSV');
          return;
        }

        setIsScanning(true);
        setScanProgress(20);
        setScanStep('PARSING CSV BATCH...');
        await new Promise(r => setTimeout(r, 600));

        setScanProgress(50);
        setScanStep('DISPATCHING BULK PACKET...');
        
        const res = await api.post('/url/bulk', { urls: parsed });
        
        setScanProgress(90);
        setScanStep('INTEGRITY SYNC...');
        await new Promise(r => setTimeout(r, 400));

        if (res.data.urls && res.data.urls.length > 0) {
          setUrls(prev => [...res.data.urls, ...prev]);
        }

        toast.success(res.data.message || `Successfully created ${res.data.urls?.length || 0} links`);
        
        if (res.data.errors && res.data.errors.length > 0) {
          console.warn('Bulk creation warnings:', res.data.errors);
          toast.error(`${res.data.errors.length} links failed validation (see console)`);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'CSV parse or shortening failed');
      } finally {
        setIsScanning(false);
        setScanProgress(0);
        setScanStep('');
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };


  const handleUpdate = async (id, payload) => {
    setSaving(true);
    try {
      const res = await api.put(`/url/${id}`, payload);
      setUrls(urls.map(u => u._id === id ? res.data.url : u));
      setEditItem(null);
      toast.success('Link updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this URL and all its analytics data?')) return;
    try { await api.delete(`/url/${id}`); setUrls(urls.filter(u => u._id !== id)); toast.success('Link deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const copyUrl = (code) => {
    navigator.clipboard.writeText(`${BASE_URL}/${code}`);
    toast.success('Link copied!');
  };

  const totalClicks = urls.reduce((s, u) => s + (u.clicks || 0), 0);
  const safeCount = urls.filter(u => u.scamStatus?.safe).length;
  const threatCount = urls.filter(u => !u.scamStatus?.safe).length;
  const filtered = urls.filter(u =>
    u.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statCards = [
    { label: 'Active Links', value: loading ? '—' : urls.length, color: 'indigo', icon: Link2 },
    { label: 'Total Clicks', value: loading ? '—' : totalClicks, color: 'purple', icon: Eye },
    { label: 'Safe Links', value: loading ? '—' : safeCount, color: 'emerald', icon: ShieldCheck },
    { label: 'Threats Detected', value: loading ? '—' : threatCount, color: 'red', icon: ShieldAlert },
  ];

  return (
    <div className="space-y-8 relative z-10">
      {/* Modals */}
      <AnimatePresence>
        {showWarning && threatInfo && <ThreatModal urlItem={threatInfo} onClose={() => { setShowWarning(false); setThreatInfo(null); }} />}
        {selectedQr && <QrModal urlItem={selectedQr} onClose={() => setSelectedQr(null)} />}
        {editItem && <EditModal urlItem={editItem} onClose={() => setEditItem(null)} onSave={handleUpdate} saving={saving} />}
      </AnimatePresence>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, color, icon: Icon }) => (
          <motion.div key={label} whileHover={{ y: -2 }} className="cyber-panel rounded-2xl p-5 flex items-center justify-between group">
            <div>
              <p className="text-[8px] font-cyber text-slate-500 uppercase tracking-widest mb-1.5">{label}</p>
              <p className={`text-3xl font-black text-white font-cyber`}>{value}</p>
            </div>
            <div className={`p-2.5 rounded-xl bg-${color}-500/10 border border-${color}-500/20 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all`}>
              <Icon className={`h-5 w-5 text-${color}-400`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Generator + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator */}
        <div className="lg:col-span-2 cyber-panel rounded-2xl p-6">
          <div className="absolute top-2 right-3 font-cyber text-[7px] text-indigo-400/30">ROUTE_GEN_v2</div>
          <h2 className="text-xs font-black text-indigo-400 tracking-widest uppercase mb-1">Create Short URL</h2>
          <p className="text-[9px] font-cyber text-slate-500 uppercase tracking-wider mb-6">Shorten and scan URLs for threat intelligence in real-time.</p>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-cyber text-slate-400 uppercase tracking-widest">Destination URL *</label>
              <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3.5 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_12px_rgba(99,102,241,0.15)] transition-all">
                <Link2 className="h-4 w-4 text-indigo-400/50 shrink-0" />
                <input type="url" value={originalUrl} onChange={e => setOriginalUrl(e.target.value)} required placeholder="https://example.com/path"
                  className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-slate-600 font-cyber" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-cyber text-slate-400 uppercase tracking-widest">Custom Alias (optional)</label>
                <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3.5 focus-within:border-indigo-500/50 transition-all">
                  <span className="text-xs text-indigo-400/40 font-cyber shrink-0">sh/</span>
                  <input type="text" value={customAlias} onChange={e => setCustomAlias(e.target.value)} placeholder="my-link"
                    className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-slate-600 font-cyber" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-cyber text-slate-400 uppercase tracking-widest">Expiry Date (optional)</label>
                <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3.5 focus-within:border-indigo-500/50 transition-all">
                  <Calendar className="h-4 w-4 text-indigo-400/50 shrink-0" />
                  <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                    className="bg-transparent text-xs text-white focus:outline-none w-full font-cyber" />
                </div>
              </div>
            </div>

            {isScanning && (
              <div className="border border-indigo-500/20 bg-slate-900/40 rounded-xl p-4 font-cyber text-[9px] space-y-2">
                <div className="flex justify-between text-indigo-400 font-bold"><span>{scanStep}</span><span>{scanProgress}%</span></div>
                <div className="w-full bg-slate-950 h-1 rounded overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                </div>
              </div>
            )}

            <button type="submit" disabled={isScanning}
              className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-cyber font-bold text-xs tracking-widest py-3.5 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 group">
              <Plus className="h-4 w-4" /> {isScanning ? 'SCANNING & BINDING...' : 'Create Link'}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </form>

          {/* Bulk upload CSV option */}
          <div className="mt-6 pt-6 border-t border-slate-800/60 space-y-3">
            <h3 className="text-[9px] font-cyber text-purple-400 tracking-widest uppercase">Or Bulk Shorten via CSV</h3>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-700/50 hover:border-purple-500/50 bg-slate-900/20 hover:bg-slate-900/40 rounded-xl py-4 px-2 cursor-pointer transition-all">
                <Plus className="h-4 w-4 text-purple-400/70 mb-1" />
                <span className="text-[9px] font-cyber text-slate-400 uppercase tracking-wider">Choose CSV File</span>
                <input type="file" accept=".csv" onChange={handleBulkCsv} className="hidden" disabled={isScanning} />
              </label>
              <div className="text-[8px] font-cyber text-slate-500 uppercase leading-relaxed max-w-[180px]">
                Format: <code className="text-purple-400">originalUrl, customAlias, expiresAt</code> (alias and expiry are optional)
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="cyber-panel rounded-2xl p-6 flex flex-col">
          <div className="absolute top-2 right-3 font-cyber text-[7px] text-purple-400/30">INTEL_FEED</div>
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <BrainCircuit className="h-5 w-5" />
            <h2 className="text-xs font-black tracking-widest uppercase">Insights</h2>
          </div>
          <p className="text-[9px] font-cyber text-slate-500 uppercase tracking-wider mb-5">Aggregated patterns from your top link's traffic stream.</p>

          <div className="flex-1">
            {aiInsights.length > 0 ? (
              <ul className="space-y-3">
                {aiInsights.slice(0, 3).map((insight, i) => (
                  <li key={i} className="flex items-start gap-2.5 bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-[10px] font-cyber text-slate-300 uppercase leading-relaxed">
                    <Activity className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <HelpCircle className="h-8 w-8 text-slate-700 mb-3" />
                <p className="text-[9px] font-cyber text-slate-500 uppercase">No traffic data yet. Insights appear after your first clicks.</p>
              </div>
            )}
          </div>

          <button onClick={() => navigate('/analytics')} disabled={!urls.length}
            className="w-full mt-5 border border-purple-500/20 hover:border-purple-500/50 text-purple-400 hover:text-purple-300 font-cyber font-bold text-[10px] tracking-widest py-2.5 rounded-xl transition-all bg-purple-500/5 hover:bg-purple-500/10 disabled:opacity-40">
            View Analytics
          </button>
        </div>
      </div>

      {/* URL Table */}
      <div className="cyber-panel rounded-2xl p-6">
        <div className="absolute top-2 right-3 font-cyber text-[7px] text-indigo-400/30">AUDIT_LOG_STREAM</div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xs font-black text-white tracking-widest uppercase">My Links</h2>
            <p className="text-[9px] font-cyber text-slate-500 uppercase mt-0.5">Live status of all your mapped endpoints.</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-700/50 rounded-xl px-3.5 py-2.5 w-full sm:w-64 focus-within:border-indigo-500/50 transition-all">
            <Search className="h-4 w-4 text-indigo-400/40" />
            <input type="text" placeholder="Search links..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-[10px] text-white focus:outline-none w-full placeholder-slate-600 font-cyber" />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-slate-900/40 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Link2 className="h-10 w-10 text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-black text-slate-500 tracking-widest uppercase">{searchQuery ? 'No matches found' : 'No Links Yet'}</p>
            <p className="text-[10px] font-cyber text-slate-600 uppercase mt-1">Use the console above to create your first secure route.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-cyber text-[10px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[9px] uppercase tracking-widest">
                  <th className="pb-3 pr-4 text-left font-bold">Original URL</th>
                  <th className="pb-3 px-4 text-left font-bold">Short Link</th>
                  <th className="pb-3 px-4 text-center font-bold">Status</th>
                  <th className="pb-3 px-4 text-center font-bold">Risk Score</th>
                  <th className="pb-3 px-4 text-center font-bold">Clicks</th>
                  <th className="pb-3 px-4 text-left font-bold">Date</th>
                  <th className="pb-3 pl-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                <AnimatePresence initial={false}>
                  {filtered.map((urlItem) => (
                    <motion.tr key={urlItem._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="hover:bg-slate-900/30 transition-colors group">
                      <td className="py-3.5 pr-4 max-w-[180px]">
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${urlItem.scamStatus?.safe ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`} />
                          <span className="text-slate-300 truncate text-[10px]">{urlItem.originalUrl}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center gap-2">
                          <a href={`${BASE_URL}/${urlItem.shortCode}`} target="_blank" rel="noreferrer" className="text-indigo-400 font-bold hover:underline">
                            {BASE_URL.replace(/^https?:\/\//, '')}/{urlItem.shortCode}
                          </a>
                          <button onClick={() => copyUrl(urlItem.shortCode)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-indigo-400">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {urlItem.scamStatus?.safe
                          ? <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase"><CheckCircle className="h-2.5 w-2.5" /> Safe</span>
                          : <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase"><AlertOctagon className="h-2.5 w-2.5" /> Threat</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-black text-xs ${urlItem.scamStatus?.riskScore > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {urlItem.scamStatus?.riskScore ?? 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-white text-xs">{urlItem.clicks || 0}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-[9px]">{new Date(urlItem.createdAt).toLocaleDateString()}</td>
                      <td className="py-3.5 pl-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/analytics?urlId=${urlItem._id}`)} title="Analytics" className="p-1.5 hover:bg-indigo-500/10 rounded-lg text-slate-500 hover:text-indigo-400 transition-colors"><Activity className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setSelectedQr(urlItem)} title="QR Code" className="p-1.5 hover:bg-purple-500/10 rounded-lg text-slate-500 hover:text-purple-400 transition-colors"><QrCode className="h-3.5 w-3.5" /></button>
                          <a href={urlItem.originalUrl} target="_blank" rel="noreferrer" title="Open" className="p-1.5 hover:bg-cyan-500/10 rounded-lg text-slate-500 hover:text-cyan-400 transition-colors"><ExternalLink className="h-3.5 w-3.5" /></a>
                          <button onClick={() => setEditItem(urlItem)} title="Edit" className="p-1.5 hover:bg-yellow-500/10 rounded-lg text-slate-500 hover:text-yellow-400 transition-colors"><Edit3 className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDelete(urlItem._id)} title="Delete" className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
