import { useState, useEffect } from 'react';
import { getHabits, getTasks } from '@/lib/storage';

export default function Dashboard({ username }) {
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState('habits');

  useEffect(() => {
    setHabits(getHabits());
    setTasks(getTasks());
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {username}! 👋
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Habits</div>
            <div className="text-3xl font-bold text-foreground">{habits.length}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Tasks</div>
            <div className="text-3xl font-bold text-foreground">{tasks.length}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Completed Today</div>
            <div className="text-3xl font-bold text-foreground">0</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Streak</div>
            <div className="text-3xl font-bold text-foreground">0 days</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          <div className="flex gap-4 border-b border-border">
            <button
              onClick={() => setTab('habits')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                tab === 'habits'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Habits
            </button>
            <button
              onClick={() => setTab('tasks')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                tab === 'tasks'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Tasks
            </button>
          </div>

          {/* Content */}
          <div>
            {tab === 'habits' && (
              <div className="space-y-4">
                {habits.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-lg border border-border">
                    <p className="text-muted-foreground">No habits yet. Create one to get started!</p>
                  </div>
                ) : (
                  habits.map((habit) => (
                    <div key={habit.id} className="bg-card border border-border rounded-lg p-4">
                      <h3 className="font-medium text-foreground">{habit.name}</h3>
                      <p className="text-sm text-muted-foreground">{habit.description}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'tasks' && (
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-lg border border-border">
                    <p className="text-muted-foreground">No tasks yet. Create one to get started!</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="bg-card border border-border rounded-lg p-4">
                      <h3 className="font-medium text-foreground">{task.title}</h3>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
