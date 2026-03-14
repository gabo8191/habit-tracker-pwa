const PARTIALS = [
  { target: 'app-nav', path: './src/html/partials/nav.html' },
  { target: 'app-expenses', path: './src/html/partials/expenses-section.html' },
  { target: 'app-budget', path: './src/html/partials/budget-section.html' },
  { target: 'app-charts', path: './src/html/partials/charts-section.html' },
  { target: 'app-summary', path: './src/html/partials/summary-section.html' },
  { target: 'app-toast', path: './src/html/partials/toast.html' },
];

async function loadPartials() {
  const results = await Promise.allSettled(
    PARTIALS.map(async ({ target, path }) => {
      const mountNode = document.getElementById(target);
      if (!mountNode) {
        throw new Error(`No existe el contenedor: ${target}`);
      }

      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`No se pudo cargar ${path}: ${response.status}`);
      }

      mountNode.innerHTML = await response.text();
    }),
  );

  const failed = results.filter((item) => item.status === 'rejected');
  if (failed.length > 0) {
    throw new Error(`Fallo la carga de ${failed.length} parcial(es)`);
  }
}

async function start() {
  try {
    await loadPartials();
    await import('./main.js');
  } catch (error) {
    console.error('Error iniciando la app:', error);
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div style="position:fixed;inset:auto 12px 12px 12px;padding:10px 12px;background:#111;color:#fff;border-radius:8px;z-index:9999;font-size:13px">Error cargando la interfaz. Recarga la pagina.</div>',
    );
  }
}

start();
