'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbClient';
import { useApp } from '@/lib/context/AppContext';
import { 
  GitFork, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  MapPin, 
  ChevronRight,
  Briefcase
} from 'lucide-react';

const STAGES = [
  { key: 'New', label: 'Lead Captured', weight: 0.10, color: 'border-t-slate-400 bg-slate-500/5' },
  { key: 'Contacted', label: 'Discovery Call', weight: 0.20, color: 'border-t-blue-400 bg-blue-500/5' },
  { key: 'Qualified', label: 'Strategy Call', weight: 0.40, color: 'border-t-purple-400 bg-purple-500/5' },
  { key: 'Proposal Sent', label: 'Proposal Sent', weight: 0.60, color: 'border-t-indigo-400 bg-indigo-500/5' },
  { key: 'Negotiation', label: 'Negotiation', weight: 0.85, color: 'border-t-orange-400 bg-orange-500/5' },
  { key: 'Closed Won', label: 'Closed Won', weight: 1.00, color: 'border-t-emerald-400 bg-emerald-500/5' },
  { key: 'Closed Lost', label: 'Closed Lost', weight: 0.00, color: 'border-t-red-400 bg-red-500/5' }
];

export default function SalesPipeline() {
  const { currentUser, refreshTrigger, triggerRefresh, addSystemNotification } = useApp();
  
  // Database States
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLeads(db.getLeads());
    }
  }, [refreshTrigger]);

  const canModify = ['Super Admin', 'Admin', 'Sales'].includes(currentUser.role);

  // --- HTML5 Drag and Drop handlers ---
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    if (!canModify) return;
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: any) => {
    e.preventDefault();
    if (!canModify) return;
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) {
      db.updateLead(leadId, { status: newStatus });
      addSystemNotification('Pipeline Card Shifted', `Shifted lead status to ${newStatus}.`, 'System');
      triggerRefresh();
    }
  };

  // --- Revenue Calculations ---
  
  // Sum of budget * weight per lead
  const forecastRevenue = leads.reduce((acc, lead) => {
    const stage = STAGES.find(s => s.key === lead.status);
    const weight = stage ? stage.weight : 0;
    return acc + (Number(lead.budget) * weight);
  }, 0);

  // Total Gross Pipeline budget (excluding won/lost)
  const totalPipelineRevenue = leads
    .filter(l => l.status !== 'Closed Won' && l.status !== 'Closed Lost')
    .reduce((acc, lead) => acc + Number(lead.budget), 0);

  // Total Revenue Won
  const totalRevenueWon = leads
    .filter(l => l.status === 'Closed Won')
    .reduce((acc, lead) => acc + Number(lead.budget), 0);

  return (
    <div className="space-y-6 fade-in-up">
      
      {/* Header & Calculations Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Sales Pipeline & Forecasting</h2>
          <p className="text-xs text-zinc-400">Drag and drop leads to advance stages, calculate weighted win forecasts, and project MRR growth.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/10 apple-glass">
          <GitFork className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-zinc-700 dark:text-zinc-300">Apple Interactive Kanban</span>
        </div>
      </div>

      {/* Forecasting Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Forecast Weight card */}
        <div className="p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Weighted Forecast</span>
            <div className="text-2xl font-extrabold text-blue-500 mt-1">${Math.round(forecastRevenue).toLocaleString()}</div>
            <p className="text-[9px] text-zinc-400 mt-1">Probability-adjusted expected close revenue.</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500"><TrendingUp className="w-5 h-5" /></div>
        </div>

        {/* Gross pipeline card */}
        <div className="p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Gross Active Pipeline</span>
            <div className="text-2xl font-extrabold mt-1">${totalPipelineRevenue.toLocaleString()}</div>
            <p className="text-[9px] text-zinc-400 mt-1">Total contract values under discussion.</p>
          </div>
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500"><DollarSign className="w-5 h-5" /></div>
        </div>

        {/* Won Closed Revenue card */}
        <div className="p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Closed Won Revenue</span>
            <div className="text-2xl font-extrabold text-emerald-500 mt-1">${totalRevenueWon.toLocaleString()}</div>
            <p className="text-[9px] text-zinc-400 mt-1">Retainer revenue successfully captured.</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500"><ArrowUpRight className="w-5 h-5" /></div>
        </div>

      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar items-start select-none">
        
        {STAGES.map((stage) => {
          const stageLeads = leads.filter(l => l.status === stage.key);
          const stageValue = stageLeads.reduce((acc, l) => acc + Number(l.budget), 0);

          return (
            <div 
              key={stage.key}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.key)}
              className={`w-72 shrink-0 p-4 rounded-3xl border border-black/5 dark:border-white/5 border-t-4 ${stage.color} flex flex-col space-y-4 min-h-[500px]`}
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                <div>
                  <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{stage.label}</h3>
                  <span className="text-[9px] text-zinc-400 font-medium">Probability: {stage.weight * 100}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded-full font-bold">
                    {stageLeads.length}
                  </span>
                  <div className="text-[9px] font-bold text-zinc-500 mt-1">${(stageValue / 1000).toFixed(0)}k</div>
                </div>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-grow min-h-[400px]">
                {stageLeads.map((l) => (
                  <div
                    key={l.id}
                    draggable={canModify}
                    onDragStart={(e) => handleDragStart(e, l.id)}
                    className="p-4 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all space-y-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{l.lead_name}</h4>
                      <p className="text-[9px] text-zinc-400 font-semibold flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-2.5 h-2.5 text-zinc-400" />
                        <span>{l.business_name}</span>
                      </p>
                    </div>

                    <p className="text-[9px] text-zinc-500 leading-normal line-clamp-2">{l.requirements || 'No specifics log.'}</p>

                    <div className="flex justify-between items-center pt-2.5 border-t border-black/5 dark:border-white/5 text-[9px] text-zinc-400">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{l.location ? l.location.split(',')[0] : 'US'}</span>
                      </span>
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200">${Number(l.budget).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                
                {stageLeads.length === 0 && (
                  <div className="text-center py-12 text-[10px] text-zinc-400/60 border border-dashed border-black/5 dark:border-white/5 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01]">
                    Drag cards here
                  </div>
                )}
              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
}
