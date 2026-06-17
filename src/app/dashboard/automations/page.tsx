'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbClient';
import { useApp } from '@/lib/context/AppContext';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Edit3, 
  Play, 
  Pause, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

export default function AutomationsInfrastructure() {
  const { currentUser, refreshTrigger, triggerRefresh, addSystemNotification } = useApp();
  
  // Database States
  const [automations, setAutomations] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  // UI States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);

  // Form Fields State
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<'WhatsApp' | 'Instagram' | 'Facebook' | 'Website' | 'CRM'>('WhatsApp');
  const [messagesProcessed, setMessagesProcessed] = useState(0);
  const [leadsQualified, setLeadsQualified] = useState(0);
  const [meetingsBooked, setMeetingsBooked] = useState(0);
  const [successRate, setSuccessRate] = useState(98.5);
  const [failureRate, setFailureRate] = useState(1.5);
  const [status, setStatus] = useState<'Active' | 'Paused' | 'Error'>('Active');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAutomations(db.getAutomations());
      const allClients = db.getClients();
      setClients(allClients);
      if (allClients.length > 0) {
        setClientId(allClients[0].id);
      }
    }
  }, [refreshTrigger]);

  const canModify = ['Super Admin', 'Admin', 'Developer'].includes(currentUser.role);

  // --- Calculations ---
  const totalProcessed = automations.reduce((acc, a) => acc + Number(a.messages_processed || 0), 0);
  const totalLeads = automations.reduce((acc, a) => acc + Number(a.leads_qualified || 0), 0);
  const totalMeetings = automations.reduce((acc, a) => acc + Number(a.meetings_booked || 0), 0);
  const avgSuccess = automations.length > 0 
    ? (automations.reduce((acc, a) => acc + Number(a.success_rate || 0), 0) / automations.length).toFixed(1)
    : '100.0';

  // --- CRUD Handlers ---
  const handleAddClick = () => {
    if (!canModify) return;
    setEditingAutomation(null);
    setClientId(clients[0]?.id || '');
    setName('');
    setPlatform('WhatsApp');
    setMessagesProcessed(0);
    setLeadsQualified(0);
    setMeetingsBooked(0);
    setSuccessRate(98.5);
    setFailureRate(1.5);
    setStatus('Active');
    setModalOpen(true);
  };

  const handleEditClick = (automation: any) => {
    if (!canModify) return;
    setEditingAutomation(automation);
    setClientId(automation.client_id);
    setName(automation.name);
    setPlatform(automation.platform);
    setMessagesProcessed(Number(automation.messages_processed) || 0);
    setLeadsQualified(Number(automation.leads_qualified) || 0);
    setMeetingsBooked(Number(automation.meetings_booked) || 0);
    setSuccessRate(Number(automation.success_rate) || 0);
    setFailureRate(Number(automation.failure_rate) || 0);
    setStatus(automation.status);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId) {
      alert('Required fields are missing.');
      return;
    }

    const payload = {
      client_id: clientId,
      name,
      platform,
      messages_processed: Number(messagesProcessed),
      leads_qualified: Number(leadsQualified),
      meetings_booked: Number(meetingsBooked),
      success_rate: Number(successRate),
      failure_rate: Number(failureRate),
      status
    };

    if (editingAutomation) {
      db.updateAutomation(editingAutomation.id, payload);
      addSystemNotification('Automation Updated', `Agent settings for ${name} were updated.`, 'System');
    } else {
      db.addAutomation(payload);
    }

    setModalOpen(false);
    triggerRefresh();
  };

  const handleDelete = (id: string) => {
    if (!canModify) return;
    if (confirm('Deploy shutdown signal? Deleting this automation removes it from active runtimes.')) {
      db.deleteAutomation(id);
      addSystemNotification('Agent Decommissioned', 'Automation runtime removed from infrastructure.', 'System');
      triggerRefresh();
    }
  };

  const toggleStatus = (automation: any) => {
    if (!canModify) return;
    const nextStatus = automation.status === 'Active' ? 'Paused' : 'Active';
    db.updateAutomation(automation.id, { status: nextStatus });
    addSystemNotification('Agent Status Shifted', `Agent runtime status shifted to ${nextStatus}.`, 'System');
    triggerRefresh();
  };

  return (
    <div className="space-y-6 fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">AI Agent Infrastructure</h2>
          <p className="text-xs text-zinc-400">Monitor live event-loops, message throughput, success rates, and webhook connections.</p>
        </div>
        {canModify && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Agent</span>
          </button>
        )}
      </div>

      {/* Aggregate stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Run-loops monitored</span>
            <div className="text-xl font-bold mt-1">{automations.length} Nodes</div>
          </div>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Zap className="w-4 h-4" /></div>
        </div>
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Messages Processed</span>
            <div className="text-xl font-bold mt-1">{totalProcessed.toLocaleString()}</div>
          </div>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500"><MessageSquare className="w-4 h-4" /></div>
        </div>
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Overall Success Rate</span>
            <div className="text-xl font-bold text-emerald-500 mt-1">{avgSuccess}%</div>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle className="w-4 h-4" /></div>
        </div>
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Auto Bookings</span>
            <div className="text-xl font-bold text-indigo-500 mt-1">+{totalMeetings} Meets</div>
          </div>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500"><Activity className="w-4 h-4" /></div>
        </div>
      </div>

      {/* Automations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {automations.map((a) => {
          const client = clients.find(c => c.id === a.client_id);
          
          return (
            <div 
              key={a.id}
              className="p-5 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex flex-col justify-between h-64 hover:scale-[1.01] transition-transform"
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 font-bold uppercase border border-black/5">
                    {a.platform}
                  </span>
                  
                  {/* Status indicators */}
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      a.status === 'Active' ? 'bg-emerald-500 animate-pulse' :
                      a.status === 'Paused' ? 'bg-zinc-400' : 'bg-red-500'
                    }`} />
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">{a.status}</span>
                  </div>
                </div>

                <h3 className="text-xs font-bold mt-3.5 leading-tight">{a.name}</h3>
                <p className="text-[9px] text-zinc-400 mt-0.5">Account: {client?.business_name || 'System'}</p>
              </div>

              {/* Node Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-center py-2.5 my-2 border-y border-black/5 dark:border-white/5 text-[9px]">
                <div>
                  <div className="text-zinc-400 font-medium">Processed</div>
                  <div className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{Number(a.messages_processed).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-zinc-400 font-medium">Auto-Meets</div>
                  <div className="font-bold text-indigo-500 mt-0.5">+{a.meetings_booked}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-emerald-500">{a.success_rate}% Ok</span>
                  <span className="text-zinc-400">{a.failure_rate}% Err</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleStatus(a)}
                    className="p-1 rounded hover:bg-black/[0.03] text-zinc-500 cursor-pointer"
                    title={a.status === 'Active' ? 'Pause Agent' : 'Resume Agent'}
                  >
                    {a.status === 'Active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                  <button
                    onClick={() => handleEditClick(a)}
                    className="p-1 rounded hover:bg-black/[0.03] text-zinc-500 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {canModify && (
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-black/5 rounded-3xl p-6 relative animate-in zoom-in-95 duration-300">
            <h3 className="text-sm font-bold mb-4">{editingAutomation ? 'Edit Automation Settings' : 'Deploy New AI Agent'}</h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Select Client Account</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                  required
                >
                  <option value="" disabled>-- Select Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.business_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Automation Agent Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                  placeholder="Apex Dental WhatsApp Booking Agent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Platform Channel</label>
                  <select
                    value={platform}
                    onChange={(e: any) => setPlatform(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                  >
                    <option value="WhatsApp">WhatsApp API</option>
                    <option value="Instagram">Instagram DM</option>
                    <option value="Facebook">Facebook Messenger</option>
                    <option value="Website">Website Chat widget</option>
                    <option value="CRM">Hubspot / CRM sync</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Error">Error</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-black/5 pt-4">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Processed</label>
                  <input
                    type="number"
                    value={messagesProcessed}
                    onChange={(e) => setMessagesProcessed(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-black/5 rounded-lg bg-transparent text-center focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Qualified</label>
                  <input
                    type="number"
                    value={leadsQualified}
                    onChange={(e) => setLeadsQualified(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-black/5 rounded-lg bg-transparent text-center focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Bookings</label>
                  <input
                    type="number"
                    value={meetingsBooked}
                    onChange={(e) => setMeetingsBooked(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-black/5 rounded-lg bg-transparent text-center focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Success Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={successRate}
                    onChange={(e) => setSuccessRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Failure Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={failureRate}
                    onChange={(e) => setFailureRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-black/5 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-black/5 font-semibold rounded-xl hover:bg-black/[0.02] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl cursor-pointer"
                >
                  Deploy Node
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
