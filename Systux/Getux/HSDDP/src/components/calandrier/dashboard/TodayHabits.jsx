import { useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isDueOnDay } from '@/lib/habitUtils';
import { motion, AnimatePresence } from 'framer-motion';

export default function TodayHabits({ habits, completedIds, onToggle, onEdit, onDelete }) {
  const today = new Date();
  const dueHabits = habits.filter(h => h.active && isDueOnDay(h, today));
  const [hoveredId, setHoveredId] = useState(null);

  if (dueHabits.length === 0) {
    return (
      <div className="border border-border rounded-md p-4 bg-card">
        <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">Rutinas — Hoy</p>
        <p className="text-xs text-muted-foreground">No existen rutinas activas.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md p-4 bg-card">
      <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">Rutinas — Hoy</p>
      <div className="space-y-0.5">
        {dueHabits.map(habit => {
          const isCompleted = completedIds.includes(habit.id);
          const isHovered = hoveredId === habit.id;
          return (
            <div
              key={habit.id}
              className={cn(
                'group flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200',
                isCompleted ? 'bg-secondary/40' : 'hover:bg-secondary/30'
              )}
              onMouseEnter={() => setHoveredId(habit.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <motion.button
                onClick={() => onToggle(habit.id)}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-2.5 flex-1 text-left"
              >
                <div className={cn(
                  'w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  isCompleted ? 'bg-foreground border-foreground' : 'border-muted-foreground/40'
                )}>
                  {isCompleted && <Check className="w-3 h-3 text-background" />}
                </div>
                <span className={cn(
                  'text-[13px] transition-all duration-200',
                  isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                )}>
                  {habit.name}
                </span>
                {habit.priority === 'critical' && (
                  <span className="text-[9px] tracking-wider uppercase text-muted-foreground ml-auto mr-1">
                    Crítico
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 4 }}
                    className="flex items-center gap-1"
                  >
                    <button
                      onClick={() => onEdit(habit)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDelete(habit.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
