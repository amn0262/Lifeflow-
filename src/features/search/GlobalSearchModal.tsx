import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { getTranslation } from '../../i18n';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { isTaskOverdue } from '../../services/analyticsService';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusPriorityBadges';
import { Search, X, ArrowRight, Filter, Calendar } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (task: Task) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTask,
}) => {
  const { tasks, categories, language, currentTime } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      // Query search in title, description, tags
      if (query) {
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = task.description?.toLowerCase().includes(query) || false;
        const tagMatch = task.tags?.some((t) => t.toLowerCase().includes(query)) || false;
        if (!titleMatch && !descMatch && !tagMatch) return false;
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'OVERDUE') {
          if (!isTaskOverdue(task, currentTime)) return false;
        } else if (task.status !== statusFilter) {
          return false;
        }
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && task.categoryId !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, currentTime]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Search Dialog Box */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200/80 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-sm sm:text-base focus:outline-none"
            placeholder={getTranslation(language, 'search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC
          </span>
        </div>

        {/* Filter Badges Row */}
        <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">Status: All</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">Priority: All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">Category: All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <span className="ml-auto text-[11px] text-slate-400 whitespace-nowrap">
            {filteredTasks.length} found
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const isOverdue = isTaskOverdue(task, currentTime);
              const category = categories.find((c) => c.id === task.categoryId);

              return (
                <div
                  key={task.id}
                  onClick={() => {
                    onSelectTask(task);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={task.status} isOverdue={isOverdue} />
                      <PriorityBadge priority={task.priority} />
                      {category && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            backgroundColor: `${category.color}15`,
                            color: category.color,
                          }}
                        >
                          {category.name}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
              No tasks matched your search or filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
