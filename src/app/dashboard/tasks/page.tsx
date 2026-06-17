'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbClient';
import { useApp } from '@/lib/context/AppContext';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Filter, 
  List, 
  Kanban, 
  Calendar as CalendarIcon, 
  Briefcase,
  User,
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function TaskManagement() {
  const { currentUser, refreshTrigger, triggerRefresh, addSystemNotification } = useApp();
  
  // Database States
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  // UI States
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [scopeFilter, setScopeFilter] = useState<'All' | 'Personal' | 'Team' | 'Project'>('All');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  // Form Fields State
  const [taskName, setTaskName] = useState('');
  const [type, setType] = useState<'Personal' | 'Team' | 'Project'>('Personal');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [status, setStatus] = useState<'Todo' | 'In Progress' | 'Completed'>('Todo');
  const [assignedTo, setAssignedTo] = useState('');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTasks(db.getTasks());
      const allUsers = db.getUsers();
      setUsers(allUsers);
      setProjects(db.getProjects());
      if (allUsers.length > 0) {
        setAssignedTo(allUsers[0].id);
      }
    }
  }, [refreshTrigger]);

  const canModify = true; // All roles can create/manage tasks

  // --- CRUD Handlers ---
  const handleAddClick = () => {
    setEditingTask(null);
    setTaskName('');
    setType('Personal');
    setPriority('Medium');
    setStatus('Todo');
    setAssignedTo(currentUser.id);
    setProjectId(projects[0]?.id || '');
    setDueDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setModalOpen(true);
  };

  const handleEditClick = (task: any) => {
    setEditingTask(task);
    setTaskName(task.task_name);
    setType(task.type);
    setPriority(task.priority);
    setStatus(task.status);
    setAssignedTo(task.assigned_to || currentUser.id);
    setProjectId(task.project_id || '');
    setDueDate(task.due_date || '');
    setNotes(task.notes || '');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !dueDate) {
      alert('Task name and due date are required.');
      return;
    }

    const payload = {
      task_name: taskName,
      type,
      priority,
      status,
      assigned_to: assignedTo,
      project_id: type === 'Project' ? projectId : '',
      due_date: dueDate,
      notes
    };

    if (editingTask) {
      db.updateTask(editingTask.id, payload);
      addSystemNotification('Task Updated', `Task "${taskName}" has been modified.`, 'System');
    } else {
      db.addTask(payload);
    }

    setModalOpen(false);
    triggerRefresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      db.deleteTask(id);
      addSystemNotification('Task Deleted', 'Task removed from database.', 'System');
      triggerRefresh();
    }
  };

  // --- Drag and Drop Kanban handlers ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: 'Todo' | 'In Progress' | 'Completed') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      db.updateTask(taskId, { status: newStatus });
      addSystemNotification('Task Shifted', `Task status changed to ${newStatus}.`, 'System');
      triggerRefresh();
    }
  };

  // Filters
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.task_name.toLowerCase().includes(search.toLowerCase());
    const matchesScope = scopeFilter === 'All' || t.type === scopeFilter;
    return matchesSearch && matchesScope;
  });

  // Calendar setup
  const [currentCalDate, setCurrentCalDate] = useState(new Date());
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysCount; i++) days.push(new Date(year, month, i));
    return days;
  };
  const calendarDays = getDaysInMonth(currentCalDate);
  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6 fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Task Operations</h2>
          <p className="text-xs text-zinc-400">Track development sprint tickets, sales followups, and administration tasks.</p>
        </div>

        {/* View toggles & Add Button */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl p-0.5 border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'calendar' ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''}`}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg cursor-pointer ${viewMode === 'kanban' ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''}`}
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Scope filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl apple-glass bg-white/50 dark:bg-zinc-900/50">
        
        {/* Scope tabs */}
        <div className="flex rounded-xl p-0.5 border border-black/5 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01]">
          {['All', 'Personal', 'Team', 'Project'].map((scope) => (
            <button
              key={scope}
              onClick={() => setScopeFilter(scope as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                scopeFilter === scope 
                  ? 'bg-white dark:bg-zinc-800 text-blue-500 shadow-xs' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
              }`}
            >
              {scope}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex items-center w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-black/5 dark:border-white/10 bg-transparent focus:outline-hidden"
          />
        </div>

      </div>

      {/* --- List View --- */}
      {viewMode === 'list' && (
        <div className="apple-glass rounded-3xl bg-white dark:bg-zinc-900 border border-black/5 overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-20 text-center text-xs text-zinc-400">No tasks found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Task Description</th>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Scope</th>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Priority</th>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase font-semibold">Assigned To</th>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Due Date</th>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Status</th>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {filteredTasks.map((t) => {
                    const assignedUser = users.find(u => u.id === t.assigned_to);
                    
                    return (
                      <tr key={t.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-sm">{t.task_name}</div>
                          {t.notes && <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{t.notes}</p>}
                        </td>
                        <td className="p-4">
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold border border-black/5">
                            {t.type}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold uppercase ${
                            t.priority === 'Critical' ? 'text-red-500' :
                            t.priority === 'High' ? 'text-orange-500' :
                            t.priority === 'Medium' ? 'text-blue-500' :
                            'text-zinc-500'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          {assignedUser ? (
                            <div className="flex items-center gap-2">
                              <img src={assignedUser.avatar_url} className="w-5 h-5 rounded-full object-cover" />
                              <span className="text-xs">{assignedUser.name.split(' ')[0]}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400">Unassigned</span>
                          )}
                        </td>
                        <td className="p-4 text-xs text-zinc-500">{t.due_date}</td>
                        <td className="p-4">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                            t.status === 'In Progress' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-blue-500/10 text-blue-500'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditClick(t)}
                              className="p-1.5 rounded-lg border border-black/5 dark:border-white/5 hover:bg-black/[0.03] text-zinc-500 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-1.5 rounded-lg border border-red-500/10 hover:bg-red-500/15 text-red-500 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- Kanban Drag-and-Drop View --- */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Todo Column */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Todo')}
            className="p-4 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-black/5 pb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">To Do</span>
              <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full font-bold">
                {filteredTasks.filter(t => t.status === 'Todo').length}
              </span>
            </div>
            
            <div className="space-y-3 min-h-[350px]">
              {filteredTasks.filter(t => t.status === 'Todo').map((t) => (
                <div
                  key={t.id}
                  draggable={canModify}
                  onDragStart={(e) => handleDragStart(e, t.id)}
                  onClick={() => handleEditClick(t)}
                  className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] hover:shadow-md cursor-grab active:cursor-grabbing text-xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                      t.priority === 'Critical' ? 'bg-red-500/10 text-red-500' :
                      t.priority === 'High' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-zinc-500/10 text-zinc-500'
                    }`}>
                      {t.priority}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-medium">{t.type}</span>
                  </div>
                  <div className="font-bold">{t.task_name}</div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-2 border-t border-black/5">
                    <span>Due: {t.due_date}</span>
                    <img src={users.find(u => u.id === t.assigned_to)?.avatar_url} className="w-5 h-5 rounded-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'In Progress')}
            className="p-4 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-black/5 pb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">In Progress</span>
              <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full font-bold">
                {filteredTasks.filter(t => t.status === 'In Progress').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[350px]">
              {filteredTasks.filter(t => t.status === 'In Progress').map((t) => (
                <div
                  key={t.id}
                  draggable={canModify}
                  onDragStart={(e) => handleDragStart(e, t.id)}
                  onClick={() => handleEditClick(t)}
                  className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] hover:shadow-md cursor-grab active:cursor-grabbing text-xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                      t.priority === 'Critical' ? 'bg-red-500/10 text-red-500' :
                      t.priority === 'High' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-zinc-500/10 text-zinc-500'
                    }`}>
                      {t.priority}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-medium">{t.type}</span>
                  </div>
                  <div className="font-bold">{t.task_name}</div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-2 border-t border-black/5">
                    <span>Due: {t.due_date}</span>
                    <img src={users.find(u => u.id === t.assigned_to)?.avatar_url} className="w-5 h-5 rounded-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Column */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Completed')}
            className="p-4 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-black/5 pb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Completed</span>
              <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full font-bold">
                {filteredTasks.filter(t => t.status === 'Completed').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[350px]">
              {filteredTasks.filter(t => t.status === 'Completed').map((t) => (
                <div
                  key={t.id}
                  draggable={canModify}
                  onDragStart={(e) => handleDragStart(e, t.id)}
                  onClick={() => handleEditClick(t)}
                  className="p-4 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] hover:shadow-md cursor-grab active:cursor-grabbing text-xs space-y-3 opacity-70"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase bg-emerald-500/10 text-emerald-500">
                      Done
                    </span>
                    <span className="text-[9px] text-zinc-400 font-medium">{t.type}</span>
                  </div>
                  <div className="font-bold line-through text-zinc-400">{t.task_name}</div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-2 border-t border-black/5">
                    <span>Due: {t.due_date}</span>
                    <img src={users.find(u => u.id === t.assigned_to)?.avatar_url} className="w-5 h-5 rounded-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* --- Calendar View --- */}
      {viewMode === 'calendar' && (
        <div className="apple-glass rounded-3xl bg-white dark:bg-zinc-900 border border-black/5 p-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/5">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {monthsList[currentCalDate.getMonth()]} {currentCalDate.getFullYear()}
            </h3>
            <div className="flex items-center gap-1 border border-black/5 rounded-xl overflow-hidden p-0.5 bg-black/[0.01] dark:bg-white/[0.01]">
              <button 
                onClick={() => setCurrentCalDate(new Date(currentCalDate.setMonth(currentCalDate.getMonth() - 1)))}
                className="p-1 hover:bg-black/[0.03] rounded-lg cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentCalDate(new Date())}
                className="text-[10px] px-2 font-bold cursor-pointer"
              >
                Today
              </button>
              <button 
                onClick={() => setCurrentCalDate(new Date(currentCalDate.setMonth(currentCalDate.getMonth() + 1)))}
                className="p-1 hover:bg-black/[0.03] rounded-lg cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-zinc-400 uppercase mb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2 min-h-64">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="bg-transparent" />;
              const dateStr = day.toISOString().split('T')[0];
              const dayTasks = filteredTasks.filter(t => t.due_date === dateStr);
              const isToday = new Date().toDateString() === day.toDateString();

              return (
                <div 
                  key={dateStr}
                  className={`p-2 rounded-2xl border border-black/[0.02] bg-black/[0.01] dark:bg-white/[0.01] flex flex-col justify-between items-stretch min-h-16 ${
                    isToday ? 'border-blue-500/50 bg-blue-500/[0.02] dark:bg-blue-500/[0.01]' : ''
                  }`}
                >
                  <span className={`text-[10px] font-bold self-end ${isToday ? 'text-blue-500' : 'text-zinc-500'}`}>
                    {day.getDate()}
                  </span>
                  
                  <div className="mt-2 space-y-1">
                    {dayTasks.map((dt) => (
                      <div 
                        key={dt.id} 
                        onClick={() => handleEditClick(dt)}
                        className={`text-[8px] p-1 rounded font-bold truncate cursor-pointer ${
                          dt.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                          dt.priority === 'Critical' ? 'bg-red-500/10 text-red-500' :
                          'bg-blue-500/15 text-blue-500'
                        }`}
                      >
                        {dt.task_name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-black/5 rounded-3xl p-6 relative animate-in zoom-in-95 duration-300">
            <h3 className="text-sm font-bold mb-4">{editingTask ? 'Edit Task Settings' : 'Create Project Sprint Task'}</h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Task Description</label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                  placeholder="Set up stripe endpoints..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Scope Category</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                  >
                    <option value="Personal">Personal Task</option>
                    <option value="Team">Team Task</option>
                    <option value="Project">Project Task</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {type === 'Project' && (
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Link to AI Project</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.project_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Assigned Team Member</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Task Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden h-20"
                  placeholder="Details for task completion..."
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
                  Save Task
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
