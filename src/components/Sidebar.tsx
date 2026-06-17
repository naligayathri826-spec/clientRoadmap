'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Target, 
  Video, 
  Handshake, 
  FolderKanban, 
  GitFork, 
  Users, 
  CheckSquare, 
  DollarSign, 
  Sparkles, 
  Zap, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Laptop
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/leads', label: 'Leads', icon: Target },
  { href: '/dashboard/meetings', label: 'Meetings', icon: Video },
  { href: '/dashboard/clients', label: 'Clients', icon: Handshake },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { href: '/dashboard/pipeline', label: 'Sales Pipeline', icon: GitFork },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/dashboard/finance', label: 'Finance', icon: DollarSign },
  { href: '/dashboard/content', label: 'Content', icon: Sparkles },
  { href: '/dashboard/automations', label: 'Automations', icon: Zap },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={`h-screen sticky top-0 flex flex-col border-r border-black/5 dark:border-white/5 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl transition-all duration-300 z-20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden select-none">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/10">
            <Laptop className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-zinc-950 to-zinc-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
              AgencyOS
            </span>
          )}
        </Link>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg border border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] hidden md:block transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative cursor-pointer ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/15 dark:shadow-blue-500/10' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
              {!collapsed && <span>{item.label}</span>}
              
              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className="absolute left-16 px-2 py-1 rounded bg-zinc-950 text-white text-xs opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 shadow-lg whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Branding or Info */}
      {!collapsed && (
        <div className="p-4 border-t border-black/5 dark:border-white/5 text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
          AgencyOS • Apple OS Edition
        </div>
      )}
    </aside>
  );
}
