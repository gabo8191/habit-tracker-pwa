import { CATEGORIES } from './constants.js';
import { state } from './state.js';
import { formatMoney, getCategoryLabel, getCategoryShort } from './utils.js';

export function updateCharts() {
  const month = document.getElementById('chart-month').value;
  renderBarChart(month);
  renderPieChart(month);
}

export function renderBarChart(month) {
  const container = document.getElementById('bar-chart');
  const legendContainer = document.getElementById('bar-chart-legend');
  const budget = state.budgets[month];

  const monthExpenses = state.expenses.filter((e) => e.date.startsWith(month));
  const spentByCategory = {};
  monthExpenses.forEach((e) => {
    spentByCategory[e.category] = (spentByCategory[e.category] || 0) + e.amount;
  });

  const allCats = new Set([
    ...Object.keys(budget ? budget.categories : {}),
    ...Object.keys(spentByCategory),
  ]);

  if (allCats.size === 0) {
    container.innerHTML =
      '<p class="empty-state">No hay datos para este mes</p>';
    legendContainer.innerHTML = '';
    return;
  }

  const cats = Array.from(allCats);
  const maxVal = Math.max(
    ...cats.map((c) =>
      Math.max((budget && budget.categories[c]) || 0, spentByCategory[c] || 0),
    ),
    1,
  );

  const barWidth = 28;
  const groupGap = 20;
  const groupWidth = barWidth * 2 + 6;
  const chartWidth = cats.length * (groupWidth + groupGap) + 60;
  const chartHeight = 220;
  const bottomMargin = 60;
  const topMargin = 20;

  let svg = `<svg class="bar-chart-svg" viewBox="0 0 ${chartWidth} ${chartHeight + bottomMargin + topMargin}" xmlns="http://www.w3.org/2000/svg">`;

  for (let i = 0; i <= 4; i++) {
    const y = topMargin + (chartHeight / 4) * i;
    const val = maxVal - (maxVal / 4) * i;
    svg += `<line x1="45" y1="${y}" x2="${chartWidth}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`;
    svg += `<text x="40" y="${y + 4}" text-anchor="end" font-size="10" fill="#6b7280">$${Math.round(val)}</text>`;
  }

  cats.forEach((cat, i) => {
    const x = 60 + i * (groupWidth + groupGap);
    const budgetVal = (budget && budget.categories[cat]) || 0;
    const spentVal = spentByCategory[cat] || 0;

    const bHeight = (budgetVal / maxVal) * chartHeight;
    const sHeight = (spentVal / maxVal) * chartHeight;

    const bY = topMargin + chartHeight - bHeight;
    const sY = topMargin + chartHeight - sHeight;

    svg += `<rect x="${x}" y="${bY}" width="${barWidth}" height="${bHeight}" rx="3" fill="#111" opacity="0.2"/>`;
    if (budgetVal > 0) {
      svg += `<text x="${x + barWidth / 2}" y="${bY - 4}" text-anchor="middle" font-size="9" fill="#555">$${Math.round(budgetVal)}</text>`;
    }

    const spentColor = spentVal > budgetVal && budgetVal > 0 ? '#555' : '#111';
    svg += `<rect x="${x + barWidth + 6}" y="${sY}" width="${barWidth}" height="${sHeight}" rx="3" fill="${spentColor}" opacity="0.75"/>`;
    if (spentVal > 0) {
      svg += `<text x="${x + barWidth + 6 + barWidth / 2}" y="${sY - 4}" text-anchor="middle" font-size="9" fill="${spentColor}">$${Math.round(spentVal)}</text>`;
    }

    svg += `<text x="${x + groupWidth / 2}" y="${topMargin + chartHeight + 16}" text-anchor="middle" font-size="10" font-weight="600" fill="#333">${getCategoryShort(cat)}</text>`;
    svg += `<text x="${x + groupWidth / 2}" y="${topMargin + chartHeight + 30}" text-anchor="middle" font-size="8" fill="#999">${getCategoryLabel(cat)}</text>`;
  });

  svg += '</svg>';
  container.innerHTML = svg;

  legendContainer.innerHTML = `
    <div class="legend-item"><span class="legend-color" style="background:#111;opacity:0.2"></span> Presupuesto</div>
    <div class="legend-item"><span class="legend-color" style="background:#111"></span> Gasto (dentro)</div>
    <div class="legend-item"><span class="legend-color" style="background:#555"></span> Gasto (excedido)</div>
  `;
}

export function renderPieChart(month) {
  const canvas = document.getElementById('pie-chart');
  const legendContainer = document.getElementById('pie-chart-legend');
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const center = size / 2;
  const radius = size / 2 - 20;

  ctx.clearRect(0, 0, size, size);

  const monthExpenses = state.expenses.filter((e) => e.date.startsWith(month));
  const spentByCategory = {};
  monthExpenses.forEach((e) => {
    spentByCategory[e.category] = (spentByCategory[e.category] || 0) + e.amount;
  });

  const cats = Object.keys(spentByCategory);
  const total = Object.values(spentByCategory).reduce((s, v) => s + v, 0);

  if (cats.length === 0 || total === 0) {
    ctx.fillStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#6b7280';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sin datos', center, center);
    legendContainer.innerHTML = '';
    return;
  }

  let currentAngle = -Math.PI / 2;
  const slices = [];

  cats.forEach((cat) => {
    const val = spentByCategory[cat];
    const sliceAngle = (val / total) * Math.PI * 2;
    const color = CATEGORIES[cat] ? CATEGORIES[cat].color : '#999999';

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (sliceAngle > 0.3) {
      const midAngle = currentAngle + sliceAngle / 2;
      const textX = center + Math.cos(midAngle) * radius * 0.6;
      const textY = center + Math.sin(midAngle) * radius * 0.6;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round((val / total) * 100) + '%', textX, textY);
    }

    slices.push({ cat, val, color });
    currentAngle += sliceAngle;
  });

  let legendHtml = '';
  slices.sort((a, b) => b.val - a.val);
  slices.forEach((s) => {
    const pct = ((s.val / total) * 100).toFixed(1);
    legendHtml += `
      <div class="legend-item">
        <span class="legend-color" style="background:${s.color}"></span>
        ${getCategoryLabel(s.cat)}: $${formatMoney(s.val)} (${pct}%)
      </div>
    `;
  });
  legendContainer.innerHTML = legendHtml;
}
