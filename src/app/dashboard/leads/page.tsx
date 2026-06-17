'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbClient';
import { useApp } from '@/lib/context/AppContext';
import { 
  Target, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Filter,
  DollarSign,
  UserPlus
} from 'lucide-react';

export default function LeadsCRM() {
  const { currentUser, refreshTrigger, triggerRefresh, addSystemNotification } = useApp();
  
  // Database State
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);

  // Form Fields State
  const [leadName, setLeadName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [source, setSource] = useState<'Instagram' | 'Facebook' | 'Website' | 'Referral' | 'LinkedIn' | 'Cold Outreach' | 'WhatsApp'>('LinkedIn');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState(3000);
  const [requirements, setRequirements] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState<'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost'>('New');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLeads(db.getLeads());
      const allUsers = db.getUsers();
      setUsers(allUsers);
      if (allUsers.length > 0) {
        setAssignedTo(allUsers[0].id);
      }
    }
  }, [refreshTrigger]);

  // Role validation
  const canModifyLeads = ['Super Admin', 'Admin', 'Sales'].includes(currentUser.role);

  // Open Modal to Add
  const handleAddClick = () => {
    if (!canModifyLeads) return;
    setEditingLead(null);
    setLeadName('');
    setBusinessName('');
    setIndustry('');
    setSource('LinkedIn');
    setPhone('');
    setEmail('');
    setLocation('');
    setBudget(3000);
    setRequirements('');
    setAssignedTo(users[0]?.id || '');
    setStatus('New');
    setNotes('');
    setModalOpen(true);
  };

  // Open Modal to Edit
  const handleEditClick = (lead: any) => {
    if (!canModifyLeads) return;
    setEditingLead(lead);
    setLeadName(lead.lead_name);
    setBusinessName(lead.business_name);
    setIndustry(lead.industry || '');
    setSource(lead.source);
    setPhone(lead.phone || '');
    setEmail(lead.email || '');
    setLocation(lead.location || '');
    setBudget(Number(lead.budget) || 0);
    setRequirements(lead.requirements || '');
    setAssignedTo(lead.assigned_to || users[0]?.id || '');
    setStatus(lead.status);
    setNotes(lead.notes || '');
    setModalOpen(true);
  };

  // Save Lead
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !businessName) {
      alert('Lead Name and Business Name are required.');
      return;
    }

    const payload = {
      lead_name: leadName,
      business_name: businessName,
      industry,
      source,
      phone,
      email,
      location,
      budget: Number(budget),
      requirements,
      assigned_to: assignedTo,
      status,
      notes
    };

    if (editingLead) {
      db.updateLead(editingLead.id, payload);
      addSystemNotification('Lead Updated', `Lead ${leadName} has been updated in the CRM.`, 'System');
    } else {
      const newLead = db.addLead(payload);
      addSystemNotification('New Lead Added', `Lead ${leadName} from ${businessName} has been captured.`, 'New Lead');
    }

    setModalOpen(false);
    triggerRefresh();
  };

  // Delete Lead
  const handleDelete = (id: string) => {
    if (!canModifyLeads) return;
    if (confirm('Are you sure you want to delete this lead?')) {
      db.deleteLead(id);
      addSystemNotification('Lead Deleted', 'Lead removed from the CRM pipeline.', 'System');
      triggerRefresh();
    }
  };

  // Filters calculation
  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.lead_name.toLowerCase().includes(search.toLowerCase()) || 
                          l.business_name.toLowerCase().includes(search.toLowerCase()) ||
                          (l.industry && l.industry.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || l.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  return (
    <div className="space-y-6 fade-in-up">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">CRM Lead Management</h2>
          <p className="text-xs text-zinc-400">Track initial contacts, proposals, and pipeline operations.</p>
        </div>
        {canModifyLeads && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        )}
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Leads</span>
          <div className="text-xl font-bold mt-1">{leads.length}</div>
        </div>
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Qualified Leads</span>
          <div className="text-xl font-bold mt-1">{leads.filter(l => l.status === 'Qualified').length}</div>
        </div>
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Proposal Stage</span>
          <div className="text-xl font-bold mt-1">{leads.filter(l => l.status === 'Proposal Sent').length}</div>
        </div>
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Conversion Ratio</span>
          <div className="text-xl font-bold mt-1">
            {leads.length > 0 
              ? `${((leads.filter(l => l.status === 'Closed Won').length / leads.length) * 100).toFixed(0)}%` 
              : '0%'}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl apple-glass bg-white/50 dark:bg-zinc-900/50">
        
        {/* Search */}
        <div className="flex items-center w-full sm:max-w-xs relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-black/5 dark:border-white/10 bg-transparent text-xs placeholder-zinc-500 focus:outline-hidden"
          />
        </div>

        {/* Filters Selectors */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-transparent border border-black/5 dark:border-white/10 rounded-xl px-2 py-1.5 focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-xs bg-transparent border border-black/5 dark:border-white/10 rounded-xl px-2 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Sources</option>
            <option value="Instagram">Instagram</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Cold Outreach">Outreach</option>
            <option value="WhatsApp">WhatsApp</option>
          </select>
        </div>

      </div>

      {/* CRM Leads Table */}
      <div className="apple-glass rounded-3xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-20 text-center text-xs text-zinc-400">
            No leads found matching current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Lead / Company</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Industry</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Source</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Budget</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Assigned To</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredLeads.map((l) => {
                  const assignedUser = users.find(u => u.id === l.assigned_to);
                  
                  return (
                    <tr key={l.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-sm">{l.lead_name}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{l.business_name} • {l.location || 'Remote'}</div>
                      </td>
                      <td className="p-4 text-xs text-zinc-500">{l.industry || 'AI Automation'}</td>
                      <td className="p-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold border border-black/5 dark:border-white/5">
                          {l.source}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        ${Number(l.budget).toLocaleString()}
                      </td>
                      <td className="p-4">
                        {assignedUser ? (
                          <div className="flex items-center gap-2">
                            <img src={assignedUser.avatar_url} className="w-5 h-5 rounded-full object-cover" />
                            <span className="text-xs">{assignedUser.name.split(' ')[0]}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          l.status === 'Closed Won' ? 'bg-emerald-500/10 text-emerald-500' :
                          l.status === 'Closed Lost' ? 'bg-red-500/10 text-red-500' :
                          l.status === 'Negotiation' ? 'bg-orange-500/10 text-orange-500' :
                          l.status === 'Proposal Sent' ? 'bg-indigo-500/10 text-indigo-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(l)}
                            className="p-1.5 rounded-lg border border-black/5 dark:border-white/5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 cursor-pointer"
                            title="Edit Lead"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {canModifyLeads && (
                            <button
                              onClick={() => handleDelete(l.id)}
                              className="p-1.5 rounded-lg border border-red-500/10 hover:bg-red-500/15 text-red-500 cursor-pointer"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Slide-over Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-300">
            <h3 className="text-base font-bold mb-4">{editingLead ? 'Modify CRM Lead' : 'Add New CRM Lead'}</h3>
            
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Lead Name</label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent text-xs focus:outline-hidden"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Company Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent text-xs focus:outline-hidden"
                  placeholder="Acme Corp"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent text-xs focus:outline-hidden"
                  placeholder="Healthcare / Real Estate"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Source</label>
                <select
                  value={source}
                  onChange={(e: any) => setSource(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] text-xs focus:outline-hidden"
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Outreach">Cold Outreach</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent text-xs focus:outline-hidden"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent text-xs focus:outline-hidden"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent text-xs focus:outline-hidden"
                  placeholder="New York, NY"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Budget ($)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent text-xs focus:outline-hidden"
                  placeholder="4000"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Assigned Team Member</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] text-xs focus:outline-hidden"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] text-xs focus:outline-hidden"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Requirements</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent text-xs focus:outline-hidden h-16"
                  placeholder="Requirements for chatbot integration..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent text-xs focus:outline-hidden h-16"
                  placeholder="Meeting notes or action items..."
                />
              </div>

              <div className="col-span-2 flex items-center justify-end gap-2 border-t border-black/5 dark:border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-black/5 dark:border-white/10 text-xs font-semibold rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  Save Lead
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
