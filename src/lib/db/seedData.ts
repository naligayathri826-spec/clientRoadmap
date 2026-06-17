// Rich seed data for AgencyOS
// Serves as initial database state for browser fallback

export interface SeedUser {
  id: string;
  email: string;
  name: string;
  role: 'Super Admin' | 'Admin' | 'Sales' | 'Operations' | 'Developer';
  avatar_url: string;
}

export interface SeedLead {
  id: string;
  lead_name: string;
  business_name: string;
  industry: string;
  source: 'Instagram' | 'Facebook' | 'Website' | 'Referral' | 'LinkedIn' | 'Cold Outreach' | 'WhatsApp';
  phone: string;
  email: string;
  location: string;
  budget: number;
  requirements: string;
  assigned_to: string; // user id
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  notes: string;
  created_at: string;
}

export interface SeedMeeting {
  id: string;
  meeting_date: string;
  meeting_time: string;
  prospect_name: string;
  business_name: string;
  meeting_link: string;
  notes: string;
  recording_link: string;
  outcome: 'Scheduled' | 'Completed' | 'Missed';
  created_at: string;
}

export interface SeedClient {
  id: string;
  business_name: string;
  contact_person: string;
  industry: string;
  monthly_retainer: number;
  start_date: string;
  contract_end_date: string;
  service_package: string;
  total_revenue_generated: number;
  meetings_booked: number;
  leads_generated: number;
  automations_built: number;
  roi_metric: number;
}

export interface SeedProject {
  id: string;
  client_id: string;
  project_name: 'Website AI Assistant' | 'WhatsApp Automation' | 'Instagram Automation' | 'Lead Qualification Agent' | 'CRM Integration' | 'Follow-Up System';
  status: 'Planning' | 'Development' | 'Testing' | 'Client Review' | 'Live' | 'Maintenance';
  progress: number;
  start_date: string;
  end_date: string;
}

export interface SeedTask {
  id: string;
  task_name: string;
  type: 'Personal' | 'Team' | 'Project';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Todo' | 'In Progress' | 'Completed';
  assigned_to: string;
  project_id: string;
  due_date: string;
  notes: string;
}

export interface SeedPayment {
  id: string;
  client_id: string;
  amount: number;
  payment_date: string;
  category: 'Revenue' | 'Software Cost' | 'Employee Cost' | 'Marketing Cost';
  description: string;
}

export interface SeedContent {
  id: string;
  title: string;
  platform: 'Instagram' | 'LinkedIn' | 'YouTube' | 'TikTok';
  type: 'Post' | 'Reel' | 'Video';
  status: 'Draft' | 'Scheduled' | 'Published';
  scheduled_date: string;
  views: number;
  reach: number;
  engagement: number;
  leads_generated: number;
}

export interface SeedAutomation {
  id: string;
  client_id: string;
  name: string;
  platform: 'WhatsApp' | 'Instagram' | 'Facebook' | 'Website' | 'CRM';
  messages_processed: number;
  leads_qualified: number;
  meetings_booked: number;
  success_rate: number;
  failure_rate: number;
  status: 'Active' | 'Paused' | 'Error';
}

export interface SeedNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'New Lead' | 'Meeting Reminder' | 'Proposal Accepted' | 'Client Payment Received' | 'System';
  read: boolean;
  created_at: string;
}

export interface SeedAuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  table_name: string;
  record_id: string;
  created_at: string;
  ip_address: string;
}

// 1. Users
export const seedUsers: SeedUser[] = [
  {
    id: 'usr-admin-1',
    email: 'ceo@agencyos.com',
    name: 'Sarah Jenkins',
    role: 'Super Admin',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 'usr-sales-1',
    email: 'alex.sales@agencyos.com',
    name: 'Alex Rivera',
    role: 'Sales',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 'usr-dev-1',
    email: 'dev.automations@agencyos.com',
    name: 'Marcus Chen',
    role: 'Developer',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 'usr-ops-1',
    email: 'ops@agencyos.com',
    name: 'Elena Rostova',
    role: 'Operations',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
  }
];

