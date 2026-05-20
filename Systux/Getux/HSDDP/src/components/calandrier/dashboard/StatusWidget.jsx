import { cn } from '@/lib/utils';

const levelStyles = {
  high: 'border-foreground/20 text-foreground',
  stable: 'border-muted-foreground/20 text-muted-foreground',
  risk: 'border-muted-foreground/30 text-muted-foreground',
  critical: 'border-muted-foreground/40 text-muted-foreground',
};

export default function StatusWidget({ status }) {
  if (!status) return null;

  return (
    <div className={cn(
      'border rounded-md px-4 py-3 bg-card',
      levelStyles[status.level]
    )}>
      <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">
        Estado Operativo
      </p>
      <p className="text-sm font-semibold tracking-wider">
        {status.label}
      </p>
    </div>
  );
}
