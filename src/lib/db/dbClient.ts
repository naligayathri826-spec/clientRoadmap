// Unified Database Client for AgencyOS
// Intercepts Supabase when configured, otherwise uses local IndexedDB/LocalStorage DB engine

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as seed from './seedData';

// Check if Supabase keys exist
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

export let supabase: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Local Database Engine utilizing LocalStorage
class LocalDatabase {
  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    this.ensureKey('users', seed.seedUsers);
    this.ensureKey('clients', seed.seedClients);
    this.ensureKey('leads', seed.seedLeads);
    this.ensureKey('meetings', seed.seedMeetings);
    this.ensureKey('projects', seed.seedProjects);
    this.ensureKey('tasks', seed.seedTasks);
    this.ensureKey('payments', seed.seedPayments);
    this.ensureKey('content', seed.seedContent);
    this.ensureKey('automations', seed.seedAutomations);
    this.ensureKey('notifications', seed.seedNotifications);
    this.ensureKey('audit_logs', seed.seedAuditLogs);
    this.ensureKey('activity_logs', [
      { id: 'act-1', user_id: 'usr-admin-1', action_description: 'Sarah Jenkins logged in.', created_at: new Date().toISOString() },
      { id: 'act-2', user_id: 'usr-sales-1', action_description: 'Alex Rivera created new lead Wright Law Partners.', created_at: new Date().toISOString() }
    ]);
    
