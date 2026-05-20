import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, isBefore, isAfter, startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { isDueOnDay, getDateStr } from '@/lib/habitUtils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

const WEEKDAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

export default function CalendarGrid({ currentMonth, habits, logs, tasks, onDayClick }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const today = startOfDay(new Date());

  const getDayData = (date) => {
    const dateStr = getDateStr(date);
    const log = logs.find(l => l.date === dateStr);
    const dueHabits = habits.filter(h => h.active && isDueOnDay(h, date));
    const dayTasks = tasks.filter(t => t.due_date === dateStr);
    const completed = log ? (log.completed_habits || []).length : 0;
    const total = dueHabits.length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    const isPast = isBefore(startOfDay(date), today);
    const isFuture = isAfter(startOfDay(date), today);
    const isCurrent = isToday(date);
    return { dateStr, log, dueHabits, dayTasks, completed, total, pct, isPast, isFuture, isCurrent };
  };

  // Past days: subtle fill based on completion
  const getPastFill = (pct) => {
    if (pct >= 90) return 'bg-foreground/20';
    if (pct >= 70) return 'bg-foreground/14';
    if (pct >= 50) return 'bg-foreground/9';
    if (pct >= 20) return 'bg-foreground/5';
    return '';
  };

  return (
    <div>
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-[10px] font-mono text-muted-foreground py-2 tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(date => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const data = getDayData(date);

          // Visual state classes
          const dayClasses = cn(
            'relative aspect-square p-1.5 rounded-md text-left transition-all duration-200 flex flex-col',
            !isCurrentMonth && 'opacity-20 pointer-events-none',
            // Past: dimmed, read-only feel
            isCurrentMonth && data.isPast && [
              'opacity-60',
              data.pct > 0 && getPastFill(data.pct),
            ],
            // Today: highlighted
            isCurrentMonth && data.isCurrent && 'ring-1 ring-foreground/40 opacity-100',
            // Future: neutral, plannable
            isCurrentMonth && data.isFuture && 'opacity-80',
            // Hover only for current month
            isCurrentMonth && 'hover:bg-secondary/60 cursor-pointer',
          );

          return (
            <HoverCard key={date.toISOString()} openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <button onClick={() => isCurrentMonth && onDayClick(date)} className={dayClasses}>
                  <span className={cn(
                    'text-[11px] font-mono',
                    data.isCurrent ? 'text-foreground font-semibold' : 'text-muted-foreground',
                    data.isPast && 'text-muted-foreground/70',
                  )}>
                    {format(date, 'd')}
                  </span>

                  {isCurrentMonth && data.total > 0 && (
                    <div className="mt-auto flex gap-0.5">
                      {Array.from({ length: Math.min(data.total, 5) }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'w-1 h-1 rounded-full',
                            i < data.completed
                              ? data.isPast ? 'bg-foreground/40' : 'bg-foreground/60'
                              : 'bg-foreground/12'
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {isCurrentMonth && data.dayTasks.length > 0 && (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/35" />
                  )}
                </button>
              </HoverCardTrigger>

              {isCurrentMonth && (
                <HoverCardContent className="w-56 bg-card border-border" side="top" align="center">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">
                        {format(date, 'd MMMM', { locale: es })}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">{data.pct}%</span>
                        {data.isPast && (
                          <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">bloqueado</span>
                        )}
                        {data.isFuture && (
                          <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">futuro</span>
                        )}
                      </div>
                    </div>

                    {data.total > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        {data.completed}/{data.total} rutinas completadas
                      </p>
                    )}
                    {data.dayTasks.length > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        {data.dayTasks.length} tarea{data.dayTasks.length > 1 ? 's' : ''}
                      </p>
                    )}
                    {data.total === 0 && data.dayTasks.length === 0 && (
                      <p className="text-[11px] text-muted-foreground">Sin actividad registrada.</p>
                    )}
                  </div>
                </HoverCardContent>
              )}
            </HoverCard>
          );
        })}
      </div>
    </div>
  );
}
