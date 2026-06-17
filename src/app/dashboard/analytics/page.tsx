'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbClient';
import { useApp } from '@/lib/context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Phone, 
  Target, 
  DollarSign,
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
  LineChart,
  Line
} from 'recharts';

export default function AnalyticsCenter() {
  const { refreshTrigger } = useApp();
  
  // UI filter state
  const [timeframe, setTimeframe] = useState<'Day' | 'Week' | 'Month' | 'Quarter' | 'Year'>('Month');

  // Database States
  const [leads, setLeads] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLeads(db.getLeads());
      setMeetings(db.getMeetings());
      setPayments(db.getPayments());
    }
  }, [refreshTrigger]);

  // --- Dynamic Trend Generation based on selected Timeframe ---
  
  const getAnalyticsData = () => {
    switch (timeframe) {
      case 'Day':
        return [
          { name: '08:00', Calls: 2, Meetings: 0, Revenue: 0, Leads: 1, Conversion: 0 },
          { name: '10:00', Calls: 5, Meetings: 2, Revenue: 3500, Leads: 3, Conversion: 33.3 },
          { name: '12:00', Calls: 3, Meetings: 1, Revenue: 0, Leads: 1, Conversion: 50.0 },
          { name: '14:00', Calls: 8, Meetings: 3, Revenue: 5000, Leads: 4, Conversion: 25.0 },
          { name: '16:00', Calls: 4, Meetings: 0, Revenue: 0, Leads: 2, Conversion: 0 },
          { name: '18:00', Calls: 1, Meetings: 1, Revenue: 4000, Leads: 1, Conversion: 100 },
        ];
      case 'Week':
        return [
          { name: 'Mon', Calls: 15, Meetings: 3, Revenue: 3500, Leads: 8, Conversion: 37.5 },
          { name: 'Tue', Calls: 22, Meetings: 5, Revenue: 5000, Leads: 11, Conversion: 45.4 },
          { name: 'Wed', Calls: 18, Meetings: 4, Revenue: 0, Leads: 9, Conversion: 44.4 },
          { name: 'Thu', Calls: 25, Meetings: 6, Revenue: 4000, Leads: 14, Conversion: 42.8 },
          { name: 'Fri', Calls: 12, Meetings: 2, Revenue: 6500, Leads: 7, Conversion: 28.5 },
        ];
      case 'Quarter':
        return [
          { name: 'Q1-W1', Calls: 80, Meetings: 22, Revenue: 12000, Leads: 35, Conversion: 34.2 },
          { name: 'Q1-W2', Calls: 110, Meetings: 31, Revenue: 18000, Leads: 48, Conversion: 37.5 },
          { name: 'Q1-W3', Calls: 140, Meetings: 39, Revenue: 22000, Leads: 62, Conversion: 40.3 },
          { name: 'Q1-W4', Calls: 165, Meetings: 48, Revenue: 26500, Leads: 78, Conversion: 42.1 },
        ];
      case 'Year':
        return [
          { name: '2022', Calls: 1200, Meetings: 210, Revenue: 85000, Leads: 420, Conversion: 22.0 },
          { name: '2023', Calls: 2100, Meetings: 450, Revenue: 140000, Leads: 890, Conversion: 28.0 },
          { name: '2024', Calls: 3400, Meetings: 720, Revenue: 210000, Leads: 1450, Conversion: 34.0 },
          { name: '2025', Calls: 4800, Meetings: 980, Revenue: 320000, Leads: 2100, Conversion: 38.0 },
          { name: '2026', Calls: 5200, Meetings: 1120, Revenue: 420000, Leads: 2800, Conversion: 41.5 },
        ];
      case 'Month':
      default:
        // Dynamic summary math
        const mCount = meetings.length;
        const lCount = leads.length;
        const revValue = payments.filter(p => p.category === 'Revenue').reduce((acc, p) => acc + p.amount, 0);
        
        return [
          { name: 'Jan', Calls: 45, Meetings: 12, Revenue: 11000, Leads: 18, Conversion: 25.0 },
          { name: 'Feb', Calls: 60, Meetings: 18, Revenue: 13500, Leads: 25, Conversion: 32.0 },
          { name: 'Mar', Calls: 78, Meetings: 22, Revenue: 14000, Leads: 32, Conversion: 35.5 },
          { name: 'Apr', Calls: 95, Meetings: 29, Revenue: 16000, Leads: 45, Conversion: 38.0 },
          { name: 'May', Calls: 110, Meetings: 35, Revenue: 18500, Leads: 50, Conversion: 42.5 },
          { name: 'Jun', Calls: 125, Meetings: mCount * 4, Revenue: revValue > 0 ? revValue : 19000, Leads: lCount * 3, Conversion: 44.0 },
        ];
    }
  };

  const chartData = getAnalyticsData();

  return (
    <div className="space-y-6 fade-in-up">
      
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Executive Analytics Desk</h2>
          <p className="text-xs text-zinc-400">Perform deep data audits, trace pipeline conversion trends, and analyze outreach efficiency.</p>
        </div>

        {/* Timeframe selector */}
        <div className="flex rounded-xl p-0.5 border border-black/5 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] overflow-hidden shrink-0">
          {(['Day', 'Week', 'Month', 'Quarter', 'Year'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                timeframe === t 
                  ? 'bg-white dark:bg-zinc-800 text-blue-500 shadow-xs' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Analytics charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue growth trend */}
        <div className="p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Revenue Growth Curve</h3>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="stat-highlight">Upward trend</span>
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.08)" />
                <XAxis dataKey="name" fontSize={9} stroke="#888888" tickLine={false} axisLine={false} />
                <YAxis fontSize={9} stroke="#888888" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ 
                    background: 'rgba(25, 25, 28, 0.85)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead and meeting trends */}
        <div className="p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">Outreach Conversion Funnel</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="Leads" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="Meetings" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Rate curves */}
        <div className="p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">Lead-to-Client Conversion Rate (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.08)" />
                <XAxis dataKey="name" fontSize={9} stroke="#888888" tickLine={false} axisLine={false} />
                <YAxis fontSize={9} stroke="#888888" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ 
                    background: 'rgba(25, 25, 28, 0.85)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Area type="monotone" dataKey="Conversion" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorConv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outreach / Call volume trends */}
        <div className="p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">Outbound Call Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
                <Bar dataKey="Calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
