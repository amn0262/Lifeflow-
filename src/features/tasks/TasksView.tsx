import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { getTranslation } from '../../i18n';
import { isTaskOverdue } from '../../services/analyticsService';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { TaskCard } from './components/TaskCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { NewCategoryModal } from '../categories/NewCategoryModal';
import { Plus, Search, Filter, ArrowUpDown, CheckCircle2, Clock, AlertCircle, FolderPlus } from 'lucide-react';

interface TasksViewProps {
  onOpenQuickAdd: () => void;
  onOpenNewTaskModal: () => void;
  onSelectTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onReopenTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
}

type TabType = 'all' | 'today' | 'upcoming' | 'completed' | 'overdue' | 'archived';
type SortOption = 'deadline' | 'priority' | 'createdAt' | 'title';

export const TasksView: React.FC<TasksViewProps> = ({
  onOpenQuickAdd,
  onOpenNewTaskModal,
  onSelectTask,
  onCompleteTask,
  onReopenTask,
  onEditTask,
}) => {
  const { tasks, categories, language, currentTime, removeTask } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [localSearch, setLocalSearch] = useState('');
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);

  const todayStr = currentTime.toISOString().split('T')[0];

  // Priority ranking for sorting
  const priorityRank: Record<TaskPriority, number> = {
    URGENT: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Archived tab handling
      if (activeTab === 'archived') {
        if (!task.archived) return false;
      } else {
        if (task.archived) return false;
      }

      // Tab filters
      if (activeTab === 'today') {
        const dueDay = task.dueAt ? task.dueAt.split('T')[0] : null;
        const startDay = task.startAt ? task.startAt.split('T')[0] : null;
        if (dueDay !== todayStr && startDay !== todayStr) return false;
      } else if (activeTab === 'upcoming') {
        if (!task.dueAt) return false;
        const dueDay = task.dueAt.split('T')[0];
        if (dueDay <= todayStr || task.status === 'COMPLETED') return false;
      } else if (activeTab === 'completed') {
        if (task.status !== 'COMPLETED') return false;
      } else if (activeTab === 'overdue') {
        if (!isTaskOverdue(task, currentTime)) return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && task.categoryId !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'ALL' && task.priority !== selectedPriority) {
        return false;
      }

      // Local search
      if (localSearch.trim()) {
        const q = localSearch.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTag) return false;
      }

      return true;
    });
  }, [
    tasks,
    activeTab,
    selectedCategory,
    selectedPriority,
    localSearch,
    todayStr,
    currentTime,
  ]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'deadline') {
        const timeA = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
        const timeB = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
        comparison = timeA - timeB;
      } else if (sortBy === 'priority') {
        comparison = priorityRank[b.priority] - priorityRank[a.priority];
      } else if (sortBy === 'createdAt') {
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredTasks, sortBy, sortOrder]);

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'all', label: getTranslation(language, 'task_tab_all'), count: tasks.filter((t) => !t.archived).length },
    {
      id: 'today',
      label: getTranslation(language, 'task_tab_today'),
      count: tasks.filter(
        (t) =>
          !t.archived &&
          (t.dueAt?.split('T')[0] === todayStr || t.startAt?.split('T')[0] === todayStr)
      ).length,
    },
    {
      id: 'upcoming',
      label: getTranslation(language, 'task_tab_upcoming'),
      count: tasks.filter(
        (t) => !t.archived && t.status !== 'COMPLETED' && t.dueAt && t.dueAt.split('T')[0] > todayStr
      ).length,
    },
    {
      id: 'completed',
      label: getTranslation(language, 'task_tab_completed'),
      count: tasks.filter((t) => !t.archived && t.status === 'COMPLETED').length,
    },
    {
      id: 'overdue',
      label: getTranslation(language, 'task_tab_overdue'),
      count: tasks.filter((t) => !t.archived && isTaskOverdue(t, currentTime)).length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {getTranslation(language, 'nav_tasks')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage, schedule, track and complete all your active responsibilities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenQuickAdd}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {getTranslation(language, 'task_quick_add')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenNewTaskModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {getTranslation(language, 'task_new')}
          </Button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by title, description or #tag..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-2 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Add Category Quick Button */}
          <button
            type="button"
            onClick={() => setIsNewCategoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 text-xs font-medium transition-colors cursor-pointer shrink-0"
            title={language === 'ar' ? 'إضافة تصنيف جديد' : 'Add New Category'}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تصنيف +' : 'New Category +'}</span>
          </button>

          {/* Priority Dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-2 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="URGENT">Urgent Priority</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-2 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="deadline">Sort: Deadline</option>
            <option value="priority">Sort: Priority</option>
            <option value="createdAt">Sort: Created Date</option>
            <option value="title">Sort: Title</option>
          </select>

          {/* Sort direction toggle */}
          <button
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List Grid */}
      {sortedTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sortedTasks.map((task) => (
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
          description="No tasks matched the selected tab, category, or search filters."
          actionText={getTranslation(language, 'task_new')}
          onAction={onOpenNewTaskModal}
        />
      )}

      {/* Category Creation Modal */}
      <NewCategoryModal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        onCategoryCreated={(newCat) => {
          setSelectedCategory(newCat.id);
        }}
      />
    </div>
  );
};