// 2. Clients
export const seedClients: SeedClient[] = [
  {
    id: 'clt-apex',
    business_name: 'Apex Dental Group',
    contact_person: 'Dr. Robert Carter',
    industry: 'Healthcare',
    monthly_retainer: 3500.00,
    start_date: '2026-01-10',
    contract_end_date: '2027-01-10',
    service_package: 'Enterprise AI & WhatsApp automations',
    total_revenue_generated: 17500.00,
    meetings_booked: 42,
    leads_generated: 280,
    automations_built: 3,
    roi_metric: 340.50,
  },
  {
    id: 'clt-quantum',
    business_name: 'Quantum SaaS',
    contact_person: 'Lisa Miller',
    industry: 'Software',
    monthly_retainer: 5000.00,
    start_date: '2026-02-15',
    contract_end_date: '2026-12-15',
    service_package: 'AI Qualification Agent & CRM integration',
    total_revenue_generated: 20000.00,
    meetings_booked: 88,
    leads_generated: 610,
    automations_built: 4,
    roi_metric: 420.00,
  },
  {
    id: 'clt-vanguard',
    business_name: 'Vanguard Realty',
    contact_person: 'Thomas Shelby',
    industry: 'Real Estate',
    monthly_retainer: 4000.00,
    start_date: '2026-03-01',
    contract_end_date: '2026-09-01',
    service_package: 'Instagram Automation & Booking agent',
    total_revenue_generated: 12000.00,
    meetings_booked: 35,
    leads_generated: 195,
    automations_built: 2,
    roi_metric: 290.00,
  },
  {
    id: 'clt-nova',
    business_name: 'Nova E-Commerce',
    contact_person: 'Charly Jordan',
    industry: 'Retail',
    monthly_retainer: 6500.00,
    start_date: '2026-04-01',
    contract_end_date: '2027-04-01',
    service_package: 'Omnichannel Customer Support Bot',
    total_revenue_generated: 13000.00,
    meetings_booked: 15,
    leads_generated: 450,
    automations_built: 5,
    roi_metric: 510.00,
  }
];

