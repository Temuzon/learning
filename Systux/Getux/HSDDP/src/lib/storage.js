/**
 * localStorage persistence layer — replaces all backend/API calls.
 * All data lives locally. No server, no auth, no cloud.
 */

const KEYS = {
  USERNAME: 'sdp_username',
  HABITS: 'sdp_habits',
  TASKS: 'sdp_tasks',
  LOGS: 'sdp_logs',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function now() {
  return new Date().toISOString();
}

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Username ──────────────────────────────────────────────────────────────────

export function getUsername() {
  return localStorage.getItem(KEYS.USERNAME) || null;
}

export function setUsername(name) {
  localStorage.setItem(KEYS.USERNAME, name.trim());
}

// ── Habits ────────────────────────────────────────────────────────────────────

export const Habits = {
  list() {
    return load(KEYS.HABITS).filter(h => !h._deleted);
  },
  get(id) {
    return load(KEYS.HABITS).find(h => h.id === id) || null;
  },
  create(data) {
    const habits = load(KEYS.HABITS);
    const item = { ...data, id: uid(), created_date: now(), updated_date: now() };
    habits.push(item);
    save(KEYS.HABITS, habits);
    return item;
  },
  update(id, data) {
    const habits = load(KEYS.HABITS);
    const idx = habits.findIndex(h => h.id === id);
    if (idx === -1) return null;
    habits[idx] = { ...habits[idx], ...data, updated_date: now() };
    save(KEYS.HABITS, habits);
    return habits[idx];
  },
  delete(id) {
    const habits = load(KEYS.HABITS);
    const filtered = habits.filter(h => h.id !== id);
    save(KEYS.HABITS, filtered);
  },
};

// ── Tasks ─────────────────────────────────────────────────────────────────────

export const Tasks = {
  list() {
    return load(KEYS.TASKS).filter(t => !t._deleted);
  },
  get(id) {
    return load(KEYS.TASKS).find(t => t.id === id) || null;
  },
  create(data) {
    const tasks = load(KEYS.TASKS);
    const item = { ...data, id: uid(), created_date: now(), updated_date: now() };
    tasks.push(item);
    save(KEYS.TASKS, tasks);
    return item;
  },
  update(id, data) {
    const tasks = load(KEYS.TASKS);
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...data, updated_date: now() };
    save(KEYS.TASKS, tasks);
    return tasks[idx];
  },
  delete(id) {
    const tasks = load(KEYS.TASKS);
    const filtered = tasks.filter(t => t.id !== id);
    save(KEYS.TASKS, filtered);
  },
};

// ── DailyLogs ─────────────────────────────────────────────────────────────────

export const Logs = {
  list() {
    return load(KEYS.LOGS);
  },
  getByDate(dateStr) {
    return load(KEYS.LOGS).find(l => l.date === dateStr) || null;
  },
  upsert(dateStr, data) {
    const logs = load(KEYS.LOGS);
    const idx = logs.findIndex(l => l.date === dateStr);
    if (idx === -1) {
      const item = { ...data, id: uid(), date: dateStr, created_date: now(), updated_date: now() };
      logs.push(item);
      save(KEYS.LOGS, logs);
      return item;
    } else {
      logs[idx] = { ...logs[idx], ...data, updated_date: now() };
      save(KEYS.LOGS, logs);
      return logs[idx];
    }
  },
  /**
   * Purge logs older than `days` days — keeps data lean.
   * Called on app startup.
   */
  purgeOld(days = 60) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const logs = load(KEYS.LOGS).filter(l => l.date >= cutoffStr);
    save(KEYS.LOGS, logs);
  },
};
