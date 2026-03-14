export function initNavigation({ onChartsOpen, onSummaryOpen }) {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      navBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      document
        .querySelectorAll('.section')
        .forEach((s) => s.classList.remove('active'));
      document.getElementById(section).classList.add('active');

      if (section === 'charts' && onChartsOpen) onChartsOpen();
      if (section === 'summary' && onSummaryOpen) onSummaryOpen();
    });
  });
}

export function setDefaultDates() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const currentMonth = `${yyyy}-${mm}`;

  document.getElementById('expense-date').value = `${yyyy}-${mm}-${dd}`;
  document.getElementById('current-date').textContent =
    today.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  document.getElementById('budget-month').value = currentMonth;
  document.getElementById('filter-month').value = currentMonth;
  document.getElementById('chart-month').value = currentMonth;
  document.getElementById('summary-month').value = currentMonth;
}