// 3. Leads
export const seedLeads: SeedLead[] = [
  {
    id: 'ld-1',
    lead_name: 'Johnathan Wright',
    business_name: 'Wright Law Partners',
    industry: 'Legal',
    source: 'LinkedIn',
    phone: '+1 (555) 234-5678',
    email: 'j.wright@wrightlaw.com',
    location: 'Chicago, IL',
    budget: 4500.00,
    requirements: 'AI Assistant to qualify legal prospects and schedule consultations on Website.',
    assigned_to: 'usr-sales-1',
    status: 'Qualified',
    notes: 'Very interested in reducing intake workload. Requested a custom demo.',
    created_at: '2026-06-02T10:30:00Z',
  },
  {
    id: 'ld-2',
    lead_name: 'Emily Davis',
    business_name: 'FitStudio Gyms',
    industry: 'Fitness',
    source: 'Instagram',
    phone: '+1 (555) 345-6789',
    email: 'emily@fitstudio.com',
    location: 'Miami, FL',
    budget: 2500.00,
    requirements: 'Instagram DM auto-responder connected to gym booking system.',
    assigned_to: 'usr-sales-1',
    status: 'Proposal Sent',
    notes: 'Proposal sent on June 8th. Followed up on June 11th. Expecting response soon.',
    created_at: '2026-06-05T14:15:00Z',
  },
  {
    id: 'ld-3',
    lead_name: 'David K.',
    business_name: 'K-Tech Logistics',
    industry: 'Logistics',
    source: 'Website',
    phone: '+1 (555) 456-7890',
    email: 'dk@ktechlogistics.com',
    location: 'Houston, TX',
    budget: 8000.00,
    requirements: 'SMS & WhatsApp automation to track orders and answer customer inquiries.',
    assigned_to: 'usr-sales-1',
    status: 'Negotiation',
    notes: 'Price objection discussed. Offsetting with a trial period. Contract draft under review.',
    created_at: '2026-05-28T09:00:00Z',
  },
  {
    id: 'ld-4',
    lead_name: 'Samantha Peterson',
    business_name: 'Orchard Spa & Wellness',
    industry: 'Wellness',
    source: 'Referral',
    phone: '+1 (555) 567-8901',
    email: 'sam@orchardspa.com',
    location: 'Los Angeles, CA',
    budget: 3000.00,
    requirements: 'Automated AI receptionist for phone booking and client intake forms.',
    assigned_to: 'usr-sales-1',
    status: 'Contacted',
    notes: 'Left message. Setting up Discovery Call next Tuesday.',
    created_at: '2026-06-11T16:40:00Z',
  },
  {
    id: 'ld-5',
    lead_name: 'Marcus Brody',
    business_name: 'Brody Consulting',
    industry: 'Consulting',
    source: 'Cold Outreach',
    phone: '+1 (555) 678-9012',
    email: 'm.brody@brodyconsulting.co',
    location: 'New York, NY',
    budget: 5000.00,
    requirements: 'Email cold outreach autopilot, prospect scrapers and automated CRM sync.',
    assigned_to: 'usr-sales-1',
    status: 'New',
    notes: 'Just imported from outreach pipeline. Ready to be contacted.',
    created_at: '2026-06-13T11:20:00Z',
  },
  {
    id: 'ld-6',
    lead_name: 'Claire Beauchamp',
    business_name: 'Fraser Distillery',
    industry: 'Food & Beverage',
    source: 'LinkedIn',
    phone: '+44 7911 123456',
    email: 'claire@fraserdistillery.co.uk',
    location: 'Edinburgh, UK',
    budget: 6000.00,
    requirements: 'WhatsApp customer ordering automated catalog agent.',
    assigned_to: 'usr-sales-1',
    status: 'Closed Won',
    notes: 'Contract signed! Retainer of $6,000/mo. Converted to Client.',
    created_at: '2026-05-15T10:00:00Z',
  }
];

// 4. Meetings
export const seedMeetings: SeedMeeting[] = [
  {
    id: 'mt-1',
    meeting_date: '2026-06-15',
    meeting_time: '10:00',
    prospect_name: 'Samantha Peterson',
    business_name: 'Orchard Spa & Wellness',
    meeting_link: 'https://meet.google.com/abc-defg-hij',
    notes: 'Discovery Call to map wellness center workflows and booking software.',
    recording_link: '',
    outcome: 'Scheduled',
    created_at: '2026-06-11T16:45:00Z',
  },
  {
    id: 'mt-2',
    meeting_date: '2026-06-16',
    meeting_time: '14:30',
    prospect_name: 'Johnathan Wright',
    business_name: 'Wright Law Partners',
    meeting_link: 'https://meet.google.com/klm-nopq-rst',
    notes: 'Strategy Session: Presenting the legal chatbot proof-of-concept design.',
    recording_link: '',
    outcome: 'Scheduled',
    created_at: '2026-06-12T09:30:00Z',
  },
  {
    id: 'mt-3',
    meeting_date: '2026-06-10',
    meeting_time: '11:00',
    prospect_name: 'Emily Davis',
    business_name: 'FitStudio Gyms',
    meeting_link: 'https://meet.google.com/uvw-xyz-123',
    notes: 'Proposal Review Meeting. Showed demo of Instagram direct booking flow.',
    recording_link: 'https://loom.com/share/example-recording-id-1',
    outcome: 'Completed',
    created_at: '2026-06-05T14:30:00Z',
  },
  {
    id: 'mt-4',
    meeting_date: '2026-06-08',
    meeting_time: '16:00',
    prospect_name: 'Arthur Pendragon',
    business_name: 'Camelot Tech',
    meeting_link: 'https://meet.google.com/cam-elot-456',
    notes: 'Discovery Call regarding HubSpot and Slack custom AI connectors.',
    recording_link: '',
    outcome: 'Missed',
    created_at: '2026-06-02T10:00:00Z',
  }
];

