import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { getTranslation, formatDate, formatDateTime } from '../../i18n';
import { exportTasksToCSV, triggerPrint } from '../../services/exportService';
import { isTaskOverdue } from '../../services/analyticsService';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusPriorityBadges';
import { Printer, Download, Filter, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

type DateRangeOption = 'today' | '7days' | '30days' | 'month' | 'all';

export const ReportsView: React.FC = () => {
  const { tasks, categories, language, timeFormat, currentTime } = useApp();
  const [range, setRange] = useState<DateRangeOption>('30days');
  const is24h = timeFormat === '24h';

  const rangeFilteredTasks = useMemo(() => {
    const now = new Date(currentTime);
    const todayStr = now.toISOString().split('T')[0];

    return tasks.filter((t) => {
      const taskDate = new Date(t.completedAt || t.dueAt || t.createdAt);

      if (range === 'today') {
        return taskDate.toISOString().split('T')[0] === todayStr;
      } else if (range === '7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
        return taskDate >= sevenDaysAgo;
      } else if (range === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
        return taskDate >= thirtyDaysAgo;
      } else if (range === 'month') {
        return (
          taskDate.getMonth() === now.getMonth() &&
          taskDate.getFullYear() === now.getFullYear()
        );
      }
      return true; // all
    });
  }, [tasks, range, currentTime]);

  // Derived metrics for current range
  const total = rangeFilteredTasks.length;
  const completed = rangeFilteredTasks.filter((t) => t.status === 'COMPLETED').length;
  const overdue = rangeFilteredTasks.filter((t) => isTaskOverdue(t, currentTime)).length;
  const inProgress = rangeFilteredTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleExportCSV = () => {
    exportTasksToCSV(rangeFilteredTasks, categories);
  };

  return (
    <div className="space-y-6 sm:space-y-8 print:p-0">
      {/* Header with Export & Print Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {getTranslation(language, 'nav_reports')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit logs, performance summaries and exportable productivity sheets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerPrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            {getTranslation(language, 'rep_print')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            {getTranslation(language, 'rep_export_csv')}
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar w-fit print:hidden">
        <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1 flex-shrink-0" />
        {(
          [
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All Time' },
          ] as const
        ).map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              range === r.id
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Printable Report Document Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Report Document Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Productivity Performance Audit
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                LifeFlow Activity & Deliverables Report
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Generated on {formatDateTime(currentTime.toISOString(), language, is24h)} • Filter: {range.toUpperCase()}
              </p>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-xs font-mono text-slate-400">DOC-ID: LF-{Date.now().toString().slice(-6)}</span>
            </div>
          </div>
        </div>

        {/* Executive Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Total In Scope
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{total}</span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Successfully Completed
            </span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {completed}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Overdue / At Risk
            </span>
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {overdue}
            </span>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Completion Rate
            </span>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {completionRate}%
            </span>
          </div>
        </div>

        {/* Detailed Task Table */}
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-2">Task Title</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Priority</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Deadline</th>
                <th className="py-3 px-2">Completed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {rangeFilteredTasks.map((t) => {
                const cat = categories.find((c) => c.id === t.categoryId);
                const isOverdue = isTaskOverdue(t, currentTime);

                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-2 font-semibold text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                      {t.title}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className="px-2 py-0.5 rounded font-medium text-[11px]"
                        style={{
                          backgroundColor: `${cat?.color || '#6366f1'}15`,
                          color: cat?.color || '#6366f1',
                        }}
                      >
                        {cat?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge status={t.status} isOverdue={isOverdue} />
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-500">
                      {t.dueAt ? formatDateTime(t.dueAt, language, is24h) : '—'}
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-500">
                      {t.completedAt ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {formatDateTime(t.completedAt, language, is24h)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
              {rangeFilteredTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No task records recorded in this timeframe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards List View */}
        <div className="md:hidden space-y-3">
          {rangeFilteredTasks.map((t) => {
            const cat = categories.find((c) => c.id === t.categoryId);
            const isOverdue = isTaskOverdue(t, currentTime);

            return (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white leading-snug">
                    {t.title}
                  </h4>
                  <StatusBadge status={t.status} isOverdue={isOverdue} />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {cat && (
                    <span
                      className="px-2 py-0.5 rounded font-medium text-[11px]"
                      style={{
                        backgroundColor: `${cat.color}18`,
                        color: cat.color,
                      }}
                    >
                      {cat.name}
                    </span>
                  )}
                  <PriorityBadge priority={t.priority} />
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1 font-mono">
                  {t.dueAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Deadline:</span>
                      <span>{formatDateTime(t.dueAt, language, is24h)}</span>
                    </div>
                  )}
                  {t.completedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-500 font-sans">Completed:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatDateTime(t.completedAt, language, is24h)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {rangeFilteredTasks.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              No task records recorded in this timeframe.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
