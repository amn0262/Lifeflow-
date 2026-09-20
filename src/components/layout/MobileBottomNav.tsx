import React from 'react';
import { useApp } from '../../store/AppContext';
import { getTranslation } from '../../i18n';
import { AppView } from './NavigationTabs';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Sliders,
  Plus,
  FileText,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onOpenQuickAdd: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onViewChange,
  onOpenQuickAdd,
}) => {
  const { language, tasks } = useApp();

  const pendingCount = tasks.filter((t) => !t.archived && t.status !== 'COMPLETED').length;

  const navItems: { id: AppView; labelKey: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      labelKey: 'nav_dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'tasks',
      labelKey: 'nav_tasks',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: 'calendar',
      labelKey: 'nav_calendar',
      icon: <CalendarDays className="w-5 h-5" />,
    },
    {
      id: 'analytics',
      labelKey: 'nav_analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'reports',
      labelKey: 'nav_reports',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'settings',
      labelKey: 'nav_settings',
      icon: <Sliders className="w-5 h-5" />,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 w-full max-w-full overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-6 gap-0.5 px-1 py-1 relative">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/40'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -end-1.5 bg-indigo-600 text-white text-[9px] font-bold px-1 py-0.2 rounded-full min-w-[15px] text-center shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-none tracking-tight truncate max-w-full">
                {getTranslation(language, item.labelKey)}
              </span>

              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1" />
              )}
            </button>
          );
        })}

        {/* Floating Quick-Add Action Button */}
        <div className="fixed bottom-20 end-4 md:hidden z-50">
          <button
            onClick={onOpenQuickAdd}
            className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/40 flex items-center justify-center transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
            aria-label="Quick Add Task"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
};
