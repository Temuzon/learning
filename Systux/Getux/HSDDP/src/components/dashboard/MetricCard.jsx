import { cn } from '@/lib/utils';

export default function MetricCard({ label, value, sublabel, className }) {
  return (
    <div className={cn('border border-border rounded-md px-4 py-3 bg-card', className)}>
      <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-xl font-semibold text-foreground font-mono">
        {value}
      </p>
      {sublabel && (
        <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>
      )}
    </div>
  );
}
