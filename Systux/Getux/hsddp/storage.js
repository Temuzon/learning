/**
 * storage.js — Capa de persistencia localStorage
 */

const KEYS = {
  USERNAME: 'habitos_username',
  HABITS: 'habitos_habits',
  TASKS: 'habitos_tasks',
  LOGS: 'habitos_logs',
  IDENTITY: 'habitos_identity',
  IDENTITY_REPORT: 'habitos_identity_report',
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function now() {
  return new Date().toISOString();
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/* --- Username --- */
const User = {
  get: () => load(KEYS.USERNAME, null),
  set: (name) => save(KEYS.USERNAME, name),
};

/* --- Habits --- */
const Habits = {
  list: () => load(KEYS.HABITS, []),
  create: (data) => {
    const habits = Habits.list();
    const h = { ...data, id: uid(), created_date: now(), updated_date: now() };
    habits.push(h);
    save(KEYS.HABITS, habits);
    return h;
  },
  update: (id, data) => {
    const habits = Habits.list().map(h =>
      h.id === id ? { ...h, ...data, updated_date: now() } : h
    );
    save(KEYS.HABITS, habits);
    return habits.find(h => h.id === id);
  },
  remove: (id) => {
    save(KEYS.HABITS, Habits.list().filter(h => h.id !== id));
    // Clean logs
    const logs = Logs.list().map(l => ({
      ...l,
      completed_habits: (l.completed_habits || []).filter(hid => hid !== id),
    }));
    save(KEYS.LOGS, logs);
  },
  find: (id) => Habits.list().find(h => h.id === id),
};

/* --- Tasks --- */
const Tasks = {
  list: () => load(KEYS.TASKS, []),
  create: (data) => {
    const tasks = Tasks.list();
    const t = { ...data, id: uid(), completed: false, created_date: now(), updated_date: now() };
    tasks.push(t);
    save(KEYS.TASKS, tasks);
    return t;
  },
  update: (id, data) => {
    const tasks = Tasks.list().map(t =>
      t.id === id ? { ...t, ...data, updated_date: now() } : t
    );
    save(KEYS.TASKS, tasks);
    return tasks.find(t => t.id === id);
  },
  remove: (id) => {
    save(KEYS.TASKS, Tasks.list().filter(t => t.id !== id));
  },
  toggle: (id, dateStr) => {
    const tasks = Tasks.list();
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const completed = !task.completed;
    Tasks.update(id, { completed, completed_date: completed ? dateStr : null });
  },
  find: (id) => Tasks.list().find(t => t.id === id),
};

/* --- Logs --- */
const Logs = {
  list: () => load(KEYS.LOGS, []),
  get: (dateStr) => Logs.list().find(l => l.date === dateStr) || null,
  upsert: (dateStr, data) => {
    const logs = Logs.list();
    const idx = logs.findIndex(l => l.date === dateStr);
    const entry = { date: dateStr, completed_habits: [], total_habits: 0, ...data };
    if (idx >= 0) {
      logs[idx] = { ...logs[idx], ...data, date: dateStr };
    } else {
      logs.push(entry);
    }
    save(KEYS.LOGS, logs);
    return logs[idx >= 0 ? idx : logs.length - 1];
  },
  toggleHabit: (habitId, dateStr, totalActive) => {
    const log = Logs.get(dateStr) || { date: dateStr, completed_habits: [], total_habits: totalActive };
    const ids = log.completed_habits || [];
    const newIds = ids.includes(habitId) ? ids.filter(id => id !== habitId) : [...ids, habitId];
    Logs.upsert(dateStr, { completed_habits: newIds, total_habits: totalActive });
  },
  purgeOld: (days) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutStr = cutoff.toISOString().slice(0, 10);
    save(KEYS.LOGS, Logs.list().filter(l => l.date >= cutStr));
  },
};

/* --- Identity --- */
const Identity = {
  get: () => load(KEYS.IDENTITY, { current: [], target: [] }),
  save: (data) => save(KEYS.IDENTITY, data),
  addCurrent: (label) => {
    const id = Identity.get();
    if (!id.current.find(t => t.label === label)) {
      id.current.push({ id: uid(), label });
      Identity.save(id);
    }
    return id;
  },
  addTarget: (label) => {
    const id = Identity.get();
    if (!id.target.find(t => t.label === label)) {
      id.target.push({ id: uid(), label });
      Identity.save(id);
    }
    return id;
  },
  removeCurrent: (tagId) => {
    const id = Identity.get();
    id.current = id.current.filter(t => t.id !== tagId);
    Identity.save(id);
    return id;
  },
  removeTarget: (tagId) => {
    const id = Identity.get();
    id.target = id.target.filter(t => t.id !== tagId);
    Identity.save(id);
    return id;
  },
};

/* --- Identity Report --- */
const IdentityReport = {
  get: () => load(KEYS.IDENTITY_REPORT, { lastShown: null, lastWeekPct: null }),
  save: (data) => save(KEYS.IDENTITY_REPORT, data),
};
