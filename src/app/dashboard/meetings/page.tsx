'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db/dbClient';
import { useApp } from '@/lib/context/AppContext';
import { 
  Calendar as CalendarIcon, 
  List, 
  Kanban, 
  Plus, 
  Video, 
  Trash2, 
  Edit3, 
  Link as LinkIcon, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function MeetingsDashboard() {
  const { currentUser, refreshTrigger, triggerRefresh, addSystemNotification } = useApp();
  
  // Database States
  const [meetings, setMeetings] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban'>('list');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);

  // Form Fields State
  const [prospectName, setProspectName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('12:00');
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');
  const [recordingLink, setRecordingLink] = useState('');
  const [outcome, setOutcome] = useState<'Scheduled' | 'Completed' | 'Missed'>('Scheduled');

  // Load meetings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMeetings(db.getMeetings());
    }
  }, [refreshTrigger]);

  const canModify = ['Super Admin', 'Admin', 'Sales'].includes(currentUser.role);

  // --- Date Math KPIs ---
  const now = new Date();
  
  // Start of week
  const getStartOfWeek = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  
  const startOfWeek = getStartOfWeek(new Date(now));
  startOfWeek.setHours(0,0,0,0);
  
  const meetingsThisWeek = meetings.filter(m => {
    const md = new Date(m.meeting_date);
    return md >= startOfWeek && md <= now;
  }).length;

  const currentMonthStr = now.toISOString().substring(0, 7); // "YYYY-MM"
  const meetingsThisMonth = meetings.filter(m => m.meeting_date.startsWith(currentMonthStr)).length;

  const meetingsThisQuarter = meetings.filter(m => {
    const md = new Date(m.meeting_date);
    const quarter = Math.floor(now.getMonth() / 3);
    const mQuarter = Math.floor(md.getMonth() / 3);
    return md.getFullYear() === now.getFullYear() && quarter === mQuarter;
  }).length;

  const meetingsThisYear = meetings.filter(m => m.meeting_date.startsWith(now.getFullYear().toString())).length;

  // --- CRUD Functions ---
  const handleAddClick = () => {
    if (!canModify) return;
    setEditingMeeting(null);
    setProspectName('');
    setBusinessName('');
    setMeetingDate(new Date().toISOString().split('T')[0]);
    setMeetingTime('10:00');
    setMeetingLink('https://meet.google.com/new');
    setNotes('');
    setRecordingLink('');
    setOutcome('Scheduled');
    setModalOpen(true);
  };

  const handleEditClick = (meeting: any) => {
    if (!canModify) return;
    setEditingMeeting(meeting);
    setProspectName(meeting.prospect_name);
    setBusinessName(meeting.business_name);
    setMeetingDate(meeting.meeting_date);
    setMeetingTime(meeting.meeting_time);
    setMeetingLink(meeting.meeting_link || '');
    setNotes(meeting.notes || '');
    setRecordingLink(meeting.recording_link || '');
    setOutcome(meeting.outcome);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectName || !businessName || !meetingDate) {
      alert('Required fields are missing.');
      return;
    }

    const payload = {
      prospect_name: prospectName,
      business_name: businessName,
      meeting_date: meetingDate,
      meeting_time: meetingTime,
      meeting_link: meetingLink,
      notes,
      recording_link: recordingLink,
      outcome
    };

    if (editingMeeting) {
      db.updateMeeting(editingMeeting.id, payload);
      addSystemNotification('Meeting Updated', `Meeting with ${prospectName} updated.`, 'System');
    } else {
      db.addMeeting(payload);
    }

    setModalOpen(false);
    triggerRefresh();
  };

  const handleDelete = (id: string) => {
    if (!canModify) return;
    if (confirm('Are you sure you want to cancel this meeting?')) {
      db.deleteMeeting(id);
      addSystemNotification('Meeting Cancelled', 'Meeting deleted from database.', 'System');
      triggerRefresh();
    }
  };

  // --- Drag and Drop Kanban handlers ---
  const handleDragStart = (e: React.DragEvent, meetingId: string) => {
    if (!canModify) return;
    e.dataTransfer.setData('text/plain', meetingId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newOutcome: 'Scheduled' | 'Completed' | 'Missed') => {
    e.preventDefault();
    if (!canModify) return;
    const meetingId = e.dataTransfer.getData('text/plain');
    if (meetingId) {
      db.updateMeeting(meetingId, { outcome: newOutcome });
      addSystemNotification('Meeting Status Updated', `Outcome updated to ${newOutcome}`, 'System');
      triggerRefresh();
    }
  };

  // --- Calendar calculations (Current Month) ---
  const [currentCalDate, setCurrentCalDate] = useState(new Date());
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    
    // Shift Sunday to last if needed or leave default (0 is Sunday, 1 Monday, etc.)
    const days = [];
    // Pad with empty days for start padding
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i));
    }
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
          <h2 className="text-xl font-bold tracking-tight">Meeting Management</h2>
          <p className="text-xs text-zinc-400">Schedule client discovery sessions, strategy syncs, and record outcomes.</p>
        </div>
        
        {/* Toggle view and Add Button */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl p-0.5 border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden">
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

          {canModify && (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book Meeting</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">This Week</span>
          <div className="text-xl font-bold mt-1">{meetingsThisWeek}</div>
        </div>
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">This Month</span>
          <div className="text-xl font-bold mt-1">{meetingsThisMonth}</div>
        </div>
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">This Quarter</span>
          <div className="text-xl font-bold mt-1">{meetingsThisQuarter}</div>
        </div>
        <div className="p-4 rounded-2xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">This Year</span>
          <div className="text-xl font-bold mt-1">{meetingsThisYear}</div>
        </div>
      </div>

      {/* --- List View --- */}
      {viewMode === 'list' && (
        <div className="apple-glass rounded-3xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 overflow-hidden">
          {meetings.length === 0 ? (
            <div className="p-20 text-center text-xs text-zinc-400">No scheduled meetings.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Prospect / Company</th>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Schedule</th>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Link</th>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Recording</th>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase">Outcome</th>
                    <th className="p-4 text-xs font-bold text-zinc-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {meetings.map((m) => (
                    <tr key={m.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-sm">{m.prospect_name}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{m.business_name}</div>
                      </td>
                      <td className="p-4 text-xs">
                        <div>{m.meeting_date}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{m.meeting_time}</div>
                      </td>
                      <td className="p-4">
                        {m.meeting_link ? (
                          <a href={m.meeting_link} target="_blank" rel="noreferrer" className="text-blue-500 flex items-center gap-1 hover:underline text-xs">
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Meet</span>
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {m.recording_link ? (
                          <a href={m.recording_link} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-blue-500 flex items-center gap-1 hover:underline text-xs">
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Loom Rec</span>
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          m.outcome === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                          m.outcome === 'Missed' ? 'bg-red-500/10 text-red-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          {m.outcome}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(m)}
                            className="p-1 rounded-lg border border-black/5 dark:border-white/5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] text-zinc-500 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {canModify && (
                            <button
                              onClick={() => handleDelete(m.id)}
                              className="p-1 rounded-lg border border-red-500/10 hover:bg-red-500/15 text-red-500 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- Calendar Grid View --- */}
      {viewMode === 'calendar' && (
        <div className="apple-glass rounded-3xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 p-6">
          {/* Header selectors */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/5 dark:border-white/5">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {monthsList[currentCalDate.getMonth()]} {currentCalDate.getFullYear()}
            </h3>
            <div className="flex items-center gap-1 border border-black/5 dark:border-white/10 rounded-xl overflow-hidden p-0.5">
              <button 
                onClick={() => setCurrentCalDate(new Date(currentCalDate.setMonth(currentCalDate.getMonth() - 1)))}
                className="p-1 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] rounded-lg cursor-pointer"
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
                className="p-1 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] rounded-lg cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Titles */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-zinc-400 uppercase mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2 min-h-64">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="bg-transparent" />;
              
              const dateStr = day.toISOString().split('T')[0];
              const dayMeetings = meetings.filter(m => m.meeting_date === dateStr);
              const isToday = new Date().toDateString() === day.toDateString();

              return (
                <div 
                  key={dateStr}
                  className={`p-2 rounded-2xl border border-black/[0.02] dark:border-white/[0.02] bg-black/[0.01] dark:bg-white/[0.01] flex flex-col justify-between items-stretch min-h-16 ${
                    isToday ? 'border-blue-500/50 bg-blue-500/[0.02] dark:bg-blue-500/[0.01]' : ''
                  }`}
                >
                  <span className={`text-[10px] font-bold self-end ${isToday ? 'text-blue-500' : 'text-zinc-500'}`}>
                    {day.getDate()}
                  </span>
                  
                  {/* Event indicators */}
                  <div className="mt-2 space-y-1">
                    {dayMeetings.map((dm) => (
                      <div 
                        key={dm.id} 
                        onClick={() => handleEditClick(dm)}
                        className={`text-[8px] p-1 rounded font-bold truncate cursor-pointer ${
                          dm.outcome === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                          dm.outcome === 'Missed' ? 'bg-red-500/10 text-red-500' :
                          'bg-amber-500/15 text-amber-500'
                        }`}
                      >
                        {dm.meeting_time} {dm.prospect_name.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- Kanban Drag-and-Drop Board View --- */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Scheduled Column */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Scheduled')}
            className="p-4 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2 mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Scheduled</span>
              <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full font-bold">
                {meetings.filter(m => m.outcome === 'Scheduled').length}
              </span>
            </div>
            
            <div className="space-y-3 min-h-[300px]">
              {meetings.filter(m => m.outcome === 'Scheduled').map((m) => (
                <div
                  key={m.id}
                  draggable={canModify}
                  onDragStart={(e) => handleDragStart(e, m.id)}
                  onClick={() => handleEditClick(m)}
                  className="p-3 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] hover:border-amber-500/30 transition-all cursor-grab active:cursor-grabbing text-xs space-y-2"
                >
                  <div className="font-bold">{m.prospect_name}</div>
                  <div className="text-[10px] text-zinc-400">{m.business_name}</div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-2 border-t border-black/5 dark:border-white/5">
                    <span>{m.meeting_date}</span>
                    <span>{m.meeting_time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Column */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Completed')}
            className="p-4 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2 mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Completed</span>
              <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full font-bold">
                {meetings.filter(m => m.outcome === 'Completed').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {meetings.filter(m => m.outcome === 'Completed').map((m) => (
                <div
                  key={m.id}
                  draggable={canModify}
                  onDragStart={(e) => handleDragStart(e, m.id)}
                  onClick={() => handleEditClick(m)}
                  className="p-3 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] hover:border-emerald-500/30 transition-all cursor-grab active:cursor-grabbing text-xs space-y-2"
                >
                  <div className="font-bold">{m.prospect_name}</div>
                  <div className="text-[10px] text-zinc-400">{m.business_name}</div>
                  {m.recording_link && (
                    <div className="inline-flex items-center gap-1 text-[9px] text-emerald-500 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded">
                      <LinkIcon className="w-2.5 h-2.5" />
                      <span>Recording logged</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-2 border-t border-black/5 dark:border-white/5">
                    <span>{m.meeting_date}</span>
                    <span>{m.meeting_time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missed Column */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Missed')}
            className="p-4 rounded-3xl apple-glass bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2 mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Missed</span>
              <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full font-bold">
                {meetings.filter(m => m.outcome === 'Missed').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {meetings.filter(m => m.outcome === 'Missed').map((m) => (
                <div
                  key={m.id}
                  draggable={canModify}
                  onDragStart={(e) => handleDragStart(e, m.id)}
                  onClick={() => handleEditClick(m)}
                  className="p-3 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] hover:border-red-500/30 transition-all cursor-grab active:cursor-grabbing text-xs space-y-2"
                >
                  <div className="font-bold">{m.prospect_name}</div>
                  <div className="text-[10px] text-zinc-400">{m.business_name}</div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-2 border-t border-black/5 dark:border-white/5">
                    <span>{m.meeting_date}</span>
                    <span>{m.meeting_time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Book Meeting Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 relative animate-in zoom-in-95 duration-300">
            <h3 className="text-sm font-bold mb-4">{editingMeeting ? 'Edit Meeting Details' : 'Book New Strategy Sync'}</h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Prospect Name</label>
                  <input
                    type="text"
                    value={prospectName}
                    onChange={(e) => setProspectName(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                    placeholder="Thomas Shelby"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Company Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                    placeholder="Vanguard Realty"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Time</label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Meeting Link (Google Meet / Zoom)</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Loom Recording URL (If completed)</label>
                <input
                  type="url"
                  value={recordingLink}
                  onChange={(e) => setRecordingLink(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden"
                  placeholder="https://loom.com/share/..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Outcome Status</label>
                <select
                  value={outcome}
                  onChange={(e: any) => setOutcome(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] focus:outline-hidden"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Missed">Missed</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Agendas / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-black/5 dark:border-white/10 rounded-xl bg-transparent focus:outline-hidden h-20"
                  placeholder="Items to discuss..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-black/5 dark:border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-black/5 dark:border-white/10 font-semibold rounded-xl hover:bg-black/[0.02] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl cursor-pointer"
                >
                  Save Meeting
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
