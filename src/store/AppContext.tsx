import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Category,
  Language,
  Task,
  TemperatureUnit,
  Theme,
  TimeFormat,
  ToastMessage,
  UserProfile,
  WeatherData,
} from '../types';
import {
  getLocalProfile,
  loginWithEmail,
  logoutUser,
  registerWithEmail,
  subscribeToAuth,
  updateUserProfile,
} from '../services/authService';
import {
  addTaskUpdate,
  completeTask,
  createCategory,
  createTask,
  deleteTask,
  getCategories,
  getTasks,
  reopenTask,
  resetToSeedData,
  subscribeToCategories,
  subscribeToTasks,
  updateTask,
} from '../services/taskService';
import { fetchWeather } from '../services/weatherService';
import { setDocumentDirection } from '../i18n';
import { DEMO_USER_PROFILE } from '../data/demo/seedData';

interface AppContextType {
  user: UserProfile | null;
  loading: boolean;
  tasks: Task[];
  categories: Category[];
  weather: WeatherData | null;
  currentTime: Date;
  language: Language;
  theme: Theme;
  timeFormat: TimeFormat;
  temperatureUnit: TemperatureUnit;
  toasts: ToastMessage[];
  currentTask: Task | null;

  // Actions
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setTimeFormat: (fmt: TimeFormat) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  addToast: (title: string, message?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Category methods
  addNewCategory: (data: { name: string; color?: string; icon?: string }) => Promise<Category>;

  // Task methods
  addNewTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'updates' | 'activity'>) => Promise<Task>;
  modifyTask: (taskId: string, updates: Partial<Task>, desc?: string) => Promise<Task>;
  markTaskComplete: (taskId: string, customCompletedAt?: string) => Promise<Task>;
  markTaskReopen: (taskId: string) => Promise<Task>;
  removeTask: (taskId: string) => Promise<void>;
  appendTaskUpdate: (taskId: string, content: string) => Promise<void>;
  resetDemoTasks: () => void;

