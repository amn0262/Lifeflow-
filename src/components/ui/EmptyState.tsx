import React from 'react';
import { Button } from './Button';
import { Sparkles } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
        {icon || <Sparkles className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}
    />
  );
};
