import { useState, useMemo } from 'react';
import {
  addMonths, subMonths, format, isToday, isBefore, isAfter, startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import { useHabits, useTasks, useLogs } from '@/lib/useLocalData';
import { calculateConsistency, getOperationalStatus, getTrend, getDateStr } from '@/lib/habitUtils';

import CalendarGrid from '@/components/calandrier/CalendarGrid';
import DayPanel from '@/components/calandrier/DayPanel';
import HabitForm from '@/components/forms/HabitForm';
import TaskForm from '@/components/forms/TaskForm';

export default function Calandrier() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const { habits, create: createHabit, update: updateHabit, remove: removeHabit } = useHabits();
  const { tasks, create: createTask, update: updateTask, remove: removeTask, toggle: toggleTask } = useTasks();
  const { logs, toggleHabit } = useLogs();

  const consistency = useMemo(() => calculateConsistency(logs, habits, 7), [logs, habits]);
  const status = useMemo(() => getOperationalStatus(consistency), [consistency]);
  const trend = useMemo(() => getTrend(logs, habits), [logs, habits]);

  const monthName = format(currentMonth, 'MMMM yyyy', { locale: es }).toUpperCase();
  const prevMonthName = format(subMonths(currentMonth, 1), 'MMMM', { locale: es }).toUpperCase();
  const nextMonthName = format(addMonths(currentMonth, 1), 'MMMM', { locale: es }).toUpperCase();

  const activeCount = habits.filter(h => h.active).length;

  const handleToggleHabit = (habitId) => {
    if (!selectedDate) return;
    const dateStr = getDateStr(selectedDate);
    const isPast = isBefore(startOfDay(selectedDate), startOfDay(new Date()));
    if (isPast) return; // blocked
    toggleHabit(habitId, dateStr, activeCount);
  };

  const handleToggleTask = (task) => {
    const dateStr = getDateStr(selectedDate || new Date());
    const isPast = selectedDate && isBefore(startOfDay(selectedDate), startOfDay(new Date()));
    if (isPast) return; // blocked
    toggleTask(task, dateStr);
  };

  const handleSubmitHabit = (data) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, data);
      setEditingHabit(null);
    } else {
      createHabit({ ...data, active: true, order: habits.length });
    }
    setShowHabitForm(false);
  };

  const handleSubmitTask = (data) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
      setEditingTask(null);
    } else {
      createTask(data);
    }
    setShowTaskForm(false);
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setShowHabitForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold tracking-wider uppercase">Calandrier</h1>
        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
          Bitácora Táctica — Registro Operativo
        </p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            {prevMonthName}
          </button>
          <h2 className="text-sm font-semibold tracking-widest">{monthName}</h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {nextMonthName}
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Consistencia</p>
            <p className="text-xs font-mono font-medium">{consistency}%</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Estado</p>
            <p className="text-xs font-medium">{status.label}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">Tendencia</p>
            <p className="text-xs font-mono">{trend.symbol}</p>
          </div>
        </div>
      </div>

      <CalendarGrid
        currentMonth={currentMonth}
        habits={habits}
        logs={logs}
        tasks={tasks}
        onDayClick={setSelectedDate}
      />

      <AnimatePresence>
        {selectedDate && (
          <DayPanel
            date={selectedDate}
            habits={habits}
            logs={logs}
            tasks={tasks}
            onClose={() => setSelectedDate(null)}
            onToggleHabit={handleToggleHabit}
            onToggleTask={handleToggleTask}
            onAddHabit={() => { setEditingHabit(null); setShowHabitForm(true); }}
            onAddTask={() => { setEditingTask(null); setShowTaskForm(true); }}
            onEditHabit={handleEditHabit}
            onEditTask={handleEditTask}
            onDeleteHabit={removeHabit}
            onDeleteTask={removeTask}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHabitForm && (
          <HabitForm
            habit={editingHabit}
            onSubmit={handleSubmitHabit}
            onClose={() => { setShowHabitForm(false); setEditingHabit(null); }}
          />
        )}
        {showTaskForm && (
          <TaskForm
            task={editingTask}
            onSubmit={handleSubmitTask}
            onClose={() => { setShowTaskForm(false); setEditingTask(null); }}
            defaultDate={selectedDate ? getDateStr(selectedDate) : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
