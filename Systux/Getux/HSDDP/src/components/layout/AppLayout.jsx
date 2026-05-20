import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-56 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
