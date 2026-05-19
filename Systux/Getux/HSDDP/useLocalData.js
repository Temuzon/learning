/**
 * React hooks that replace TanStack Query + base44 API calls.
 * All reads/writes go through localStorage via lib/storage.js.
 */

import { useState, useEffect, useCallback } from 'react';
import { Habits, Tasks, Logs } from './storage';

// Global event bus so hooks across components re-render on changes
const listeners = {};

function subscribe(key, fn) {
  if (!listeners[key]) listeners[key] = new Set();
  listeners[key].add(fn);
  return () => listeners[key].delete(fn);
}

function notify(key) {
  if (listeners[key]) listeners[key].forEach(fn => fn());
}

// ── Habits hook ───────────────────────────────────────────────────────────────

export function useHabits() {
  const [habits, setHabits] = useState(() => Habits.list());

  useEffect(() => {
    return subscribe('habits', () => setHabits(Habits.list()));
  }, []);

  const create = useCallback((data) => {
    Habits.create(data);
    notify('habits');
  }, []);

  const update = useCallback((id, data) => {
    Habits.update(id, data);
    notify('habits');
  }, []);

  const remove = useCallback((id) => {
    Habits.delete(id);
    notify('habits');
    // Also clean up logs that reference this habit
    const logs = Logs.list();
    logs.forEach(log => {
      if ((log.completed_habits || []).includes(id)) {
        Logs.upsert(log.date, {
          ...log,
          completed_habits: (log.completed_habits || []).filter(h => h !== id),
        });
      }
    });
    notify('logs');
  }, []);

  return { habits, create, update, remove };
}

// ── Tasks hook ────────────────────────────────────────────────────────────────

export function useTasks() {
  const [tasks, setTasks] = useState(() => Tasks.list());

  useEffect(() => {
    return subscribe('tasks', () => setTasks(Tasks.list()));
  }, []);

  const create = useCallback((data) => {
    Tasks.create(data);
    notify('tasks');
  }, []);

  const update = useCallback((id, data) => {
    Tasks.update(id, data);
    notify('tasks');
  }, []);

  const remove = useCallback((id) => {
    Tasks.delete(id);
    notify('tasks');
  }, []);

  const toggle = useCallback((task, dateStr) => {
    Tasks.update(task.id, {
      completed: !task.completed,
      completed_date: !task.completed ? dateStr : null,
    });
    notify('tasks');
  }, []);

  return { tasks, create, update, remove, toggle };
}

// ── Logs hook ─────────────────────────────────────────────────────────────────

export function useLogs() {
  const [logs, setLogs] = useState(() => Logs.list());

  useEffect(() => {
    return subscribe('logs', () => setLogs(Logs.list()));
  }, []);

  const toggleHabit = useCallback((habitId, dateStr, totalActiveHabits) => {
    const log = Logs.getByDate(dateStr);
    const completedIds = log?.completed_habits || [];
    const newCompleted = completedIds.includes(habitId)
      ? completedIds.filter(id => id !== habitId)
      : [...completedIds, habitId];
    Logs.upsert(dateStr, { completed_habits: newCompleted, total_habits: totalActiveHabits });
    notify('logs');
  }, []);

  return { logs, toggleHabit };
}
