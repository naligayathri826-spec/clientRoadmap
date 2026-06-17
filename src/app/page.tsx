'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { Shield, Sparkles, LogIn, Laptop, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const { users, switchUserRole } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleLogin = (userId: string) => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      switchUserRole(userId);
      router.push('/dashboard');
    }, 800);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      // Find matching user or default to Super Admin
      const matched = users.find(u => u.email === email) || users[0];
      switchUserRole(matched.id);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 overflow-hidden bg-radial from-slate-100 to-zinc-200 dark:from-zinc-950 dark:to-neutral-900 transition-colors duration-500">
      
      {/* Visual background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/5 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-500/10 blur-[120px] dark:bg-purple-600/5 pointer-events-none" />

      {/* Floating Theme Button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full apple-glass border border-black/5 dark:border-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-zinc-700" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>
      </div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-stretch relative z-10">
        
        {/* Branding & Marketing Pane */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col justify-between p-8 rounded-3xl apple-glass bg-white/40 dark:bg-zinc-900/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Laptop className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
              AgencyOS
            </span>
          </div>

          <div className="my-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
              Operating System <br />
              <span className="text-blue-500">for AI Agencies.</span>
            </h1>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-sm">
              Manage CRM leads, sales pipeline forecasting, client retainers, automation runtimes, projects, and task execution through a unified premium console.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Fully simulated Row Level Security and RBAC audit logs.</span>
          </div>
        </motion.div>

        {/* Login Form & Role Selector Pane */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex-1 flex flex-col justify-between p-8 rounded-3xl apple-glass bg-white/60 dark:bg-zinc-900/60 border-t border-white/20 dark:border-white/5 shadow-2xl"
        >
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Select an enterprise role below to login instantly, or use credentials.
            </p>

            {/* Quick Demo Login Grid */}
            <div className="mt-6 space-y-2">
              <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Quick Role-Based Access
              </div>
              <div className="grid grid-cols-2 gap-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleRoleLogin(u.id)}
                    disabled={loading}
                    className="flex flex-col items-start p-3 text-left rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-blue-500/10 hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:border-blue-500/30 transition-all cursor-pointer group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={u.avatar_url}
                        alt={u.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-blue-500 transition-colors">
                        {u.name.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative my-6 flex py-1 items-center">
              <div className="flex-grow border-t border-black/5 dark:border-white/5"></div>
              <span className="flex-shrink mx-4 text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold">Or Credentials</span>
              <div className="flex-grow border-t border-black/5 dark:border-white/5"></div>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleManualLogin} className="space-y-3">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="ceo@agencyos.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Access Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center text-[10px] text-zinc-400 dark:text-zinc-500">
            AgencyOS v1.0.0 Enterprise • Secure Session Tokens Enabled
          </div>
        </motion.div>
      </div>
    </div>
  );
}
