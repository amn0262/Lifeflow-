import React from 'react';
import { TaskPriority, TaskStatus } from '../../types';
import { Badge } from './Badge';
import { useApp } from '../../store/AppContext';
import { getTranslation } from '../../i18n';
import { AlertCircle, CheckCircle2, Clock, PlayCircle, XCircle } from 'lucide-react';

export const PriorityBadge: React.FC<{ priority: TaskPriority; className?: string }> = ({
  priority,
  className = '',
}) => {
  const { language } = useApp();

  switch (priority) {
    case 'URGENT':
      return (
        <Badge variant="rose" size="sm" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          {getTranslation(language, 'priority_urgent')}
        </Badge>
      );
    case 'HIGH':
      return (
        <Badge variant="amber" size="sm" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {getTranslation(language, 'priority_high')}
        </Badge>
      );
    case 'MEDIUM':
      return (
        <Badge variant="indigo" size="sm" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          {getTranslation(language, 'priority_medium')}
        </Badge>
      );
    case 'LOW':
    default:
      return (
        <Badge variant="slate" size="sm" className={className}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          {getTranslation(language, 'priority_low')}
        </Badge>
      );
  }
};

export const StatusBadge: React.FC<{
  status: TaskStatus;
  isOverdue?: boolean;
  className?: string;
}> = ({ status, isOverdue = false, className = '' }) => {
  const { language } = useApp();

  if (isOverdue && status !== 'COMPLETED') {
    return (
      <Badge variant="rose" size="sm" className={className}>
        <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
        {getTranslation(language, 'stats_overdue')}
      </Badge>
    );
  }

  switch (status) {
    case 'COMPLETED':
      return (
        <Badge variant="emerald" size="sm" className={className}>
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          {getTranslation(language, 'status_completed')}
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge variant="cyan" size="sm" className={className}>
          <PlayCircle className="w-3 h-3 text-cyan-600 dark:text-cyan-400 animate-spin" />
          {getTranslation(language, 'status_in_progress')}
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="slate" size="sm" className={className}>
          <XCircle className="w-3 h-3 text-slate-500" />
          {getTranslation(language, 'status_cancelled')}
        </Badge>
      );
    case 'TODO':
    default:
      return (
        <Badge variant="slate" size="sm" className={className}>
          <Clock className="w-3 h-3 text-slate-500" />
          {getTranslation(language, 'status_todo')}
        </Badge>
      );
  }
};
