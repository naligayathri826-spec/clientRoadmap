'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbClient';
import { useApp } from '@/lib/context/AppContext';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  PhoneCall, 
  Video, 
  CheckSquare, 
  DollarSign,
  Trophy,
  Briefcase
} from 'lucide-react';

export default function TeamManagement() {
  const { currentUser, refreshTrigger, triggerRefresh, addSystemNotification } = useApp();
  
  // Database States
  const [team, setTeam] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  
  // UI States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Super Admin' | 'Admin' | 'Sales' | 'Operations' | 'Developer'>('Developer');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTeam(db.getUsers());
      setTasks(db.getTasks());
      setLeads(db.getLeads());
      setMeetings(db.getMeetings());
    }
  }, [refreshTrigger]);

  const canModify = ['Super Admin', 'Admin'].includes(currentUser.role);

  // --- Dynamic Stats Calculations per Member ---
  const getMemberStats = (memberId: string, memberRole: string) => {
    // 1. Tasks completed
    const completedTasks = tasks.filter(t => t.assigned_to === memberId && t.status === 'Completed').length;
    
    // 2. Revenue generated (For Sales/CEO, closed won lead budgets)
    let revenueGenerated = 0;
    if (memberRole === 'Sales' || memberRole === 'Super Admin' || memberRole === 'Admin') {
      revenueGenerated = leads
        .filter(l => l.assigned_to === memberId && l.status === 'Closed Won')
        .reduce((acc, l) => acc + Number(l.budget), 0);
    }

    // 3. Calls made (Simulated base values + activity index)
    let callsMade = 0;
    if (memberRole === 'Sales') callsMade = 145;
    else if (memberRole === 'Super Admin') callsMade = 65;
    else if (memberRole === 'Operations') callsMade = 32;

    // 4. Meetings conducted
    let meetingsConducted = 0;
    if (memberRole === 'Sales') meetingsConducted = 28;
    else if (memberRole === 'Super Admin') meetingsConducted = 12;
    else if (memberRole === 'Operations') meetingsConducted = 10;

    return {
      tasksCompleted: completedTasks,
      callsMade,
      meetingsConducted,
      revenueGenerated
    };
  };

  // --- CRUD Handlers ---
  const handleAddClick = () => {
    if (!canModify) return;
    setEditingMember(null);
    setName('');
    setEmail('');
    setRole('Developer');
    setAvatarUrl('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face');
    setModalOpen(true);
  };

  const handleEditClick = (member: any) => {
    if (!canModify) return;
    setEditingMember(member);
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setAvatarUrl(member.avatar_url || '');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Name and email are required.');
      return;
    }

    const payload = {
      name,
      email,
      role,
      avatar_url: avatarUrl
    };

    if (editingMember) {
      db.updateUserRole(editingMember.id, role);
      // Local DB helper updates roles, standard user values remain
      const users = JSON.parse(localStorage.getItem('agencyos-users') || '[]');
      const updated = users.map((u: any) => u.id === editingMember.id ? { ...u, ...payload } : u);
      localStorage.setItem('agencyos-users', JSON.stringify(updated));
      
      addSystemNotification('Team Member Profile Updated', `${name} profile changed.`, 'System');
    } else {
      const users = JSON.parse(localStorage.getItem('agencyos-users') || '[]');
      const newMember = {
        ...payload,
        id: `usr-${Math.random().toString(36).substring(2, 9)}`
      };
      users.push(newMember);
      localStorage.setItem('agencyos-users', JSON.stringify(users));
      addSystemNotification('New Team Member Invited', `${name} invited to join operations.`, 'System');
    }

    setModalOpen(false);
    triggerRefresh();
  };

  const handleDelete = (id: string) => {
    if (!canModify) return;
    if (confirm('Are you sure you want to remove this team member?')) {
      const users = JSON.parse(localStorage.getItem('agencyos-users') || '[]');
      const filtered = users.filter((u: any) => u.id !== id);
      localStorage.setItem('agencyos-users', JSON.stringify(filtered));
      addSystemNotification('Team Member Removed', 'User deleted from workspace.', 'System');
      triggerRefresh();
    }
  };

  // Rank team by completed tasks + closed revenue index
  const rankedTeam = [...team].map(m => {
    const stats = getMemberStats(m.id, m.role);
    const score = stats.tasksCompleted * 10 + (stats.revenueGenerated / 100) + stats.meetingsConducted * 5;
    return { ...m, stats, score };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6 fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Team Operations & Leaderboard</h2>
          <p className="text-xs text-zinc-400">Track key contributions, closed accounts, and developer sprint velocities.</p>
        </div>
        {canModify && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {/* Roster & Stats Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leaderboard panel */}
        <div className="lg:col-span-1 p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
            <span>Performance Leaderboard</span>
          </h3>

          <div className="space-y-4 pt-2">
            {rankedTeam.map((m, index) => (
              <div key={m.id} className="flex items-center justify-between p-2 rounded-2xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/[0.02]">
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    index === 0 ? 'bg-amber-500/20 text-amber-600' :
                    index === 1 ? 'bg-slate-300/20 text-slate-600' :
                    'bg-zinc-200/20 text-zinc-500'
                  }`}>
                    {index + 1}
                  </span>
                  <img src={m.avatar_url} alt={m.name} className="w-9 h-9 rounded-full object-cover shadow-sm" />
                  <div>
                    <h4 className="text-xs font-bold">{m.name}</h4>
                    <span className="text-[9px] text-zinc-400">{m.role}</span>
                  </div>
                </div>
                <div className="text-right text-[10px]">
                  <div className="font-bold text-zinc-800 dark:text-zinc-200">Score: {Math.round(m.score)}</div>
                  {m.stats.revenueGenerated > 0 && (
                    <span className="text-emerald-500 font-medium">+${(m.stats.revenueGenerated/1000).toFixed(0)}k closed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Team Grid (Right Pane) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Workspace Roster</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {team.map((m) => {
              const stats = getMemberStats(m.id, m.role);
              
              return (
                <div 
                  key={m.id}
                  className="p-5 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex flex-col justify-between h-56"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img src={m.avatar_url} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                      <div>
                        <h4 className="text-xs font-bold">{m.name}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{m.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditClick(m)}
                        className="p-1 rounded hover:bg-black/[0.03] text-zinc-500 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {canModify && team.length > 1 && (
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1 rounded hover:bg-red-500/10 text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contributions stats widget */}
                  <div className="grid grid-cols-4 gap-2 text-center py-3 my-2 border-y border-black/5 dark:border-white/5">
                    <div>
                      <span className="text-[8px] text-zinc-400 font-bold uppercase">Calls</span>
                      <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-0.5 flex items-center justify-center gap-0.5">
                        <PhoneCall className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                        <span>{stats.callsMade}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[8px] text-zinc-400 font-bold uppercase">Meets</span>
                      <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-0.5 flex items-center justify-center gap-0.5">
                        <Video className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                        <span>{stats.meetingsConducted}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[8px] text-zinc-400 font-bold uppercase">Tasks</span>
                      <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-0.5 flex items-center justify-center gap-0.5">
                        <CheckSquare className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                        <span>{stats.tasksCompleted}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[8px] text-zinc-400 font-bold uppercase">Revenue</span>
                      <div className="text-xs font-bold text-emerald-500 mt-0.5 flex items-center justify-center gap-0.5">
                        <DollarSign className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                        <span>{(stats.revenueGenerated/1000).toFixed(0)}k</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold uppercase">
                      {m.role}
                    </span>
                    <span className="text-zinc-400">Active session</span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Invite Member modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-black/5 rounded-3xl p-6 relative animate-in zoom-in-95 duration-300">
            <h3 className="text-sm font-bold mb-4">{editingMember ? 'Update Team Member Role' : 'Invite New Team Member'}</h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                  placeholder="Arthur Pendragon"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                  placeholder="arthur@agencyos.com"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Role Designation</label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Developer">Developer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Profile Photo Avatar Link</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                  placeholder="https://..."
                />
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
                  Save Settings
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
