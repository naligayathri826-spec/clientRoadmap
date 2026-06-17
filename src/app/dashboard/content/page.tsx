'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbClient';
import { useApp } from '@/lib/context/AppContext';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Tv, 
  Eye, 
  Heart, 
  Share2,
  TrendingUp
} from 'lucide-react';

export default function ContentManagement() {
  const { currentUser, refreshTrigger, triggerRefresh, addSystemNotification } = useApp();
  
  // Database States
  const [contentList, setContentList] = useState<any[]>([]);
  
  // UI States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<'Instagram' | 'LinkedIn' | 'YouTube' | 'TikTok'>('LinkedIn');
  const [type, setType] = useState<'Post' | 'Reel' | 'Video'>('Post');
  const [status, setStatus] = useState<'Draft' | 'Scheduled' | 'Published'>('Draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [views, setViews] = useState(0);
  const [reach, setReach] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [leadsGenerated, setLeadsGenerated] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setContentList(db.getContent());
    }
  }, [refreshTrigger]);

  const canModify = ['Super Admin', 'Admin', 'Operations'].includes(currentUser.role);

  // --- Summary Metrics Calculations ---
  const totalViews = contentList.reduce((acc, c) => acc + Number(c.views || 0), 0);
  const totalReach = contentList.reduce((acc, c) => acc + Number(c.reach || 0), 0);
  const totalLeads = contentList.reduce((acc, c) => acc + Number(c.leads_generated || 0), 0);
  const avgEngagement = contentList.length > 0 
    ? Math.round(contentList.reduce((acc, c) => acc + Number(c.engagement || 0), 0) / contentList.length)
    : 0;

  // --- CRUD Handlers ---
  const handleAddClick = () => {
    if (!canModify) return;
    setEditingContent(null);
    setTitle('');
    setPlatform('LinkedIn');
    setType('Post');
    setStatus('Draft');
    setScheduledDate(new Date().toISOString().split('T')[0]);
    setViews(0);
    setReach(0);
    setEngagement(0);
    setLeadsGenerated(0);
    setModalOpen(true);
  };

  const handleEditClick = (content: any) => {
    if (!canModify) return;
    setEditingContent(content);
    setTitle(content.title);
    setPlatform(content.platform);
    setType(content.type);
    setStatus(content.status);
    setScheduledDate(content.scheduled_date || '');
    setViews(Number(content.views) || 0);
    setReach(Number(content.reach) || 0);
    setEngagement(Number(content.engagement) || 0);
    setLeadsGenerated(Number(content.leads_generated) || 0);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scheduledDate) {
      alert('Title and scheduled date are required.');
      return;
    }

    const payload = {
      title,
      platform,
      type,
      status,
      scheduled_date: scheduledDate,
      views: Number(views),
      reach: Number(reach),
      engagement: Number(engagement),
      leads_generated: Number(leadsGenerated)
    };

    if (editingContent) {
      db.updateContent(editingContent.id, payload);
      addSystemNotification('Content Item Modified', `Updated calendar post "${title}".`, 'System');
    } else {
      db.addContent(payload);
    }

    setModalOpen(false);
    triggerRefresh();
  };

  const handleDelete = (id: string) => {
    if (!canModify) return;
    if (confirm('Delete this content calendar item?')) {
      db.deleteContent(id);
      addSystemNotification('Content Removed', 'Content item deleted.', 'System');
      triggerRefresh();
    }
  };

  return (
    <div className="space-y-6 fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Social Content Hub</h2>
          <p className="text-xs text-zinc-400">Track organic lead acquisition, schedule announcements, and audit reach analytics.</p>
        </div>
        {canModify && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Content</span>
          </button>
        )}
      </div>

      {/* Aggregate metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Organic Views</span>
            <div className="text-xl font-extrabold mt-1">{totalViews.toLocaleString()}</div>
          </div>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Eye className="w-4 h-4" /></div>
        </div>
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Reach Count</span>
            <div className="text-xl font-extrabold mt-1">{totalReach.toLocaleString()}</div>
          </div>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500"><Share2 className="w-4 h-4" /></div>
        </div>
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Avg Interactions</span>
            <div className="text-xl font-extrabold mt-1">{avgEngagement} likes</div>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><Heart className="w-4 h-4" /></div>
        </div>
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Leads Sourced</span>
            <div className="text-xl font-extrabold text-emerald-500 mt-1">+{totalLeads}</div>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><TrendingUp className="w-4 h-4" /></div>
        </div>
      </div>

      {/* Roster list */}
      <div className="apple-glass rounded-3xl bg-white dark:bg-zinc-900 border border-black/5 overflow-hidden">
        {contentList.length === 0 ? (
          <div className="p-20 text-center text-xs text-zinc-400">No scheduled content.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-black/5 bg-black/[0.01] dark:bg-white/[0.01]">
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Post Title</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Platform</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Format</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Scheduled Date</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Views / Reach</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Leads Generated</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-zinc-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {contentList.map((c) => (
                  <tr key={c.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 font-semibold text-zinc-800 dark:text-zinc-200">{c.title}</td>
                    <td className="p-4">
                      <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-black/5 rounded-full font-bold">
                        {c.platform}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-500">{c.type}</td>
                    <td className="p-4 text-zinc-400">{c.scheduled_date}</td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-400">
                      <strong>{Number(c.views).toLocaleString()}</strong> / {Number(c.reach).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-emerald-500">+{c.leads_generated || 0}</td>
                    <td className="p-4">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        c.status === 'Published' ? 'bg-emerald-500/10 text-emerald-500' :
                        c.status === 'Scheduled' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-zinc-500/10 text-zinc-500'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(c)}
                          className="p-1 rounded border border-black/5 hover:bg-black/[0.03] text-zinc-500 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {canModify && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1 rounded border border-red-500/10 hover:bg-red-500/15 text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-black/5 rounded-3xl p-6 relative animate-in zoom-in-95 duration-300">
            <h3 className="text-sm font-bold mb-4">{editingContent ? 'Edit Social Post Stats' : 'Schedule Social Media Post'}</h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Post Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                  placeholder="Drafting next hooks guide..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e: any) => setPlatform(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Content Format</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                  >
                    <option value="Post">Post (Text/Image)</option>
                    <option value="Reel">Reel (Short Video)</option>
                    <option value="Video">Video (Longform)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {status === 'Published' && (
                <div className="grid grid-cols-4 gap-2 border-t border-black/5 pt-4">
                  <div className="col-span-1">
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Views</label>
                    <input
                      type="number"
                      value={views}
                      onChange={(e) => setViews(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-black/5 rounded-lg bg-transparent text-center"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Reach</label>
                    <input
                      type="number"
                      value={reach}
                      onChange={(e) => setReach(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-black/5 rounded-lg bg-transparent text-center"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Likes</label>
                    <input
                      type="number"
                      value={engagement}
                      onChange={(e) => setEngagement(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-black/5 rounded-lg bg-transparent text-center"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Leads</label>
                    <input
                      type="number"
                      value={leadsGenerated}
                      onChange={(e) => setLeadsGenerated(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-black/5 rounded-lg bg-transparent text-center"
                    />
                  </div>
                </div>
              )}

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
                  Save Post
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
