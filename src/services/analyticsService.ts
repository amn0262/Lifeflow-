import { Category, DailyStats, ProductivityStats, Task } from '../types';

export function isTaskOverdue(task: Task, referenceDate: Date = new Date()): boolean {
  if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
    return false;
  }
  if (!task.dueAt) {
    return false;
  }
  const dueDate = new Date(task.dueAt);
  return !isNaN(dueDate.getTime()) && dueDate < referenceDate;
}

export function getDailyStats(tasks: Task[], date: Date = new Date()): DailyStats {
  const dateStr = date.toISOString().split('T')[0];

  // Tasks scheduled for today or due today
  const activeToday = tasks.filter((t) => {
    const dueDay = t.dueAt ? t.dueAt.split('T')[0] : null;
    const startDay = t.startAt ? t.startAt.split('T')[0] : null;
    const completedDay = t.completedAt ? t.completedAt.split('T')[0] : null;

    return dueDay === dateStr || startDay === dateStr || completedDay === dateStr;
  });

  const total = activeToday.length;
  // Completed on THIS day (using completedAt strictly!)
  const completed = tasks.filter((t) => {
    if (t.status !== 'COMPLETED' || !t.completedAt) return false;
    return t.completedAt.split('T')[0] === dateStr;
  }).length;

  const inProgress = activeToday.filter((t) => t.status === 'IN_PROGRESS').length;
  const pending = activeToday.filter((t) => t.status === 'TODO').length;
  const overdue = tasks.filter((t) => isTaskOverdue(t, date)).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    date: dateStr,
    total,
    completed,
    inProgress,
    pending,
    overdue,
    completionRate,
  };
}

export function calculateProductivityStats(
  tasks: Task[],
  categories: Category[]
): ProductivityStats {
  const now = new Date();
  const nonArchived = tasks.filter((t) => !t.archived);

  const totalTasks = nonArchived.length;
  const completedTasks = nonArchived.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTasks = nonArchived.filter((t) => t.status === 'IN_PROGRESS').length;
  const pendingTasks = nonArchived.filter((t) => t.status === 'TODO').length;
  const overdueTasks = nonArchived.filter((t) => isTaskOverdue(t, now)).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Average tasks per day across last 14 days
  const dailyCompletionsMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().split('T')[0];
    dailyCompletionsMap[key] = 0;
  }

  // Count completions on completedAt day
  nonArchived.forEach((t) => {
    if (t.status === 'COMPLETED' && t.completedAt) {
      const day = t.completedAt.split('T')[0];
      if (dailyCompletionsMap[day] !== undefined) {
        dailyCompletionsMap[day] += 1;
      }
    }
  });

  const dailyCompletions = Object.entries(dailyCompletionsMap).map(([date, count]) => ({
    date,
    count,
  }));

  const totalRecentCompletions = dailyCompletions.reduce((acc, curr) => acc + curr.count, 0);
  const avgTasksPerDay = Math.round((totalRecentCompletions / 14) * 10) / 10;

  // Category breakdown
  const catCountMap: Record<string, number> = {};
  categories.forEach((c) => {
    catCountMap[c.id] = 0;
  });

  nonArchived.forEach((t) => {
    if (catCountMap[t.categoryId] !== undefined) {
      catCountMap[t.categoryId] += 1;
    }
  });

  const categoryBreakdown = categories.map((c) => ({
    name: c.name,
    count: catCountMap[c.id] || 0,
    color: c.color,
  }));

  // Weekly Trend: past 6 weeks
  const weeklyTrend = [];
  for (let w = 5; w >= 0; w--) {
    const startOfWeek = new Date(now.getTime() - (w * 7 + 6) * 86400000);
    const endOfWeek = new Date(now.getTime() - w * 7 * 86400000);
    const weekLabel = `W-${5 - w}`;

    const weekCompleted = nonArchived.filter((t) => {
      if (t.status !== 'COMPLETED' || !t.completedAt) return false;
      const comp = new Date(t.completedAt);
      return comp >= startOfWeek && comp <= endOfWeek;
    }).length;

    const weekTotal = nonArchived.filter((t) => {
      const created = new Date(t.createdAt);
      return created >= startOfWeek && created <= endOfWeek;
    }).length;

    weeklyTrend.push({
      week: weekLabel,
      completed: weekCompleted,
      total: Math.max(weekTotal, weekCompleted),
    });
  }

  // Yearly Productivity Heatmap (365 days) strictly based on completedAt
  const yearHeatmap = [];
  for (let dayOffset = 364; dayOffset >= 0; dayOffset--) {
    const cellDate = new Date(now.getTime() - dayOffset * 86400000);
    const dateStr = cellDate.toISOString().split('T')[0];

    const completionsOnDate = nonArchived.filter((t) => {
      if (t.status !== 'COMPLETED' || !t.completedAt) return false;
      return t.completedAt.split('T')[0] === dateStr;
    }).length;

    let level = 0;
    if (completionsOnDate >= 4) level = 4;
    else if (completionsOnDate === 3) level = 3;
    else if (completionsOnDate === 2) level = 2;
    else if (completionsOnDate === 1) level = 1;

    yearHeatmap.push({
      date: dateStr,
      count: completionsOnDate,
      level,
    });
  }

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    overdueTasks,
    completionRate,
    avgTasksPerDay,
    categoryBreakdown,
    weeklyTrend,
    dailyCompletions,
    yearHeatmap,
  };
}

export function getWeeklyStats(tasks: Task[]) {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekTasks = tasks.filter((t) => {
    const d = new Date(t.dueAt || t.createdAt);
    return d >= startOfWeek;
  });

  const completed = thisWeekTasks.filter((t) => t.status === 'COMPLETED').length;
  const rate = thisWeekTasks.length > 0 ? Math.round((completed / thisWeekTasks.length) * 100) : 0;

  return {
    total: thisWeekTasks.length,
    completed,
    rate,
  };
}

export function getMonthlyStats(tasks: Task[], year: number, monthIndex: number) {
  const monthTasks = tasks.filter((t) => {
    const dateToCheck = t.completedAt ? new Date(t.completedAt) : new Date(t.dueAt || t.createdAt);
    return dateToCheck.getFullYear() === year && dateToCheck.getMonth() === monthIndex;
  });

  const completed = monthTasks.filter((t) => t.status === 'COMPLETED').length;
  const overdue = monthTasks.filter((t) => isTaskOverdue(t)).length;
  const rate = monthTasks.length > 0 ? Math.round((completed / monthTasks.length) * 100) : 0;

  return {
    total: monthTasks.length,
    completed,
    overdue,
    rate,
  };
}