  // Auth methods
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, dob?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEMO_USER_PROFILE);
  const [loading, setLoading] = useState<boolean>(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // User preferences
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<Theme>('system');
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>('24h');
  const [temperatureUnit, setTemperatureUnitState] = useState<TemperatureUnit>('celsius');

  // Live ticking clock (updates every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Language & direction application
  useEffect(() => {
    setDocumentDirection(language);
  }, [language]);

  // Toast helper
  const addToast = (
    title: string,
    message?: string,
    type: ToastMessage['type'] = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type, duration: 4000 }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to ensure an active user is always available
  const getActiveUser = (): UserProfile => {
    if (user) return user;
    const fallback = getLocalProfile();
    setUser(fallback);
    return fallback;
  };

  // Subscribe to auth state and live Firestore tasks/categories
  useEffect(() => {
    let unsubscribeTasks: (() => void) | null = null;
    let unsubscribeCategories: (() => void) | null = null;

    const unsubscribeAuth = subscribeToAuth(async (currentUser) => {
      const activeUser = currentUser || getLocalProfile();
      setUser(activeUser);

      // Clean up previous listeners
      if (unsubscribeTasks) {
        unsubscribeTasks();
        unsubscribeTasks = null;
      }
      if (unsubscribeCategories) {
        unsubscribeCategories();
        unsubscribeCategories = null;
      }

      if (activeUser) {
        setLanguageState(activeUser.language || 'en');
        setThemeState(activeUser.theme || 'system');
        setTimeFormatState(activeUser.timeFormat || '24h');
        setTemperatureUnitState(activeUser.temperatureUnit || 'celsius');

        // Subscribe to live Firestore tasks
        unsubscribeTasks = subscribeToTasks(activeUser.id, (updatedTasks) => {
          setTasks(updatedTasks);
        });

        // Subscribe to live Firestore categories
        unsubscribeCategories = subscribeToCategories(activeUser.id, (updatedCategories) => {
          setCategories(updatedCategories);
        });
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeTasks) unsubscribeTasks();
      if (unsubscribeCategories) unsubscribeCategories();
    };
  }, []);

  // Weather fetch
  useEffect(() => {
    fetchWeather('London').then((data) => setWeather(data));
  }, []);

  // Calculate current focus task dynamically
  const currentTask = useMemo(() => {
    const activeTasks = tasks.filter(
      (t) => !t.archived && (t.status === 'IN_PROGRESS' || t.status === 'TODO')
    );

    // Prioritize explicit IN_PROGRESS task
    const inProgress = activeTasks.find((t) => t.status === 'IN_PROGRESS');
    if (inProgress) return inProgress;

    // Or one whose time slot overlaps currentTime
    const nowTime = currentTime.getTime();
    const overlapping = activeTasks.find((t) => {
      if (!t.startAt || !t.dueAt) return false;
      const start = new Date(t.startAt).getTime();
      const due = new Date(t.dueAt).getTime();
      return nowTime >= start && nowTime <= due;
    });

    return overlapping || activeTasks[0] || null;
  }, [tasks, currentTime]);

  // Actions
  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    const activeUser = getActiveUser();
    await updateUserProfile(activeUser.id, { language: lang });
  };

  const setTheme = async (thm: Theme) => {
    setThemeState(thm);
    const activeUser = getActiveUser();
    await updateUserProfile(activeUser.id, { theme: thm });
  };

  const setTimeFormat = async (fmt: TimeFormat) => {
    setTimeFormatState(fmt);
    const activeUser = getActiveUser();
    await updateUserProfile(activeUser.id, { timeFormat: fmt });
  };

  const setTemperatureUnit = async (unit: TemperatureUnit) => {
    setTemperatureUnitState(unit);
    const activeUser = getActiveUser();
    await updateUserProfile(activeUser.id, { temperatureUnit: unit });
  };

  const addNewCategory = async (data: { name: string; color?: string; icon?: string }) => {
    const activeUser = getActiveUser();
    const created = await createCategory(activeUser.id, data);
    setCategories((prev) => [...prev, created]);
    addToast(
      language === 'ar' ? 'تم إنشاء التصنيف' : 'Category Created',
      created.name,
      'success'
    );
    return created;
  };

  const addNewTask = async (
    data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'updates' | 'activity'>
  ) => {
    const activeUser = getActiveUser();
    const created = await createTask(activeUser.id, data);
    setTasks((prev) => [created, ...prev]);
    addToast('Task Created', created.title, 'success');
    return created;
  };

  const modifyTask = async (taskId: string, updates: Partial<Task>, desc?: string) => {
    const activeUser = getActiveUser();
    const updated = await updateTask(activeUser.id, taskId, updates, desc);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    addToast('Task Updated', updated.title, 'info');
    return updated;
  };

  const markTaskComplete = async (taskId: string, customCompletedAt?: string) => {
    const activeUser = getActiveUser();
    const updated = await completeTask(activeUser.id, taskId, customCompletedAt);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    addToast('Task Completed', `Great job on completing "${updated.title}"!`, 'success');
    return updated;
  };

  const markTaskReopen = async (taskId: string) => {
    const activeUser = getActiveUser();
    const updated = await reopenTask(activeUser.id, taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    addToast('Task Reopened', updated.title, 'info');
    return updated;
  };

  const removeTask = async (taskId: string) => {
    const activeUser = getActiveUser();
    const target = tasks.find((t) => t.id === taskId);
    await deleteTask(activeUser.id, taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    addToast('Task Deleted', target?.title || '', 'warning');
  };

  const appendTaskUpdate = async (taskId: string, content: string) => {
    const activeUser = getActiveUser();
    const newUpdate = await addTaskUpdate(activeUser.id, taskId, content);
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          updates: [...(t.updates || []), newUpdate],
        };
      })
    );
    addToast('Update Logged', 'Task progress update recorded.', 'success');
  };

  const resetDemoTasks = () => {
    const activeUser = getActiveUser();
    const fresh = resetToSeedData(activeUser.id);
    setTasks(fresh);
    addToast('Demo Tasks Reset', 'Restored 20 sample tasks with fresh timestamps.', 'info');
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const u = await loginWithEmail(email, pass);
      setUser(u);
      addToast('Signed In', `Welcome back, ${u.name}!`, 'success');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, dob?: string) => {
    setLoading(true);
    try {
      const u = await registerWithEmail(name, email, pass, dob);
      setUser(u);
      addToast('Account Created', `Welcome to LifeFlow, ${u.name}!`, 'success');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await logoutUser();
    const fallback = getLocalProfile();
    setUser(fallback);
    addToast('Signed Out', 'You have been safely logged out.', 'info');
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    const activeUser = getActiveUser();
    const updated = await updateUserProfile(activeUser.id, updates);
    setUser(updated);
    addToast('Profile Updated', 'Your profile details have been saved.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        tasks,
        categories,
        weather,
        currentTime,
        language,
        theme,
        timeFormat,
        temperatureUnit,
        toasts,
        currentTask,
        setLanguage,
        setTheme,
        setTimeFormat,
        setTemperatureUnit,
        addToast,
        removeToast,
        addNewCategory,
        addNewTask,
        modifyTask,
        markTaskComplete,
        markTaskReopen,
        removeTask,
        appendTaskUpdate,
        resetDemoTasks,
        login,
        register,
        logout,
        updateProfileData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
