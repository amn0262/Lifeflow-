import React, { useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { getTranslation } from '../../i18n';
import { calculateProductivityStats } from '../../services/analyticsService';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressRing } from '../../components/ui/ProgressRing';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Flame,
  Activity,
  Layers,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { tasks, categories, language } = useApp();

  const stats = useMemo(() => {
    return calculateProductivityStats(tasks, categories);
  }, [tasks, categories]);

  // Heatmap tooltip hover state
  const [hoveredCell, setHoveredCell] = React.useState<{
    date: string;
    count: number;
  } | null>(null);

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 4:
        return 'bg-indigo-600 dark:bg-indigo-500';
      case 3:
        return 'bg-indigo-500/80 dark:bg-indigo-600/80';
      case 2:
        return 'bg-indigo-400/70 dark:bg-indigo-700/70';
      case 1:
        return 'bg-indigo-200 dark:bg-indigo-900/60';
      case 0:
      default:
        return 'bg-slate-100 dark:bg-slate-800/80';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {getTranslation(language, 'nav_analytics')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Deep productivity metrics, completion patterns and task distribution analysis
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label={getTranslation(language, 'stats_completion_rate')}
          value={`${stats.completionRate}%`}
          subtext={`${stats.completedTasks} of ${stats.totalTasks} tasks closed`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          label={getTranslation(language, 'stats_avg_per_day')}
          value={stats.avgTasksPerDay}
          subtext="Based on last 14 days"
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label={getTranslation(language, 'stats_in_progress')}
          value={stats.inProgressTasks}
          subtext="Active in workflow"
          icon={<Activity className="w-5 h-5" />}
          accentColor="text-cyan-600 dark:text-cyan-400"
        />
        <StatCard
          label={getTranslation(language, 'stats_overdue')}
          value={stats.overdueTasks}
          subtext="Passed deadline"
          icon={<AlertCircle className="w-5 h-5" />}
          accentColor="text-rose-600 dark:text-rose-400"
        />
      </div>

      {/* 365-DAY PRODUCTIVITY HEATMAP (Strictly built from completedAt) */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 overflow-hidden max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Yearly Productivity Heatmap (365 Days)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strictly calculated by task <strong>completedAt</strong> timestamps
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((lvl) => (
              <div
                key={lvl}
                className={`w-3 h-3 rounded-sm ${getHeatmapColor(lvl)} border border-slate-200/40 dark:border-slate-700/40`}
              />
            ))}
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid Container */}
        <div className="overflow-x-auto pb-2 w-full max-w-full overscroll-x-contain">
          <div className="min-w-[720px]">
            <div className="flex flex-wrap gap-1">
              {stats.yearHeatmap.map((cell) => (
                <div
                  key={cell.date}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`w-3 h-3 rounded-[3px] cursor-pointer transition-transform hover:scale-125 ${getHeatmapColor(
                    cell.level
                  )}`}
                  title={`${cell.date}: ${cell.count} task${cell.count === 1 ? '' : 's'} completed`}
                />
              ))}
            </div>

            {/* Hover Tooltip display */}
            <div className="h-6 mt-2 text-xs text-slate-500 font-medium">
              {hoveredCell ? (
                <span>
                  <strong>{hoveredCell.date}</strong> — {hoveredCell.count} completed task
                  {hoveredCell.count === 1 ? '' : 's'}
                </span>
              ) : (
                <span className="text-slate-400">Hover over any day cell to view exact completions</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Category Breakdown & 6-Week Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Category Workload Distribution
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{categories.length} Categories</span>
          </div>

          <div className="space-y-3.5">
            {stats.categoryBreakdown.map((cat) => {
              const percentage =
                stats.totalTasks > 0 ? Math.round((cat.count / stats.totalTasks) * 100) : 0;

              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {cat.name}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {cat.count} tasks ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6-Week Completion Trend */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              6-Week Productivity Velocity
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Weekly comparison</span>
          </div>

          <div className="flex items-end justify-between h-48 pt-6 pb-2 gap-3 border-b border-slate-100 dark:border-slate-800">
            {stats.weeklyTrend.map((wt) => {
              const maxVal = Math.max(
                ...stats.weeklyTrend.map((x) => Math.max(x.total, x.completed, 4))
              );
              const totalHeight = Math.round((wt.total / maxVal) * 100);
              const completedHeight = Math.round((wt.completed / maxVal) * 100);

              return (
                <div key={wt.week} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="flex items-end gap-1 h-full w-full justify-center">
                    {/* Total Created Bar */}
                    <div
                      style={{ height: `${Math.max(10, totalHeight)}%` }}
                      className="w-3 sm:w-4 rounded-t bg-slate-200 dark:bg-slate-700 transition-all group-hover:opacity-80"
                      title={`${wt.week}: ${wt.total} Total Created`}
                    />
                    {/* Completed Bar */}
                    <div
                      style={{ height: `${Math.max(10, completedHeight)}%` }}
                      className="w-3 sm:w-4 rounded-t bg-indigo-600 dark:bg-indigo-500 transition-all group-hover:scale-105"
                      title={`${wt.week}: ${wt.completed} Completed`}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-2">
                    {wt.week}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700" />
              <span>Total Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-indigo-600" />
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
