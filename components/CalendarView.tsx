
import React, { useState } from 'react';
import { Task, Priority } from '../types';

interface CalendarViewProps {
  tasks: Task[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const today = new Date();
  const isToday = (day: number) => 
    day === today.getDate() && 
    month === today.getMonth() && 
    year === today.getFullYear();

  const getTasksForDay = (day: number) => {
    const d = new Date(year, month, day);
    const dateStr = d.toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const priorityColors = {
    [Priority.HIGH]: 'bg-red-500',
    [Priority.MEDIUM]: 'bg-yellow-500',
    [Priority.LOW]: 'bg-blue-500',
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create grid cells
  const cells = [];
  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
    cells.push(<div key={`empty-${i}`} className="h-16 md:h-24 border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10" />);
  }
  // Actual days
  for (let day = 1; day <= numDays; day++) {
    const dayTasks = getTasksForDay(day);
    const isActiveDay = isToday(day);
    
    cells.push(
      <div 
        key={day} 
        className={`h-16 md:h-24 border-b border-r border-slate-100 dark:border-slate-800 p-1 md:p-2 transition-colors relative group hover:bg-slate-50 dark:hover:bg-slate-800/30 ${isActiveDay ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : 'bg-white dark:bg-slate-900'}`}
      >
        <span className={`text-[10px] md:text-xs font-bold ${isActiveDay ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
          {day}
          {isActiveDay && <span className="ml-1.5 inline-block w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />}
        </span>
        
        <div className="mt-1 flex flex-wrap gap-0.5 md:gap-1 max-h-full overflow-hidden">
          {dayTasks.map(task => (
            <div 
              key={task.id} 
              title={task.name}
              className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0 ${priorityColors[task.priority]} ${task.completed ? 'opacity-30' : 'shadow-sm shadow-black/10'}`} 
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Calendar Header */}
      <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">
            {monthName} <span className="text-slate-300 dark:text-slate-600 font-medium">{year}</span>
          </h2>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={goToToday}
            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Today
          </button>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
        {daysOfWeek.map(day => (
          <div key={day} className="py-2 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 border-l border-slate-100 dark:border-slate-800 h-full">
          {cells}
        </div>
        
        {/* Legend */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center space-x-4 opacity-60">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500 dark:text-slate-400">High</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500 dark:text-slate-400">Med</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500 dark:text-slate-400">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
};
