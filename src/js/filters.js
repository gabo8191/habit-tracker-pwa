export function initFilters({
  onExpensesFilter,
  onChartFilter,
  onSummaryFilter,
}) {
  document
    .getElementById('filter-month')
    .addEventListener('change', onExpensesFilter);
  document
    .getElementById('chart-month')
    .addEventListener('change', onChartFilter);
  document
    .getElementById('summary-month')
    .addEventListener('change', onSummaryFilter);
}
