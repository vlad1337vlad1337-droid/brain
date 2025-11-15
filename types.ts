
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export type RecurrenceRule = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
export type View = 'today' | 'ideas' | 'projects' | 'calendar' | 'analytics' | 'journal' | 'employees' | 'settings';

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

// WASEWORM OC Types
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
}
