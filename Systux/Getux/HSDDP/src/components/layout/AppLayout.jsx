import { Outlet } from 'react-router-dom';
import { useState } from 'react';

export default function AppLayout({ username }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="font-bold text-lg text-sidebar-foreground truncate">
            {sidebarOpen ? 'Statux' : 'S'}
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <a href="/" className="block px-4 py-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground">
            {sidebarOpen ? '📊 Dashboard' : '📊'}
          </a>
          <a href="/calandrier" className="block px-4 py-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground">
            {sidebarOpen ? '📅 Calendario' : '📅'}
          </a>
        </nav>
        
        <div className="p-4 border-t border-sidebar-border text-sm text-sidebar-foreground">
          {sidebarOpen ? `👤 ${username}` : '👤'}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
