import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useApp } from '../../../store/AppContext';
import { getTranslation } from '../../../i18n';
import { TaskPriority, TaskRecurrence } from '../../../types';
import { NewCategoryModal } from '../../categories/NewCategoryModal';
import { Plus, X, Calendar } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullForm?: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onOpenFullForm,
}) => {
  const { addNewTask, categories, language } = useApp();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('18:00');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-work');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);

  const setTodayDate = () => {
    setDueDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(language === 'ar' ? 'اسم المهمة هو الحقل الإجباري الوحيد' : 'Please provide a title for the task');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const dueAt = dueDate && dueTime ? new Date(`${dueDate}T${dueTime}:00`).toISOString() : undefined;
      const startAt = dueDate ? new Date(`${dueDate}T09:00:00`).toISOString() : undefined;

      await addNewTask({
        title: title.trim(),
        categoryId: categoryId || (categories[0]?.id ?? 'cat-work'),
        priority,
        status: 'TODO',
        startAt,
        dueAt,
        recurrence: 'NONE' as TaskRecurrence,
        tags: [],
        reminderEnabled: false,
        archived: false,
      });

      setTitle('');
      setDueDate('');
      onClose();
    } catch (err) {
      setError(language === 'ar' ? 'فشل إنشاء المهمة' : 'Failed to create task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));
  const priorityOptions = [
    { label: getTranslation(language, 'priority_low'), value: 'LOW' },
    { label: getTranslation(language, 'priority_medium'), value: 'MEDIUM' },
    { label: getTranslation(language, 'priority_high'), value: 'HIGH' },
    { label: getTranslation(language, 'priority_urgent'), value: 'URGENT' },
  ];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={getTranslation(language, 'task_quick_add')}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title - The ONLY required field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <span>{getTranslation(language, 'task_title')}</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                {language === 'ar' ? 'الحقل الإجباري الوحيد' : 'Only required field'}
              </span>
            </div>
            <Input
              placeholder={getTranslation(language, 'task_title_placeholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              error={error}
            />
          </div>

          {/* Due Date & Time - Completely Optional */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {language === 'ar' ? 'الموعد النهائي (اختياري)' : 'Due Date & Time (Optional)'}
              </label>
              <div className="flex items-center gap-1.5">
                {!dueDate ? (
                  <button
                    type="button"
                    onClick={setTodayDate}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>{language === 'ar' ? 'اليوم' : 'Today'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="text-[11px] text-rose-500 hover:underline inline-flex items-center gap-0.5"
                  >
                    <X className="w-3 h-3" />
                    <span>{language === 'ar' ? 'بدون موعد' : 'No date'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 text-slate-800 dark:text-slate-100"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <input
                type="time"
                disabled={!dueDate}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 text-slate-800 dark:text-slate-100 disabled:opacity-40"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {getTranslation(language, 'task_category')}
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewCategoryModalOpen(true)}
                  className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>{language === 'ar' ? 'تصنيف جديد' : 'New'}</span>
                </button>
              </div>
              <Select
                options={categoryOptions}
                value={categoryId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryId(e.target.value)}
              />
            </div>

            <Select
              label={getTranslation(language, 'task_priority')}
              options={priorityOptions}
              value={priority}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setPriority(e.target.value as TaskPriority)
              }
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            {onOpenFullForm ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullForm();
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {language === 'ar' ? 'النموذج المفصل الكامل ←' : 'Full Detailed Form →'}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                {getTranslation(language, 'btn_cancel')}
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={loading}>
                {getTranslation(language, 'task_create_btn')}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Embedded New Category Modal */}
      <NewCategoryModal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        onCategoryCreated={(newCat) => {
          setCategoryId(newCat.id);
        }}
      />
    </>
  );
};
