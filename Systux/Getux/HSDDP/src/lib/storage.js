// Storage utilities for managing local data
const STORAGE_KEYS = {
  USERNAME: 'app_username',
  HABITS: 'app_habits',
  TASKS: 'app_tasks',
  DAILY_LOGS: 'app_daily_logs'
};

export const getUsername = () => {
  return localStorage.getItem(STORAGE_KEYS.USERNAME) || null;
};

export const setUsername = (username) => {
  localStorage.setItem(STORAGE_KEYS.USERNAME, username);
};

export const getHabits = () => {
  const data = localStorage.getItem(STORAGE_KEYS.HABITS);
  return data ? JSON.parse(data) : [];
};

export const setHabits = (habits) => {
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
};

export const getTasks = () => {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : [];
};

export const setTasks = (tasks) => {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const getDailyLogs = () => {
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
  return data ? JSON.parse(data) : [];
};

export const setDailyLogs = (logs) => {
  localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
};

// Logs class for managing daily logs with expiration
export class Logs {
  static add(log) {
    const logs = getDailyLogs();
    logs.push({
      ...log,
      timestamp: new Date().toISOString()
    });
    setDailyLogs(logs);
  }

  static getAll() {
    return getDailyLogs();
  }

  static getByDate(date) {
    const logs = getDailyLogs();
    const targetDate = new Date(date).toDateString();
    return logs.filter(log => 
      new Date(log.timestamp).toDateString() === targetDate
    );
  }

  static purgeOld(days) {
    const logs = getDailyLogs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filtered = logs.filter(log => 
      new Date(log.timestamp) > cutoffDate
    );
    
    setDailyLogs(filtered);
  }

  static clear() {
    setDailyLogs([]);
  }
}
