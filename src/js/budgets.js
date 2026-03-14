import { CATEGORIES } from './constants.js';
import { state } from './state.js';
import { saveBudgets } from './storage.js';
import { showToast } from './ui.js';
import { formatMoney, formatMonth } from './utils.js';

export function initBudgetForm({ onDataChanged }) {
  const catInputs = Object.keys(CATEGORIES).map((c) =>
    document.getElementById('budget-' + c),
  );
  const incomeInput = document.getElementById('income-amount');

  function updateTotals() {
    let total = 0;
    catInputs.forEach((inp) => {
      if (inp) total += parseFloat(inp.value) || 0;
    });

    const income = parseFloat(incomeInput.value) || 0;
    document.getElementById('budget-total-value').textContent =
      '$' + formatMoney(total);

    const remaining = income - total;
    const remEl = document.getElementById('budget-remaining-value');
    remEl.textContent = '$' + formatMoney(remaining);
    remEl.style.color = remaining < 0 ? '#999' : '#111';
  }

  catInputs.forEach((inp) => {
    if (inp) inp.addEventListener('input', updateTotals);
  });
  incomeInput.addEventListener('input', updateTotals);

  document.getElementById('budget-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const month = document.getElementById('budget-month').value;
    const income = parseFloat(incomeInput.value) || 0;

    if (!month || income <= 0) {
      showToast('Ingrese un mes e ingreso valido');
      return;
    }

    const catBudgets = {};
    Object.keys(CATEGORIES).forEach((c) => {
      const val = parseFloat(document.getElementById('budget-' + c).value) || 0;
      if (val > 0) catBudgets[c] = val;
    });

    state.budgets[month] = { income, categories: catBudgets };
    saveBudgets();
    renderBudgetsList();
    showToast('Presupuesto guardado para ' + formatMonth(month));

    if (onDataChanged) onDataChanged();
  });
}

export function deleteBudget(month, { onDataChanged } = {}) {
  delete state.budgets[month];
  saveBudgets();
  renderBudgetsList();
  showToast('Presupuesto eliminado');
  if (onDataChanged) onDataChanged();
}

export function renderBudgetsList() {
  const container = document.getElementById('budgets-list');
  const months = Object.keys(state.budgets).sort().reverse();

  if (months.length === 0) {
    container.innerHTML =
      '<p class="empty-state">No hay presupuestos configurados</p>';
    return;
  }

  let html = '';
  months.forEach((month) => {
    const b = state.budgets[month];
    const totalBudget = Object.values(b.categories).reduce((s, v) => s + v, 0);
    html += `
      <div class="budget-saved-item">
        <div class="budget-saved-header">
          <strong>${formatMonth(month)}</strong>
          <button class="btn btn-danger" onclick="deleteBudget('${month}')">Eliminar</button>
        </div>
        <div class="budget-saved-detail">
          Ingreso: $${formatMoney(b.income)} | Presupuestado: $${formatMoney(totalBudget)}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}
