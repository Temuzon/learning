import { useState } from 'react';
import { setUsername } from '@/lib/storage';

export default function Welcome({ onComplete }) {
  const [username, setUsernameValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }

    setUsername(username.trim());
    onComplete(username.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg border border-border shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-foreground">Welcome to Statux</h1>
          <p className="text-muted-foreground">Your personal habit and task tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-foreground">
              What's your name?
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsernameValue(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Your data is stored locally in your browser
        </p>
      </div>
    </div>
  );
}
