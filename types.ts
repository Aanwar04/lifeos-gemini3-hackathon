
export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum Category {
  WORK = 'Work',
  PERSONAL = 'Personal',
  HEALTH = 'Health',
  FINANCE = 'Finance',
  OTHER = 'Other'
}

export interface SubTask {
  id: string;
  name: string;
  completed: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Task {
  id: string;
  name: string;
  priority: Priority;
  estimatedTime: string;
  category: Category;
  dueDate?: string; // Expected format: YYYY-MM-DD
  completed: boolean;
  createdAt: number;
  subTasks?: SubTask[];
  sources?: GroundingSource[];
  reminded?: boolean; // Track if user was notified
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string;
  type?: 'text' | 'vision_board' | 'knowledge_card';
  sources?: GroundingSource[];
}

export type SidebarView = 'tasks' | 'audit' | 'calendar';
