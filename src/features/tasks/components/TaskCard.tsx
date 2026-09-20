import React from 'react';
import { Task } from '../../../types';
import { useApp } from '../../../store/AppContext';
import { isTaskOverdue } from '../../../services/analyticsService';
import { StatusBadge, PriorityBadge } from '../../../components/ui/StatusPriorityBadges';
import { formatTime, formatDateTime } from '../../../i18n';
import { Calendar, Clock, CheckCircle2, Circle, MoreVertical, MessageSquare } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  onComplete: (task: Task) => void;
  onReopen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onSelect,
  onComplete,
  onReopen,
  onEdit,
  onDelete,
}) => {
  const { categories, language, timeFormat, currentTime } = useApp();
  const category = categories.find((c) => c.id === task.categoryId);
  const isOverdue = isTaskOverdue(task, currentTime);
  const isCompleted = task.status === 'COMPLETED';
  const is24h = timeFormat === '24h';

  return (
    <div
      onClick={() => onSelect(task)}
      className={`group relative bg-white dark:bg-slate-900/90 rounded-2xl border p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
        isCompleted
          ? 'border-slate-200/60 dark:border-slate-800/60 opacity-80'
          : isOverdue
          ? 'border-rose-300 dark:border-rose-900/70 bg-rose-50/10'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Complete Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isCompleted) {
              onReopen(task);
            } else {
              onComplete(task);
            }
          }}
          className="p-2 -m-1 sm:p-1.5 sm:m-0 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0 rounded-xl"
          title={isCompleted ? 'Mark uncompleted' : 'Mark completed'}
          aria-label={isCompleted ? 'Mark uncompleted' : 'Mark completed'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950/60" />
          ) : (
            <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StatusBadge status={task.status} isOverdue={isOverdue} />
            <PriorityBadge priority={task.priority} />
            {category && (
              <span
                className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                style={{ backgroundColor: `${category.color}18`, color: category.color }}
              >
                {category.name}
              </span>
            )}
          </div>

          <h3
            className={`text-sm sm:text-base font-semibold leading-snug truncate ${
              isCompleted
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Time & tags footer */}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            {task.dueAt && (
              <div
                className={`flex items-center gap-1.5 font-medium ${
                  isOverdue && !isCompleted ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {task.dueAt ? formatDateTime(task.dueAt, language, is24h) : ''}
                </span>
              </div>
            )}

            {task.updates && task.updates.length > 0 && (
              <div className="flex items-center gap-1 text-slate-400">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{task.updates.length}</span>
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1.5">
                {task.tags.slice(0, 2).map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    {t}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-[10px] text-slate-400">+{task.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
