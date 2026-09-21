import { Category, Task, UserProfile } from '../../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-work',
    name: 'Work & Projects',
    icon: 'Briefcase',
    color: '#3b82f6', // blue
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'cat-personal',
    name: 'Personal & Life',
    icon: 'User',
    color: '#10b981', // emerald
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'cat-design',
    name: 'Design & Creative',
    icon: 'Palette',
    color: '#8b5cf6', // purple
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'cat-health',
    name: 'Health & Fitness',
    icon: 'Heart',
    color: '#f43f5e', // rose
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'cat-finance',
    name: 'Finance & Wealth',
    icon: 'DollarSign',
    color: '#f59e0b', // amber
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'cat-learning',
    name: 'Learning & Books',
    icon: 'BookOpen',
    color: '#06b6d4', // cyan
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
];

export const DEMO_USER_PROFILE: UserProfile = {
  id: 'demo-user-123',
  name: 'Aymen Bakkour',
  email: 'aymenbakkour@gmail.com',
  dateOfBirth: '1995-09-20', // today matches or easily observable!
  language: 'en',
  theme: 'system',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  timeFormat: '24h',
  temperatureUnit: 'celsius',
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-09-20T10:00:00Z',
};

// Helper for generating dynamic dates relative to current date (2026-09-20)
const now = new Date();
const d = (daysOffset: number, hoursOffset: number = 0) => {
  const target = new Date(now.getTime() + daysOffset * 86400000 + hoursOffset * 3600000);
  return target.toISOString();
};

