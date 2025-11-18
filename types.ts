export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export type RecurrenceRule = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
export type View = 'today' | 'ideas' | 'projects' | 'calendar' | 'analytics' | 'journal' | 'employees' | 'settings' | 'external-brain' | 'knowledge-base' | 'finance' | 'notes' | 'ai-task-creation' | 'personalization' | 'crm' | 'kanban';

export interface Task {
  id: string;
  title: string;
  isDone: boolean;
  priority: TaskPriority;
  deadline?: Date;
  completedAt?: Date;
  projectId?: string;
  categoryId?: string;
  recurrence?: RecurrenceRule;
  timeOfDay?: TimeOfDay;
  assignedTo?: string;
  originalText?: string;
  durationMinutes?: number;
  kanbanColumnId?: string;
}

export interface Project {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface Employee {
  id:string;
  name: string;
  avatar?: string; // Optional avatar icon class
  color?: string; // Optional accent color
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

export interface Idea {
  id: string;
  text: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  date: Date;
  aiSummary: string;
  userNotes: string;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate: string;
}

export interface TaskPriorityConfig {
    color: string;
    text: string;
    icon: string;
}

export interface Holiday {
  name: string;
  country: 'RU' | 'CN';
  isPublic: boolean;
}

export interface KnowledgeNote {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = 'income' | 'expense';

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'business' | 'personal';
}

export interface FinanceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: Date;
  description: string;
  accountId: string;
  recurrence?: RecurrenceRule;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number; // This will be calculated from account balances
  createdAt: Date;
}

export interface Contact {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    notes?: string;
    createdAt: Date;
}

export interface Settings {
    theme: 'light' | 'dark' | 'system';
    weekendDays: number[];
    accentColor: string;
    wallpaper: string;
}

export interface Notification {
    id: string;
    message: string;
    icon: string;
    timestamp: Date;
    isRead: boolean;
}

export interface AppDefinition {
  id: View;
  name: string;
  icon: string;
  defaultSize: { width: number | string; height: number | string };
}

export interface WindowInstance {
  id: string; // Unique instance ID
  appId: View;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
  initialSubView?: View;
}

export type CommandPaletteAction = {
  id: string;
  type: 'app' | 'task' | 'action';
  title: string;
  icon: string;
  section: 'Приложения' | 'Задачи' | 'Действия';
  perform: () => void;
  keywords?: string;
  task?: Task; // for task actions
};

export enum WidgetType {
  CLOCK = 'CLOCK',
  AGENDA = 'AGENDA',
  PROJECT_PROGRESS = 'PROJECT_PROGRESS',
  NOTEPAD = 'NOTEPAD',
  FINANCE_OVERVIEW = 'FINANCE_OVERVIEW',
  QUOTE = 'QUOTE',
  WEATHER = 'WEATHER',
  STREAK = 'STREAK',
  AI_TASK = 'AI_TASK',
}

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
  config?: any;
}

export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
}