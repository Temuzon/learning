async function loadDashboardSection() {
  const root = document.getElementById('dashboard-root');
  if (!root || root.querySelector('.dashboard')) return;

  if (!document.querySelector('link[href="Dashboard/dashboard.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'Dashboard/dashboard.css';
    document.head.appendChild(link);
  }

  try {
    const response = await fetch('Dashboard/dashboard.html', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Error cargando dashboard: ${response.status}`);
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const dashboardSection = doc.querySelector('.dashboard');

    if (!dashboardSection) throw new Error('No se encontró .dashboard en el HTML');

    root.appendChild(dashboardSection);

    const nameEl = root.querySelector('.user-name');
    if (nameEl) {
      nameEl.textContent = localStorage.getItem('stx_dashboard_name') || 'Usuario';
    }

    if (!document.querySelector('script[src="Dashboard/dashboard.js"]')) {
      const script = document.createElement('script');
      script.src = 'Dashboard/dashboard.js';
      document.body.appendChild(script);
    }
  } catch (error) {
    root.innerHTML = '<p style="color:#777;text-align:center;padding:40px;">No se pudo cargar el dashboard.</p>';
    console.error(error);
  }
}
