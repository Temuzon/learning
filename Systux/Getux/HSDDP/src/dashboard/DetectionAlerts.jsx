import { subDays } from 'date-fns';
import { calculateConsistency, getMostAbandonedHabit, getDateStr, isDueOnDay } from '@/lib/habitUtils';
import { AlertTriangle } from 'lucide-react';

function calcRange(logs, habits, start, end) {
  if (!habits.length || !logs.length) return 0;
  let totalDue = 0;
  let totalCompleted = 0;
  for (let i = start; i < end; i++) {
    const date = subDays(new Date(), i);
    const dateStr = getDateStr(date);
    const log = logs.find(l => l.date === dateStr);
    const dueHabits = habits.filter(h => h.active && isDueOnDay(h, date));
    totalDue += dueHabits.length;
    if (log) totalCompleted += (log.completed_habits || []).length;
  }
  return totalDue === 0 ? 0 : Math.round((totalCompleted / totalDue) * 100);
}

export default function DetectionAlerts({ logs, habits }) {
  const alerts = [];
  const weekConsistency = calculateConsistency(logs, habits, 7);
  const prevWeekConsistency = calcRange(logs, habits, 7, 14);

  if (prevWeekConsistency > 0 && weekConsistency < prevWeekConsistency - 15) {
    const drop = prevWeekConsistency - weekConsistency;
    alerts.push(`Tu consistencia cayó ${drop}% esta semana.`);
  }

  const abandoned = getMostAbandonedHabit(logs, habits);
  if (abandoned && abandoned.rate < 30) {
    alerts.push(`Se detectó deterioro en: ${abandoned.habit.name}.`);
  }

  if (weekConsistency < 30 && habits.filter(h => h.active).length > 0 && logs.length > 3) {
    alerts.push('Abandono progresivo detectado.');
  }

  if (alerts.length === 0) return null;

  return (
    <div className="border border-border rounded-md p-4 bg-card">
      <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">
        Detección del Sistema
      </p>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{alert}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
