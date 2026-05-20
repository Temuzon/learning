import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

import { useHabits, useTasks, useLogs } from '@/lib/useLocalData';
import { getDateStr } from '@/lib/habitUtils';

import StatusWidget from '@/components/dashboard/StatusWidget';
import MetricCard from '@/components/dashboard/MetricCard';
import WeeklyChart from '@/components/dashboard/WeeklyChart';
import TodayHabits from '@/components/dashboard/TodayHabits';
import TodayTasks from '@/components/dashboard/TodayTasks';
import DetectionAlerts from '@/components/dashboard/DetectionAlerts';
import HabitForm from '@/components/forms/HabitForm';
import TaskForm from '@/components/forms/TaskForm';

import {
  calculateConsistency,
  calculateStreak,
  getOperationalStatus,
  getTrend,
  getMostConsistentHabit,
  getMostAbandonedHabit,
  getDomainLevel,
} from '@/lib/habitUtils';

const GREETINGS = [
  (name) => `Bienvenido de nuevo, ${name}.`,
  (name) => `Estado operativo listo, ${name}.`,
  (name) => `Dominio activo, ${name}.`,
  (name) => `Sistema iniciado, ${name}.`,
  (name) => `Disciplina en curso, ${name}.`,
];

function getGreeting(name) {
  const idx = name.charCodeAt(0) % GREETINGS.length;
  return GREETINGS[idx](name);
}

export default function Dashboard({ username }) {
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const todayStr = getDateStr(new Date());

  const { habits, create: createHabit, update: updateHabit, remove: removeHabit } = useHabits();
  const { tasks, create: createTask, update: updateTask, remove: removeTask, toggle: toggleTask } = useTasks();
  const { logs, toggleHabit } = useLogs();

  const todayLog = logs.find(l => l.date === todayStr);
  const completedIds = todayLog?.completed_habits || [];

  const consistency = useMemo(() => calculateConsistency(logs, habits, 7), [logs, habits]);
  const streak = useMemo(() => calculateStreak(logs, habits), [logs, habits]);
  const status = useMemo(() => getOperationalStatus(consistency), [consistency]);
  const trend = useMemo(() => getTrend(logs, habits), [logs, habits]);
  const mostConsistent = useMemo(() => getMostConsistentHabit(logs, habits), [logs, habits]);
  const mostAbandoned = useMemo(() => getMostAbandonedHabit(logs, habits), [logs, habits]);
  const domainLevel = useMemo(() => getDomainLevel(consistency), [consistency]);

  const activeCount = habits.filter(h => h.active).length;

  const handleToggleHabit = (id) => {
    toggleHabit(id, todayStr, activeCount);
  };

  const handleToggleTask = (task) => {
    toggleTask(task, todayStr);
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

  const hasData = habits.length > 0 || logs.length > 0;

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-lg font-semibold tracking-wider uppercase">Dashboard</h1>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
            {format(new Date(), 'dd.MM.yyyy')} — {getGreeting(username)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setEditingTask(null); setShowTaskForm(true); }}
            className="text-[11px] gap-1.5 h-8"
          >
            <Plus className="w-3 h-3" /> Tarea
          </Button>
          <Button
            size="sm"
            onClick={() => { setEditingHabit(null); setShowHabitForm(true); }}
            className="text-[11px] gap-1.5 h-8"
          >
            <Plus className="w-3 h-3" /> Rutina
          </Button>
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <p className="text-sm text-muted-foreground mb-1">
            El sistema aún no posee historial operativo.
          </p>
          <p className="text-xs text-muted-foreground">
            Crea tu primera rutina para comenzar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status + Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatusWidget status={status} />
            <MetricCard label="Consistencia" value={`${consistency}%`} sublabel="Últimos 7 días" />
            <MetricCard
              label="Racha Actual"
              value={streak}
              sublabel={streak === 1 ? 'día' : 'días'}
            />
            <MetricCard
              label="Tendencia"
              value={trend.symbol}
              sublabel={trend.direction === 'up' ? 'Mejorando' : trend.direction === 'down' ? 'Decayendo' : 'Estable'}
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <MetricCard label="Nivel de Dominio" value={domainLevel.label} sublabel={`Nivel ${domainLevel.level}/5`} />
            {mostConsistent && (
              <MetricCard label="Más Consistente" value={mostConsistent.habit.name} sublabel={`${mostConsistent.rate}%`} />
            )}
            {mostAbandoned && (
              <MetricCard label="Más Abandonado" value={mostAbandoned.habit.name} sublabel={`${mostAbandoned.rate}%`} />
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <WeeklyChart logs={logs} habits={habits} />
            <DetectionAlerts logs={logs} habits={habits} />
          </div>

          {/* Today */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TodayHabits
              habits={habits}
              completedIds={completedIds}
              onToggle={handleToggleHabit}
              onEdit={handleEditHabit}
              onDelete={removeHabit}
            />
            <TodayTasks
              tasks={tasks}
              onToggle={handleToggleTask}
              onEdit={handleEditTask}
              onDelete={removeTask}
            />
          </div>
        </div>
      )}

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
          />
        )}
      </AnimatePresence>
    </div>
  );
}
