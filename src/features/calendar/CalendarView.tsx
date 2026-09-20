import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { getTranslation, formatTime } from '../../i18n';
import { Task } from '../../types';
import { isTaskOverdue } from '../../services/analyticsService';
import { Button } from '../../components/ui/Button';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
} from 'lucide-react';

interface CalendarViewProps {
  onSelectTask: (task: Task) => void;
  onOpenQuickAdd: () => void;
}

type CalendarMode = 'month' | 'week' | 'day' | 'year';

export const CalendarView: React.FC<CalendarViewProps> = ({
  onSelectTask,
  onOpenQuickAdd,
}) => {
  const { tasks, categories, language, timeFormat, currentTime } = useApp();

  const [mode, setMode] = useState<CalendarMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const is24h = timeFormat === '24h';

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(selectedDate);
    if (mode === 'month') d.setMonth(d.getMonth() - 1);
    else if (mode === 'week') d.setDate(d.getDate() - 7);
    else if (mode === 'day') d.setDate(d.getDate() - 1);
    else if (mode === 'year') d.setFullYear(d.getFullYear() - 1);
    setSelectedDate(d);
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    if (mode === 'month') d.setMonth(d.getMonth() + 1);
    else if (mode === 'week') d.setDate(d.getDate() + 7);
    else if (mode === 'day') d.setDate(d.getDate() + 1);
    else if (mode === 'year') d.setFullYear(d.getFullYear() + 1);
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Month grid calculations
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const monthName = selectedDate.toLocaleDateString(
    language === 'ar' ? 'ar-SA' : language === 'de' ? 'de-DE' : 'en-US',
    { month: 'long', year: 'numeric' }
  );

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun

  // Map tasks by date string (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      const dateKey = t.dueAt
        ? t.dueAt.split('T')[0]
        : t.startAt
        ? t.startAt.split('T')[0]
        : t.createdAt.split('T')[0];

      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(t);
    });
    return map;
  }, [tasks]);

  const weekDayNames =
    language === 'ar'
      ? ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
      : language === 'de'
      ? ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Current today string
  const todayStr = currentTime.toISOString().split('T')[0];
  const [activeMobileDate, setActiveMobileDate] = useState<string>(todayStr);

  const activeMobileTasks = useMemo(() => {
    return tasksByDate[activeMobileDate] || [];
  }, [tasksByDate, activeMobileDate]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {getTranslation(language, 'nav_calendar')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize your schedules, deadlines and workload across time
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center justify-between sm:justify-start gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          {(['month', 'week', 'day', 'year'] as CalendarMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer text-center ${
                mode === m
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Button variant="outline" size="sm" onClick={handleToday} className="text-xs px-2.5 sm:px-3">
            {getTranslation(language, 'cal_today')}
          </Button>
          <div className="flex items-center">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white ml-1 sm:ml-2 truncate">
            {mode === 'day'
              ? selectedDate.toLocaleDateString(
                  language === 'ar' ? 'ar-SA' : language === 'de' ? 'de-DE' : 'en-US',
                  { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
                )
              : mode === 'year'
              ? year
              : monthName}
          </h2>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenQuickAdd}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          <span className="hidden sm:inline">{getTranslation(language, 'task_quick_add')}</span>
        </Button>
      </div>

      {/* MONTH VIEW */}
      {mode === 'month' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-center py-2 text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {weekDayNames.map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            {/* Calendar Day Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* Empty cells before month start */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="min-h-[50px] sm:min-h-[110px] bg-slate-50/40 dark:bg-slate-900/30 p-1 sm:p-2 opacity-40"
                />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                  dayNum
                ).padStart(2, '0')}`;
                const isToday = dateStr === todayStr;
                const isSelectedOnMobile = dateStr === activeMobileDate;
                const dayTasks = tasksByDate[dateStr] || [];

                return (
                  <div
                    key={dateStr}
                    onClick={() => setActiveMobileDate(dateStr)}
                    className={`min-h-[52px] sm:min-h-[110px] p-1 sm:p-2 transition-all cursor-pointer ${
                      isToday
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/40'
                        : isSelectedOnMobile
                        ? 'bg-indigo-50/30 dark:bg-indigo-950/20 ring-2 ring-inset ring-indigo-500/40 sm:ring-0'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                          isToday
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : isSelectedOnMobile
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-extrabold sm:bg-transparent sm:dark:bg-transparent'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="hidden sm:inline text-[10px] text-slate-400 font-semibold">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    {/* Mobile: Compact task dots indicator */}
                    <div className="flex sm:hidden items-center justify-center gap-1 mt-0.5">
                      {dayTasks.slice(0, 3).map((t) => (
                        <span
                          key={t.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.status === 'COMPLETED'
                              ? 'bg-emerald-500'
                              : isTaskOverdue(t, currentTime)
                              ? 'bg-rose-500'
                              : 'bg-indigo-500'
                          }`}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-[8px] text-slate-400 font-bold leading-none">+</span>
                      )}
                    </div>

                    {/* Desktop: Task pills inside day cell */}
                    <div className="hidden sm:block space-y-1 max-h-[80px] overflow-y-auto no-scrollbar">
                      {dayTasks.slice(0, 3).map((task) => {
                        const isCompleted = task.status === 'COMPLETED';
                        const isOverdue = isTaskOverdue(task, currentTime);
                        const cat = categories.find((c) => c.id === task.categoryId);

                        return (
                          <div
                            key={task.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTask(task);
                            }}
                            className={`text-[11px] px-1.5 py-0.5 rounded truncate cursor-pointer transition-all border ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 line-through opacity-75'
                                : isOverdue
                                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                            }`}
                            title={task.title}
                          >
                            {cat && (
                              <span
                                className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                                style={{ backgroundColor: cat.color }}
                              />
                            )}
                            {task.title}
                          </div>
                        );
                      })}
                      {dayTasks.length > 3 && (
                        <div className="text-[10px] text-slate-400 pl-1">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Selected Day Agenda Box */}
          <div className="sm:hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {new Date(activeMobileDate + 'T00:00:00').toLocaleDateString(
                    language === 'ar' ? 'ar-SA' : language === 'de' ? 'de-DE' : 'en-US',
                    { weekday: 'short', month: 'short', day: 'numeric' }
                  )}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {activeMobileTasks.length} {activeMobileTasks.length === 1 ? 'task' : 'tasks'} scheduled
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenQuickAdd}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                {getTranslation(language, 'task_quick_add')}
              </Button>
            </div>

            {activeMobileTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center italic">
                No tasks scheduled on this day. Tap Quick Add to schedule one!
              </p>
            ) : (
              <div className="space-y-2">
                {activeMobileTasks.map((task) => {
                  const isCompleted = task.status === 'COMPLETED';
                  const isOverdue = isTaskOverdue(task, currentTime);
                  const cat = categories.find((c) => c.id === task.categoryId);

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isCompleted
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                          : isOverdue
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          {cat && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                              style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                            >
                              {cat.name}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold uppercase ${
                            task.priority === 'HIGH' ? 'text-rose-600' : 'text-slate-400'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <h4 className={`text-xs font-semibold truncate ${
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          {task.title}
                        </h4>
                      </div>

                      {task.dueAt && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          <span>{formatTime(new Date(task.dueAt), language, is24h, false)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DAY VIEW (Hourly Schedule) */}
      {mode === 'day' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Hourly Schedule (07:00 – 21:00)
          </div>

          <div className="relative divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 15 }).map((_, idx) => {
              const hour = idx + 7; // 07:00 to 21:00
              const hourLabel = is24h
                ? `${String(hour).padStart(2, '0')}:00`
                : `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

              const currentDayStr = selectedDate.toISOString().split('T')[0];
              const tasksInHour = tasks.filter((t) => {
                if (!t.startAt && !t.dueAt) return false;
                const taskTime = new Date(t.startAt || t.dueAt!);
                return (
                  taskTime.toISOString().split('T')[0] === currentDayStr &&
                  taskTime.getHours() === hour
                );
              });

              return (
                <div key={hour} className="flex items-start min-h-[56px] py-2 group">
                  <span className="w-20 text-xs font-mono text-slate-400 dark:text-slate-500 pt-0.5">
                    {hourLabel}
                  </span>
                  <div className="flex-1 pl-4 flex flex-wrap gap-2">
                    {tasksInHour.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 cursor-pointer flex items-center gap-2"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-semibold">{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {mode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(selectedDate);
            const currentDayOfWeek = d.getDay();
            d.setDate(d.getDate() - currentDayOfWeek + i);
            const dateStr = d.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const dayTasks = tasksByDate[dateStr] || [];

            return (
              <div
                key={dateStr}
                className={`p-3 rounded-2xl border bg-white dark:bg-slate-900 ${
                  isToday
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="text-center pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">
                    {weekDayNames[i]}
                  </span>
                  <span
                    className={`text-base font-extrabold ${
                      isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </div>

                <div className="space-y-1.5 min-h-[140px]">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-indigo-400 cursor-pointer truncate"
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length === 0 && (
                    <div className="text-[11px] text-slate-400 italic text-center py-6">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* YEAR VIEW */}
      {mode === 'year' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, mIdx) => {
            const mDate = new Date(year, mIdx, 1);
            const mDays = new Date(year, mIdx + 1, 0).getDate();
            const mName = mDate.toLocaleDateString(
              language === 'ar' ? 'ar-SA' : language === 'de' ? 'de-DE' : 'en-US',
              { month: 'short' }
            );

            return (
              <div
                key={mIdx}
                onClick={() => {
                  setSelectedDate(new Date(year, mIdx, 1));
                  setMode('month');
                }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-400 cursor-pointer transition-all"
              >
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{mName}</h4>
                <div className="grid grid-cols-7 gap-1 text-[9px] text-center text-slate-400">
                  {Array.from({ length: mDays }).map((_, dIdx) => (
                    <div
                      key={dIdx}
                      className="w-4 h-4 rounded-sm flex items-center justify-center bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400"
                    >
                      {dIdx + 1}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