export const INITIAL_DEMO_TASKS: Task[] = [
  // 1. Current focus task (In Progress, right now)
  {
    id: 'task-01',
    title: 'Finalize LifeFlow Design Architecture',
    description: 'Refine responsive layouts, color tokens, and Arabic typography for the executive dashboard.',
    categoryId: 'cat-design',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: d(-2, 0),
    updatedAt: d(0, -1),
    startAt: d(0, -2),
    dueAt: d(0, 4),
    estimatedDuration: 120,
    recurrence: 'NONE',
    tags: ['#design', '#urgent'],
    reminderEnabled: true,
    reminderAt: d(0, 3),
    archived: false,
    updates: [
      {
        id: 'upd-01',
        taskId: 'task-01',
        content: 'Completed desktop navigation and calendar view wireframes.',
        createdAt: d(-1, -4),
        updatedAt: d(-1, -4),
      },
      {
        id: 'upd-02',
        taskId: 'task-01',
        content: 'Reviewing accessibility contrast ratios and RTL layout mirroring.',
        createdAt: d(0, -1),
        updatedAt: d(0, -1),
      },
    ],
    activity: [
      {
        id: 'act-01',
        type: 'CREATED',
        description: 'Task created',
        createdAt: d(-2, 0),
      },
      {
        id: 'act-02',
        type: 'STARTED',
        description: 'Status changed to In Progress',
        createdAt: d(0, -2),
      },
    ],
  },

  // 2. Today's task - TODO
  {
    id: 'task-02',
    title: 'Review Q3 Financial Ledger & Budget',
    description: 'Verify quarterly operational subscriptions, server costs, and revenue margins.',
    categoryId: 'cat-finance',
    priority: 'HIGH',
    status: 'TODO',
    createdAt: d(-1, 0),
    updatedAt: d(-1, 0),
    startAt: d(0, 2),
    dueAt: d(0, 6),
    estimatedDuration: 60,
    recurrence: 'MONTHLY',
    tags: ['#finance', '#work'],
    reminderEnabled: true,
    reminderAt: d(0, 1),
    archived: false,
    activity: [
      { id: 'act-03', type: 'CREATED', description: 'Task created', createdAt: d(-1, 0) },
    ],
  },

  // 3. Completed Today
  {
    id: 'task-03',
    title: 'Morning 5km Cadence Run',
    description: 'Target pace 5:10/km with progressive sprint finish.',
    categoryId: 'cat-health',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    createdAt: d(-1, 0),
    updatedAt: d(0, -4),
    startAt: d(0, -6),
    dueAt: d(0, -4),
    completedAt: d(0, -4),
    estimatedDuration: 45,
    recurrence: 'DAILY',
    tags: ['#health', '#personal'],
    reminderEnabled: false,
    archived: false,
    updates: [
      {
        id: 'upd-03',
        taskId: 'task-03',
        content: 'Completed in 24m 42s. Felt energetic and well-paced.',
        createdAt: d(0, -4),
        updatedAt: d(0, -4),
      },
    ],
    activity: [
      { id: 'act-04', type: 'CREATED', description: 'Task created', createdAt: d(-1, 0) },
      { id: 'act-05', type: 'STARTED', description: 'Run commenced', createdAt: d(0, -5) },
      { id: 'act-06', type: 'COMPLETED', description: 'Completed at 08:30', createdAt: d(0, -4) },
    ],
  },

  // 4. Overdue Task 1
  {
    id: 'task-04',
    title: 'Submit Tax Audit Documentation',
    description: 'Provide notarized accountant receipts and export bank declarations.',
    categoryId: 'cat-finance',
    priority: 'URGENT',
    status: 'TODO',
    createdAt: d(-5, 0),
    updatedAt: d(-2, 0),
    startAt: d(-3, 0),
    dueAt: d(-1, 0), // yesterday (overdue!)
    estimatedDuration: 90,
    recurrence: 'YEARLY',
    tags: ['#finance', '#urgent'],
    reminderEnabled: true,
    reminderAt: d(-2, 0),
    archived: false,
    activity: [
      { id: 'act-07', type: 'CREATED', description: 'Task created', createdAt: d(-5, 0) },
    ],
  },

  // 5. Overdue Task 2
  {
    id: 'task-05',
    title: 'Send Revised Client Contract',
    description: 'Update Section 4 intellectual property terms and send via electronic signature.',
    categoryId: 'cat-work',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: d(-4, 0),
    updatedAt: d(-2, 0),
    startAt: d(-3, 0),
    dueAt: d(-2, 0), // 2 days ago overdue
    estimatedDuration: 40,
    recurrence: 'NONE',
    tags: ['#work', '#urgent'],
    reminderEnabled: false,
    archived: false,
    updates: [
      {
        id: 'upd-04',
        taskId: 'task-05',
        content: 'Legal counsel reviewed clauses. Awaiting client confirmation.',
        createdAt: d(-2, 0),
        updatedAt: d(-2, 0),
      },
    ],
    activity: [
      { id: 'act-08', type: 'CREATED', description: 'Task created', createdAt: d(-4, 0) },
      { id: 'act-09', type: 'STARTED', description: 'In progress', createdAt: d(-3, 0) },
    ],
  },

  // 6. Upcoming Tomorrow
  {
    id: 'task-06',
    title: 'Sprint Planning & Backlog Grooming',
    description: 'Prioritize upcoming feature epics and assign sprint story points.',
    categoryId: 'cat-work',
    priority: 'MEDIUM',
    status: 'TODO',
    createdAt: d(-1, 0),
    updatedAt: d(-1, 0),
    startAt: d(1, 1),
    dueAt: d(1, 3),
    estimatedDuration: 90,
    recurrence: 'WEEKLY',
    tags: ['#work'],
    reminderEnabled: true,
    reminderAt: d(1, 0),
    archived: false,
    activity: [
      { id: 'act-10', type: 'CREATED', description: 'Task created', createdAt: d(-1, 0) },
    ],
  },

  // 7. Upcoming in 2 days
  {
    id: 'task-07',
    title: 'Read Chapters 7-9 of System Design Primer',
    description: 'Focus on distributed caching, write-through vs write-back strategies.',
    categoryId: 'cat-learning',
    priority: 'LOW',
    status: 'TODO',
    createdAt: d(-1, 0),
    updatedAt: d(-1, 0),
    startAt: d(2, 2),
    dueAt: d(2, 5),
    estimatedDuration: 60,
    recurrence: 'WEEKLY',
    tags: ['#learning'],
    reminderEnabled: false,
    archived: false,
    activity: [
      { id: 'act-11', type: 'CREATED', description: 'Task created', createdAt: d(-1, 0) },
    ],
  },

  // 8. Upcoming in 3 days
  {
    id: 'task-08',
    title: 'Doctor Annual Health Checkup',
    description: 'Routine blood panel, vision exam, and preventative screening.',
    categoryId: 'cat-health',
    priority: 'HIGH',
    status: 'TODO',
    createdAt: d(-3, 0),
    updatedAt: d(-3, 0),
    startAt: d(3, 1),
    dueAt: d(3, 3),
    estimatedDuration: 75,
    recurrence: 'YEARLY',
    tags: ['#health', '#personal'],
    reminderEnabled: true,
    reminderAt: d(2, 18),
    archived: false,
    activity: [
      { id: 'act-12', type: 'CREATED', description: 'Task created', createdAt: d(-3, 0) },
    ],
  },

  // 9. Completed 1 day ago
  {
    id: 'task-09',
    title: 'Deploy Firebase Cloud Security Rules',
    description: 'Ensure user document isolation and subcollection token verification.',
    categoryId: 'cat-work',
    priority: 'URGENT',
    status: 'COMPLETED',
    createdAt: d(-3, 0),
    updatedAt: d(-1, 0),
    startAt: d(-2, 0),
    dueAt: d(-1, 0),
    completedAt: d(-1, 0),
    estimatedDuration: 45,
    recurrence: 'NONE',
    tags: ['#work', '#urgent'],
    reminderEnabled: false,
    archived: false,
    updates: [
      {
        id: 'upd-05',
        taskId: 'task-09',
        content: 'firestore.rules verified and automated unit tests passing.',
        createdAt: d(-1, 0),
        updatedAt: d(-1, 0),
      },
    ],
    activity: [
      { id: 'act-13', type: 'CREATED', description: 'Task created', createdAt: d(-3, 0) },
      { id: 'act-14', type: 'COMPLETED', description: 'Rules verified and deployed', createdAt: d(-1, 0) },
    ],
  },

  // 10. Completed 2 days ago
  {
    id: 'task-10',
    title: 'Design System Color Palette Harmonization',
    description: 'Curate high-contrast tokens for dark mode and light mode across all cards.',
    categoryId: 'cat-design',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    createdAt: d(-4, 0),
    updatedAt: d(-2, 0),
    startAt: d(-3, 0),
    dueAt: d(-2, 0),
    completedAt: d(-2, 0),
    estimatedDuration: 90,
    recurrence: 'NONE',
    tags: ['#design'],
    reminderEnabled: false,
    archived: false,
    activity: [
      { id: 'act-15', type: 'CREATED', description: 'Task created', createdAt: d(-4, 0) },
      { id: 'act-16', type: 'COMPLETED', description: 'Approved and merged', createdAt: d(-2, 0) },
    ],
  },

  // 11. Completed 3 days ago
  {
    id: 'task-11',
    title: 'Prepare Monthly Investment Rebalancing',
    description: 'Allocate indexed portfolio contributions into low-fee ETF baskets.',
    categoryId: 'cat-finance',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    createdAt: d(-5, 0),
    updatedAt: d(-3, 0),
    startAt: d(-4, 0),
    dueAt: d(-3, 0),
    completedAt: d(-3, 0),
    estimatedDuration: 30,
    recurrence: 'MONTHLY',
    tags: ['#finance'],
    reminderEnabled: false,
    archived: false,
    activity: [
      { id: 'act-17', type: 'CREATED', description: 'Task created', createdAt: d(-5, 0) },
      { id: 'act-18', type: 'COMPLETED', description: 'Portfolio allocated', createdAt: d(-3, 0) },
    ],
  },

  // 12. Completed 4 days ago
  {
    id: 'task-12',
    title: 'Arabic Font Pairing Research',
    description: 'Benchmark Tajawal vs IBM Plex Sans Arabic for crisp legibility in dense dashboards.',
    categoryId: 'cat-design',
    priority: 'LOW',
    status: 'COMPLETED',
    createdAt: d(-6, 0),
    updatedAt: d(-4, 0),
    startAt: d(-5, 0),
    dueAt: d(-4, 0),
    completedAt: d(-4, 0),
    estimatedDuration: 40,
    recurrence: 'NONE',
    tags: ['#design'],
    reminderEnabled: false,
    archived: false,
    activity: [
      { id: 'act-19', type: 'CREATED', description: 'Task created', createdAt: d(-6, 0) },
      { id: 'act-20', type: 'COMPLETED', description: 'Selected Tajawal for elegant numerals and headers', createdAt: d(-4, 0) },
    ],
  },

  // 13. Completed 5 days ago
  {
    id: 'task-13',
    title: 'Weekly Meal Prep & Grocery Order',
    description: 'Source organic produce, proteins, and healthy whole foods for the week.',
    categoryId: 'cat-health',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    createdAt: d(-7, 0),
    updatedAt: d(-5, 0),
    startAt: d(-6, 0),
    dueAt: d(-5, 0),
    completedAt: d(-5, 0),
    estimatedDuration: 60,
    recurrence: 'WEEKLY',
    tags: ['#health', '#personal'],
    reminderEnabled: false,
    archived: false,
    activity: [
      { id: 'act-21', type: 'CREATED', description: 'Task created', createdAt: d(-7, 0) },
      { id: 'act-22', type: 'COMPLETED', description: 'Stocked and prepped', createdAt: d(-5, 0) },
    ],
  },

  // 14. Completed 6 days ago
  {
    id: 'task-14',
    title: 'Audit Web Core Vitals & Bundle Size',
    description: 'Ensure LCP < 1.2s, zero layout shift, and clean code splitting.',
    categoryId: 'cat-work',
    priority: 'HIGH',
    status: 'COMPLETED',
    createdAt: d(-8, 0),
    updatedAt: d(-6, 0),
    startAt: d(-7, 0),
    dueAt: d(-6, 0),
    completedAt: d(-6, 0),
    estimatedDuration: 75,
    recurrence: 'MONTHLY',
    tags: ['#work'],
    reminderEnabled: false,
    archived: false,
    activity: [
      { id: 'act-23', type: 'CREATED', description: 'Task created', createdAt: d(-8, 0) },
      { id: 'act-24', type: 'COMPLETED', description: '99/100 Lighthouse score achieved', createdAt: d(-6, 0) },
    ],
  },

  // 15. Completed 7 days ago
  {
    id: 'task-15',
    title: 'Complete Deep Work Session on State Engine',
    description: 'Draft single-source of truth state schema with reactive synchronization.',
    categoryId: 'cat-work',
    priority: 'HIGH',
    status: 'COMPLETED',
    createdAt: d(-9, 0),
    updatedAt: d(-7, 0),
    startAt: d(-8, 0),
    dueAt: d(-7, 0),
    completedAt: d(-7, 0),
    estimatedDuration: 180,
    recurrence: 'NONE',
    tags: ['#work'],
    reminderEnabled: false,
    archived: false,
    activity: [
      { id: 'act-25', type: 'CREATED', description: 'Task created', createdAt: d(-9, 0) },
      { id: 'act-26', type: 'COMPLETED', description: 'Architected and documented', createdAt: d(-7, 0) },
    ],
  },

  // 16. In Progress Task
  {
    id: 'task-16',
    title: 'PWA Service Worker & Offline Sync Integration',
    description: 'Configure cache strategies, background sync listeners, and app manifest.',
    categoryId: 'cat-work',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdAt: d(-2, 0),
    updatedAt: d(0, -2),
    startAt: d(-1, 0),
    dueAt: d(1, 0),
    estimatedDuration: 90,
    recurrence: 'NONE',
    tags: ['#work'],
    reminderEnabled: false,
    archived: false,
    updates: [
      {
        id: 'upd-06',
        taskId: 'task-16',
        content: 'Service worker manifest and cache manifest defined successfully.',
        createdAt: d(0, -2),
        updatedAt: d(0, -2),
      },
    ],
    activity: [
      { id: 'act-27', type: 'CREATED', description: 'Task created', createdAt: d(-2, 0) },
      { id: 'act-28', type: 'STARTED', description: 'In progress', createdAt: d(-1, 0) },
    ],
  },

  // 17. Cancelled Task
  {
    id: 'task-17',
    title: 'Legacy REST Migration Exploration',
    description: 'De-scoped in favor of direct Firestore real-time listeners and local cache.',
    categoryId: 'cat-work',
    priority: 'LOW',
    status: 'CANCELLED',
    createdAt: d(-10, 0),
    updatedAt: d(-3, 0),
    startAt: d(-8, 0),
    dueAt: d(-4, 0),
    estimatedDuration: 60,
    recurrence: 'NONE',
    tags: ['#work'],
    reminderEnabled: false,
    archived: false,
    activity: [
      { id: 'act-29', type: 'CREATED', description: 'Task created', createdAt: d(-10, 0) },
      { id: 'act-30', type: 'CANCELLED', description: 'Cancelled due to architectural simplification', createdAt: d(-3, 0) },
    ],
  },

  // 18. Upcoming next week
  {
    id: 'task-18',
    title: 'German Localization QA & Umlaut Validation',
    description: 'Review German strings with native phrasing, date formats, and layout sizing.',
    categoryId: 'cat-work',
    priority: 'MEDIUM',
    status: 'TODO',
    createdAt: d(-1, 0),
    updatedAt: d(-1, 0),
    startAt: d(5, 0),
    dueAt: d(6, 0),
    estimatedDuration: 60,
    recurrence: 'NONE',
    tags: ['#work'],
    reminderEnabled: false,
    archived: false,
    activity: [
      { id: 'act-31', type: 'CREATED', description: 'Task created', createdAt: d(-1, 0) },
    ],
  },

  // 19. Personal Goal
  {
    id: 'task-19',
    title: 'Plan Weekend Nature Hike & Photography Trip',
    description: 'Reserve trail passes, check weather forecast, and pack optical gear.',
    categoryId: 'cat-personal',
    priority: 'LOW',
    status: 'TODO',
    createdAt: d(-1, 0),
    updatedAt: d(-1, 0),
    startAt: d(6, 2),
    dueAt: d(6, 8),
    estimatedDuration: 45,
    recurrence: 'NONE',
    tags: ['#personal'],
    reminderEnabled: true,
    reminderAt: d(5, 12),
    archived: false,
    activity: [
      { id: 'act-32', type: 'CREATED', description: 'Task created', createdAt: d(-1, 0) },
    ],
  },

  // 20. Completed 12 days ago
  {
    id: 'task-20',
    title: 'Quarterly OKRs Review & Goal Setting',
    description: 'Establish clear measurable outcomes for product velocity and personal health.',
    categoryId: 'cat-personal',
    priority: 'HIGH',
    status: 'COMPLETED',
    createdAt: d(-15, 0),
    updatedAt: d(-12, 0),
    startAt: d(-14, 0),
    dueAt: d(-12, 0),
    completedAt: d(-12, 0),
    estimatedDuration: 120,
    recurrence: 'MONTHLY',
    tags: ['#work', '#personal'],
    reminderEnabled: false,
    archived: false,
    activity: [
      { id: 'act-33', type: 'CREATED', description: 'Task created', createdAt: d(-15, 0) },
      { id: 'act-34', type: 'COMPLETED', description: 'Quarterly OKRs documented', createdAt: d(-12, 0) },
    ],
  },
];
