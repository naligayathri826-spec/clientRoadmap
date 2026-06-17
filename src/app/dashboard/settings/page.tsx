'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbClient';
import { useApp } from '@/lib/context/AppContext';
import { 
  Settings, 
  User, 
  ShieldAlert, 
  Terminal, 
  Key, 
  Lock, 
  ShieldCheck, 
  RefreshCw,
  Server
} from 'lucide-react';

export default function SettingsPage() {
  const { currentUser, refreshTrigger, triggerRefresh, addSystemNotification } = useApp();
  
  // UI Tabs State
  const [activeTab, setActiveTab] = useState<'profile' | 'rbac' | 'audit' | 'api'>('profile');

  // Database States
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Form profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Form API state
  const [rateLimit, setRateLimit] = useState(120);
  const [apiKey, setApiKey] = useState('ag_live_72k1a983b0dc56ef7f8a92');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAuditLogs(db.getAuditLogs());
      setActivityLogs(db.getActivityLogs());
      setUsers(db.getUsers());
      setName(currentUser.name);
      setEmail(currentUser.email);
    }
  }, [refreshTrigger, currentUser]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Update local currentUser values
    const allUsers = JSON.parse(localStorage.getItem('agencyos-users') || '[]');
    const updated = allUsers.map((u: any) => u.id === currentUser.id ? { ...u, name, email } : u);
    localStorage.setItem('agencyos-users', JSON.stringify(updated));
    db.addActivityLog('Updated personal profile settings.');
    addSystemNotification('Profile Saved', 'Personal configurations updated.', 'System');
    triggerRefresh();
  };

  const handleRotateKey = () => {
    const randomHex = Array.from({length: 22}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const newKey = `ag_live_${randomHex}`;
    setApiKey(newKey);
    db.addActivityLog('Rotated active API authentication keys.');
    addSystemNotification('API Credentials Rotated', 'Old tokens decommissioned; new token active.', 'System');
  };

  return (
    <div className="space-y-6 fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight font-sans">Settings & Governance</h2>
          <p className="text-xs text-zinc-400">Configure workspace parameters, verify row-level audit logs, and manage token credentials.</p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex rounded-xl p-0.5 border border-black/5 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] w-full sm:max-w-md overflow-hidden">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'profile' ? 'bg-white dark:bg-zinc-800 text-blue-500 shadow-xs' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'rbac' ? 'bg-white dark:bg-zinc-800 text-blue-500 shadow-xs' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>RBAC</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'audit' ? 'bg-white dark:bg-zinc-800 text-blue-500 shadow-xs' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Audits</span>
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'api' ? 'bg-white dark:bg-zinc-800 text-blue-500 shadow-xs' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API & Runtimes</span>
        </button>
      </div>

      {/* --- Profile tab panel --- */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 max-w-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">Profile Parameters</h3>
          
          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Update Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl cursor-pointer"
            >
              Save Parameters
            </button>
          </form>
        </div>
      )}

      {/* --- RBAC panel --- */}
      {activeTab === 'rbac' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Role Definitions</h3>
            
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 border border-black/5 rounded-xl">
                <span className="font-bold text-blue-500 uppercase text-[10px]">Super Admin / Admin</span>
                <p className="text-zinc-500 mt-1">Full infrastructure capabilities. Access to settings, invoicing, audits, team roster, leads, and client profiles.</p>
              </div>
              <div className="p-3 border border-black/5 rounded-xl">
                <span className="font-bold text-amber-500 uppercase text-[10px]">Sales Desk</span>
                <p className="text-zinc-500 mt-1">Restricted permissions. Access to leads CRM, meetings schedules, and pipeline boards. Cannot change settings, view audits, or delete clients.</p>
              </div>
              <div className="p-3 border border-black/5 rounded-xl">
                <span className="font-bold text-purple-500 uppercase text-[10px]">Operations & Developers</span>
                <p className="text-zinc-500 mt-1">Restricted permissions. Operations manage clients/payments. Developers configure automations and project codes. Cannot view audits or alter billing packages.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Roster Groups</h3>
            <div className="space-y-3">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between text-xs p-2 bg-black/[0.01] rounded-xl border border-black/[0.02]">
                  <div className="flex items-center gap-2">
                    <img src={u.avatar_url} className="w-5 h-5 rounded-full object-cover" />
                    <span>{u.name}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold uppercase">{u.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- Auditing Logs tab --- */}
      {activeTab === 'audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Audit log list */}
          <div className="lg:col-span-2 p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Row Level Security (RLS) Auditing</span>
            </h3>

            <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1 no-scrollbar text-xs">
              {auditLogs.length === 0 ? (
                <div className="text-center py-6 text-zinc-400">No security logs recorded.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 border border-black/5 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                          log.action === 'DELETE' ? 'bg-red-500/10 text-red-500' :
                          log.action === 'INSERT' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          {log.action}
                        </span>
                        <span className="font-bold">Table: {log.table_name}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1">ID: {log.record_id} | IP: {log.ip_address}</div>
                    </div>
                    
                    <div className="text-right text-[10px]">
                      <div className="font-semibold text-zinc-700 dark:text-zinc-300">{log.user_name}</div>
                      <div className="text-zinc-400 text-[9px] mt-0.5">{new Date(log.created_at).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Logs Feed */}
          <div className="lg:col-span-1 p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Operations Feed</h3>
            
            <div className="space-y-3.5 overflow-y-auto max-h-[50vh] pr-1 no-scrollbar text-[11px]">
              {activityLogs.map((act) => (
                <div key={act.id} className="relative pl-4 border-l border-zinc-200 dark:border-zinc-800 py-0.5">
                  <span className="absolute left-[-3.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <p className="text-zinc-700 dark:text-zinc-300 leading-normal">{act.action_description}</p>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">{new Date(act.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* --- API keys panel --- */}
      {activeTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">API Credentials</h3>
            
            <div className="space-y-4 pt-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Access Token Endpoint</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="https://api.agencyos.com/v1/graphql"
                    disabled
                    className="flex-1 px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/5 text-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Secret Authentication Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiKey}
                    disabled
                    className="flex-1 px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/5 text-zinc-400 font-mono"
                  />
                  <button
                    onClick={handleRotateKey}
                    className="px-3 rounded-xl border border-black/5 hover:bg-black/[0.02] flex items-center justify-center cursor-pointer gap-1.5 font-bold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Rotate</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
              <Server className="w-4 h-4 text-blue-500 animate-pulse" />
              <span>API Rate Limiter</span>
            </h3>
            
            <div className="space-y-4 pt-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Limits: {rateLimit} calls / min</label>
                <input
                  type="range"
                  min="30"
                  max="500"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                  className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-zinc-400 mt-2 block">Configure rate limits to restrict abuse.</span>
              </div>

              <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                <span className="font-bold text-[10px] text-blue-500 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>JWT Tokens Active</span>
                </span>
                <p className="text-[10px] text-zinc-400 mt-1">Bearer tokens enforce RBAC row-level security on endpoints.</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
