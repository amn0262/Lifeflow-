import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input, Select } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useApp } from '../../../store/AppContext';
import { getTranslation } from '../../../i18n';
import { TaskPriority, TaskRecurrence } from '../../../types';

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
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('18:00');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-work');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the task');
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
      onClose();
    } catch (err) {
      setError('Failed to create task');
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTranslation(language, 'task_quick_add')}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={getTranslation(language, 'task_title')}
          placeholder={getTranslation(language, 'task_title_placeholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          error={error}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Input
            label="Due Time"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label={getTranslation(language, 'task_category')}
            options={categoryOptions}
            value={categoryId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryId(e.target.value)}
          />
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
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Detailed Form →
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
  );
};
