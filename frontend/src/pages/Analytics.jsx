import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Sector
} from 'recharts';
import { BarChart3, Loader2, ChevronDown, ArrowLeft, ExternalLink, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1','#a855f7','#06b6d4','#39FF88','#f59e0b','#ef4444'];

const AreaTooltip = ({ active, payload, label }) => active && payload?.length ? (
  <div className="bg-[#070B14]/95 p-3 rounded-xl border border-indigo-500/20 shadow-lg font-cyber text-[10px]">
    <p className="text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-indigo-400 font-black">CLICKS: <span className="text-white">{payload[0].value}</span></p>
  </div>
) : null;

const PieTooltip = ({ active, payload }) => active && payload?.length ? (
  <div className="bg-[#070B14]/95 px-3 py-2 rounded-xl border border-indigo-500/20 font-cyber text-[9px] uppercase">
    <span className="text-slate-400">{payload[0].name}: </span>
    <span className="text-indigo-400 font-black">{payload[0].value}</span>
  </div>
) : null;

const ActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  return (
    <g>
      <text x={cx} y={cy - 5} textAnchor="middle" fill="#fff" fontSize={10} fontFamily="Share Tech Mono" fontWeight="bold">{payload.name.toUpperCase()}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#6366f1" fontSize={11} fontFamily="Share Tech Mono" fontWeight="bold">{`${(percent * 100).toFixed(0)}%`}</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 8} outerRadius={outerRadius + 11} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.4} />
    </g>
  );
};

