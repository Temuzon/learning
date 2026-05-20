import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUsername } from '@/lib/storage';
import { Logs } from '@/lib/storage';

import Welcome from '@/pages/Welcome';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Calandrier from '@/pages/Calandrier';
import PageNotFound from '@/pages/PageNotFound';

function App() {
  const [username, setUsernameState] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Purge logs older than 60 days on startup
    Logs.purgeOld(60);
    const stored = getUsername();
    setUsernameState(stored);
    setChecked(true);
  }, []);

  if (!checked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!username) {
    return (
      <>
        <Welcome onComplete={(name) => setUsernameState(name)} />
        <Toaster />
      </>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<AppLayout username={username} />}>
          <Route path="/" element={<Dashboard username={username} />} />
          <Route path="/calandrier" element={<Calandrier />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
