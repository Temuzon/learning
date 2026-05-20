import { subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getDateStr, isDueOnDay } from '@/lib/habitUtils';
import { cn } from '@/lib/utils';

export default function WeeklyChart({ logs, habits }) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = getDateStr(date);
    const log = logs.find(l => l.date === dateStr);
    const dueHabits = habits.filter(h => h.active && isDueOnDay(h, date));
    const completed = log ? (log.completed_habits || []).length : 0;
    const total = dueHabits.length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    days.push({
      label: format(date, 'EEE', { locale: es }).slice(0, 2).toUpperCase(),
      pct,
      completed,
      total,
      isToday: i === 0,
    });
  }

  return (
    <div className="border border-border rounded-md p-4 bg-card">
      <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-4">
        Consistencia Semanal
      </p>
      <div className="flex items-end gap-2 h-24">
        {days.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full bg-secondary rounded-sm overflow-hidden" style={{ height: '72px' }}>
              <div
                className={cn(
                  'w-full rounded-sm transition-all duration-500 mt-auto',
                  day.pct >= 80 ? 'bg-foreground/80' :
                  day.pct >= 50 ? 'bg-foreground/40' :
                  day.pct > 0 ? 'bg-foreground/20' : 'bg-transparent'
                )}
                style={{
                  height: `${day.pct}%`,
                  marginTop: `${100 - day.pct}%`,
                }}
              />
            </div>
            <span className={cn(
              'text-[10px] font-mono',
              day.isToday ? 'text-foreground font-semibold' : 'text-muted-foreground'
            )}>
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
