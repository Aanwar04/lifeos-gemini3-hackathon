
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Task, Message, SidebarView, GroundingSource, Priority } from './types';
import { TaskCard } from './components/TaskCard';
import { InputArea } from './components/InputArea';
import { AuditDashboard } from './components/AuditDashboard';
import { CalendarView } from './components/CalendarView';
import { extractTasksFromInput, generateBriefing, generateSubTasks, generateVisionBoardImage } from './services/geminiService';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am LifeOS. I can now send you reminders for your tasks. Click the bell icon above to enable notifications!',
      timestamp: Date.now()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [breakingDownId, setBreakingDownId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sidebarView, setSidebarView] = useState<SidebarView>('tasks');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('lifeos_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Theme effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lifeos_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lifeos_theme', 'light');
    }
  }, [isDarkMode]);

  // Persistence
  useEffect(() => {
    const savedTasks = localStorage.getItem('lifeos_tasks_v5');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem('lifeos_tasks_v5', JSON.stringify(tasks));
  }, [tasks]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Background Reminder Checker
  useEffect(() => {
    const checkReminders = () => {
      if (notificationPermission !== 'granted') return;

      const today = new Date().toISOString().split('T')[0];
      setTasks(currentTasks => {
        let updated = false;
        const newTasks = currentTasks.map(task => {
          if (
            task.dueDate === today && 
            !task.completed && 
            !task.reminded
          ) {
            new Notification('LifeOS Reminder', {
              body: `Task due today: ${task.name} (${task.priority} Priority)`,
              icon: '/favicon.ico' 
            });
            updated = true;
            return { ...task, reminded: true };
          }
          return task;
        });
        return updated ? newTasks : currentTasks;
      });
    };

    const interval = setInterval(checkReminders, 60000); 
    checkReminders(); 
    return () => clearInterval(interval);
  }, [notificationPermission]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      new Notification('Reminders Active!', {
        body: 'LifeOS will notify you when tasks are due.',
      });
    }
  };

  const handleSendMessage = useCallback(async (text: string, image?: string) => {
    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: text,
      image,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    const lowercaseText = text.toLowerCase();
    const isBriefingRequest = lowercaseText.includes('morning briefing') || lowercaseText.includes("today looking like");
    const isVisionRequest = lowercaseText.includes('vision board') || lowercaseText.includes("visualize my day");

    try {
      if (isVisionRequest) {
        const visionImg = await generateVisionBoardImage(tasks);
        setMessages(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: "Visualized your current priorities into a vision board for focus.",
          image: visionImg,
          type: 'vision_board',
          timestamp: Date.now()
        }]);
      } else if (isBriefingRequest) {
        const briefing = await generateBriefing(tasks);
        setMessages(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: briefing,
          timestamp: Date.now()
        }]);
      } else {
        const { tasks: newTasksRaw, sources } = await extractTasksFromInput(text, image);
        if (newTasksRaw.length > 0) {
          const newTasks = newTasksRaw as Task[];
          setTasks(prev => [...newTasks, ...prev]);
          setMessages(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            role: 'assistant',
            content: `Scheduled ${newTasks.length} new item${newTasks.length > 1 ? 's' : ''}. Check your planner!`,
            sources: sources.length > 0 ? sources : undefined,
            timestamp: Date.now()
          }]);
        } else if (text.trim()) {
           setMessages(prev => [...prev, {
             id: Math.random().toString(36).substr(2, 9),
             role: 'assistant',
             content: "Understood. How else can I help organize your life today?",
             sources: sources.length > 0 ? sources : undefined,
             timestamp: Date.now()
           }]);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'assistant',
        content: "Processing error. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [tasks]);

  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  
  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updated = task.subTasks?.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
        return { ...task, subTasks: updated };
      }
      return task;
    }));
  };

  const handleBreakdown = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setBreakingDownId(id);
    try {
      const subtasks = await generateSubTasks(task.name);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, subTasks: subtasks } : t));
    } catch (e) {
      console.error(e);
    } finally {
      setBreakingDownId(null);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row overflow-hidden transition-colors duration-500">
      {/* Sidebar */}
      <div className="w-full md:w-1/2 lg:w-2/5 xl:w-1/3 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-1/2 md:h-full z-20">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center tracking-tight">
              <span className="bg-indigo-600 text-white p-1 rounded-lg mr-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-950/20">L</span>
              LifeOS
            </h1>
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>

              <button 
                onClick={requestNotificationPermission}
                title={`Notifications: ${notificationPermission}`}
                className={`p-2 rounded-lg transition-all ${
                  notificationPermission === 'granted' 
                    ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400' 
                    : notificationPermission === 'denied' 
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button 
                  onClick={() => setSidebarView('tasks')}
                  className={`p-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${sidebarView === 'tasks' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400'}`}
                >
                  Tasks
                </button>
                <button 
                  onClick={() => setSidebarView('calendar')}
                  className={`p-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${sidebarView === 'calendar' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400'}`}
                >
                  Planner
                </button>
                <button 
                  onClick={() => setSidebarView('audit')}
                  className={`p-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${sidebarView === 'audit' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400'}`}
                >
                  Audit
                </button>
              </div>
            </div>
          </div>
          
          {sidebarView === 'tasks' && (
            <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
              {(['all', 'active', 'completed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/20 dark:bg-slate-900/20">
          {sidebarView === 'tasks' && (
            <div className="p-4 md:p-6">
              {filteredTasks.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center opacity-30 dark:text-slate-100">
                  <p className="text-sm font-medium">Agenda Clear.</p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onToggle={toggleTask} 
                    onDelete={deleteTask} 
                    onBreakdown={handleBreakdown}
                    onToggleSubtask={toggleSubtask}
                    isBreakingDown={breakingDownId === task.id}
                  />
                ))
              )}
            </div>
          )}
          {sidebarView === 'calendar' && <CalendarView tasks={tasks} />}
          {sidebarView === 'audit' && <AuditDashboard tasks={tasks} />}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-1/2 md:h-full relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-5 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white shadow-indigo-100 dark:shadow-none' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm'
              }`}>
                {msg.image && (
                  <div className="mb-4 rounded-xl overflow-hidden shadow-sm">
                    <img src={msg.image} alt="Media" className="w-full object-cover" />
                  </div>
                )}
                <div className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Verified Sources & Places</span>
                    {msg.sources.map((src, i) => (
                      <a 
                        key={i} 
                        href={src.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-indigo-600 dark:text-indigo-400 font-medium text-xs"
                      >
                        <svg className="w-3.5 h-3.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        {src.title || 'Linked Resource'}
                      </a>
                    ))}
                  </div>
                )}

                <div className={`mt-3 text-[10px] font-medium uppercase tracking-widest opacity-50 ${msg.role === 'user' ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <InputArea onSendMessage={handleSendMessage} isProcessing={isProcessing} />
      </div>
    </div>
  );
};

export default App;
