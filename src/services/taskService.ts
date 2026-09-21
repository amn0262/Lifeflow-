import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  addDoc,
  deleteField,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { Task, TaskActivity, TaskUpdate, Category, TaskStatus, ActivityType } from '../types';
import { INITIAL_CATEGORIES, INITIAL_DEMO_TASKS } from '../data/demo/seedData';

/**
 * Strips all undefined fields recursively so Firestore setDoc / addDoc never throws:
 * "Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export function sanitizeForSetDoc<T extends Record<string, any>>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      clean[key] = sanitizeForSetDoc(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

/**
 * In updateDoc, undefined fields are converted to deleteField() so Firestore deletes
 * the attribute safely without throwing "Unsupported field value: undefined".
 */
export function sanitizeForUpdateDoc<T extends Record<string, any>>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      clean[key] = deleteField();
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      clean[key] = sanitizeForUpdateDoc(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

const getTasksStorageKey = (userId: string) => `lifeflow_tasks_${userId || 'demo'}`;
const getCategoriesStorageKey = (userId: string) => `lifeflow_categories_${userId || 'demo'}`;

// Local storage helpers
function readLocalTasks(userId: string): Task[] {
  try {
    const raw = localStorage.getItem(getTasksStorageKey(userId));
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse local tasks:', err);
  }
  // Initialize with seed data
  const initial = [...INITIAL_DEMO_TASKS];
  writeLocalTasks(userId, initial);
  return initial;
}

function writeLocalTasks(userId: string, tasks: Task[]): void {
  try {
    localStorage.setItem(getTasksStorageKey(userId), JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to write local tasks:', err);
  }
}

export function readLocalCategories(userId: string): Category[] {
  try {
    const raw = localStorage.getItem(getCategoriesStorageKey(userId));
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse local categories:', err);
  }
  writeLocalCategories(userId, INITIAL_CATEGORIES);
  return INITIAL_CATEGORIES;
}

export function writeLocalCategories(userId: string, categories: Category[]): void {
  try {
    localStorage.setItem(getCategoriesStorageKey(userId), JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to write local categories:', err);
  }
}

export async function getTasks(userId: string): Promise<Task[]> {
  if (isFirebaseConfigured && db && userId) {
    try {
      const tasksRef = collection(db, 'users', userId, 'tasks');
      const q = query(tasksRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const remoteTasks: Task[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task));
      if (remoteTasks.length > 0) {
        writeLocalTasks(userId, remoteTasks);
        return remoteTasks;
      }
    } catch (err) {
      console.warn('[LifeFlow TaskService] Firestore fetch failed, falling back to local cache:', err);
    }
  }
  return readLocalTasks(userId);
}

export function subscribeToTasks(
  userId: string,
  onUpdate: (tasks: Task[]) => void,
  onError?: (error: any) => void
): () => void {
  if (isFirebaseConfigured && db && userId) {
    try {
      const tasksRef = collection(db, 'users', userId, 'tasks');
      const q = query(tasksRef, orderBy('createdAt', 'desc'));
      return onSnapshot(
        q,
        (snapshot) => {
          const remoteTasks: Task[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Task));
          if (remoteTasks.length > 0) {
            writeLocalTasks(userId, remoteTasks);
            onUpdate(remoteTasks);
          } else {
            // If remote collection is currently empty, load local tasks
            const local = readLocalTasks(userId);
            onUpdate(local);
          }
        },
        (error) => {
          console.warn('[LifeFlow TaskService] Tasks snapshot listener error:', error);
          onError?.(error);
          onUpdate(readLocalTasks(userId));
        }
      );
    } catch (err) {
      console.warn('[LifeFlow TaskService] Failed to establish tasks snapshot listener:', err);
      onError?.(err);
    }
  }

  // Local fallback
  onUpdate(readLocalTasks(userId));
  return () => {};
}

export async function getCategories(userId: string): Promise<Category[]> {
  if (isFirebaseConfigured && db && userId) {
    try {
      const catRef = collection(db, 'users', userId, 'categories');
      const snap = await getDocs(catRef);
      const remoteCats: Category[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
      if (remoteCats.length > 0) {
        writeLocalCategories(userId, remoteCats);
        return remoteCats;
      }
    } catch (err) {
      console.warn('[LifeFlow TaskService] Firestore categories fetch failed, using local cache:', err);
    }
  }
  return readLocalCategories(userId);
}

export function subscribeToCategories(
  userId: string,
  onUpdate: (categories: Category[]) => void
): () => void {
  if (isFirebaseConfigured && db && userId) {
    try {
      const catRef = collection(db, 'users', userId, 'categories');
      return onSnapshot(
        catRef,
        (snapshot) => {
          const remoteCats: Category[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
          if (remoteCats.length > 0) {
            writeLocalCategories(userId, remoteCats);
            onUpdate(remoteCats);
          } else {
            onUpdate(readLocalCategories(userId));
          }
        },
        (error) => {
          console.warn('[LifeFlow TaskService] Categories snapshot listener error:', error);
          onUpdate(readLocalCategories(userId));
        }
      );
    } catch (err) {
      console.warn('[LifeFlow TaskService] Failed to establish categories listener:', err);
    }
  }

  onUpdate(readLocalCategories(userId));
  return () => {};
}

export async function createCategory(
  userId: string,
  data: { name: string; color?: string; icon?: string }
): Promise<Category> {
  const catId = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const newCat: Category = {
    id: catId,
    name: data.name.trim(),
    color: data.color || '#6366f1',
    icon: data.icon || 'Folder',
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured && db && userId) {
    try {
      const catDocRef = doc(db, 'users', userId, 'categories', catId);
      await setDoc(catDocRef, sanitizeForSetDoc(newCat));
    } catch (err) {
      console.error('Firestore create category error:', err);
    }
  }

  const currentCats = readLocalCategories(userId);
  const updated = [...currentCats, newCat];
  writeLocalCategories(userId, updated);
  return newCat;
}

export async function createTask(
  userId: string,
  data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'updates' | 'activity'>
): Promise<Task> {
  const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const initialActivity: TaskActivity = {
    id: `act-${Date.now()}`,
    type: 'CREATED',
    description: 'Task created',
    createdAt: now,
  };

  const newTask: Task = {
    ...data,
    id: taskId,
    createdAt: now,
    updatedAt: now,
    updates: [],
    activity: [initialActivity],
  };

  // Firestore write if connected
  if (isFirebaseConfigured && db && userId) {
    try {
      const taskDocRef = doc(db, 'users', userId, 'tasks', taskId);
      await setDoc(taskDocRef, sanitizeForSetDoc(newTask));
      // Activity subcollection
      await addDoc(
        collection(db, 'users', userId, 'tasks', taskId, 'activity'),
        sanitizeForSetDoc(initialActivity)
      );
    } catch (err) {
      console.error('Firestore create task error:', err);
    }
  }

  // Local cache update
  const current = readLocalTasks(userId);
  const updated = [newTask, ...current];
  writeLocalTasks(userId, updated);
  return newTask;
}

export async function updateTask(
  userId: string,
  taskId: string,
  updates: Partial<Task>,
  activityDescription?: string,
  activityType: ActivityType = 'UPDATED'
): Promise<Task> {
  const now = new Date().toISOString();
  const currentTasks = readLocalTasks(userId);
  const taskIndex = currentTasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    throw new Error('Task not found');
  }

  const existing = currentTasks[taskIndex];
  const newActivity: TaskActivity | null = activityDescription
    ? {
        id: `act-${Date.now()}`,
        type: activityType,
        description: activityDescription,
        createdAt: now,
      }
    : null;

  const updatedTask: Task = {
    ...existing,
    ...updates,
    updatedAt: now,
    activity: newActivity
      ? [...(existing.activity || []), newActivity]
      : existing.activity || [],
  };

  if (isFirebaseConfigured && db && userId) {
    try {
      const taskDocRef = doc(db, 'users', userId, 'tasks', taskId);
      await updateDoc(
        taskDocRef,
        sanitizeForUpdateDoc({
          ...updates,
          updatedAt: now,
        })
      );
      if (newActivity) {
        await addDoc(
          collection(db, 'users', userId, 'tasks', taskId, 'activity'),
          sanitizeForSetDoc(newActivity)
        );
      }
    } catch (err) {
      console.error('Firestore update task error:', err);
    }
  }

  currentTasks[taskIndex] = updatedTask;
  writeLocalTasks(userId, currentTasks);
  return updatedTask;
}

export async function completeTask(
  userId: string,
  taskId: string,
  customCompletedAt?: string
): Promise<Task> {
  const completionDate = customCompletedAt || new Date().toISOString();
  return updateTask(
    userId,
    taskId,
    {
      status: 'COMPLETED',
      completedAt: completionDate,
    },
    `Completed task on ${new Date(completionDate).toLocaleString()}`,
    'COMPLETED'
  );
}

export async function reopenTask(userId: string, taskId: string): Promise<Task> {
  return updateTask(
    userId,
    taskId,
    {
      status: 'TODO',
      completedAt: undefined,
    },
    'Task reopened',
    'REOPENED'
  );
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  if (isFirebaseConfigured && db && userId) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
    } catch (err) {
      console.error('Firestore delete task error:', err);
    }
  }

  const current = readLocalTasks(userId);
  const filtered = current.filter((t) => t.id !== taskId);
  writeLocalTasks(userId, filtered);
}

export async function addTaskUpdate(
  userId: string,
  taskId: string,
  content: string
): Promise<TaskUpdate> {
  const now = new Date().toISOString();
  const updateId = `upd-${Date.now()}`;
  const newUpdate: TaskUpdate = {
    id: updateId,
    taskId,
    content,
    createdAt: now,
    updatedAt: now,
  };

  const tasks = readLocalTasks(userId);
  const target = tasks.find((t) => t.id === taskId);
  if (target) {
    const updatedTask: Task = {
      ...target,
      updatedAt: now,
      updates: [...(target.updates || []), newUpdate],
      activity: [
        ...(target.activity || []),
        {
          id: `act-${Date.now()}`,
          type: 'UPDATED',
          description: `Added progress update: "${content.slice(0, 40)}${content.length > 40 ? '...' : ''}"`,
          createdAt: now,
        },
      ],
    };
    const updatedList = tasks.map((t) => (t.id === taskId ? updatedTask : t));
    writeLocalTasks(userId, updatedList);
  }

  if (isFirebaseConfigured && db && userId) {
    try {
      await addDoc(
        collection(db, 'users', userId, 'tasks', taskId, 'updates'),
        sanitizeForSetDoc(newUpdate)
      );
    } catch (err) {
      console.error('Firestore add update error:', err);
    }
  }

  return newUpdate;
}

export function resetToSeedData(userId: string): Task[] {
  writeLocalTasks(userId, INITIAL_DEMO_TASKS);
  writeLocalCategories(userId, INITIAL_CATEGORIES);
  return INITIAL_DEMO_TASKS;
}
