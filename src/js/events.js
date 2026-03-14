export function initGlobalEvents() {
  document.getElementById('export-charts-pdf').addEventListener('click', () => {
    const chartsSection = document.getElementById('charts');
    chartsSection.classList.add('printing');
    document.body.classList.add('print-mode');
    window.print();
    document.body.classList.remove('print-mode');
    chartsSection.classList.remove('printing');
  });

  window.addEventListener('offline', () => {
    window.location.href = './src/html/offline.html';
  });

  window.addEventListener('online', () => {
    window.location.href = new URL(
      '../../../index.html',
      window.location.href,
    ).href;
  });
}
