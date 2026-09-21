import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { Navbar } from './components/layout/Navbar';
import { NavigationTabs, AppView } from './components/layout/NavigationTabs';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { DashboardView } from './features/dashboard/DashboardView';
import { TasksView } from './features/tasks/TasksView';
import { CalendarView } from './features/calendar/CalendarView';
import { AnalyticsView } from './features/analytics/AnalyticsView';
import { ReportsView } from './features/reports/ReportsView';
import { ProfileSettingsView } from './features/profile/ProfileSettingsView';

// Modals & Drawers
import { QuickAddModal } from './features/tasks/components/QuickAddModal';
import { TaskFormModal } from './features/tasks/components/TaskFormModal';
import { CompletionModal } from './features/tasks/components/CompletionModal';
import { TaskDetailDrawer } from './features/tasks/components/TaskDetailDrawer';
import { GlobalSearchModal } from './features/search/GlobalSearchModal';
import { BirthdayModal } from './features/profile/BirthdayModal';
import { AuthModal } from './features/auth/AuthModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { Task } from './types';
import { isBirthdayToday } from './i18n';

const MainLayout: React.FC = () => {
  const { user, markTaskReopen } = useApp();

  // Active View Navigation
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  // Modals & Drawer States
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Auto-trigger birthday greeting once if today is user's birthday!
  useEffect(() => {
    if (user?.dateOfBirth && isBirthdayToday(user.dateOfBirth)) {
      const hasCelebrated = sessionStorage.getItem('lifeflow_bday_celebrated');
      if (!hasCelebrated) {
        setIsBirthdayModalOpen(true);
        sessionStorage.setItem('lifeflow_bday_celebrated', 'true');
      }
    }
  }, [user]);

  // Global Keyboard Shortcuts (Ctrl+K / Cmd+K for search, 'c' for quick create)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'c' || e.key === 'n') {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskFormOpen(true);
  };

  const handleOpenComplete = (task: Task) => {
    setTaskToComplete(task);
    setIsCompletionModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenBirthdayCelebration={() => setIsBirthdayModalOpen(true)}
        onNavigateToProfile={() => setCurrentView('settings')}
      />

      {/* Navigation Tabs Bar */}
      <NavigationTabs currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-8">
        {currentView === 'dashboard' && (
          <DashboardView
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onSelectTask={setSelectedTaskForDetail}
            onNavigateToTasks={() => setCurrentView('tasks')}
            onCompleteTask={handleOpenComplete}
            onReopenTask={(t) => markTaskReopen(t.id)}
            onEditTask={handleOpenEdit}
          />
        )}

        {currentView === 'tasks' && (
          <TasksView
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onOpenNewTaskModal={() => {
              setTaskToEdit(null);
              setIsTaskFormOpen(true);
            }}
            onSelectTask={setSelectedTaskForDetail}
            onCompleteTask={handleOpenComplete}
            onReopenTask={(t) => markTaskReopen(t.id)}
            onEditTask={handleOpenEdit}
          />
        )}

        {currentView === 'calendar' && (
          <CalendarView
            onSelectTask={setSelectedTaskForDetail}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        )}

        {currentView === 'analytics' && <AnalyticsView />}

        {currentView === 'reports' && <ReportsView />}

        {currentView === 'settings' && (
          <ProfileSettingsView
            onOpenBirthdayModal={() => setIsBirthdayModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Modals & Slide-overs */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onOpenFullForm={() => {
          setTaskToEdit(null);
          setIsTaskFormOpen(true);
        }}
      />

      <TaskFormModal
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />

      <CompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => {
          setIsCompletionModalOpen(false);
          setTaskToComplete(null);
        }}
        task={taskToComplete}
      />

      <TaskDetailDrawer
        task={selectedTaskForDetail}
        onClose={() => setSelectedTaskForDetail(null)}
        onEdit={(task) => {
          setSelectedTaskForDetail(null);
          handleOpenEdit(task);
        }}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTask={(task) => {
          setSelectedTaskForDetail(task);
        }}
      />

      <BirthdayModal
        isOpen={isBirthdayModalOpen}
        onClose={() => setIsBirthdayModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Offline Connectivity Status Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
