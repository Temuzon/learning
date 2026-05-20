import { useLocation } from 'react-router-dom';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-mono font-light text-muted-foreground/30">404</h1>
        <p className="text-sm text-muted-foreground">
          Ruta <span className="font-medium text-foreground/60">"{pageName}"</span> no encontrada.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-4 text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
}
