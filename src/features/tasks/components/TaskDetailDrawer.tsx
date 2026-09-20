import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';
import { getTranslation, formatDate, formatDateTime } from '../../../i18n';
import { Task } from '../../../types';
import { StatusBadge, PriorityBadge } from '../../../components/ui/StatusPriorityBadges';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Input';
import { CompletionModal } from './CompletionModal';
import { isTaskOverdue } from '../../../services/analyticsService';
import {
  Clock,
  Calendar,
  Tag,
  CheckCircle2,
  RotateCcw,
  Edit3,
  Trash2,
  Send,
  MessageSquare,
  Activity,
  X,
  Repeat,
  Timer,
} from 'lucide-react';

interface TaskDetailDrawerProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  onClose,
  onEdit,
}) => {
  const {
    categories,
    language,
    timeFormat,
    markTaskReopen,
    removeTask,
    appendTaskUpdate,
    currentTime,
  } = useApp();

  const [updateText, setUpdateText] = useState('');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  if (!task) return null;

  const category = categories.find((c) => c.id === task.categoryId);
  const isOverdue = isTaskOverdue(task, currentTime);
  const is24h = timeFormat === '24h';

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) return;
    setIsSubmittingUpdate(true);
    try {
      await appendTaskUpdate(task.id, updateText.trim());
      setUpdateText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleReopen = async () => {
    try {
      await markTaskReopen(task.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      await removeTask(task.id);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Drawer Content */}
        <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col h-full z-10">
          {/* Header */}
          <div className="flex items-start justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex-1 pr-3 rtl:pr-0 rtl:pl-3">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                <StatusBadge status={task.status} isOverdue={isOverdue} />
                <PriorityBadge priority={task.priority} />
                {category && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-md font-medium"
                    style={{ backgroundColor: `${category.color}15`, color: category.color }}
                  >
                    {category.name}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {task.title}
              </h2>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Edit Task"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
            {/* Description */}
            {task.description ? (
              <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {task.description}
              </div>
            ) : (
              <p className="text-sm italic text-slate-400 dark:text-slate-500">
                No description provided for this task.
              </p>
            )}

            {/* Time & Parameters Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <div>
                  <span className="block font-medium text-slate-400 dark:text-slate-500">Start</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {task.startAt ? formatDateTime(task.startAt, language, is24h) : 'Not scheduled'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-500" />
                <div>
                  <span className="block font-medium text-slate-400 dark:text-slate-500">Deadline</span>
                  <span
                    className={`font-semibold ${
                      isOverdue
                        ? 'text-rose-600 dark:text-rose-400 font-bold'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {task.dueAt ? formatDateTime(task.dueAt, language, is24h) : 'None'}
                  </span>
                </div>
              </div>

              {task.completedAt && (
                <div className="flex items-center gap-2 col-span-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-wider">
                      Completed At
                    </span>
                    <span className="font-semibold">
                      {formatDateTime(task.completedAt, language, is24h)}
                    </span>
                  </div>
                </div>
              )}

              {task.estimatedDuration && (
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="block font-medium text-slate-400 dark:text-slate-500">
                      Estimated
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {task.estimatedDuration} mins
                    </span>
                  </div>
                </div>
              )}

              {task.recurrence && task.recurrence !== 'NONE' && (
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-cyan-500" />
                  <div>
                    <span className="block font-medium text-slate-400 dark:text-slate-500">
                      Recurrence
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {task.recurrence}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Updates Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {getTranslation(language, 'task_updates')} ({task.updates?.length || 0})
                </h4>
              </div>

              {/* Add update form */}
              <form onSubmit={handleAddUpdate} className="space-y-2">
                <Textarea
                  placeholder={getTranslation(language, 'task_update_placeholder')}
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  rows={2}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    disabled={!updateText.trim()}
                    isLoading={isSubmittingUpdate}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    {getTranslation(language, 'task_add_update')}
                  </Button>
                </div>
              </form>

              {/* Updates List */}
              <div className="space-y-2.5 mt-3">
                {task.updates && task.updates.length > 0 ? (
                  task.updates.map((upd) => (
                    <div
                      key={upd.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-sm"
                    >
                      <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                        {upd.content}
                      </p>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 block">
                        {formatDateTime(upd.createdAt, language, is24h)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs italic text-slate-400 dark:text-slate-500">
                    No progress updates logged yet.
                  </p>
                )}
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                {getTranslation(language, 'task_timeline')}
              </h4>

              <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 dark:border-slate-800 ml-2">
                {task.activity && task.activity.length > 0 ? (
                  task.activity.map((act) => (
                    <div key={act.id} className="relative">
                      <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {act.description}
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {formatDateTime(act.createdAt, language, is24h)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs italic text-slate-400">Created on {formatDate(task.createdAt, language)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 flex items-center justify-between gap-3 shrink-0">
            <Button variant="outline" size="sm" onClick={onClose}>
              {getTranslation(language, 'btn_close')}
            </Button>

            {task.status === 'COMPLETED' ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReopen}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                {getTranslation(language, 'task_reopen')}
              </Button>
            ) : (
              <Button
                variant="success"
                size="sm"
                onClick={() => setIsCompletionModalOpen(true)}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {getTranslation(language, 'task_complete')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <CompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        task={task}
        onSuccess={onClose}
      />
    </>
  );
};
