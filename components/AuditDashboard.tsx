
import React from 'react';
import { Task, Category } from '../types';

interface AuditDashboardProps {
  tasks: Task[];
}

export const AuditDashboard: React.FC<AuditDashboardProps> = ({ tasks }) => {
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length || 1;
  const score = Math.round((completed / total) * 100);

  const categories = Object.values(Category);
  const catData = categories.map(cat => ({
    name: cat,
    count: tasks.filter(t => t.category === cat).length
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-indigo-600 dark:bg-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Life Balance Score</h2>
          <div className="flex items-baseline space-x-2">
            <span className="text-6xl font-black">{score}</span>
            <span className="text-xl font-bold opacity-60">/ 100</span>
          </div>
          <p className="mt-4 text-indigo-100 text-sm leading-relaxed max-w-[200px]">
            {score > 70 ? "You're crushing your goals. Keep this momentum!" : "Focused effort today will lead to a better tomorrow."}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center">
          <svg className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
          Category Distribution
        </h3>
        <div className="space-y-3">
          {catData.map(cat => (
            <div key={cat.name} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300">{cat.name}</span>
                <span className="text-slate-400 dark:text-slate-500">{cat.count} tasks</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-1000" 
                  style={{ width: `${(cat.count / total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">Active</span>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{tasks.filter(t => !t.completed).length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">Success Rate</span>
          <p className="text-2xl font-bold text-green-600 dark:text-green-500">{score}%</p>
        </div>
      </div>
    </div>
  );
};
