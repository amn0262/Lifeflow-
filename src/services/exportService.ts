import { Category, Task } from '../types';

export function triggerPrint(): void {
  window.print();
}

export function downloadCSV(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTasksToCSV(tasks: Task[], categories: Category[]): void {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const headers = [
    'ID',
    'Title',
    'Status',
    'Priority',
    'Category',
    'Start Date',
    'Due Date',
    'Completed Date',
    'Estimated Minutes',
    'Tags',
    'Created At',
  ];

  const rows = tasks.map((t) => [
    `"${t.id}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.status}"`,
    `"${t.priority}"`,
    `"${catMap.get(t.categoryId) || 'Uncategorized'}"`,
    `"${t.startAt || ''}"`,
    `"${t.dueAt || ''}"`,
    `"${t.completedAt || ''}"`,
    t.estimatedDuration || 0,
    `"${(t.tags || []).join(', ')}"`,
    `"${t.createdAt}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCSV(csv, `lifeflow_tasks_export_${new Date().toISOString().split('T')[0]}.csv`);
}