// 5. Projects
export const seedProjects: SeedProject[] = [
  {
    id: 'prj-1',
    client_id: 'clt-apex',
    project_name: 'WhatsApp Automation',
    status: 'Live',
    progress: 100,
    start_date: '2026-01-15',
    end_date: '2026-02-15',
  },
  {
    id: 'prj-2',
    client_id: 'clt-apex',
    project_name: 'Website AI Assistant',
    status: 'Maintenance',
    progress: 100,
    start_date: '2026-02-20',
    end_date: '2026-03-20',
  },
  {
    id: 'prj-3',
    client_id: 'clt-quantum',
    project_name: 'Lead Qualification Agent',
    status: 'Development',
    progress: 65,
    start_date: '2026-05-10',
    end_date: '2026-06-30',
  },
  {
    id: 'prj-4',
    client_id: 'clt-quantum',
    project_name: 'CRM Integration',
    status: 'Testing',
    progress: 85,
    start_date: '2026-05-20',
    end_date: '2026-06-20',
  },
  {
    id: 'prj-5',
    client_id: 'clt-vanguard',
    project_name: 'Instagram Automation',
    status: 'Client Review',
    progress: 90,
    start_date: '2026-05-01',
    end_date: '2026-06-15',
  },
  {
    id: 'prj-6',
    client_id: 'clt-nova',
    project_name: 'Follow-Up System',
    status: 'Planning',
    progress: 15,
    start_date: '2026-06-01',
    end_date: '2026-08-01',
  }
];

// 6. Tasks
export const seedTasks: SeedTask[] = [
  {
    id: 'tsk-1',
    task_name: 'Fix API Timeout on WhatsApp webhooks',
    type: 'Project',
    priority: 'Critical',
    status: 'Todo',
    assigned_to: 'usr-dev-1',
    project_id: 'prj-1',
    due_date: '2026-06-14',
    notes: 'Client Apex Dental reported a few delayed notifications. Inspect server response times.',
  },
  {
    id: 'tsk-2',
    task_name: 'Prepare marketing material for reels',
    type: 'Team',
    priority: 'Low',
    status: 'In Progress',
    assigned_to: 'usr-ops-1',
    project_id: '',
    due_date: '2026-06-18',
    notes: 'Draft script for "3 AI Automations to scale your sales pipeline".',
  },
  {
    id: 'tsk-3',
    task_name: 'Integrate Stripe hooks with Client CRM',
    type: 'Project',
    priority: 'High',
    status: 'In Progress',
    assigned_to: 'usr-dev-1',
    project_id: 'prj-4',
    due_date: '2026-06-17',
    notes: 'Sync invoice payouts directly into Hubspot for Quantum SaaS.',
  },
  {
    id: 'tsk-4',
    task_name: 'Call Wright Law Partners to lock contract',
    type: 'Personal',
    priority: 'Medium',
    status: 'Todo',
    assigned_to: 'usr-sales-1',
    project_id: '',
    due_date: '2026-06-15',
    notes: 'Follow up on the PoC legal bot demo. Offer free onboarding setup.',
  },
  {
    id: 'tsk-5',
    task_name: 'Deploy updated LLM model prompt',
    type: 'Project',
    priority: 'High',
    status: 'Completed',
    assigned_to: 'usr-dev-1',
    project_id: 'prj-5',
    due_date: '2026-06-10',
    notes: 'Change system context to restrict off-topic conversations in Vanguard bot.',
  }
];

