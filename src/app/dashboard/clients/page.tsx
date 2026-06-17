'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbClient';
import { useApp } from '@/lib/context/AppContext';
import { 
  Handshake, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Zap, 
  FolderKanban, 
  X,
  FileText
} from 'lucide-react';

export default function ClientManagement() {
  const { currentUser, refreshTrigger, triggerRefresh, addSystemNotification } = useApp();
  
  // Database States
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  
  // UI States
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  // Form Fields State
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [industry, setIndustry] = useState('');
  const [monthlyRetainer, setMonthlyRetainer] = useState(3000);
  const [startDate, setStartDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [servicePackage, setServicePackage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const allClients = db.getClients();
      setClients(allClients);
      setProjects(db.getProjects());
      setAutomations(db.getAutomations());
      setPayments(db.getPayments());
      
      // Auto-select first client as active profile view by default
      if (allClients.length > 0 && !selectedClient) {
        setSelectedClient(allClients[0]);
      }
    }
  }, [refreshTrigger, selectedClient]);

  const canModify = ['Super Admin', 'Admin', 'Operations'].includes(currentUser.role);

  // --- CRUD actions ---
  const handleAddClick = () => {
    if (!canModify) return;
    setEditingClient(null);
    setBusinessName('');
    setContactPerson('');
    setIndustry('');
    setMonthlyRetainer(3000);
    setStartDate(new Date().toISOString().split('T')[0]);
    setContractEndDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
    setServicePackage('AI Chatbot & CRM Auto-responder Setup');
    setModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, client: any) => {
    e.stopPropagation();
    if (!canModify) return;
    setEditingClient(client);
    setBusinessName(client.business_name);
    setContactPerson(client.contact_person);
    setIndustry(client.industry || '');
    setMonthlyRetainer(Number(client.monthly_retainer));
    setStartDate(client.start_date);
    setContractEndDate(client.contract_end_date || '');
    setServicePackage(client.service_package);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !contactPerson) {
      alert('Business name and contact person are required.');
      return;
    }

    const payload = {
      business_name: businessName,
      contact_person: contactPerson,
      industry,
      monthly_retainer: Number(monthlyRetainer),
      start_date: startDate,
      contract_end_date: contractEndDate,
      service_package: servicePackage
    };

    if (editingClient) {
      const updated = db.updateClient(editingClient.id, payload);
      setSelectedClient(updated);
      addSystemNotification('Client Account Updated', `${businessName} profile details have been modified.`, 'System');
    } else {
      db.addClient(payload);
      addSystemNotification('New Client Added', `Active contract signed with ${businessName}.`, 'System');
    }

    setModalOpen(false);
    triggerRefresh();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!canModify) return;
    if (confirm('Are you sure you want to offboard this client? All projects and payments logs will be archived.')) {
      db.deleteClient(id);
      addSystemNotification('Client Terminated', 'Client has been deleted from active database.', 'System');
      setSelectedClient(null);
      triggerRefresh();
    }
  };

  const filteredClients = clients.filter(c => 
    c.business_name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_person.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry && c.industry.toLowerCase().includes(search.toLowerCase()))
  );

  // Get Client Specific Data
  const clientProjects = projects.filter(p => p.client_id === selectedClient?.id);
  const clientAutomations = automations.filter(a => a.client_id === selectedClient?.id);
  const clientPayments = payments.filter(p => p.client_id === selectedClient?.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in-up">
      
      {/* Client List (Left Panel) */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Active Clients</h2>
            <p className="text-[10px] text-zinc-400">Total: {clients.length} signed accounts</p>
          </div>
          {canModify && (
            <button
              onClick={handleAddClick}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl cursor-pointer"
              title="Add Client"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-zinc-900 focus:outline-hidden"
          />
        </div>

        {/* Client Cards List */}
        <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1 no-scrollbar">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 text-xs text-zinc-400">No clients found.</div>
          ) : (
            filteredClients.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedClient?.id === c.id 
                    ? 'border-blue-500 bg-blue-500/[0.03] dark:bg-blue-500/[0.02]' 
                    : 'border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 hover:border-black/10 dark:hover:border-white/15'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold">{c.business_name}</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{c.contact_person} • {c.industry}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleEditClick(e, c)}
                      className="p-1 rounded hover:bg-black/[0.03] dark:hover:bg-white/[0.03] text-zinc-500 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {canModify && (
                      <button
                        onClick={(e) => handleDelete(e, c.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/5 dark:border-white/5 text-[10px]">
                  <span className="text-zinc-400">Retainer</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">${Number(c.monthly_retainer).toLocaleString()}/mo</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Client Profile Page (Right Panel) */}
      <div className="lg:col-span-2">
        {!selectedClient ? (
          <div className="h-[75vh] flex items-center justify-center border border-dashed border-black/5 dark:border-white/5 rounded-3xl apple-glass">
            <p className="text-xs text-zinc-400">Select a client from the left pane to view their comprehensive profile.</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Profile Header */}
            <div className="p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block text-[9px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold uppercase mb-2">
                    Client Profile
                  </span>
                  <h2 className="text-xl font-bold tracking-tight">{selectedClient.business_name}</h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Partner Contact: <strong>{selectedClient.contact_person}</strong> | Package: {selectedClient.service_package}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-400">Monthly Contract Value</div>
                  <div className="text-xl font-extrabold text-blue-500 mt-1">
                    ${Number(selectedClient.monthly_retainer).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Client Metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-black/5 dark:border-white/5 text-center">
                <div>
                  <span className="text-[10px] text-zinc-400">Revenue Generated</span>
                  <div className="text-sm font-bold mt-1">${Number(selectedClient.total_revenue_generated || 0).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400">Meetings Booked</span>
                  <div className="text-sm font-bold mt-1">{selectedClient.meetings_booked || 0}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400">Automations Active</span>
                  <div className="text-sm font-bold mt-1">{clientAutomations.length}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400">ROI Performance</span>
                  <div className="text-sm font-bold mt-1 text-emerald-500 flex items-center justify-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="stat-highlight">{selectedClient.roi_metric || 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Progress Widget */}
            <div className="p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-1.5">
                <FolderKanban className="w-4 h-4 text-blue-500" />
                <span>Active Projects ({clientProjects.length})</span>
              </h3>
              
              {clientProjects.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-400">No active projects running.</div>
              ) : (
                <div className="space-y-3.5">
                  {clientProjects.map((p) => (
                    <div key={p.id} className="p-3 border border-black/5 dark:border-white/5 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                      <div className="space-y-1 sm:w-1/3">
                        <span className="font-bold">{p.project_name}</span>
                        <div className="text-[10px] text-zinc-400">Status: {p.status}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1">
                          <span>Progress</span>
                          <span>{p.progress}%</span>
                        </div>
                        <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${p.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Automation Nodes & Finance History */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Deployed Automations */}
              <div className="p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-indigo-500" />
                  <span>AI Automations ({clientAutomations.length})</span>
                </h3>

                {clientAutomations.length === 0 ? (
                  <div className="text-center py-6 text-xs text-zinc-400">No automation logs.</div>
                ) : (
                  <div className="space-y-3">
                    {clientAutomations.map((a) => (
                      <div key={a.id} className="p-2.5 rounded-xl border border-black/5 dark:border-white/5 text-[10px] flex items-center justify-between">
                        <div>
                          <span className="font-bold truncate block max-w-[150px]">{a.name}</span>
                          <span className="text-zinc-400 font-medium">Channel: {a.platform}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-500 font-bold block">{a.success_rate}% Ok</span>
                          <span className="text-zinc-400">Vol: {a.messages_processed.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invoicing / Finance Logs */}
              <div className="p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Invoice & Payments</span>
                </h3>

                {clientPayments.length === 0 ? (
                  <div className="text-center py-6 text-xs text-zinc-400">No recorded payments.</div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                    {clientPayments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-black/[0.01] dark:bg-white/[0.01]">
                        <div>
                          <div className="font-semibold">{p.description.split(' ').slice(2).join(' ') || 'Retainer'}</div>
                          <div className="text-[9px] text-zinc-400">{p.payment_date}</div>
                        </div>
                        <span className="font-bold text-emerald-500">+${Number(p.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Add/Edit Client Account modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 relative animate-in zoom-in-95 duration-300">
            <h3 className="text-sm font-bold mb-4">{editingClient ? 'Edit Client Details' : 'Create New Client Account'}</h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Business / Brand Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                  placeholder="Apex Dental Group"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Primary Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                  placeholder="Dr. Robert Carter"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                    placeholder="Healthcare"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Monthly Retainer ($)</label>
                  <input
                    type="number"
                    value={monthlyRetainer}
                    onChange={(e) => setMonthlyRetainer(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Contract Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Contract End Date</label>
                  <input
                    type="date"
                    value={contractEndDate}
                    onChange={(e) => setContractEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Service Package Description</label>
                <textarea
                  value={servicePackage}
                  onChange={(e) => setServicePackage(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden h-20"
                  placeholder="E.g., Custom AI receptionist with booking flow..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-black/5 dark:border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-black/5 dark:border-white/10 font-semibold rounded-xl hover:bg-black/[0.02] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl cursor-pointer"
                >
                  Save Contract
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
