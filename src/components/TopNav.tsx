'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  ChevronDown, 
  LogOut, 
  User, 
  ShieldAlert, 
  Check,
  Menu,
  X
} from 'lucide-react';

export default function TopNav({ onToggleMobileSidebar }: { onToggleMobileSidebar?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { 
    currentUser, 
    users, 
    switchUserRole, 
    notifications, 
    unreadCount, 
    markAsRead, 
    clearNotifications,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Format page name from route
  const getPageTitle = () => {
    const segment = pathname.split('/').pop();
    if (!segment || segment === 'dashboard') return 'Overview';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agencyos-current-user-id');
    }
    router.push('/');
  };

  return (
    <header className="h-16 border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between px-6 select-none">
      
      {/* Page Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button 
            onClick={onToggleMobileSidebar} 
            className="p-1.5 rounded-lg border border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] md:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">AgencyOS</span>
          <h1 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden sm:flex items-center w-full max-w-xs relative">
        <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Global search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 rounded-full border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-hidden focus:border-blue-500/50 dark:focus:border-blue-500/50 transition-colors"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        
        {/* Theme Switching Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full border border-black/5 dark:border-white/5 bg-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4 text-zinc-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notifications Center Button */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="p-2 rounded-full border border-black/5 dark:border-white/5 bg-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02] relative transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl apple-glass bg-white dark:bg-zinc-900 shadow-2xl border border-black/5 dark:border-white/5 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2 mb-3">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">Notifications ({unreadCount} unread)</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearNotifications}
                    className="text-[10px] text-zinc-400 hover:text-blue-500 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-zinc-400 dark:text-zinc-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        n.read 
                          ? 'border-transparent bg-transparent opacity-65' 
                          : 'border-blue-500/10 bg-blue-500/[0.02] dark:bg-blue-500/[0.01]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-500">{n.type}</span>
                        <span className="text-[9px] text-zinc-400">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">{n.title}</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown with RBAC switchers */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all cursor-pointer"
          >
            <img 
              src={currentUser.avatar_url} 
              alt={currentUser.name} 
              className="w-6 h-6 rounded-full object-cover shadow-sm"
            />
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">
                {currentUser.name}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          </button>

          {/* User profile popup menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-64 rounded-2xl apple-glass bg-white dark:bg-zinc-900 shadow-2xl border border-black/5 dark:border-white/5 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-3 mb-3">
                <img 
                  src={currentUser.avatar_url} 
                  alt={currentUser.name} 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{currentUser.name}</h4>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">{currentUser.email}</p>
                  <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold mt-1 uppercase">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* RBAC Role Switchers */}
              <div className="space-y-1 mb-3">
                <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-2 mb-1.5">
                  Access Controls (Simulate)
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUserRole(u.id);
                      setProfileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-left text-xs font-medium transition-all cursor-pointer ${
                      currentUser.id === u.id 
                        ? 'bg-blue-500/10 text-blue-500' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={u.avatar_url} className="w-4.5 h-4.5 rounded-full object-cover" />
                      <div>
                        <div>{u.name.split(' ')[0]}</div>
                        <div className="text-[9px] text-zinc-400">{u.role}</div>
                      </div>
                    </div>
                    {currentUser.id === u.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-black/5 dark:border-white/5 pt-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-left text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
