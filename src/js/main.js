import { deleteBudget, initBudgetForm, renderBudgetsList } from './budgets.js';
import { updateCharts } from './charts.js';
import { initGlobalEvents } from './events.js';
import {
  deleteExpense,
  initExpenseForm,
  renderExpensesList,
} from './expenses.js';
import { initFilters } from './filters.js';
import { initNavigation, setDefaultDates } from './navigation.js';
import { loadData } from './storage.js';
import { updateSummary } from './summary.js';

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => console.log('SW registrado:', reg.scope))
      .catch((err) => console.log('SW error:', err));
  }
}

function syncDependentViews() {
  updateCharts();
  updateSummary();
}

function initApp() {
  loadData();
  setDefaultDates();

  initNavigation({
    onChartsOpen: updateCharts,
    onSummaryOpen: updateSummary,
  });

  initExpenseForm({ onDataChanged: syncDependentViews });
  initBudgetForm({ onDataChanged: syncDependentViews });
  initFilters({
    onExpensesFilter: renderExpensesList,
    onChartFilter: updateCharts,
    onSummaryFilter: updateSummary,
  });
  initGlobalEvents();

  renderExpensesList();
  renderBudgetsList();
  registerSW();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Keep global handlers for inline buttons in rendered templates.
window.deleteExpense = (id) =>
  deleteExpense(id, { onDataChanged: syncDependentViews });
window.deleteBudget = (month) =>
  deleteBudget(month, { onDataChanged: syncDependentViews });
