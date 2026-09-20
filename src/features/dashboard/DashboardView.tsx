import React from 'react';
import { useApp } from '../../store/AppContext';
import { getTranslation, formatDate, formatTime, formatDateTime } from '../../i18n';
import { formatTempString } from '../../services/weatherService';
import { getDailyStats, calculateProductivityStats, isTaskOverdue } from '../../services/analyticsService';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { TaskCard } from '../tasks/components/TaskCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Task } from '../../types';
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  Flame,
  Calendar,
  CloudSun,
  Target,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenQuickAdd: () => void;
  onSelectTask: (task: Task) => void;
  onNavigateToTasks: () => void;
  onCompleteTask: (task: Task) => void;
  onReopenTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenQuickAdd,
  onSelectTask,
  onNavigateToTasks,
  onCompleteTask,
  onReopenTask,
  onEditTask,
}) => {
  const {
    user,
    tasks,
    categories,
    weather,
    currentTime,
    language,
    timeFormat,
    temperatureUnit,
    currentTask,
    removeTask,
  } = useApp();

  const is24h = timeFormat === '24h';
  const dailyStats = getDailyStats(tasks, currentTime);
  const prodStats = calculateProductivityStats(tasks, categories);

  // Filter tasks for today's agenda
  const todayStr = currentTime.toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => {
    if (t.archived) return false;
    const dueDay = t.dueAt ? t.dueAt.split('T')[0] : null;
    const startDay = t.startAt ? t.startAt.split('T')[0] : null;
    const completedDay = t.completedAt ? t.completedAt.split('T')[0] : null;
    return dueDay === todayStr || startDay === todayStr || completedDay === todayStr;
  });

  const pendingToday = todayTasks.filter((t) => t.status !== 'COMPLETED');
  const completedToday = todayTasks.filter((t) => t.status === 'COMPLETED');

  // Dynamic greeting based on hour
  const currentHour = currentTime.getHours();
  let greetingKey = 'greeting_morning';
  if (currentHour >= 12 && currentHour < 17) greetingKey = 'greeting_afternoon';
  else if (currentHour >= 17) greetingKey = 'greeting_evening';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Welcome & Live Schedule Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {formatDate(currentTime, language)}
              </span>
              {weather && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <CloudSun className="w-3.5 h-3.5" />
                  {weather.city}: {formatTempString(weather.temperature, temperatureUnit)}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {getTranslation(language, greetingKey)}, {user?.name || 'Producer'}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              You have {pendingToday.length} active tasks scheduled for today. Keep your momentum going!
            </p>
          </div>

          {/* Quick Progress Dial */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <ProgressRing
              progress={dailyStats.completionRate}
              size={90}
              strokeWidth={8}
              strokeColor="#818cf8"
              sublabel="Today"
            />
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Daily Completion
              </span>
              <p className="text-sm font-bold text-white">
                {dailyStats.completed} of {dailyStats.total} Completed
              </p>
              <span className="text-xs text-indigo-300 font-medium">
                {dailyStats.completionRate}% Target achieved
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label={getTranslation(language, 'stats_completed')}
          value={prodStats.completedTasks}
          subtext="Total completed tasks"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label={getTranslation(language, 'stats_in_progress')}
          value={prodStats.inProgressTasks}
          subtext="Tasks in active focus"
          icon={<PlayCircle className="w-5 h-5" />}
          accentColor="text-cyan-600 dark:text-cyan-400"
        />
        <StatCard
          label={getTranslation(language, 'stats_pending')}
          value={prodStats.pendingTasks}
          subtext="Waiting in queue"
          icon={<Clock className="w-5 h-5" />}
          accentColor="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          label={getTranslation(language, 'stats_overdue')}
          value={prodStats.overdueTasks}
          subtext="Requires immediate attention"
          icon={<AlertCircle className="w-5 h-5" />}
          accentColor="text-rose-600 dark:text-rose-400"
        />
      </div>

      {/* Current Focus Task Highlight Banner */}
      {currentTask && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/40 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
                <Target className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {getTranslation(language, 'task_current_focus')}
                  </span>
                  {currentTask.dueAt && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      • Due {formatDateTime(currentTask.dueAt, language, is24h)}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentTask.title}
                </h3>
                {currentTask.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl line-clamp-1">
                    {currentTask.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectTask(currentTask)}
              >
                {getTranslation(language, 'task_details')}
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => onCompleteTask(currentTask)}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {getTranslation(language, 'task_complete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Agenda Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {getTranslation(language, 'dashboard_today_agenda')}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              {todayTasks.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToTasks}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {getTranslation(language, 'dashboard_view_all')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenQuickAdd}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {getTranslation(language, 'task_quick_add')}
            </Button>
          </div>
        </div>

        {/* Task Cards Grid */}
        {todayTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {todayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onSelect={onSelectTask}
                onComplete={onCompleteTask}
                onReopen={onReopenTask}
                onEdit={onEditTask}
                onDelete={(t) => removeTask(t.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={getTranslation(language, 'task_empty_title')}
            description={getTranslation(language, 'task_empty_desc')}
            actionText={getTranslation(language, 'task_new')}
            onAction={onOpenQuickAdd}
          />
        )}
      </div>
    </div>
  );
};
