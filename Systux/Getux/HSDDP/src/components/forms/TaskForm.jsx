import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function TaskForm({ task, onSubmit, onClose, defaultDate }) {
  const [form, setForm] = useState({
    name: task?.name || '',
    purpose: task?.purpose || '',
    due_date: task?.due_date || defaultDate || format(new Date(), 'yyyy-MM-dd'),
    priority: task?.priority || 'medium',
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Nombre requerido.'); return; }
    if (!form.purpose.trim()) { setError('Propósito obligatorio.'); return; }
    onSubmit(form);
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
        className="bg-card border border-border rounded-lg w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold tracking-wider uppercase">
            {task ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Nombre</Label>
            <Input
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Ej: Terminar proyecto"
              className="bg-secondary border-border text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Propósito *</Label>
            <Textarea
              value={form.purpose}
              onChange={e => setForm({...form, purpose: e.target.value})}
              placeholder="¿Por qué esta tarea es importante?"
              className="bg-secondary border-border text-sm min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Fecha</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={e => setForm({...form, due_date: e.target.value})}
                className="bg-secondary border-border text-sm"
              />
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-xs">
              Cancelar
            </Button>
            <Button type="submit" className="text-xs">
              {task ? 'Guardar Cambios' : 'Crear Tarea'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
