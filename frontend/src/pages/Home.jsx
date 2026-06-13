import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Terminal, Activity, Cpu, Radio, AlertOctagon, CheckCircle, Globe, Zap, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const simulateScan = async (url, setProgress, setStep, setResult, setChecking) => {
  setChecking(true);
  const steps = [
    [10, 'INITIALIZING SCAN NODE...'],
    [30, 'RESOLVING TLD INTEGRITY...'],
    [55, 'CROSS-REFERENCING PHISHING DB...'],
    [75, 'RUNNING HEURISTIC ANALYSIS...'],
    [90, 'COMPUTING RISK INDEX...'],
    [100, 'SCAN COMPLETE'],
  ];

  let score = 0;
  const reasons = [];
  const lower = url.toLowerCase();

  if (/\.(xyz|top|click|cc|ru|gq|cf|ml|ga)$/.test(new URL(url).hostname)) { score += 40; reasons.push('SUSPICIOUS_TLD_DETECTED'); }
  if (/paypal|secure|verify|login|signin|account|billing|password/.test(lower)) { score += 45; reasons.push('PHISHING_KEYWORD_MATCH'); }
  if (/--/.test(lower) || (lower.match(/-/g) || []).length > 3) { score += 15; reasons.push('BRAND_LOOKALIKE_HYPHENS'); }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(new URL(url).hostname)) { score += 40; reasons.push('IP_HOSTNAME_DETECTED'); }
  score = Math.min(score, 100);

  for (const [p, s] of steps) {
    setProgress(p); setStep(s);
    await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
  }

  setResult({ safe: score < 50, score, reasons: reasons.length ? reasons : ['NO_MALICIOUS_MARKERS'] });
  setChecking(false);
};

