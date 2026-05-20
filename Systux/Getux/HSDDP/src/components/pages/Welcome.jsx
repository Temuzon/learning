import { useState } from 'react';
import { setUsername } from '@/lib/storage';
import { motion } from 'framer-motion';

export default function Welcome({ onComplete }) {
  const [name, setName] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setUsername(name.trim());
    onComplete(name.trim());
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm px-8"
      >
        {/* Logo / Brand */}
        <div className="mb-12">
          <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase font-mono mb-1">
            Sistema de Dominio Personal
          </p>
          <h1 className="text-2xl font-semibold tracking-wider uppercase text-foreground">
            Hábitos
          </h1>
        </div>

        {/* Prompt */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Antes de comenzar, necesito conocerte.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
              Tu nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Escribe tu nombre"
              autoFocus
              className={`
                w-full bg-transparent border-b text-foreground text-lg font-light
                placeholder:text-muted-foreground/40 outline-none pb-2 transition-colors duration-200
                ${focused ? 'border-foreground/60' : 'border-border'}
              `}
            />
          </div>

          <motion.button
            type="submit"
            disabled={!name.trim()}
            whileTap={{ scale: 0.97 }}
            className={`
              w-full py-3 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-200
              ${name.trim()
                ? 'bg-foreground text-background hover:bg-foreground/90 cursor-pointer'
                : 'bg-secondary text-muted-foreground cursor-not-allowed'
              }
              rounded-md
            `}
          >
            Iniciar Sistema
          </motion.button>
        </form>

        <p className="mt-8 text-[10px] text-muted-foreground/40 text-center tracking-wider">
          Todo se guarda localmente. Sin cuentas. Sin servidores.
        </p>
      </motion.div>
    </div>
  );
}
