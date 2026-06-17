'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbClient';
import { useApp } from '@/lib/context/AppContext';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Activity, 
  CheckCircle, 
  Clock, 
  Wrench, 
  Play
} from 'lucide-react';

export default function ProjectsManager() {
  const { currentUser, refreshTrigger, triggerRefresh, addSystemNotification } = useApp();
  
  // Database States
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  // UI States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  // Form Fields State
  const [clientId, setClientId] = useState('');
  const [projectName, setProjectName] = useState<'Website AI Assistant' | 'WhatsApp Automation' | 'Instagram Automation' | 'Lead Qualification Agent' | 'CRM Integration' | 'Follow-Up System'>('Website AI Assistant');
  const [status, setStatus] = useState<'Planning' | 'Development' | 'Testing' | 'Client Review' | 'Live' | 'Maintenance'>('Planning');
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProjects(db.getProjects());
      const allClients = db.getClients();
      setClients(allClients);
      if (allClients.length > 0) {
        setClientId(allClients[0].id);
      }
    }
  }, [refreshTrigger]);

  const canModify = ['Super Admin', 'Admin', 'Operations', 'Developer'].includes(currentUser.role);

  // --- CRUD Actions ---
  const handleAddClick = () => {
    if (!canModify) return;
    setEditingProject(null);
    setClientId(clients[0]?.id || '');
    setProjectName('Website AI Assistant');
    setStatus('Planning');
    setProgress(0);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handleEditClick = (project: any) => {
    if (!canModify) return;
    setEditingProject(project);
    setClientId(project.client_id);
    setProjectName(project.project_name);
    setStatus(project.status);
    setProgress(Number(project.progress));
    setStartDate(project.start_date || '');
    setEndDate(project.end_date || '');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert('Please select a client.');
      return;
    }

    const payload = {
      client_id: clientId,
      project_name: projectName,
      status,
      progress: Number(progress),
      start_date: startDate,
      end_date: endDate
    };

    if (editingProject) {
      db.updateProject(editingProject.id, payload);
      addSystemNotification('Project Updated', `Project ${projectName} was updated.`, 'System');
    } else {
      db.addProject(payload);
    }

    setModalOpen(false);
    triggerRefresh();
  };

  const handleDelete = (id: string) => {
    if (!canModify) return;
    if (confirm('Are you sure you want to delete this project?')) {
      db.deleteProject(id);
      addSystemNotification('Project Deleted', 'Project removed from schedule.', 'System');
      triggerRefresh();
    }
  };

  // Filters
  const filteredProjects = projects.filter(p => {
    const client = clients.find(c => c.id === p.client_id);
    const matchesSearch = p.project_name.toLowerCase().includes(search.toLowerCase()) || 
                          (client && client.business_name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate status KPIs
  const totalProjects = projects.length;
  const activeDev = projects.filter(p => p.status === 'Development' || p.status === 'Testing').length;
  const liveCount = projects.filter(p => p.status === 'Live' || p.status === 'Maintenance').length;
  const avgProgress = totalProjects > 0 
    ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / totalProjects)
    : 0;

  return (
    <div className="space-y-6 fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">AI Projects Desk</h2>
          <p className="text-xs text-zinc-400">Manage build sprints, deployments, and QA testing cycles.</p>
        </div>
        {canModify && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">All Projects</span>
            <div className="text-xl font-bold mt-1">{totalProjects}</div>
          </div>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><FolderKanban className="w-4 h-4" /></div>
        </div>
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">In Build Sprint</span>
            <div className="text-xl font-bold mt-1">{activeDev}</div>
          </div>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500"><Clock className="w-4 h-4" /></div>
        </div>
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Active & Live</span>
            <div className="text-xl font-bold mt-1">{liveCount}</div>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle className="w-4 h-4" /></div>
        </div>
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Avg Progress</span>
            <div className="text-xl font-bold mt-1">{avgProgress}%</div>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><Activity className="w-4 h-4" /></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl apple-glass bg-white/50 dark:bg-zinc-900/50">
        <div className="flex items-center w-full sm:max-w-xs relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search projects by name/client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-black/5 dark:border-white/10 bg-transparent text-xs focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-transparent border border-black/5 dark:border-white/10 rounded-xl px-2 py-1.5 focus:outline-hidden w-full sm:w-auto"
        >
          <option value="All">All Statuses</option>
          <option value="Planning">Planning</option>
          <option value="Development">Development</option>
          <option value="Testing">Testing</option>
          <option value="Client Review">Client Review</option>
          <option value="Live">Live</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>

      {/* Projects Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-zinc-400">
            No projects found matching search filters.
          </div>
        ) : (
          filteredProjects.map((p) => {
            const client = clients.find(c => c.id === p.client_id);
            
            return (
              <div 
                key={p.id}
                className="p-5 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex flex-col justify-between h-56 hover:scale-[1.01] transition-transform"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      p.status === 'Live' ? 'bg-emerald-500/10 text-emerald-500' :
                      p.status === 'Testing' ? 'bg-amber-500/10 text-amber-500' :
                      p.status === 'Development' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-zinc-500/10 text-zinc-500'
                    }`}>
                      {p.status}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="p-1 rounded hover:bg-black/[0.03] dark:hover:bg-white/[0.03] text-zinc-500 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {canModify && (
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 rounded hover:bg-red-500/10 text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold mt-3 leading-snug">{p.project_name}</h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Account: {client?.business_name || 'Generic'}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 mt-4">
                  <div className="flex justify-between items-center text-[9px] text-zinc-400">
                    <span>Build Sprint completion</span>
                    <span className="font-bold">{p.progress}%</span>
                  </div>
                  <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>

                {/* Date stamps */}
                <div className="flex justify-between items-center border-t border-black/5 pt-3 mt-4 text-[9px] text-zinc-400">
                  <span>Start: {p.start_date || 'N/A'}</span>
                  <span>Due: {p.end_date || 'N/A'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-black/5 rounded-3xl p-6 relative animate-in zoom-in-95 duration-300">
            <h3 className="text-sm font-bold mb-4">{editingProject ? 'Modify Project Fields' : 'Launch New AI Integration Project'}</h3>

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
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Project Solution Name</label>
                <select
                  value={projectName}
                  onChange={(e: any) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                >
                  <option value="Website AI Assistant">Website AI Assistant</option>
                  <option value="WhatsApp Automation">WhatsApp Automation</option>
                  <option value="Instagram Automation">Instagram Automation</option>
                  <option value="Lead Qualification Agent">Lead Qualification Agent</option>
                  <option value="CRM Integration">CRM Integration</option>
                  <option value="Follow-Up System">Follow-Up System</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Status Column</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Development">Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Client Review">Client Review</option>
                    <option value="Live">Live</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Progress Percentage</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Target End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
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
                  Launch Project
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
