
import React from 'react';
import { Task, Priority, Category } from '../types';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onBreakdown: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  isBreakingDown?: boolean;
}

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors = {
    [Priority.HIGH]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    [Priority.LOW]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[priority]}`}>{priority}</span>;
};

const CategoryIcon = ({ category }: { category: Category }) => {
  const icons = {
    [Category.WORK]: '💼',
    [Category.PERSONAL]: '🏠',
    [Category.HEALTH]: '🏥',
    [Category.FINANCE]: '💰',
    [Category.OTHER]: '✨',
  };
  return <span className="mr-2">{icons[category]}</span>;
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onBreakdown, onToggleSubtask, isBreakingDown }) => {
  const hasSubtasks = task.subTasks && task.subTasks.length > 0;
  const totalSubtasks = task.subTasks?.length || 0;
  const completedSubtasksCount = task.subTasks?.filter(s => s.completed).length || 0;
  const progress = hasSubtasks ? Math.round((completedSubtasksCount / totalSubtasks) * 100) : 0;

  return (
    <div className={`group flex flex-col p-4 mb-3 transition-all rounded-2xl border ${
      task.completed 
        ? 'bg-gray-50 dark:bg-slate-800/20 border-gray-100 dark:border-slate-800/50 opacity-60' 
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:border-indigo-500/30'
    }`}>
      <div className="flex items-start">
        <button 
          onClick={() => onToggle(task.id)}
          className={`mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            task.completed 
              ? 'bg-green-500 border-green-500' 
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400'
          }`}
        >
          {task.completed && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        </button>

        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center min-w-0">
              <h3 className={`font-medium text-slate-800 dark:text-slate-200 leading-tight truncate ${task.completed ? 'line-through' : ''}`}>
                {task.name}
              </h3>
              {hasSubtasks && !task.completed && (
                <span className="ml-2 px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black tracking-tight">
                  {progress}%
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {!task.completed && !hasSubtasks && (
                <button 
                  onClick={() => onBreakdown(task.id)}
                  disabled={isBreakingDown}
                  className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors disabled:opacity-50"
                >
                  {isBreakingDown ? '...' : '🪄 Breakdown'}
                </button>
              )}
              <button 
                onClick={() => onDelete(task.id)}
                className="text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              <CategoryIcon category={task.category} />
              <span className="font-bold opacity-70 uppercase tracking-tighter">{task.category}</span>
            </div>
            <PriorityBadge priority={task.priority} />
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {task.estimatedTime}
            </span>
            {task.dueDate && (
              <span className="flex items-center text-indigo-500 dark:text-indigo-400 font-bold">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {hasSubtasks && !task.completed && (
        <div className="mt-4 pl-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Progress
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              {completedSubtasksCount} / {totalSubtasks} steps
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4 shadow-inner">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(79,70,229,0.3)]" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="space-y-2">
            {task.subTasks?.map(sub => (
              <div key={sub.id} className="flex items-center group/sub">
                <button 
                  onClick={() => onToggleSubtask(task.id, sub.id)}
                  className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                    sub.completed 
                      ? 'bg-indigo-500 border-indigo-500 dark:bg-indigo-400 dark:border-indigo-400 shadow-sm shadow-indigo-200 dark:shadow-none' 
                      : 'border-slate-300 dark:border-slate-700 group-hover/sub:border-indigo-400'
                  }`}
                >
                  {sub.completed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </button>
                <span className={`ml-2 text-xs font-medium transition-colors ${sub.completed ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-600 dark:text-slate-300'}`}>{sub.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