// 7. Payments & Expenses
export const seedPayments: SeedPayment[] = [
  // Revenue
  { id: 'pay-1', client_id: 'clt-apex', amount: 3500.00, payment_date: '2026-06-01', category: 'Revenue', description: 'Monthly Retainer Apex Dental' },
  { id: 'pay-2', client_id: 'clt-quantum', amount: 5000.00, payment_date: '2026-06-05', category: 'Revenue', description: 'Monthly Retainer Quantum SaaS' },
  { id: 'pay-3', client_id: 'clt-vanguard', amount: 4000.00, payment_date: '2026-06-02', category: 'Revenue', description: 'Monthly Retainer Vanguard Realty' },
  { id: 'pay-4', client_id: 'clt-nova', amount: 6500.00, payment_date: '2026-06-03', category: 'Revenue', description: 'Monthly Retainer Nova E-Commerce' },
  { id: 'pay-5', client_id: 'clt-apex', amount: 3500.00, payment_date: '2026-05-01', category: 'Revenue', description: 'Monthly Retainer Apex Dental' },
  { id: 'pay-6', client_id: 'clt-quantum', amount: 5000.00, payment_date: '2026-05-05', category: 'Revenue', description: 'Monthly Retainer Quantum SaaS' },
  { id: 'pay-7', client_id: 'clt-vanguard', amount: 4000.00, payment_date: '2026-05-02', category: 'Revenue', description: 'Monthly Retainer Vanguard Realty' },
  { id: 'pay-8', client_id: 'clt-nova', amount: 6500.00, payment_date: '2026-05-03', category: 'Revenue', description: 'Monthly Retainer Nova E-Commerce' },
  // Expenses
  { id: 'pay-exp-1', client_id: '', amount: 800.00, payment_date: '2026-06-01', category: 'Software Cost', description: 'Supabase & OpenAI API usage' },
  { id: 'pay-exp-2', client_id: '', amount: 1200.00, payment_date: '2026-06-02', category: 'Software Cost', description: 'Vercel, Hubspot, and Make.com' },
  { id: 'pay-exp-3', client_id: '', amount: 5500.00, payment_date: '2026-06-05', category: 'Employee Cost', description: 'Marcus Chen - Dev Payroll' },
  { id: 'pay-exp-4', client_id: '', amount: 3000.00, payment_date: '2026-06-05', category: 'Employee Cost', description: 'Alex Rivera - Sales Commission' },
  { id: 'pay-exp-5', client_id: '', amount: 1500.00, payment_date: '2026-06-04', category: 'Marketing Cost', description: 'LinkedIn Ads & Video Editor retainer' }
];

// 8. Social Content
export const seedContent: SeedContent[] = [
  {
    id: 'cnt-1',
    title: 'How we built an AI Agent that answers DMs in 2s',
    platform: 'Instagram',
    type: 'Reel',
    status: 'Published',
    scheduled_date: '2026-06-05',
    views: 12400,
    reach: 9800,
    engagement: 1450,
    leads_generated: 28,
  },
  {
    id: 'cnt-2',
    title: 'Why traditional CRMs fail without AI automations',
    platform: 'LinkedIn',
    type: 'Post',
    status: 'Published',
    scheduled_date: '2026-06-08',
    views: 4500,
    reach: 3800,
    engagement: 320,
    leads_generated: 12,
  },
  {
    id: 'cnt-3',
    title: 'AgencyOS: Behind the scenes of our operations center',
    platform: 'YouTube',
    type: 'Video',
    status: 'Draft',
    scheduled_date: '2026-06-20',
    views: 0,
    reach: 0,
    engagement: 0,
    leads_generated: 0,
  },
  {
    id: 'cnt-4',
    title: 'Stop scheduling meetings manually. Use this AI Agent',
    platform: 'TikTok',
    type: 'Video',
    status: 'Published',
    scheduled_date: '2026-06-11',
    views: 8900,
    reach: 7200,
    engagement: 920,
    leads_generated: 18,
  }
];