export default function Home() {
  const navigate = useNavigate();
  const [demoUrl, setDemoUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState('');
  const [result, setResult] = useState(null);

  const handleScan = (e) => {
    e.preventDefault();
    if (!demoUrl.trim()) return;
    try {
      new URL(demoUrl.trim());
      setResult(null);
      simulateScan(demoUrl.trim(), setProgress, setStep, setResult, setChecking);
    } catch {
      toast.error('INVALID URL — include http:// or https://');
    }
  };

  return (
    <div className="min-h-screen bg-[#05060A] cyber-grid text-slate-100 relative overflow-x-hidden">
      {/* Ambient glows */}
      <div className="absolute top-[-5%] left-[10%] w-[700px] h-[500px] bg-indigo-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[500px] bg-purple-600/6 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-cyan-600/4 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#05060A]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600/30 to-cyan-600/30 border border-indigo-500/30 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="font-display font-black text-sm tracking-widest">
              SMART<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 glow-text">SHIELD</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-xs font-cyber text-slate-400 hover:text-indigo-400 transition-colors tracking-widest px-4 py-2">
              [ Log In ]
            </button>
            <button onClick={() => navigate('/signup')}
              className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-cyber font-bold text-xs tracking-widest px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all group">
              Sign Up
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full">
              <Radio className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              <span className="text-[10px] font-cyber text-indigo-400 tracking-widest">Threat Scanner Online</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] text-white">
              Intelligent URL<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                Threat Detection
              </span>
            </h1>

            <p className="text-sm font-cyber text-slate-400 leading-relaxed max-w-xl uppercase tracking-wide">
              SmartShield audits every link against phishing databases, brand lookalikes, and malware networks. Create secure short URLs with real-time threat intelligence.
            </p>

            {/* Scan input */}
            <div className="cyber-panel rounded-2xl p-6">
              <div className="absolute top-2 right-3 font-cyber text-[8px] text-indigo-400/30 uppercase tracking-widest">AUDIT_NODE_v2</div>
              <form onSubmit={handleScan} className="space-y-4">
                <label className="text-[9px] font-cyber text-slate-400 tracking-widest uppercase block">Enter URL to scan</label>
                <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-3.5 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all">
                  <Terminal className="h-4 w-4 text-indigo-400/50 shrink-0" />
                  <input type="text" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} disabled={checking}
                    placeholder="https://paypal-security-update-required.xyz"
                    className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-slate-600 font-cyber" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={checking}
                    className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-cyber font-bold text-xs tracking-widest px-6 py-3 rounded-xl transition-all disabled:opacity-50 group">
                    {checking ? 'Scanning...' : 'Scan URL'}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                  <button type="button" onClick={() => navigate('/signup')}
                    className="flex items-center gap-2 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-400 font-cyber font-bold text-xs tracking-widest px-6 py-3 rounded-xl transition-all hover:bg-indigo-500/5">
                    Get Started <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/5">
              {[['1.4M+', 'SCANS COMPLETED'], ['0.02%', 'THREAT INDEX'], ['99.98%', 'REDIRECT RATE']].map(([v, l]) => (
                <div key={l}>
                  <p className="text-[8px] font-cyber text-slate-500 tracking-widest uppercase mb-1">{l}</p>
                  <p className="text-2xl font-black text-white font-cyber">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Radar Panel */}
          <div className="lg:col-span-5">
            <div className="cyber-panel rounded-2xl p-6 min-h-[400px] flex flex-col">
              <div className="absolute top-2 right-3 font-cyber text-[8px] text-cyan-400/30 uppercase">VECTOR_RADAR_v2</div>
              <h3 className="text-[10px] font-cyber text-cyan-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                URL Risk Scanner
              </h3>

              {/* Radar */}
              <div className="relative w-48 h-48 mx-auto my-6 radar-sweep-lines rounded-full border border-cyan-500/15 flex items-center justify-center">
                <div className="absolute w-36 h-36 rounded-full border border-cyan-500/10" />
                <div className="absolute w-24 h-24 rounded-full border border-cyan-500/8" />
                <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-spin" style={{ animationDuration: '4s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
                </div>
                <Radio className="h-8 w-8 text-cyan-400 animate-pulse" />
              </div>

              {/* Result / Progress */}
              {checking ? (
                <div className="bg-slate-900/60 border border-indigo-500/15 rounded-xl p-4 font-cyber text-[9px] space-y-2">
                  <div className="flex justify-between text-indigo-400 font-bold"><span>{step}</span><span>{progress}%</span></div>
                  <div className="w-full bg-slate-950 h-1 rounded overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.8)]" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : result ? (
                <div className={`border rounded-xl p-4 font-cyber text-[10px] ${result.safe ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-red-500/5 border-red-500/30'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {result.safe ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertOctagon className="h-4 w-4 text-red-400 animate-pulse" />}
                    <span className={`font-black tracking-widest uppercase text-[11px] ${result.safe ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.safe ? 'Safe — No Threats' : 'Threat Detected'}
                    </span>
                    <span className="ml-auto text-[9px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">RISK: {result.score}/100</span>
                  </div>
                  <div className="space-y-1 text-slate-400 text-[9px]">
                    {result.reasons.map((r, i) => <p key={i}><span className={`font-bold ${result.safe ? 'text-emerald-400' : 'text-red-400'}`}>▸ </span>{r}</p>)}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 text-center font-cyber text-[10px] text-slate-500 uppercase tracking-wider">
                  Enter a URL above to scan
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <p className="text-[9px] font-cyber text-indigo-400/60 tracking-widest uppercase mb-12">[ ENGINE SPECIFICATIONS ]</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Activity, color: 'indigo', title: 'DYNAMIC PHISHING BLOCKER', desc: 'Heuristic matching against brand spoofing, typosquatting, and known phishing domains.' },
            { icon: Cpu, color: 'purple', title: 'HEURISTIC TELEMETRY', desc: 'Aggregate visitor device, OS, and browser profiles into real-time redirection audit streams.' },
            { icon: Lock, color: 'cyan', title: 'ENCRYPTED QR DECK', desc: 'Generate fully customizable QR codes client-side with neon color schemes and print-ready resolution.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="cyber-panel rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300">
              <div className={`p-3 rounded-xl w-fit mb-5 bg-${color}-500/10 border border-${color}-500/25`}>
                <Icon className={`h-5 w-5 text-${color}-400`} />
              </div>
              <h3 className="text-xs font-cyber font-black tracking-widest text-white mb-3">{title}</h3>
              <p className="text-[11px] font-cyber text-slate-400 leading-relaxed uppercase">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-cyber text-slate-500 uppercase tracking-widest">
          <span className="font-black text-white">SMARTSHIELD // URL INTELLIGENCE</span>
          <span>© {new Date().getFullYear()} SmartShield Inc. — Threat Firewall Active.</span>
          <span className="text-indigo-400/60">Protected</span>
        </div>
      </footer>
    </div>
  );
}
