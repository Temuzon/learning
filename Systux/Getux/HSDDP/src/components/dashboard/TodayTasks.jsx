import { useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isToday, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function TodayTasks({ tasks, onToggle, onEdit, onDelete }) {
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(t => t.due_date === today);
  const [hoveredId, setHoveredId] = useState(null);

  if (todayTasks.length === 0) {
    return (
      <div className="border border-border rounded-md p-4 bg-card">
        <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">Tareas — Hoy</p>
        <p className="text-xs text-muted-foreground">Sin tareas programadas para hoy.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md p-4 bg-card">
      <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">Tareas — Hoy</p>
      <div className="space-y-0.5">
        {todayTasks.map(task => {
          const isHovered = hoveredId === task.id;
          return (
            <div
              key={task.id}
              className={cn(
                'group flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200',
                task.completed ? 'bg-secondary/40' : 'hover:bg-secondary/30'
              )}
              onMouseEnter={() => setHoveredId(task.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <motion.button
                onClick={() => onToggle(task)}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-2.5 flex-1 text-left"
              >
                <div className={cn(
                  'w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  task.completed ? 'bg-foreground border-foreground' : 'border-muted-foreground/40'
                )}>
                  {task.completed && <Check className="w-3 h-3 text-background" />}
                </div>
                <span className={cn(
                  'text-[13px] transition-all duration-200',
                  task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                )}>
                  {task.name}
                </span>
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
                      onClick={() => onEdit(task)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
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
