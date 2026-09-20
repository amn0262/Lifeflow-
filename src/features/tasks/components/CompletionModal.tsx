import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useApp } from '../../../store/AppContext';
import { getTranslation } from '../../../i18n';
import { Task } from '../../../types';
import { CheckCircle2 } from 'lucide-react';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSuccess?: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onClose,
  task,
  onSuccess,
}) => {
  const { markTaskComplete, language } = useApp();
  const [completeDate, setCompleteDate] = useState('');
  const [completeTime, setCompleteTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setCompleteDate(now.toISOString().split('T')[0]);
      setCompleteTime(now.toTimeString().slice(0, 5));
    }
  }, [isOpen]);

  if (!task) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const completedAt = completeDate && completeTime
        ? new Date(`${completeDate}T${completeTime}:00`).toISOString()
        : new Date().toISOString();

      await markTaskComplete(task.id, completedAt);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTranslation(language, 'task_confirm_complete')}
      description={getTranslation(language, 'task_confirm_complete_desc')}
      maxWidth="md"
    >
      <form onSubmit={handleConfirm} className="space-y-4">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="text-sm font-semibold text-emerald-950 dark:text-emerald-200 leading-snug">
              {task.title}
            </h5>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400 mt-0.5">
              Marking as completed will update your productivity charts and records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Input
            label="Completion Date"
            type="date"
            value={completeDate}
            onChange={(e) => setCompleteDate(e.target.value)}
            required
          />
          <Input
            label="Completion Time"
            type="time"
            value={completeTime}
            onChange={(e) => setCompleteTime(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {getTranslation(language, 'btn_cancel')}
          </Button>
          <Button type="submit" variant="success" size="sm" isLoading={loading}>
            {getTranslation(language, 'task_complete')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
