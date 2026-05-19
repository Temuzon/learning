import { useState } from 'react';
import { format, isToday, isBefore, isAfter, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, Check, Plus, Pencil, Trash2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isDueOnDay, getDateStr, getOperationalStatus } from '@/lib/habitUtils';
import { motion, AnimatePresence } from 'framer-motion';

const PAST_MESSAGES = [
  'El historial operativo está bloqueado.',
  'Los registros anteriores son permanentes.',
  'No se puede alterar disciplina pasada.',
];

function getPastMessage(date) {
  const idx = date.getDate() % PAST_MESSAGES.length;
  return PAST_MESSAGES[idx];
}

export default function DayPanel({
  date, habits, logs, tasks, onClose,
  onToggleHabit, onToggleTask,
  onAddTask, onAddHabit,
  onEditHabit, onEditTask,
  onDeleteHabit, onDeleteTask,
}) {
  const [pastMsg, setPastMsg] = useState(null);
  const [hoveredHabitId, setHoveredHabitId] = useState(null);
  const [hoveredTaskId, setHoveredTaskId] = useState(null);

  if (!date) return null;

  const dateStr = getDateStr(date);
  const log = logs.find(l => l.date === dateStr);
  const completedIds = log?.completed_habits || [];
  const dueHabits = habits.filter(h => h.active && isDueOnDay(h, date));
  const dayTasks = tasks.filter(t => t.due_date === dateStr);
  const completed = completedIds.length;
  const total = dueHabits.length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  const isPast = isBefore(startOfDay(date), startOfDay(new Date()));
  const isFuture = isAfter(startOfDay(date), startOfDay(new Date()));
  const isTodayDate = isToday(date);
  // Checkboxes: only today; Add task: today + future; Add habit: always
  const canToggle = isTodayDate;
  const canAddTask = isTodayDate || isFuture;
  const status = getOperationalStatus(pct);

  const handleBlockedClick = () => {
    const msg = getPastMessage(date);
    setPastMsg(msg);
    setTimeout(() => setPastMsg(null), 2500);
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed right-0 top-0 h-screen w-80 bg-card border-l border-border z-50 flex flex-col"
    >
      {/* Header */}
      <div className={cn(
        'p-4 border-b border-border flex items-center justify-between',
        isPast && 'opacity-80'
      )}>
        <div>
          <p className="text-sm font-semibold">
            {format(date, 'd MMMM yyyy', { locale: es })}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isPast && <Lock className="w-2.5 h-2.5 text-muted-foreground/60" />}
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
              {isPast ? 'Solo Lectura' : isTodayDate ? 'Día Actual' : 'Planificable'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Past block message */}
      <AnimatePresence>
        {pastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mx-4 mt-3 px-3 py-2 bg-secondary/60 rounded-md border border-border"
          >
            <p className="text-[11px] text-muted-foreground italic">{pastMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics */}
      {!isFuture && (
        <div className={cn('p-4 border-b border-border', isPast && 'opacity-60')}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Rendimiento</p>
              <p className="text-lg font-mono font-semibold">{pct}%</p>
            </div>
            <div>
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Estado</p>
              <p className="text-xs font-medium mt-1">{total > 0 ? status.label : '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={cn('flex-1 overflow-y-auto p-4 space-y-4', isPast && 'opacity-70')}>
        {/* Habits */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Rutinas</p>
            <button
              onClick={() => onAddHabit()}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          {dueHabits.length === 0 ? (
            <p className="text-xs text-muted-foreground">No existen rutinas activas.</p>
          ) : (
            <div className="space-y-0.5">
              {dueHabits.map(habit => {
                const isCompleted = completedIds.includes(habit.id);
                const isHovered = hoveredHabitId === habit.id;
                return (
                  <div
                    key={habit.id}
                    className="flex items-center gap-1"
                    onMouseEnter={() => setHoveredHabitId(habit.id)}
                    onMouseLeave={() => setHoveredHabitId(null)}
                  >
                    <button
                      onClick={() => canToggle ? onToggleHabit(habit.id) : handleBlockedClick()}
                      className={cn(
                        'flex-1 flex items-center gap-2.5 px-2.5 py-1.5 rounded text-left transition-all',
                        canToggle ? 'hover:bg-secondary cursor-pointer' : 'cursor-default',
                        isCompleted && 'opacity-60'
                      )}
                    >
                      <div className={cn(
                        'w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all',
                        isCompleted ? 'bg-foreground border-foreground' : 'border-muted-foreground/40'
                      )}>
                        {isCompleted && <Check className="w-2.5 h-2.5 text-background" />}
                      </div>
                      <span className={cn(
                        'text-xs',
                        isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                      )}>
                        {habit.name}
                      </span>
                    </button>
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-0.5"
                        >
                          <button onClick={() => onEditHabit(habit)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                            <Pencil className="w-2.5 h-2.5" />
                          </button>
                          <button onClick={() => onDeleteHabit(habit.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Tareas</p>
            {canAddTask && (
              <button onClick={() => onAddTask()} className="text-muted-foreground hover:text-foreground transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
          {dayTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin tareas programadas.</p>
          ) : (
            <div className="space-y-0.5">
              {dayTasks.map(task => {
                const isHovered = hoveredTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-1"
                    onMouseEnter={() => setHoveredTaskId(task.id)}
                    onMouseLeave={() => setHoveredTaskId(null)}
                  >
                    <button
                      onClick={() => canToggle ? onToggleTask(task) : handleBlockedClick()}
                      className={cn(
                        'flex-1 flex items-center gap-2.5 px-2.5 py-1.5 rounded text-left transition-all',
                        canToggle ? 'hover:bg-secondary cursor-pointer' : 'cursor-default',
                        task.completed && 'opacity-60'
                      )}
                    >
                      <div className={cn(
                        'w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all',
                        task.completed ? 'bg-foreground border-foreground' : 'border-muted-foreground/40'
                      )}>
                        {task.completed && <Check className="w-2.5 h-2.5 text-background" />}
                      </div>
                      <span className={cn(
                        'text-xs',
                        task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      )}>
                        {task.name}
                      </span>
                    </button>
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-0.5"
                        >
                          <button onClick={() => onEditTask(task)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                            <Pencil className="w-2.5 h-2.5" />
                          </button>
                          <button onClick={() => onDeleteTask(task.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Purpose */}
        {dueHabits.length > 0 && (
          <div>
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">Propósito</p>
            <div className="space-y-2">
              {dueHabits.map(h => (
                <div key={h.id} className="text-[11px]">
                  <span className="text-muted-foreground">{h.name}: </span>
                  <span className="text-foreground/70 italic">{h.purpose}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