export default function Analytics() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlIdParam = searchParams.get('urlId');
  const [urls, setUrls] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [activeDevice, setActiveDevice] = useState(0);
  const [activeBrowser, setActiveBrowser] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoadingUrls(true);
        const res = await api.get('/url/all');
        const list = res.data.urls || [];
        setUrls(list);
        if (list.length) {
          const init = urlIdParam && list.some(u => u._id === urlIdParam) ? urlIdParam : list[0]._id;
          setSelectedId(init);
        }
      } catch { toast.error('Failed to load URLs'); }
      finally { setLoadingUrls(false); }
    };
    fetch();
  }, [urlIdParam]);

  useEffect(() => {
    if (!selectedId) return;
    const fetch = async () => {
      try { setLoadingAnalytics(true); const res = await api.get(`/analytics/${selectedId}`); setAnalytics(res.data); }
      catch { toast.error('Failed to load analytics'); }
      finally { setLoadingAnalytics(false); }
    };
    fetch();
  }, [selectedId]);

  const onChange = (e) => { setSelectedId(e.target.value); setSearchParams({ urlId: e.target.value }); };

  const deviceData = Object.entries(analytics?.analytics?.devices || {}).filter(([,v]) => v > 0).map(([name, value]) => ({ name, value }));
  const browserData = Object.entries(analytics?.analytics?.browsers || {}).filter(([,v]) => v > 0).map(([name, value]) => ({ name, value }));
  const osData = Object.entries(analytics?.analytics?.os || {}).filter(([,v]) => v > 0).map(([name, clicks]) => ({ name, clicks }));
  const timelineData = (() => {
    const dates = {};
    const sorted = [...(analytics?.analytics?.history || [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    sorted.forEach(v => { const d = new Date(v.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); dates[d] = (dates[d] || 0) + 1; });
    return Object.entries(dates).map(([date, Clicks]) => ({ date, Clicks }));
  })();

  const lastVisited = analytics?.analytics?.history?.length 
    ? new Date(Math.max(...analytics.analytics.history.map(h => new Date(h.timestamp)))).toLocaleString()
    : 'Never';

  if (loadingUrls) return <div className="flex-1 flex items-center justify-center py-24"><Loader2 className="h-7 w-7 animate-spin text-indigo-400" /></div>;

  if (!urls.length) return (
    <div className="cyber-panel rounded-2xl max-w-lg mx-auto mt-16 p-12 text-center">
      <BarChart3 className="h-12 w-12 text-indigo-400/30 mx-auto mb-4" />
      <h3 className="text-sm font-black text-white tracking-widest uppercase mb-3">No Data Yet</h3>
      <p className="text-[10px] font-cyber text-slate-500 uppercase leading-relaxed mb-8">Create routes and generate traffic to unlock analytics intelligence.</p>
      <button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-cyber font-bold text-xs tracking-widest px-6 py-3 rounded-xl">GO TO Dashboard</button>
    </div>
  );

  return (
    <div className="space-y-6 relative z-10">
      {/* Selector */}
      <div className="cyber-panel rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="absolute top-2 right-3 font-cyber text-[7px] text-indigo-400/30">SELECTOR_NODE</div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={() => navigate('/dashboard')} className="p-2.5 border border-slate-700/50 hover:border-indigo-500/40 rounded-xl text-slate-400 hover:text-indigo-400 transition-all"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <p className="text-[8px] font-cyber text-slate-500 uppercase tracking-widest mb-1">Select Link</p>
            <div className="relative">
              <select value={selectedId} onChange={onChange}
                className="appearance-none bg-slate-900/60 border border-slate-700/50 text-xs font-cyber text-slate-200 rounded-xl py-2 pl-4 pr-10 focus:outline-none focus:border-indigo-500/60 cursor-pointer w-56">
                {urls.map(u => <option key={u._id} value={u._id}>{u.customAlias || u.shortCode}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-indigo-400/50 pointer-events-none" />
            </div>
          </div>
        </div>
        {analytics?.url && (
          <div className="text-xs font-cyber text-slate-400 sm:border-l sm:border-slate-800 sm:pl-6 space-y-1">
            <p className="flex items-center gap-2">
              <span className="text-slate-500 uppercase text-[9px]">Target URL:</span>
              <a href={analytics.url.originalUrl} target="_blank" rel="noreferrer" className="hover:text-indigo-400 inline-flex items-center gap-1 truncate max-w-[240px]">
                {analytics.url.originalUrl} <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[10px]">
              <span><span className="text-slate-500 uppercase">Total Clicks: </span><span className="text-white font-black">{analytics.url.clicks}</span></span>
              <span><span className="text-slate-500 uppercase">Last Visited: </span><span className="text-white font-black">{lastVisited}</span></span>
              <span><span className="text-slate-500 uppercase">Status: </span>
                <span className={`font-black ${analytics.url.scamStatus?.safe ? 'text-emerald-400' : 'text-red-400'}`}>
                  {analytics.url.scamStatus?.safe ? 'Safe' : 'Threat'}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {loadingAnalytics ? (
        <div className="py-24 flex items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-indigo-400" /></div>
      ) : analytics ? (
        <>
          {/* Timeline */}
          <div className="cyber-panel rounded-2xl p-6">
            <div className="absolute top-2 right-3 font-cyber text-[7px] text-indigo-400/30">TIME_SERIES</div>
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Click History</h3>
            <div className="h-72">
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                    <XAxis dataKey="date" stroke="#475569" fontSize={9} tickLine={false} fontFamily="Share Tech Mono" />
                    <YAxis stroke="#475569" fontSize={9} tickLine={false} allowDecimals={false} fontFamily="Share Tech Mono" />
                    <Tooltip content={<AreaTooltip />} />
                    <Area type="monotone" dataKey="Clicks" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#cg)" dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[10px] font-cyber text-slate-600 uppercase border border-slate-900 rounded-xl">NO TIMELINE DATA YET</div>
              )}
            </div>
          </div>

          {/* Demographic charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Devices', data: deviceData, active: activeDevice, setActive: setActiveDevice },
              { title: 'Browsers', data: browserData, active: activeBrowser, setActive: setActiveBrowser },
            ].map(({ title, data, active, setActive }) => (
              <div key={title} className="cyber-panel rounded-2xl p-6">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">{title}</h3>
                <div className="h-48 flex items-center justify-center">
                  {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie activeIndex={active} activeShape={ActiveShape} data={data} cx="50%" cy="50%" innerRadius={46} outerRadius={64} paddingAngle={4} dataKey="value" onMouseEnter={(_, i) => setActive(i)}>
                          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <span className="text-[10px] font-cyber text-slate-600 uppercase">NO DATA</span>}
                </div>
              </div>
            ))}

            {/* OS Bar */}
            <div className="cyber-panel rounded-2xl p-6">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Operating Systems</h3>
              <div className="h-48">
                {osData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={osData}>
                      <defs>
                        <linearGradient id="og" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={8} tickLine={false} fontFamily="Share Tech Mono" />
                      <YAxis stroke="#475569" fontSize={8} tickLine={false} allowDecimals={false} fontFamily="Share Tech Mono" />
                      <Tooltip contentStyle={{ backgroundColor: '#070B14', borderColor: 'rgba(99,102,241,0.2)', borderRadius: '12px', fontFamily: 'Share Tech Mono', fontSize: '9px' }} />
                      <Bar dataKey="clicks" fill="url(#og)" radius={[6, 6, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-[10px] font-cyber text-slate-600 uppercase">NO OS DATA</div>}
              </div>
            </div>
          </div>

          {/* Insights + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="cyber-panel rounded-2xl p-6">
              <div className="absolute top-2 right-3 font-cyber text-[7px] text-purple-400/30">INTEL_SUMMARY</div>
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-5">Insights</h3>
              {analytics.analytics?.insights?.length > 0 ? (
                <ul className="space-y-3">
                  {analytics.analytics.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2.5 bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-[10px] font-cyber text-slate-300 uppercase leading-relaxed">
                      <Activity className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              ) : <div className="text-center py-8 text-[9px] font-cyber text-slate-600 uppercase">Waiting for first clicks...</div>}
            </div>

            <div className="lg:col-span-2 cyber-panel rounded-2xl p-6">
              <div className="absolute top-2 right-3 font-cyber text-[7px] text-purple-400/30">CLICK_STREAM</div>
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-5">Recent Clicks</h3>
              {analytics.analytics?.history?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full font-cyber text-[9px] uppercase border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 text-[8px] tracking-widest">
                        <th className="pb-3 text-left font-bold">Device</th>
                        <th className="pb-3 px-4 text-left font-bold">Browser</th>
                        <th className="pb-3 px-4 text-left font-bold">OS</th>
                        <th className="pb-3 px-4 text-left font-bold">IP</th>
                        <th className="pb-3 pl-4 text-right font-bold">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60">
                      {analytics.analytics.history.slice(0, 6).map((v, i) => (
                        <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-3 font-bold text-slate-200">{v.device || '—'}</td>
                          <td className="py-3 px-4 text-slate-400">{v.browser || '—'}</td>
                          <td className="py-3 px-4 text-slate-400">{v.os || '—'}</td>
                          <td className="py-3 px-4 text-indigo-400 font-bold">{v.ip || '—'}</td>
                          <td className="py-3 pl-4 text-right text-slate-500">{new Date(v.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <div className="text-center py-12 text-[10px] font-cyber text-slate-600 uppercase">NO VISIT DATA YET</div>}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-[10px] font-cyber text-slate-600 uppercase">SELECT A LINK TO VIEW ANALYTICS</div>
      )}
    </div>
  );
}
