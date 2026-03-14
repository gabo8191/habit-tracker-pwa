import { CATEGORIES, CATEGORY_LABELS } from './constants.js';

export function getCategoryLabel(cat) {
  return CATEGORY_LABELS[cat] || cat;
}

export function getCategoryShort(cat) {
  return CATEGORIES[cat] ? CATEGORIES[cat].label : 'OT';
}

export function formatDate(dateStr) {
  const parts = dateStr.split('-');
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonth(monthStr) {
  const [y, m] = monthStr.split('-');
  const date = new Date(y, m - 1);
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

export function formatMoney(amount) {
  return amount.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
