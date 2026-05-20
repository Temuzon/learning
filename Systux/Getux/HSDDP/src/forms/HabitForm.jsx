import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function HabitForm({ habit, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: habit?.name || '',
    purpose: habit?.purpose || '',
    benefit: habit?.benefit || '',
    frequency: habit?.frequency || 'daily',
    custom_days: habit?.custom_days || [],
    priority: habit?.priority || 'medium',
    difficulty: habit?.difficulty || 'moderate',
    schedule_time: habit?.schedule_time || '',
    active: habit?.active !== undefined ? habit.active : true,
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Nombre requerido.'); return; }
    if (!form.purpose.trim()) { setError('Propósito obligatorio.'); return; }
    onSubmit(form);
  };

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      custom_days: prev.custom_days.includes(day)
        ? prev.custom_days.filter(d => d !== day)
        : [...prev.custom_days, day],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold tracking-wider uppercase">
            {habit ? 'Editar Rutina' : 'Nueva Rutina'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Nombre</Label>
            <Input
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Ej: Leer documentación técnica"
              className="bg-secondary border-border text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Propósito *</Label>
            <Textarea
              value={form.purpose}
              onChange={e => setForm({...form, purpose: e.target.value})}
              placeholder="¿Por qué este hábito es importante?"
              className="bg-secondary border-border text-sm min-h-[60px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Beneficio</Label>
            <Input
              value={form.benefit}
              onChange={e => setForm({...form, benefit: e.target.value})}
              placeholder="¿Qué obtienes al cumplirlo?"
              className="bg-secondary border-border text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Frecuencia</Label>
              <Select value={form.frequency} onValueChange={v => setForm({...form, frequency: v})}>
                <SelectTrigger className="bg-secondary border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekdays">Lun-Vie</SelectItem>
                  <SelectItem value="weekends">Sáb-Dom</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Prioridad</Label>
              <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                <SelectTrigger className="bg-secondary border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.frequency === 'custom' && (
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Días</Label>
              <div className="flex gap-1.5">
                {DAYS.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-all ${
                      form.custom_days.includes(i)
                        ? 'bg-foreground text-background'
                        : 'bg-secondary text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Dificultad</Label>
              <Select value={form.difficulty} onValueChange={v => setForm({...form, difficulty: v})}>
                <SelectTrigger className="bg-secondary border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trivial">Trivial</SelectItem>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="moderate">Moderada</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                  <SelectItem value="extreme">Extrema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Horario</Label>
              <Input
                type="time"
                value={form.schedule_time}
                onChange={e => setForm({...form, schedule_time: e.target.value})}
                className="bg-secondary border-border text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-xs">
              Cancelar
            </Button>
            <Button type="submit" className="text-xs">
              {habit ? 'Guardar Cambios' : 'Crear Rutina'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
