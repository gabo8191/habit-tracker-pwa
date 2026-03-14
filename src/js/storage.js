import { STORAGE_KEYS } from './constants.js';
import { state } from './state.js';

export function loadData() {
  try {
    const savedExpenses = localStorage.getItem(STORAGE_KEYS.expenses);
    const savedBudgets = localStorage.getItem(STORAGE_KEYS.budgets);
    state.expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
    state.budgets = savedBudgets ? JSON.parse(savedBudgets) : {};
  } catch {
    state.expenses = [];
    state.budgets = {};
  }
}

export function saveExpenses() {
  localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(state.expenses));
}

export function saveBudgets() {
  localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(state.budgets));
}
