import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input, Textarea, Select } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useApp } from '../../../store/AppContext';
import { getTranslation } from '../../../i18n';
import { Task, TaskPriority, TaskRecurrence, TaskStatus } from '../../../types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
}) => {
  const { addNewTask, modifyTask, categories, language } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('18:00');
  const [estimatedDuration, setEstimatedDuration] = useState('60');
  const [recurrence, setRecurrence] = useState<TaskRecurrence>('NONE');
  const [tagsInput, setTagsInput] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategoryId(taskToEdit.categoryId);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setEstimatedDuration(String(taskToEdit.estimatedDuration || 60));
      setRecurrence(taskToEdit.recurrence || 'NONE');
      setTagsInput((taskToEdit.tags || []).join(', '));
      setReminderEnabled(taskToEdit.reminderEnabled);

      if (taskToEdit.startAt) {
        const s = new Date(taskToEdit.startAt);
        setStartDate(s.toISOString().split('T')[0]);
        setStartTime(s.toTimeString().slice(0, 5));
      } else {
        setStartDate('');
        setStartTime('09:00');
      }

      if (taskToEdit.dueAt) {
        const d = new Date(taskToEdit.dueAt);
        setDueDate(d.toISOString().split('T')[0]);
        setDueTime(d.toTimeString().slice(0, 5));
      } else {
        setDueDate('');
        setDueTime('18:00');
      }
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setCategoryId(categories[0]?.id || 'cat-work');
      setPriority('MEDIUM');
      setStatus('TODO');
      setStartDate(todayStr);
      setStartTime('09:00');
      setDueDate(todayStr);
      setDueTime('18:00');
      setEstimatedDuration('60');
      setRecurrence('NONE');
      setTagsInput('');
      setReminderEnabled(false);
    }
    setErrors({});
  }, [taskToEdit, isOpen, categories]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Title is required';
    }
    if (startDate && dueDate) {
      const start = new Date(`${startDate}T${startTime}`);
      const due = new Date(`${dueDate}T${dueTime}`);
      if (due < start) {
        errs.dueDate = 'Deadline cannot be earlier than start time';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const startAt = startDate ? new Date(`${startDate}T${startTime}:00`).toISOString() : undefined;
      const dueAt = dueDate ? new Date(`${dueDate}T${dueTime}:00`).toISOString() : undefined;

      // Parse tags
      const formattedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => (t.startsWith('#') ? t : `#${t}`));

      if (taskToEdit) {
        await modifyTask(
          taskToEdit.id,
          {
            title: title.trim(),
            description: description.trim() || undefined,
            categoryId: categoryId || categories[0]?.id || 'cat-work',
            priority,
            status,
            startAt,
            dueAt,
            estimatedDuration: Number(estimatedDuration) || 0,
            recurrence,
            tags: formattedTags,
            reminderEnabled,
          },
          'Task details updated'
        );
      } else {
        await addNewTask({
          title: title.trim(),
          description: description.trim() || undefined,
          categoryId: categoryId || categories[0]?.id || 'cat-work',
          priority,
          status,
          startAt,
          dueAt,
          estimatedDuration: Number(estimatedDuration) || 0,
          recurrence,
          tags: formattedTags,
          reminderEnabled,
          archived: false,
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setErrors({ form: 'Failed to save task. Please check your inputs.' });
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
  const statusOptions = [
    { label: getTranslation(language, 'status_todo'), value: 'TODO' },
    { label: getTranslation(language, 'status_in_progress'), value: 'IN_PROGRESS' },
    { label: getTranslation(language, 'status_completed'), value: 'COMPLETED' },
    { label: getTranslation(language, 'status_cancelled'), value: 'CANCELLED' },
  ];
  const recurrenceOptions = [
    { label: getTranslation(language, 'rec_none'), value: 'NONE' },
    { label: getTranslation(language, 'rec_daily'), value: 'DAILY' },
    { label: getTranslation(language, 'rec_weekly'), value: 'WEEKLY' },
    { label: getTranslation(language, 'rec_monthly'), value: 'MONTHLY' },
    { label: getTranslation(language, 'rec_yearly'), value: 'YEARLY' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? getTranslation(language, 'task_edit') : getTranslation(language, 'task_new')}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-300">
            {errors.form}
          </div>
        )}

        <Input
          label={getTranslation(language, 'task_title')}
          placeholder={getTranslation(language, 'task_title_placeholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        <Textarea
          label={getTranslation(language, 'task_description')}
          placeholder={getTranslation(language, 'task_description_placeholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label={getTranslation(language, 'task_category')}
            options={categoryOptions}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          />
          <Select
            label={getTranslation(language, 'task_priority')}
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          />
          <Select
            label={getTranslation(language, 'task_status')}
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          />
        </div>

        {/* Schedule grid */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Start Schedule
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 text-slate-800 dark:text-slate-100"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="time"
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 text-slate-800 dark:text-slate-100"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Deadline (Due)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 text-slate-800 dark:text-slate-100"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                <input
                  type="time"
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 text-slate-800 dark:text-slate-100"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                />
              </div>
              {errors.dueDate && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.dueDate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Input
              label={getTranslation(language, 'task_estimated_duration')}
              type="number"
              min="0"
              step="5"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
            />
            <Select
              label={getTranslation(language, 'task_recurrence')}
              options={recurrenceOptions}
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as TaskRecurrence)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={getTranslation(language, 'task_tags')}
            placeholder="e.g. work, design, urgent"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            helperText="Tags will automatically be formatted with #"
          />

          <div className="flex items-center h-full pt-6">
            <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
              />
              <span>{getTranslation(language, 'task_reminder')}</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            {getTranslation(language, 'btn_cancel')}
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {taskToEdit ? getTranslation(language, 'task_save') : getTranslation(language, 'task_create_btn')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
