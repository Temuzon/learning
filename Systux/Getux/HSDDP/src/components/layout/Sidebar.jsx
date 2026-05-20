import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUsername } from '@/lib/storage';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/calandrier', label: 'Calandrier', icon: Calendar },
];

export default function Sidebar() {
  const location = useLocation();
  const username = getUsername();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      <div className="p-6 pb-2">
        <h1 className="text-sm font-semibold tracking-[0.2em] text-foreground uppercase">
          Hábitos
        </h1>
        <p className="text-[10px] tracking-[0.15em] text-muted-foreground mt-0.5 uppercase">
          Sistema de Dominio Personal
        </p>
      </div>

      <div className="h-px bg-sidebar-border mx-4 my-3" />

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        {username && (
          <p className="text-[11px] text-foreground/60 font-medium mb-1 truncate">{username}</p>
        )}
        <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
          v1.0 — Operativo
        </p>
      </div>
    </aside>
  );
}
