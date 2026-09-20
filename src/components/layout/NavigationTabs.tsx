import React from 'react';
import { useApp } from '../../store/AppContext';
import { getTranslation } from '../../i18n';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  BarChart3,
  FileText,
  Settings,
} from 'lucide-react';

export type AppView = 'dashboard' | 'tasks' | 'calendar' | 'analytics' | 'reports' | 'settings';

interface NavigationTabsProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  currentView,
  onViewChange,
}) => {
  const { language } = useApp();

  const navItems: { id: AppView; labelKey: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      labelKey: 'nav_dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'tasks',
      labelKey: 'nav_tasks',
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: 'calendar',
      labelKey: 'nav_calendar',
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      labelKey: 'nav_analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'reports',
      labelKey: 'nav_reports',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'settings',
      labelKey: 'nav_settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <nav className="hidden md:block bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{getTranslation(language, item.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
