import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, isToday, isBefore, startOfDay } from 'date-fns';

export function isDueOnDay(habit, date) {
  const dayOfWeek = date.getDay();
  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'custom':
      return (habit.custom_days || []).includes(dayOfWeek);
    default:
      return true;
  }
}

export function getDateStr(date) {
  return format(date, 'yyyy-MM-dd');
}

export function calculateConsistency(logs, habits, days = 7) {
  if (!habits.length || !logs.length) return 0;
  
  let totalDue = 0;
  let totalCompleted = 0;
  
  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), i);
    const dateStr = getDateStr(date);
    const log = logs.find(l => l.date === dateStr);
    const dueHabits = habits.filter(h => h.active && isDueOnDay(h, date));
    
    totalDue += dueHabits.length;
    if (log) {
      totalCompleted += (log.completed_habits || []).length;
    }
  }
  
  return totalDue === 0 ? 0 : Math.round((totalCompleted / totalDue) * 100);
}

export function calculateStreak(logs, habits) {
  if (!habits.length || !logs.length) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  
  // Check if today is complete — if not started yet, start from yesterday
  const todayStr = getDateStr(currentDate);
  const todayLog = logs.find(l => l.date === todayStr);
  const todayDue = habits.filter(h => h.active && isDueOnDay(h, currentDate));
  
  if (!todayLog || (todayLog.completed_habits || []).length < todayDue.length) {
    currentDate = subDays(currentDate, 1);
  }
  
  for (let i = 0; i < 365; i++) {
    const date = subDays(currentDate, i);
    const dateStr = getDateStr(date);
    const log = logs.find(l => l.date === dateStr);
    const dueHabits = habits.filter(h => h.active && isDueOnDay(h, date));
    
    if (dueHabits.length === 0) continue;
    
    if (log && (log.completed_habits || []).length >= dueHabits.length) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export function getOperationalStatus(consistency) {
  if (consistency >= 85) return { label: 'CONSISTENCIA ALTA', level: 'high' };
  if (consistency >= 65) return { label: 'ESTABLE', level: 'stable' };
  if (consistency >= 40) return { label: 'EN RIESGO', level: 'risk' };
  return { label: 'DETERIORO DETECTADO', level: 'critical' };
}

export function getTrend(logs, habits) {
  if (logs.length < 7) return { direction: 'neutral', symbol: '→' };
  
  const thisWeek = calculateConsistency(logs, habits, 7);
  const lastWeek = calculateConsistencyRange(logs, habits, 7, 14);
  
  const diff = thisWeek - lastWeek;
  if (diff > 5) return { direction: 'up', symbol: '↑' };
  if (diff < -5) return { direction: 'down', symbol: '↓' };
  return { direction: 'neutral', symbol: '→' };
}

function calculateConsistencyRange(logs, habits, start, end) {
  if (!habits.length || !logs.length) return 0;
  
  let totalDue = 0;
  let totalCompleted = 0;
  
  for (let i = start; i < end; i++) {
    const date = subDays(new Date(), i);
    const dateStr = getDateStr(date);
    const log = logs.find(l => l.date === dateStr);
    const dueHabits = habits.filter(h => h.active && isDueOnDay(h, date));
    
    totalDue += dueHabits.length;
    if (log) {
      totalCompleted += (log.completed_habits || []).length;
    }
  }
  
  return totalDue === 0 ? 0 : Math.round((totalCompleted / totalDue) * 100);
}

export function getMostConsistentHabit(logs, habits) {
  if (!habits.length || !logs.length) return null;
  
  let best = null;
  let bestRate = -1;
  
  for (const habit of habits.filter(h => h.active)) {
    let due = 0;
    let completed = 0;
    
    for (let i = 0; i < 14; i++) {
      const date = subDays(new Date(), i);
      if (!isDueOnDay(habit, date)) continue;
      due++;
      const dateStr = getDateStr(date);
      const log = logs.find(l => l.date === dateStr);
      if (log && (log.completed_habits || []).includes(habit.id)) {
        completed++;
      }
    }
    
    const rate = due === 0 ? 0 : completed / due;
    if (rate > bestRate) {
      bestRate = rate;
      best = { habit, rate: Math.round(rate * 100) };
    }
  }
  
  return best;
}

export function getMostAbandonedHabit(logs, habits) {
  if (!habits.length || !logs.length) return null;
  
  let worst = null;
  let worstRate = 101;
  
  for (const habit of habits.filter(h => h.active)) {
    let due = 0;
    let completed = 0;
    
    for (let i = 0; i < 14; i++) {
      const date = subDays(new Date(), i);
      if (!isDueOnDay(habit, date)) continue;
      due++;
      const dateStr = getDateStr(date);
      const log = logs.find(l => l.date === dateStr);
      if (log && (log.completed_habits || []).includes(habit.id)) {
        completed++;
      }
    }
    
    const rate = due === 0 ? 100 : Math.round((completed / due) * 100);
    if (rate < worstRate) {
      worstRate = rate;
      worst = { habit, rate };
    }
  }
  
  return worst;
}

export function getDomainLevel(consistency) {
  if (consistency >= 90) return { level: 5, label: 'DOMINIO' };
  if (consistency >= 75) return { level: 4, label: 'DISCIPLINA' };
  if (consistency >= 55) return { level: 3, label: 'DESARROLLO' };
  if (consistency >= 30) return { level: 2, label: 'INICIO' };
  return { level: 1, label: 'FUNDACIÓN' };
}

export function isPastDay(dateStr) {
  const date = parseISO(dateStr);
  return isBefore(startOfDay(date), startOfDay(new Date()));
}
