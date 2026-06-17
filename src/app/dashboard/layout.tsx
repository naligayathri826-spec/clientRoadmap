'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import { useApp } from '@/lib/context/AppContext';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Target, 
  Handshake, 
  Video, 
  FolderKanban, 
  CheckSquare,
  SearchCheck
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { 
    currentUser, 
    searchQuery, 
    setSearchQuery, 
    searchResults, 
    hasSearchResults 
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Authenticate locally (redirect to login if user not set)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeId = localStorage.getItem('agencyos-current-user-id');
      if (!activeId) {
        router.push('/');
      }
    }
  }, [router]);

  if (!currentUser?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-radial from-slate-100 to-zinc-200 dark:from-zinc-950 dark:to-neutral-900">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleResultClick = (route: string) => {
    setSearchQuery('');
    router.push(route);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-400">
      
      {/* Desktop Sidebar (visible on md+) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs" 
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Drawer Content */}
          <div className="relative w-64 bg-white dark:bg-zinc-900 flex flex-col h-full animate-in slide-in-from-left duration-300">
            <div className="absolute top-4 right-4 z-50">
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-full border border-black/5 dark:border-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <TopNav onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        
        <main className="flex-1 p-6 overflow-y-auto relative">
          
          {/* Global Search Results Overlay Interceptor */}
          {searchQuery.trim() !== '' ? (
            <div className="absolute inset-0 bg-slate-50/95 dark:bg-zinc-950/95 p-6 z-40 overflow-y-auto animate-in fade-in duration-150">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <SearchCheck className="w-6 h-6 text-blue-500" />
                    <div>
                      <h2 className="text-xl font-bold">Global Search Results</h2>
                      <p className="text-xs text-zinc-400">Showing matches for &quot;{searchQuery}&quot;</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-black/5 dark:border-white/10 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Close Search</span>
                  </button>
                </div>

                {!hasSearchResults ? (
                  <div className="text-center py-20 border border-dashed border-black/5 dark:border-white/5 rounded-3xl apple-glass bg-white/20 dark:bg-zinc-900/20">
                    <p className="text-sm text-zinc-400">No results matching your query. Try searching for a different term.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Leads Results */}
                    {searchResults.leads.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-blue-500" />
                          <span>CRM Leads ({searchResults.leads.length})</span>
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {searchResults.leads.map(l => (
                            <div 
                              key={l.id} 
                              onClick={() => handleResultClick('/dashboard/leads')}
                              className="p-3 rounded-2xl apple-glass bg-white/40 dark:bg-zinc-900/40 hover:bg-blue-500/5 dark:hover:bg-blue-500/5 border border-black/5 dark:border-white/5 hover:border-blue-500/20 cursor-pointer transition-all flex flex-col justify-between"
                            >
                              <div>
                                <h4 className="text-xs font-bold">{l.lead_name}</h4>
                                <p className="text-[10px] text-zinc-500 mt-0.5">{l.business_name} • {l.industry}</p>
                              </div>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold">{l.status}</span>
                                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">${l.budget}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clients Results */}
                    {searchResults.clients.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Handshake className="w-3.5 h-3.5 text-purple-500" />
                          <span>Clients ({searchResults.clients.length})</span>
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {searchResults.clients.map(c => (
                            <div 
                              key={c.id} 
                              onClick={() => handleResultClick('/dashboard/clients')}
                              className="p-3 rounded-2xl apple-glass bg-white/40 dark:bg-zinc-900/40 hover:bg-blue-500/5 dark:hover:bg-blue-500/5 border border-black/5 dark:border-white/5 hover:border-blue-500/20 cursor-pointer transition-all flex flex-col justify-between"
                            >
                              <div>
                                <h4 className="text-xs font-bold">{c.business_name}</h4>
                                <p className="text-[10px] text-zinc-500 mt-0.5">{c.contact_person} • {c.industry}</p>
                              </div>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold">{c.service_package.split(' ')[0]}</span>
                                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">${c.monthly_retainer}/mo</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meetings Results */}
                    {searchResults.meetings.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-amber-500" />
                          <span>Meetings ({searchResults.meetings.length})</span>
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {searchResults.meetings.map(m => (
                            <div 
                              key={m.id} 
                              onClick={() => handleResultClick('/dashboard/meetings')}
                              className="p-3 rounded-2xl apple-glass bg-white/40 dark:bg-zinc-900/40 hover:bg-blue-500/5 dark:hover:bg-blue-500/5 border border-black/5 dark:border-white/5 hover:border-blue-500/20 cursor-pointer transition-all"
                            >
                              <h4 className="text-xs font-bold">{m.prospect_name}</h4>
                              <p className="text-[10px] text-zinc-500 mt-0.5">{m.business_name}</p>
                              <div className="text-[9px] text-zinc-400 mt-1">{m.meeting_date} at {m.meeting_time} • {m.outcome}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects Results */}
                    {searchResults.projects.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Projects ({searchResults.projects.length})</span>
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {searchResults.projects.map(p => (
                            <div 
                              key={p.id} 
                              onClick={() => handleResultClick('/dashboard/projects')}
                              className="p-3 rounded-2xl apple-glass bg-white/40 dark:bg-zinc-900/40 hover:bg-blue-500/5 dark:hover:bg-blue-500/5 border border-black/5 dark:border-white/5 hover:border-blue-500/20 cursor-pointer transition-all"
                            >
                              <h4 className="text-xs font-bold">{p.project_name}</h4>
                              <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 mt-2">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${p.progress}%` }} />
                              </div>
                              <div className="flex items-center justify-between text-[9px] mt-1 text-zinc-400">
                                <span>{p.status}</span>
                                <span>{p.progress}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tasks Results */}
                    {searchResults.tasks.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-rose-500" />
                          <span>Tasks ({searchResults.tasks.length})</span>
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {searchResults.tasks.map(t => (
                            <div 
                              key={t.id} 
                              onClick={() => handleResultClick('/dashboard/tasks')}
                              className="p-3 rounded-2xl apple-glass bg-white/40 dark:bg-zinc-900/40 hover:bg-blue-500/5 dark:hover:bg-blue-500/5 border border-black/5 dark:border-white/5 hover:border-blue-500/20 cursor-pointer transition-all flex justify-between items-center"
                            >
                              <div>
                                <h4 className="text-xs font-bold">{t.task_name}</h4>
                                <p className="text-[9px] text-zinc-400 mt-0.5">Due: {t.due_date} • {t.type}</p>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                t.priority === 'Critical' ? 'bg-red-500/15 text-red-500' :
                                t.priority === 'High' ? 'bg-orange-500/15 text-orange-500' :
                                t.priority === 'Medium' ? 'bg-blue-500/15 text-blue-500' :
                                'bg-zinc-500/15 text-zinc-500'
                              }`}>
                                {t.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Regular Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
}
