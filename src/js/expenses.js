import { CATEGORIES } from './constants.js';
import { state } from './state.js';
import { saveExpenses } from './storage.js';
import { showToast } from './ui.js';
import {
  escapeHtml,
  formatDate,
  formatMoney,
  getCategoryLabel,
} from './utils.js';

export function initExpenseForm({ onDataChanged }) {
  document.getElementById('expense-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const description = document
      .getElementById('expense-description')
      .value.trim();
    const date = document.getElementById('expense-date').value;

    if (!amount || amount <= 0 || !category || !date) {
      showToast('Complete todos los campos requeridos');
      return;
    }

    const expense = {
      id: Date.now().toString(),
      amount,
      category,
      description: description || getCategoryLabel(category),
      date,
    };

    state.expenses.push(expense);
    saveExpenses();
    renderExpensesList();
    showToast('Gasto registrado correctamente');

    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-category').value = '';
    document.getElementById('expense-description').value = '';

    if (onDataChanged) onDataChanged();
  });
}

export function deleteExpense(id, { onDataChanged } = {}) {
  state.expenses = state.expenses.filter((e) => e.id !== id);
  saveExpenses();
  renderExpensesList();
  showToast('Gasto eliminado');
  if (onDataChanged) onDataChanged();
}

export function renderExpensesList() {
  const container = document.getElementById('expenses-list');
  const filterMonth = document.getElementById('filter-month').value;

  let filtered = state.expenses;
  if (filterMonth) {
    filtered = state.expenses.filter((e) => e.date.startsWith(filterMonth));
  }

  filtered.sort(
    (a, b) => b.date.localeCompare(a.date) || Number(b.id) - Number(a.id),
  );

  if (filtered.length === 0) {
    container.innerHTML =
      '<p class="empty-state">No hay gastos registrados</p>';
    return;
  }

  let total = 0;
  let html = '';
  filtered.forEach((exp) => {
    total += exp.amount;
    const cat = CATEGORIES[exp.category] || CATEGORIES.otros;
    html += `
      <div class="expense-item">
        <span class="expense-icon">${cat.label}</span>
        <div class="expense-info">
          <div class="expense-cat">${getCategoryLabel(exp.category)}</div>
          <div class="expense-desc">${escapeHtml(exp.description)}</div>
          <div class="expense-date-label">${formatDate(exp.date)}</div>
        </div>
        <span class="expense-amount">-$${formatMoney(exp.amount)}</span>
        <div class="expense-actions">
          <button class="btn btn-danger" onclick="deleteExpense('${exp.id}')">x</button>
        </div>
      </div>
    `;
  });

  html =
    `<div style="text-align:right;margin-bottom:8px;font-weight:600;font-size:13px;color:#777;">
      Total: <span style="color:#111;">-$${formatMoney(total)}</span> (${filtered.length} gastos)
    </div>` + html;

  container.innerHTML = html;
}
