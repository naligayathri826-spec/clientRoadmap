'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../db/dbClient';
import { SeedUser, SeedNotification, SeedLead, SeedClient, SeedMeeting, SeedProject, SeedTask } from '../db/seedData';

interface AppContextType {
  currentUser: SeedUser;
  switchUserRole: (userId: string) => void;
  users: SeedUser[];
  
  // Notifications
  notifications: SeedNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  addSystemNotification: (title: string, message: string, type: SeedNotification['type']) => void;
  
  // Global Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: {
    leads: SeedLead[];
    clients: SeedClient[];
    meetings: SeedMeeting[];
    projects: SeedProject[];
    tasks: SeedTask[];
  };
  hasSearchResults: boolean;
  
  // Database refreshes
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<SeedUser>({} as SeedUser);
  const [users, setUsers] = useState<SeedUser[]>([]);
  const [notifications, setNotifications] = useState<SeedNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Initialize data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUser(db.getCurrentUser());
      setUsers(db.getUsers());
      setNotifications(db.getNotifications());
      setMounted(true);
    }
  }, [refreshTrigger]);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const switchUserRole = (userId: string) => {
    db.setCurrentUser(userId);
    setCurrentUser(db.getCurrentUser());
    triggerRefresh();
  };

  const markAsRead = (id: string) => {
    db.markNotificationRead(id);
    setNotifications(db.getNotifications());
    triggerRefresh();
  };

  const clearNotifications = () => {
    db.clearAllNotifications();
    setNotifications([]);
    triggerRefresh();
  };

  const addSystemNotification = (title: string, message: string, type: SeedNotification['type']) => {
    db.addNotification({ title, message, type });
    setNotifications(db.getNotifications());
    triggerRefresh();
  };

  // Compute unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Global search filtering
  const leads = db.getLeads ? db.getLeads() : [];
  const clients = db.getClients ? db.getClients() : [];
  const meetings = db.getMeetings ? db.getMeetings() : [];
  const projects = db.getProjects ? db.getProjects() : [];
  const tasks = db.getTasks ? db.getTasks() : [];

  const query = searchQuery.trim().toLowerCase();
  
  const searchResults = {
    leads: query ? leads.filter(l => 
      l.lead_name.toLowerCase().includes(query) || 
      l.business_name.toLowerCase().includes(query) || 
      (l.industry && l.industry.toLowerCase().includes(query)) ||
      l.status.toLowerCase().includes(query)
    ) : [],
    clients: query ? clients.filter(c => 
      c.business_name.toLowerCase().includes(query) || 
      c.contact_person.toLowerCase().includes(query) || 
      (c.industry && c.industry.toLowerCase().includes(query))
    ) : [],
    meetings: query ? meetings.filter(m => 
      m.prospect_name.toLowerCase().includes(query) || 
      m.business_name.toLowerCase().includes(query) || 
      (m.notes && m.notes.toLowerCase().includes(query))
    ) : [],
    projects: query ? projects.filter(p => 
      p.project_name.toLowerCase().includes(query) || 
      p.status.toLowerCase().includes(query)
    ) : [],
    tasks: query ? tasks.filter(t => 
      t.task_name.toLowerCase().includes(query) || 
      t.priority.toLowerCase().includes(query) || 
      t.status.toLowerCase().includes(query)
    ) : [],
  };

  const hasSearchResults = 
    searchResults.leads.length > 0 ||
    searchResults.clients.length > 0 ||
    searchResults.meetings.length > 0 ||
    searchResults.projects.length > 0 ||
    searchResults.tasks.length > 0;

  if (!mounted) {
    return null;
  }

  return (
    <AppContext.Provider value={{
      currentUser,
      switchUserRole,
      users,
      notifications,
      unreadCount,
      markAsRead,
      clearNotifications,
      addSystemNotification,
      searchQuery,
      setSearchQuery,
      searchResults,
      hasSearchResults,
      refreshTrigger,
      triggerRefresh
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
