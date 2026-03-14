import { CATEGORIES } from './constants.js';
import { state } from './state.js';
import {
  escapeHtml,
  formatDate,
  formatMoney,
  formatMonth,
  getCategoryLabel,
  getCategoryShort,
} from './utils.js';

export function updateSummary() {
  const month = document.getElementById('summary-month').value;
  const budget = state.budgets[month];
  const monthExpenses = state.expenses.filter((e) => e.date.startsWith(month));

  const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const income = budget ? budget.income : 0;
  const totalBudgeted = budget
    ? Object.values(budget.categories).reduce((s, v) => s + v, 0)
    : 0;
  const remaining = income - totalSpent;

  document.getElementById('summary-title').textContent =
    'Resumen - ' + formatMonth(month);
  document.getElementById('summary-income').textContent =
    '$' + formatMoney(income);
  document.getElementById('summary-budgeted').textContent =
    '$' + formatMoney(totalBudgeted);
  document.getElementById('summary-spent').textContent =
    '$' + formatMoney(totalSpent);
  document.getElementById('summary-remaining').textContent =
    '$' + formatMoney(remaining);

  const progressBar = document.getElementById('general-progress');
  const progressText = document.getElementById('general-progress-text');
  if (totalBudgeted > 0) {
    const pct = Math.min((totalSpent / totalBudgeted) * 100, 100);
    progressBar.style.width = pct + '%';
    progressBar.className = 'progress-bar';
    if (pct > 90) progressBar.classList.add('danger');
    else if (pct > 70) progressBar.classList.add('warning');

    progressText.textContent = `${pct.toFixed(1)}% del presupuesto utilizado ($${formatMoney(totalSpent)} de $${formatMoney(totalBudgeted)})`;
  } else {
    progressBar.style.width = '0%';
    progressBar.className = 'progress-bar';
    progressText.textContent = 'Sin presupuesto configurado para este mes';
  }

  const catContainer = document.getElementById('summary-categories');
  const spentByCategory = {};
  monthExpenses.forEach((e) => {
    spentByCategory[e.category] = (spentByCategory[e.category] || 0) + e.amount;
  });

  const allCats = new Set([
    ...Object.keys(budget ? budget.categories : {}),
    ...Object.keys(spentByCategory),
  ]);

  if (allCats.size === 0) {
    catContainer.innerHTML =
      '<p class="empty-state">Sin datos para este mes</p>';
  } else {
    let catHtml = '';
    Array.from(allCats).forEach((cat) => {
      const spent = spentByCategory[cat] || 0;
      const budgeted = (budget && budget.categories[cat]) || 0;
      const pct =
        budgeted > 0
          ? Math.min((spent / budgeted) * 100, 100)
          : spent > 0
            ? 100
            : 0;
      const color = CATEGORIES[cat] ? CATEGORIES[cat].color : '#999999';
      const shortLabel = getCategoryShort(cat);
      const barColor = spent > budgeted && budgeted > 0 ? '#555' : color;

      catHtml += `
        <div class="category-detail-item">
          <span class="cat-detail-icon">${shortLabel}</span>
          <div class="cat-detail-info">
            <div class="cat-detail-name">${getCategoryLabel(cat)}</div>
            <div class="cat-detail-bar-container">
              <div class="cat-detail-bar" style="width:${pct}%;background:${barColor}"></div>
            </div>
          </div>
          <div class="cat-detail-amounts">
            <div class="cat-detail-spent">$${formatMoney(spent)}</div>
            <div class="cat-detail-budget">${budgeted > 0 ? 'de $' + formatMoney(budgeted) : 'sin ppto.'}</div>
          </div>
        </div>
      `;
    });
    catContainer.innerHTML = catHtml;
  }

  const topContainer = document.getElementById('summary-top-expenses');
  const sortedExpenses = [...monthExpenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  if (sortedExpenses.length === 0) {
    topContainer.innerHTML =
      '<p class="empty-state">Sin gastos registrados</p>';
  } else {
    let topHtml = '';
    sortedExpenses.forEach((exp, i) => {
      const shortLabel = getCategoryShort(exp.category);
      topHtml += `
        <div class="top-expense-item">
          <span class="top-expense-rank">${i + 1}</span>
          <span class="cat-detail-icon">${shortLabel}</span>
          <div class="top-expense-info">
            <div class="te-cat">${getCategoryLabel(exp.category)}</div>
            <div class="te-desc">${escapeHtml(exp.description)} · ${formatDate(exp.date)}</div>
          </div>
          <span class="top-expense-amount">$${formatMoney(exp.amount)}</span>
        </div>
      `;
    });
    topContainer.innerHTML = topHtml;
  }
}