    // Set default user
    if (!localStorage.getItem('agencyos-current-user-id')) {
      localStorage.setItem('agencyos-current-user-id', 'usr-admin-1');
    }
  }

  private ensureKey(key: string, defaultData: any) {
    if (!localStorage.getItem(`agencyos-${key}`)) {
      localStorage.setItem(`agencyos-${key}`, JSON.stringify(defaultData));
    }
  }

  private getTable<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(`agencyos-${key}`);
    return data ? JSON.parse(data) : [];
  }

  private saveTable(key: string, data: any) {
    localStorage.setItem(`agencyos-${key}`, JSON.stringify(data));
  }

  // --- Auth / Users ---
  getCurrentUser(): seed.SeedUser {
    const userId = localStorage.getItem('agencyos-current-user-id') || 'usr-admin-1';
    const users = this.getTable<seed.SeedUser>('users');
    return users.find(u => u.id === userId) || users[0];
  }

  setCurrentUser(userId: string) {
    localStorage.setItem('agencyos-current-user-id', userId);
    const user = this.getCurrentUser();
    this.addActivityLog(`${user.name} switched active session role to ${user.role}.`);
  }

  getUsers(): seed.SeedUser[] {
    return this.getTable<seed.SeedUser>('users');
  }

  updateUserRole(userId: string, role: seed.SeedUser['role']) {
    const users = this.getTable<seed.SeedUser>('users');
    const updated = users.map(u => u.id === userId ? { ...u, role } : u);
    this.saveTable('users', updated);
    this.addAuditLog('UPDATE_ROLE', 'users', userId);
  }

  // --- Leads CRM ---
  getLeads(): seed.SeedLead[] {
    return this.getTable<seed.SeedLead>('leads');
  }

  addLead(lead: Omit<seed.SeedLead, 'id' | 'created_at'>): seed.SeedLead {
    const leads = this.getTable<seed.SeedLead>('leads');
    const newLead: seed.SeedLead = {
      ...lead,
      id: `ld-${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString()
    };
    leads.push(newLead);
    this.saveTable('leads', leads);
    this.addActivityLog(`Created new lead: ${lead.lead_name} (${lead.business_name})`);
    this.addAuditLog('INSERT', 'leads', newLead.id);
    return newLead;
  }

  updateLead(id: string, data: Partial<seed.SeedLead>): seed.SeedLead {
    const leads = this.getTable<seed.SeedLead>('leads');
    let updatedLead!: seed.SeedLead;
    const updated = leads.map(l => {
      if (l.id === id) {
        updatedLead = { ...l, ...data };
        return updatedLead;
      }
      return l;
    });
    this.saveTable('leads', updated);
    
    if (data.status) {
      this.addActivityLog(`Updated lead status of ${updatedLead.lead_name} to ${data.status}`);
      // Auto create Client if Closed Won
      if (data.status === 'Closed Won') {
        this.convertLeadToClient(updatedLead);
      }
    }
    
    this.addAuditLog('UPDATE', 'leads', id);
    return updatedLead;
  }

  deleteLead(id: string) {
    const leads = this.getTable<seed.SeedLead>('leads');
    const filtered = leads.filter(l => l.id !== id);
    this.saveTable('leads', filtered);
    this.addAuditLog('DELETE', 'leads', id);
  }

  private convertLeadToClient(lead: seed.SeedLead) {
    const clients = this.getTable<seed.SeedClient>('clients');
    const exists = clients.some(c => c.business_name === lead.business_name);
    if (!exists) {
      const newClient: seed.SeedClient = {
        id: `clt-${Math.random().toString(36).substring(2, 9)}`,
        business_name: lead.business_name,
        contact_person: lead.lead_name,
        industry: lead.industry || 'AI Automation',
        monthly_retainer: lead.budget || 3000.00,
        start_date: new Date().toISOString().split('T')[0],
        contract_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        service_package: lead.requirements || 'AI Automation package',
        total_revenue_generated: lead.budget || 3000.00,
        meetings_booked: 1,
        leads_generated: 0,
        automations_built: 1,
        roi_metric: 150.00
      };
      clients.push(newClient);
      this.saveTable('clients', clients);
      this.addActivityLog(`Automatically converted Lead ${lead.lead_name} into Active Client ${lead.business_name}.`);
      
      // Seed default project for client
      const projects = this.getTable<seed.SeedProject>('projects');
      projects.push({
        id: `prj-${Math.random().toString(36).substring(2, 9)}`,
        client_id: newClient.id,
        project_name: 'Website AI Assistant',
        status: 'Planning',
        progress: 10,
        start_date: newClient.start_date,
        end_date: newClient.contract_end_date
      });
      this.saveTable('projects', projects);

      // Log invoice payment
      this.addPayment({
        client_id: newClient.id,
        amount: newClient.monthly_retainer,
        payment_date: newClient.start_date,
        category: 'Revenue',
        description: `Setup retainer payment for ${newClient.business_name}`
      });
    }
  }

  // --- Clients ---
  getClients(): seed.SeedClient[] {
    return this.getTable<seed.SeedClient>('clients');
  }

  addClient(client: Omit<seed.SeedClient, 'id' | 'total_revenue_generated' | 'meetings_booked' | 'leads_generated' | 'automations_built' | 'roi_metric'>): seed.SeedClient {
    const clients = this.getTable<seed.SeedClient>('clients');
    const newClient: seed.SeedClient = {
      ...client,
      id: `clt-${Math.random().toString(36).substring(2, 9)}`,
      total_revenue_generated: client.monthly_retainer,
      meetings_booked: 0,
      leads_generated: 0,
      automations_built: 0,
      roi_metric: 100.00
    };
    clients.push(newClient);
    this.saveTable('clients', clients);
    this.addActivityLog(`Added Client: ${client.business_name}`);
    this.addAuditLog('INSERT', 'clients', newClient.id);
    return newClient;
  }

  updateClient(id: string, data: Partial<seed.SeedClient>): seed.SeedClient {
    const clients = this.getTable<seed.SeedClient>('clients');
    let updatedClient!: seed.SeedClient;
    const updated = clients.map(c => {
      if (c.id === id) {
        updatedClient = { ...c, ...data };
        return updatedClient;
      }
      return c;
    });
    this.saveTable('clients', updated);
    this.addAuditLog('UPDATE', 'clients', id);
    return updatedClient;
  }

  deleteClient(id: string) {
    const clients = this.getTable<seed.SeedClient>('clients');
    const filtered = clients.filter(c => c.id !== id);
    this.saveTable('clients', filtered);
    this.addAuditLog('DELETE', 'clients', id);
  }

  // --- Meetings ---
  getMeetings(): seed.SeedMeeting[] {
    return this.getTable<seed.SeedMeeting>('meetings');
  }

  addMeeting(meeting: Omit<seed.SeedMeeting, 'id' | 'created_at'>): seed.SeedMeeting {
    const meetings = this.getTable<seed.SeedMeeting>('meetings');
    const newMeeting: seed.SeedMeeting = {
      ...meeting,
      id: `mt-${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString()
    };
    meetings.push(newMeeting);
    this.saveTable('meetings', meetings);
    this.addActivityLog(`Scheduled meeting with ${meeting.prospect_name} (${meeting.business_name})`);
    
    // Add real-time notification
    this.addNotification({
      title: 'New Meeting Booked',
      message: `Meeting scheduled with ${meeting.prospect_name} on ${meeting.meeting_date} at ${meeting.meeting_time}.`,
      type: 'Meeting Reminder'
    });

    this.addAuditLog('INSERT', 'meetings', newMeeting.id);
    return newMeeting;
  }

  updateMeeting(id: string, data: Partial<seed.SeedMeeting>): seed.SeedMeeting {
    const meetings = this.getTable<seed.SeedMeeting>('meetings');
    let updatedMeeting!: seed.SeedMeeting;
    const updated = meetings.map(m => {
      if (m.id === id) {
        updatedMeeting = { ...m, ...data };
        return updatedMeeting;
      }
      return m;
    });
    this.saveTable('meetings', updated);
    this.addAuditLog('UPDATE', 'meetings', id);
    return updatedMeeting;
  }

  deleteMeeting(id: string) {
    const meetings = this.getTable<seed.SeedMeeting>('meetings');
    const filtered = meetings.filter(m => m.id !== id);
    this.saveTable('meetings', filtered);
    this.addAuditLog('DELETE', 'meetings', id);
  }

  // --- Projects ---
  getProjects(): seed.SeedProject[] {
    return this.getTable<seed.SeedProject>('projects');
  }

  addProject(project: Omit<seed.SeedProject, 'id'>): seed.SeedProject {
    const projects = this.getTable<seed.SeedProject>('projects');
    const newProject: seed.SeedProject = {
      ...project,
      id: `prj-${Math.random().toString(36).substring(2, 9)}`
    };
    projects.push(newProject);
    this.saveTable('projects', projects);
    this.addActivityLog(`Created project ${project.project_name}`);
    this.addAuditLog('INSERT', 'projects', newProject.id);
    return newProject;
  }

  updateProject(id: string, data: Partial<seed.SeedProject>): seed.SeedProject {
    const projects = this.getTable<seed.SeedProject>('projects');
    let updatedPrj!: seed.SeedProject;
    const updated = projects.map(p => {
      if (p.id === id) {
        updatedPrj = { ...p, ...data };
        return updatedPrj;
      }
      return p;
    });
    this.saveTable('projects', updated);
    this.addAuditLog('UPDATE', 'projects', id);
    return updatedPrj;
  }

  deleteProject(id: string) {
    const projects = this.getTable<seed.SeedProject>('projects');
    const filtered = projects.filter(p => p.id !== id);
    this.saveTable('projects', filtered);
    this.addAuditLog('DELETE', 'projects', id);
  }

  // --- Tasks ---
  getTasks(): seed.SeedTask[] {
    return this.getTable<seed.SeedTask>('tasks');
  }

  addTask(task: Omit<seed.SeedTask, 'id'>): seed.SeedTask {
    const tasks = this.getTable<seed.SeedTask>('tasks');
    const newTask: seed.SeedTask = {
      ...task,
      id: `tsk-${Math.random().toString(36).substring(2, 9)}`
    };
    tasks.push(newTask);
    this.saveTable('tasks', tasks);
    this.addActivityLog(`Added task: ${task.task_name}`);
    this.addAuditLog('INSERT', 'tasks', newTask.id);
    return newTask;
  }

  updateTask(id: string, data: Partial<seed.SeedTask>): seed.SeedTask {
    const tasks = this.getTable<seed.SeedTask>('tasks');
    let updatedTask!: seed.SeedTask;
    const updated = tasks.map(t => {
      if (t.id === id) {
        updatedTask = { ...t, ...data };
        return updatedTask;
      }
      return t;
    });
    this.saveTable('tasks', updated);
    this.addAuditLog('UPDATE', 'tasks', id);
    return updatedTask;
  }

  deleteTask(id: string) {
    const tasks = this.getTable<seed.SeedTask>('tasks');
    const filtered = tasks.filter(t => t.id !== id);
    this.saveTable('tasks', filtered);
    this.addAuditLog('DELETE', 'tasks', id);
  }

  // --- Finance / Payments ---
  getPayments(): seed.SeedPayment[] {
    return this.getTable<seed.SeedPayment>('payments');
  }

  addPayment(payment: Omit<seed.SeedPayment, 'id'>): seed.SeedPayment {
    const payments = this.getTable<seed.SeedPayment>('payments');
    const newPayment: seed.SeedPayment = {
      ...payment,
      id: `pay-${Math.random().toString(36).substring(2, 9)}`
    };
    payments.push(newPayment);
    this.saveTable('payments', payments);
    
    const user = this.getCurrentUser();
    this.addActivityLog(`Recorded finance entry: ${payment.category} of $${payment.amount} - ${payment.description}`);
    
    if (payment.category === 'Revenue') {
      this.addNotification({
        title: 'Client Payment Received',
        message: `Retainer payment of $${payment.amount} recorded for project/client.`,
        type: 'Client Payment Received'
      });
    }

    this.addAuditLog('INSERT', 'payments', newPayment.id);
    return newPayment;
  }

  deletePayment(id: string) {
    const payments = this.getTable<seed.SeedPayment>('payments');
    const filtered = payments.filter(p => p.id !== id);
    this.saveTable('payments', filtered);
    this.addAuditLog('DELETE', 'payments', id);
  }

  // --- Social Content ---
  getContent(): seed.SeedContent[] {
    return this.getTable<seed.SeedContent>('content');
  }

  addContent(item: Omit<seed.SeedContent, 'id'>): seed.SeedContent {
    const content = this.getTable<seed.SeedContent>('content');
    const newItem: seed.SeedContent = {
      ...item,
      id: `cnt-${Math.random().toString(36).substring(2, 9)}`
    };
    content.push(newItem);
    this.saveTable('content', content);
    this.addActivityLog(`Scheduled social post: ${item.title} on ${item.platform}`);
    this.addAuditLog('INSERT', 'content', newItem.id);
    return newItem;
  }

  updateContent(id: string, data: Partial<seed.SeedContent>): seed.SeedContent {
    const content = this.getTable<seed.SeedContent>('content');
    let updatedItem!: seed.SeedContent;
    const updated = content.map(c => {
      if (c.id === id) {
        updatedItem = { ...c, ...data };
        return updatedItem;
      }
      return c;
    });
    this.saveTable('content', updated);
    this.addAuditLog('UPDATE', 'content', id);
    return updatedItem;
  }

  deleteContent(id: string) {
    const content = this.getTable<seed.SeedContent>('content');
    const filtered = content.filter(c => c.id !== id);
    this.saveTable('content', filtered);
    this.addAuditLog('DELETE', 'content', id);
  }

  // --- Automations ---
  getAutomations(): seed.SeedAutomation[] {
    return this.getTable<seed.SeedAutomation>('automations');
  }

  addAutomation(automation: Omit<seed.SeedAutomation, 'id'>): seed.SeedAutomation {
    const automations = this.getTable<seed.SeedAutomation>('automations');
    const newAuto: seed.SeedAutomation = {
      ...automation,
      id: `auto-${Math.random().toString(36).substring(2, 9)}`
    };
    automations.push(newAuto);
    this.saveTable('automations', automations);
    this.addActivityLog(`Deployed custom automation agent: ${automation.name}`);
    this.addAuditLog('INSERT', 'automations', newAuto.id);
    return newAuto;
  }

  updateAutomation(id: string, data: Partial<seed.SeedAutomation>): seed.SeedAutomation {
    const automations = this.getTable<seed.SeedAutomation>('automations');
    let updatedAuto!: seed.SeedAutomation;
    const updated = automations.map(a => {
      if (a.id === id) {
        updatedAuto = { ...a, ...data };
        return updatedAuto;
      }
      return a;
    });
    this.saveTable('automations', updated);
    this.addAuditLog('UPDATE', 'automations', id);
    return updatedAuto;
  }

  deleteAutomation(id: string) {
    const automations = this.getTable<seed.SeedAutomation>('automations');
    const filtered = automations.filter(a => a.id !== id);
    this.saveTable('automations', filtered);
    this.addAuditLog('DELETE', 'automations', id);
  }

  // --- Notifications ---
  getNotifications(): seed.SeedNotification[] {
    return this.getTable<seed.SeedNotification>('notifications');
  }

  addNotification(notif: Omit<seed.SeedNotification, 'id' | 'user_id' | 'read' | 'created_at'>): seed.SeedNotification {
    const notifications = this.getTable<seed.SeedNotification>('notifications');
    const currentUser = this.getCurrentUser();
    const newNotif: seed.SeedNotification = {
      ...notif,
      id: `notif-${Math.random().toString(36).substring(2, 9)}`,
      user_id: currentUser.id,
      read: false,
      created_at: new Date().toISOString()
    };
    notifications.unshift(newNotif); // latest first
    this.saveTable('notifications', notifications);
    return newNotif;
  }

  markNotificationRead(id: string) {
    const notifications = this.getTable<seed.SeedNotification>('notifications');
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    this.saveTable('notifications', updated);
  }

  clearAllNotifications() {
    const notifications = this.getTable<seed.SeedNotification>('notifications');
    const currentUser = this.getCurrentUser();
    const filtered = notifications.filter(n => n.user_id !== currentUser.id);
    this.saveTable('notifications', filtered);
  }

  // --- Audit & Activity Logging ---
  getAuditLogs(): seed.SeedAuditLog[] {
    return this.getTable<seed.SeedAuditLog>('audit_logs');
  }

  getActivityLogs() {
    return this.getTable<any>('activity_logs');
  }

  addActivityLog(actionDescription: string) {
    const logs = this.getTable<any>('activity_logs');
    const currentUser = this.getCurrentUser();
    logs.unshift({
      id: `act-${Math.random().toString(36).substring(2, 9)}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_role: currentUser.role,
      action_description: actionDescription,
      created_at: new Date().toISOString()
    });
    this.saveTable('activity_logs', logs.slice(0, 100)); // cap at 100
  }

  addAuditLog(action: string, tableName: string, recordId: string) {
    const logs = this.getTable<seed.SeedAuditLog>('audit_logs');
    const currentUser = this.getCurrentUser();
    logs.unshift({
      id: `aud-${Math.random().toString(36).substring(2, 9)}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      action,
      table_name: tableName,
      record_id: recordId,
      created_at: new Date().toISOString(),
      ip_address: '127.0.0.1'
    });
    this.saveTable('audit_logs', logs.slice(0, 100)); // cap at 100
  }
}

export const db = typeof window !== 'undefined' ? new LocalDatabase() : ({} as any as LocalDatabase);
