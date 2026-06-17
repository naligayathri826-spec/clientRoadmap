'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbClient';
import { useApp } from '@/lib/context/AppContext';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function FinanceModule() {
  const { currentUser, refreshTrigger, triggerRefresh, addSystemNotification } = useApp();
  
  // Database States
  const [payments, setPayments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  // UI States
  const [modalOpen, setModalOpen] = useState(false);
  
  // Form State
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState(1000);
  const [paymentDate, setPaymentDate] = useState('');
  const [category, setCategory] = useState<'Revenue' | 'Software Cost' | 'Employee Cost' | 'Marketing Cost'>('Revenue');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPayments(db.getPayments());
      const allClients = db.getClients();
      setClients(allClients);
      if (allClients.length > 0) {
        setClientId(allClients[0].id);
      }
      setPaymentDate(new Date().toISOString().split('T')[0]);
    }
  }, [refreshTrigger]);

  const canModify = ['Super Admin', 'Admin', 'Operations'].includes(currentUser.role);

  // --- Dynamic SaaS Calculations ---
  
  // 1. Monthly Recurring Revenue (MRR) - Sum of active monthly retainers
  const mrr = clients.reduce((acc, c) => acc + Number(c.monthly_retainer), 0);
  const arr = mrr * 12;

  // 2. Total Revenue logged in payments
  const totalRevenue = payments
    .filter(p => p.category === 'Revenue')
    .reduce((acc, p) => acc + Number(p.amount), 0);

  // 3. Expenses Breakdown
  const softwareCosts = payments.filter(p => p.category === 'Software Cost').reduce((acc, p) => acc + Number(p.amount), 0);
  const employeeCosts = payments.filter(p => p.category === 'Employee Cost').reduce((acc, p) => acc + Number(p.amount), 0);
  const marketingCosts = payments.filter(p => p.category === 'Marketing Cost').reduce((acc, p) => acc + Number(p.amount), 0);
  const totalExpenses = softwareCosts + employeeCosts + marketingCosts;

  // 4. Profit & Margins
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 
    ? ((netProfit / totalRevenue) * 100).toFixed(1)
    : '0.0';

  // --- Chart Data Formatting ---
  // A. Monthly comparison: Revenue vs Expense
  const monthlyFinanceData = [
    { name: 'Jan', Revenue: 11000, Expenses: 6500 },
    { name: 'Feb', Revenue: 13500, Expenses: 7200 },
    { name: 'Mar', Revenue: 14000, Expenses: 7800 },
    { name: 'Apr', Revenue: 16000, Expenses: 9400 },
    { name: 'May', Revenue: 18500, Expenses: 10500 },
    { name: 'Jun', Revenue: totalRevenue > 0 ? totalRevenue : 19000, Expenses: totalExpenses > 0 ? totalExpenses : 12000 },
  ];

  // --- CRUD Handlers ---
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !paymentDate || !description) {
      alert('Fields cannot be empty.');
      return;
    }

    const payload = {
      client_id: category === 'Revenue' ? clientId : '',
      amount: Number(amount),
      payment_date: paymentDate,
      category,
      description
    };

    db.addPayment(payload);
    addSystemNotification('Finance Entry Logged', `Logged ${category} transaction of $${amount}.`, 'System');
    setModalOpen(false);
    triggerRefresh();
  };

  const handleDelete = (id: string) => {
    if (!canModify) return;
    if (confirm('Delete this transaction?')) {
      db.deletePayment(id);
      addSystemNotification('Finance Log Deleted', 'Transaction removed.', 'System');
      triggerRefresh();
    }
  };

  return (
    <div className="space-y-6 fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Finance Management</h2>
          <p className="text-xs text-zinc-400">Log software licenses, payroll costs, marketing expenses, and client payments.</p>
        </div>
        {canModify && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Entry</span>
          </button>
        )}
      </div>

      {/* SaaS Financial Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* MRR Card */}
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Monthly Recurring Revenue</span>
            <div className="text-xl font-extrabold text-blue-500 mt-1">${mrr.toLocaleString()}</div>
            <span className="text-[9px] text-zinc-400 mt-0.5 block">ARR: <strong className="text-zinc-600 dark:text-zinc-300">${(arr/1000).toFixed(0)}k</strong></span>
          </div>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><TrendingUp className="w-4 h-4" /></div>
        </div>

        {/* Total revenue Card */}
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Gross Revenue</span>
            <div className="text-xl font-extrabold text-emerald-500 mt-1">${totalRevenue.toLocaleString()}</div>
            <span className="text-[9px] text-emerald-400 font-medium mt-0.5 block flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              <span className="stat-highlight">Healthy cash flow</span>
            </span>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><DollarSign className="w-4 h-4" /></div>
        </div>

        {/* Expenses Card */}
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Total Expenses</span>
            <div className="text-xl font-extrabold text-red-500 mt-1">${totalExpenses.toLocaleString()}</div>
            <span className="text-[9px] text-red-500 font-medium mt-0.5 block flex items-center gap-0.5">
              <ArrowDownRight className="w-3 h-3" />
              <span>Operating costs</span>
            </span>
          </div>
          <div className="p-2 rounded-xl bg-red-500/10 text-red-500"><TrendingDown className="w-4 h-4" /></div>
        </div>

        {/* Profit margin Card */}
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Net Profit Margin</span>
            <div className="text-xl font-extrabold text-indigo-500 mt-1">{profitMargin}%</div>
            <span className="text-[9px] text-zinc-400 mt-0.5 block">Net Profit: <strong className="text-zinc-600 dark:text-zinc-300">${netProfit.toLocaleString()}</strong></span>
          </div>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500"><Percent className="w-4 h-4" /></div>
        </div>

      </div>

      {/* Analytics chart and Expense split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend comparison Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">Revenue vs Expenses (Trend)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFinanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.08)" />
                <XAxis dataKey="name" fontSize={10} stroke="#888888" tickLine={false} axisLine={false} />
                <YAxis fontSize={10} stroke="#888888" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ 
                    background: 'rgba(25, 25, 28, 0.85)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operating cost allocations */}
        <div className="lg:col-span-1 p-6 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Operating Cost Splits</h3>
          
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">Software & APIs</span>
                <span className="font-bold">${softwareCosts.toLocaleString()}</span>
              </div>
              <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${totalExpenses > 0 ? (softwareCosts / totalExpenses) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">Employee Payroll</span>
                <span className="font-bold">${employeeCosts.toLocaleString()}</span>
              </div>
              <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${totalExpenses > 0 ? (employeeCosts / totalExpenses) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">Marketing & Ads</span>
                <span className="font-bold">${marketingCosts.toLocaleString()}</span>
              </div>
              <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${totalExpenses > 0 ? (marketingCosts / totalExpenses) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Ledger Table */}
      <div className="apple-glass rounded-3xl bg-white dark:bg-zinc-900 border border-black/5 overflow-hidden">
        <div className="p-4 border-b border-black/5 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Transaction Ledger</h3>
          <span className="text-[10px] text-zinc-400">Total Entries: {payments.length}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-black/5 bg-black/[0.01] dark:bg-white/[0.01]">
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Category</th>
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Description</th>
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Date</th>
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Amount</th>
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                  <td className="p-4">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      p.category === 'Revenue' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {p.category}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{p.description}</td>
                  <td className="p-4 text-zinc-400">{p.payment_date}</td>
                  <td className={`p-4 font-bold ${p.category === 'Revenue' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {p.category === 'Revenue' ? '+' : '-'}${Number(p.amount).toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    {canModify && (
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-red-500 cursor-pointer"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Entry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-black/5 rounded-3xl p-6 relative animate-in zoom-in-95 duration-300">
            <h3 className="text-sm font-bold mb-4">Record Financial Transaction</h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Transaction Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                  >
                    <option value="Revenue">Revenue (Client Payment)</option>
                    <option value="Software Cost">Software Cost (SaaS/API)</option>
                    <option value="Employee Cost">Employee Cost (Payroll)</option>
                    <option value="Marketing Cost">Marketing Cost (Ads/Video)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {category === 'Revenue' && (
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Select Payer Client</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.business_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Transaction Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                  placeholder="Monthly Retainer Invoice #1230 / OpenAI usage license"
                  required
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
                  Log Transaction
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