// 9. Automations Status
export const seedAutomations: SeedAutomation[] = [
  {
    id: 'auto-1',
    client_id: 'clt-apex',
    name: 'Apex Dental WhatsApp Booking Agent',
    platform: 'WhatsApp',
    messages_processed: 8430,
    leads_qualified: 480,
    meetings_booked: 120,
    success_rate: 98.40,
    failure_rate: 1.60,
    status: 'Active',
  },
  {
    id: 'auto-2',
    client_id: 'clt-quantum',
    name: 'Quantum SaaS Website Chatbot',
    platform: 'Website',
    messages_processed: 14820,
    leads_qualified: 1240,
    meetings_booked: 410,
    success_rate: 97.80,
    failure_rate: 2.20,
    status: 'Active',
  },
  {
    id: 'auto-3',
    client_id: 'clt-vanguard',
    name: 'Vanguard Realty Instagram Auto-DM',
    platform: 'Instagram',
    messages_processed: 5120,
    leads_qualified: 310,
    meetings_booked: 95,
    success_rate: 94.60,
    failure_rate: 5.40,
    status: 'Error',
  },
  {
    id: 'auto-4',
    client_id: 'clt-nova',
    name: 'Nova Store CRM sync webhook',
    platform: 'CRM',
    messages_processed: 28940,
    leads_qualified: 0,
    meetings_booked: 0,
    success_rate: 99.90,
    failure_rate: 0.10,
    status: 'Active',
  }
];

// 10. Notifications
export const seedNotifications: SeedNotification[] = [
  {
    id: 'notif-1',
    user_id: 'usr-admin-1',
    title: 'New Lead Captured',
    message: 'Marcus Brody from Brody Consulting submitted a form. Budget: $5,000.',
    type: 'New Lead',
    read: false,
    created_at: '2026-06-13T11:20:00Z',
  },
  {
    id: 'notif-2',
    user_id: 'usr-admin-1',
    title: 'Meeting Scheduled',
    message: 'Discovery Call with Samantha Peterson is scheduled for June 15th at 10:00 AM.',
    type: 'Meeting Reminder',
    read: false,
    created_at: '2026-06-11T16:45:00Z',
  },
  {
    id: 'notif-3',
    user_id: 'usr-admin-1',
    title: 'Proposal Accepted',
    message: 'Fraser Distillery approved the Catalog bot contract. Setup started.',
    type: 'Proposal Accepted',
    read: true,
    created_at: '2026-06-08T09:30:00Z',
  },
  {
    id: 'notif-4',
    user_id: 'usr-admin-1',
    title: 'Payment Received',
    message: 'Monthly Retainer of $5,000 received from Quantum SaaS.',
    type: 'Client Payment Received',
    read: true,
    created_at: '2026-06-05T08:12:00Z',
  }
];

// 11. Audit Logs
export const seedAuditLogs: SeedAuditLog[] = [
  {
    id: 'aud-1',
    user_id: 'usr-admin-1',
    user_name: 'Sarah Jenkins',
    action: 'UPDATE_ROLE',
    table_name: 'users',
    record_id: 'usr-sales-1',
    created_at: '2026-06-10T14:22:00Z',
    ip_address: '192.168.1.45',
  },
  {
    id: 'aud-2',
    user_id: 'usr-sales-1',
    user_name: 'Alex Rivera',
    action: 'CONVERT_LEAD',
    table_name: 'leads',
    record_id: 'ld-6',
    created_at: '2026-06-08T10:00:00Z',
    ip_address: '192.168.1.52',
  },
  {
    id: 'aud-3',
    user_id: 'usr-dev-1',
    user_name: 'Marcus Chen',
    action: 'DEPLOY_PROJECT',
    table_name: 'projects',
    record_id: 'prj-1',
    created_at: '2026-06-05T16:45:00Z',
    ip_address: '192.168.1.99',
  }
];
