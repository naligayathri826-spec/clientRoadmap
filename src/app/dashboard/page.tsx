'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbClient';
import { useApp } from '@/lib/context/AppContext';
import { 
  Phone, 
  Calendar, 
  Target, 
  DollarSign, 
  Handshake,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function DashboardOverview() {
  const { refreshTrigger } = useApp();
  
  // Database States
  const [leads, setLeads] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLeads(db.getLeads());
      setMeetings(db.getMeetings());
      setClients(db.getClients());
      setPayments(db.getPayments());
      setAutomations(db.getAutomations());
      setLoading(false);
    }
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // --- Dynamic Calculations ---
  
  // 1. Calls (Simulated calls data based on activity levels)
  const callsToday = 12;
  const callsThisWeek = 78;
  const callsThisMonth = 340;
  const callsThisYear = 4120;

  // 2. Meetings KPI counts
  const meetingsScheduled = meetings.filter(m => m.outcome === 'Scheduled').length;
  const meetingsCompleted = meetings.filter(m => m.outcome === 'Completed').length;
  const meetingsMissed = meetings.filter(m => m.outcome === 'Missed').length;

  // 3. Leads CRM status counts
  const leadsNew = leads.filter(l => l.status === 'New').length;
  const leadsQualified = leads.filter(l => l.status === 'Qualified' || l.status === 'Proposal Sent' || l.status === 'Negotiation').length;
  const leadsConverted = leads.filter(l => l.status === 'Closed Won').length;

  // 4. Revenue calculation
  const mrr = clients.reduce((acc, c) => acc + Number(c.monthly_retainer), 0);
  const arr = mrr * 12;
  const pipelineRevenue = leads
    .filter(l => l.status !== 'Closed Won' && l.status !== 'Closed Lost')
    .reduce((acc, l) => acc + Number(l.budget), 0);

  // 5. Clients status counts
  const clientsActive = clients.length;
  const clientsOnboarding = 2; // Simulated onboarding
  const clientsRetained = clients.filter(c => Number(c.roi_metric) > 200).length;
  const clientsChurned = 1; // Simulated baseline

  // 6. Growth ratios & metrics
  const totalClosedDeals = leads.filter(l => l.status === 'Closed Won' || l.status === 'Closed Lost').length;
  const conversionRate = totalClosedDeals > 0 
    ? ((leadsConverted / totalClosedDeals) * 100).toFixed(1)
    : '0.0';

  // --- Charts Data ---
  
  // A. Revenue Growth curve (Area chart, monthly trend)
  const revenueGrowthData = [
    { name: 'Jan', revenue: mrr * 0.70 },
    { name: 'Feb', revenue: mrr * 0.78 },
    { name: 'Mar', revenue: mrr * 0.85 },
    { name: 'Apr', revenue: mrr * 0.92 },
    { name: 'May', revenue: mrr * 0.95 },
    { name: 'Jun', revenue: mrr },
  ];

  // B. Leads vs Meetings (Bar chart)
  const leadMeetingComparisonData = [
    { name: 'Jan', Leads: 18, Meetings: 8 },
    { name: 'Feb', Leads: 25, Meetings: 12 },
    { name: 'Mar', Leads: 32, Meetings: 15 },
    { name: 'Apr', Leads: 45, Meetings: 22 },
    { name: 'May', Leads: 50, Meetings: 28 },
    { name: 'Jun', Leads: leads.length * 4, Meetings: meetings.length * 3 },
  ];

  // C. Source conversion pie data
  const sourceData = [
    { name: 'LinkedIn', value: leads.filter(l => l.source === 'LinkedIn').length, color: '#3b82f6' },
    { name: 'Instagram', value: leads.filter(l => l.source === 'Instagram').length, color: '#ec4899' },
    { name: 'Website', value: leads.filter(l => l.source === 'Website').length, color: '#10b981' },
    { name: 'Referral', value: leads.filter(l => l.source === 'Referral').length, color: '#8b5cf6' },
    { name: 'Outreach', value: leads.filter(l => l.source === 'Cold Outreach' || l.source === 'Facebook' || l.source === 'WhatsApp').length, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6 fade-in-up">
      
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agency Operations Center</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time insights across CRM leads, financial metrics, and active automation agents.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-black/5 dark:border-white/10 apple-glass">
          <Activity className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          <span className="text-zinc-700 dark:text-zinc-300">Live Sync Enabled</span>
        </div>
      </div>

      {/* KPI Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Calls Card */}
        <div className="p-5 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Calls</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Phone className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight mt-2">{callsToday}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Today</p>
          </div>
          <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2 mt-2 text-[10px] text-zinc-400">
            <span>Wk: <strong className="text-zinc-700 dark:text-zinc-300">{callsThisWeek}</strong></span>
            <span>Mo: <strong className="text-zinc-700 dark:text-zinc-300">{callsThisMonth}</strong></span>
          </div>
        </div>

        {/* Meetings Card */}
        <div className="p-5 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Meetings</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><Calendar className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight mt-2">{meetingsScheduled}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Scheduled</p>
          </div>
          <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2 mt-2 text-[10px] text-zinc-400">
            <span>Done: <strong className="text-zinc-700 dark:text-zinc-300">{meetingsCompleted}</strong></span>
            <span>Miss: <strong className="text-zinc-700 dark:text-zinc-300">{meetingsMissed}</strong></span>
          </div>
        </div>

        {/* Leads Card */}
        <div className="p-5 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Leads</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500"><Target className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight mt-2">{leadsNew}</div>
            <p className="text-[10px] text-zinc-500 mt-1">New Leads</p>
          </div>
          <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2 mt-2 text-[10px] text-zinc-400">
            <span>Qual: <strong className="text-zinc-700 dark:text-zinc-300">{leadsQualified}</strong></span>
            <span>Won: <strong className="text-zinc-700 dark:text-zinc-300">{leadsConverted}</strong></span>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="p-5 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">MRR</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><DollarSign className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight mt-2">${mrr.toLocaleString()}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Monthly Retainer</p>
          </div>
          <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2 mt-2 text-[10px] text-zinc-400">
            <span>ARR: <strong className="text-zinc-700 dark:text-zinc-300">${(arr / 1000).toFixed(0)}k</strong></span>
            <span>Pipe: <strong className="text-zinc-700 dark:text-zinc-300">${(pipelineRevenue / 1000).toFixed(0)}k</strong></span>
          </div>
        </div>

        {/* Clients Card */}
        <div className="p-5 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Clients</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500"><Handshake className="w-4 h-4" /></div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight mt-2">{clientsActive}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Active Accounts</p>
          </div>
          <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-2 mt-2 text-[10px] text-zinc-400">
            <span>Onb: <strong className="text-zinc-700 dark:text-zinc-300">{clientsOnboarding}</strong></span>
            <span>Ret: <strong className="text-zinc-700 dark:text-zinc-300">{clientsRetained}</strong></span>
          </div>
        </div>

      </div>

      {/* Executive Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Overview Banner */}
        <div className="lg:col-span-2 p-6 rounded-3xl apple-glass bg-white/40 dark:bg-zinc-900/40 border border-black/5 dark:border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
            <div>
              <h3 className="text-sm font-bold">Total Agency Performance</h3>
              <p className="text-[11px] text-zinc-400">Consolidated analytics and forecasting model.</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="stat-highlight">+18.4% MoM Growth</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 py-6 text-center">
            <div>
              <span className="text-[10px] font-medium text-zinc-400">Lead Growth</span>
              <div className="text-lg font-bold mt-1 flex items-center justify-center gap-0.5">
                <span className="stat-highlight">+12.5%</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-medium text-zinc-400">Meeting Growth</span>
              <div className="text-lg font-bold mt-1 flex items-center justify-center gap-0.5">
                <span className="stat-highlight">+8.2%</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-medium text-zinc-400">Conversion Rate</span>
              <div className="text-lg font-bold mt-1 flex items-center justify-center gap-0.5">
                <span className="stat-highlight">{conversionRate}%</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-medium text-zinc-400">ROI Generated</span>
              <div className="text-lg font-bold mt-1 flex items-center justify-center gap-0.5">
                <span className="stat-highlight">3.8x</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>
            </div>
          </div>

          {/* Revenue growth Chart container */}
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.08)" />
                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(25, 25, 28, 0.85)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side panel charts */}
        <div className="space-y-6">
          
          {/* Leads vs Meetings BarChart */}
          <div className="p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Leads vs Meetings Ratio</h3>
            <div className="h-44 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadMeetingComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.08)" />
                  <XAxis dataKey="name" fontSize={9} stroke="#888888" tickLine={false} axisLine={false} />
                  <YAxis fontSize={9} stroke="#888888" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ 
                      background: 'rgba(25, 25, 28, 0.85)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Meetings" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lead Source conversion PieChart */}
          <div className="p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Lead Sources Breakdown</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1/2 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="w-1/2 space-y-1.5">
                {sourceData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-[60px]">{s.name}</span>
                    </div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Deployed automations performance summary widget */}
      <div className="p-6 rounded-3xl apple-glass bg-white/40 dark:bg-zinc-900/40 border border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold">Automation Infrastructure Operations</h3>
            <p className="text-[11px] text-zinc-400">Operational analytics of active AI assistant runtimes.</p>
          </div>
          <span className="text-xs text-blue-500 font-bold hover:underline cursor-pointer">View Infrastructure</span>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {automations.map((a) => (
            <div key={a.id} className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">{a.platform}</span>
                <span className={`w-2 h-2 rounded-full ${a.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              </div>
              <h4 className="text-xs font-bold mt-2 truncate">{a.name}</h4>
              <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2 border-t border-black/5 dark:border-white/5 pt-2">
                <span>Processed: <strong className="text-zinc-800 dark:text-zinc-200">{a.messages_processed.toLocaleString()}</strong></span>
                <span className="text-emerald-500 font-bold">{a.success_rate}% Ok</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
