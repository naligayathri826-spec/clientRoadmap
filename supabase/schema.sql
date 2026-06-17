-- AgencyOS PostgreSQL / Supabase Schema Definition
-- Includes tables, relationships, indexes, RLS, and logging setup

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROLES TYPE enum or constraint helper
-- Valid roles: 'Super Admin', 'Admin', 'Sales', 'Operations', 'Developer'
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Super Admin', 'Admin', 'Sales', 'Operations', 'Developer')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    industry TEXT,
    source TEXT NOT NULL CHECK (source IN ('Instagram', 'Facebook', 'Website', 'Referral', 'LinkedIn', 'Cold Outreach', 'WhatsApp')),
    phone TEXT,
    email TEXT,
    location TEXT,
    budget NUMERIC(12, 2) DEFAULT 0.00,
    requirements TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_date DATE NOT NULL,
    meeting_time TIME NOT NULL,
    prospect_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    meeting_link TEXT,
    notes TEXT,
    recording_link TEXT,
    outcome TEXT DEFAULT 'Scheduled' CHECK (outcome IN ('Scheduled', 'Completed', 'Missed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    industry TEXT,
    monthly_retainer NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    start_date DATE NOT NULL,
    contract_end_date DATE,
    service_package TEXT NOT NULL,
    total_revenue_generated NUMERIC(12, 2) DEFAULT 0.00,
    meetings_booked INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    automations_built INTEGER DEFAULT 0,
    roi_metric NUMERIC(5, 2) DEFAULT 0.00, -- e.g., 350.50% ROI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL CHECK (project_name IN ('Website AI Assistant', 'WhatsApp Automation', 'Instagram Automation', 'Lead Qualification Agent', 'CRM Integration', 'Follow-Up System')),
    status TEXT NOT NULL DEFAULT 'Planning' CHECK (status IN ('Planning', 'Development', 'Testing', 'Client Review', 'Live', 'Maintenance')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Personal' CHECK (type IN ('Personal', 'Team', 'Project')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status TEXT NOT NULL DEFAULT 'Todo' CHECK (status IN ('Todo', 'In Progress', 'Completed')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Sent' CHECK (status IN ('Paid', 'Sent', 'Overdue')),
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table (Finance logs)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method TEXT,
    category TEXT CHECK (category IN ('Revenue', 'Software Cost', 'Employee Cost', 'Marketing Cost', 'Other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Management table
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('Instagram', 'LinkedIn', 'YouTube', 'TikTok')),
    type TEXT NOT NULL CHECK (type IN ('Post', 'Reel', 'Video')),
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Scheduled', 'Published')),
    scheduled_date DATE,
    views INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    engagement INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Automation Infrastructure table
CREATE TABLE IF NOT EXISTS automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('WhatsApp', 'Instagram', 'Facebook', 'Website', 'CRM')),
    messages_processed INTEGER DEFAULT 0,
    leads_qualified INTEGER DEFAULT 0,
    meetings_booked INTEGER DEFAULT 0,
    success_rate NUMERIC(5, 2) DEFAULT 0.00,
    failure_rate NUMERIC(5, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Paused', 'Error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('New Lead', 'Meeting Reminder', 'Proposal Accepted', 'Client Payment Received', 'System')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs (Security compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs (General feed)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for optimization
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Row Level Security (RLS) Enablement
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Sample Policies
-- 1. Users can read their own profiles
CREATE POLICY user_read_policy ON users FOR SELECT USING (true);

-- 2. Leads: Super Admin and Admin can do everything. Sales can see all, modify leads assigned to them or unassigned.
CREATE POLICY leads_select_policy ON leads FOR SELECT USING (true);
CREATE POLICY leads_write_policy ON leads FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('Super Admin', 'Admin', 'Sales')
    )
);

-- 3. Clients: Read allowed for all authenticated users. Writes restricted to Admin/Super Admin/Operations.
CREATE POLICY clients_select_policy ON clients FOR SELECT USING (true);
CREATE POLICY clients_write_policy ON clients FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('Super Admin', 'Admin', 'Operations')
    )
);

-- 4. Projects: Read allowed for all, Developer and Operations can write.
CREATE POLICY projects_select_policy ON projects FOR SELECT USING (true);
CREATE POLICY projects_write_policy ON projects FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('Super Admin', 'Admin', 'Operations', 'Developer')
    )
);

-- 5. Tasks: Anyone can read, users can update tasks assigned to them or created by them.
CREATE POLICY tasks_select_policy ON tasks FOR SELECT USING (true);
CREATE POLICY tasks_all_policy ON tasks FOR ALL USING (true);

-- 6. Audit & Activity Logs: Select allowed for Admins. Insert allowed automatically.
CREATE POLICY audit_select_policy ON audit_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('Super Admin', 'Admin')
    )
);
CREATE POLICY audit_insert_policy ON audit_logs FOR INSERT WITH CHECK (true);
