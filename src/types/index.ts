export type Language = 'en' | 'ar' | 'de';
export type Theme = 'light' | 'dark' | 'system';
export type TimeFormat = '12h' | '24h';
export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dateOfBirth?: string; // YYYY-MM-DD
  language: Language;
  theme: Theme;
  timezone: string;
  timeFormat: TimeFormat;
  temperatureUnit: TemperatureUnit;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskRecurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type ActivityType =
  | 'CREATED'
  | 'UPDATED'
  | 'STARTED'
  | 'PAUSED'
  | 'RESUMED'
  | 'COMPLETED'
  | 'REOPENED'
  | 'CANCELLED'
  | 'ARCHIVED';

export interface TaskActivity {
  id: string;
  type: ActivityType;
  description: string;
  createdAt: string; // ISO string
  metadata?: Record<string, unknown>;
}

export interface TaskUpdate {
  id: string;
  taskId: string;
  content: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  priority: TaskPriority;
  status: TaskStatus;

  createdAt: string; // ISO string
  updatedAt: string; // ISO string

  startAt?: string; // ISO string
  dueAt?: string; // ISO string
  completedAt?: string; // ISO string

  estimatedDuration?: number; // In minutes
  recurrence: TaskRecurrence;
  tags: string[]; // e.g. ["#work", "#urgent"]

  reminderEnabled: boolean;
  reminderAt?: string; // ISO string

  archived: boolean;
  updates?: TaskUpdate[];
  activity?: TaskActivity[];
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon identifier
  color: string; // Tailwind color token or hex
  createdAt: string;
  updatedAt: string;
}

export interface WeatherData {
  city: string;
  temperature: number; // in Celsius
  condition: string;
  conditionCode: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'storm' | 'clear';
  high: number;
  low: number;
  humidity: number;
  isDemo?: boolean;
}

export interface TaskFilterOptions {
  query?: string;
  status?: TaskStatus | 'ALL';
  priority?: TaskPriority | 'ALL';
  categoryId?: string | 'ALL';
  tag?: string | 'ALL';
  dateRange?: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'OVERDUE' | 'UPCOMING';
  archived?: boolean;
}

export interface DailyStats {
  date: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export interface ProductivityStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number; // percentage 0-100
  avgTasksPerDay: number;
  categoryBreakdown: { name: string; count: number; color: string }[];
  weeklyTrend: { week: string; completed: number; total: number }[];
  dailyCompletions: { date: string; count: number }[];
  yearHeatmap: { date: string; count: number; level: number }[];
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
