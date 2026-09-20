import { TaskPriority, TaskStatus } from '../../types';

export interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export interface StatusBadgeProps {
  status: TaskStatus;
  isOverdue?: boolean;
  className?: string;
}
