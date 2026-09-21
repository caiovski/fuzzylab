/**
 * Fuzzy Lab - Visualizador Didático (Curvas de Pertinência & Inspetor de Regras)
 */

export function initVisualizerController() {
  const canvas = document.getElementById('canvas-membership');
  const ctx = canvas.getContext('2d');
  const rulesContainer = document.getElementById('active-rules-container');

  let currentData = null;

  const SET_COLORS = ['#38bdf8', '#a855f7', '#10b981', '#f59e0b', '#f43f5e'];

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0) {
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = 220 * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }

  function drawCurves(system, primaryInputKey, inputValue) {
    if (!system || !canvas) return;

    const width = canvas.getBoundingClientRect().width;
    const height = 220;

    ctx.clearRect(0, 0, width, height);

    const variable = system.inputs[primaryInputKey] || Object.values(system.inputs)[0];
    if (!variable) return;

    const [minX, maxX] = variable.range;
    const padding = { top: 25, right: 30, bottom: 40, left: 45 };
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;

    // Grid e Eixos
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Rótulos de Y (0.0, 0.5, 1.0)
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('1.0', padding.left - 8, padding.top + 4);
    ctx.fillText('0.5', padding.left - 8, padding.top + plotH / 2 + 4);
    ctx.fillText('0.0', padding.left - 8, height - padding.bottom + 4);

    // Curvas dos conjuntos
    let colorIdx = 0;
    for (const [setName, fn] of Object.entries(variable.sets)) {
      const color = SET_COLORS[colorIdx % SET_COLORS.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const steps = 120;
      for (let i = 0; i <= steps; i++) {
        const val = minX + (i / steps) * (maxX - minX);
        const degree = fn(val);

        const x = padding.left + ((val - minX) / (maxX - minX)) * plotW;
        const y = height - padding.bottom - degree * plotH;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Legenda do conjunto
      ctx.fillStyle = color;
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(setName.toUpperCase(), padding.left + colorIdx * 90, padding.top - 8);

      colorIdx++;
    }

    // Linha vertical do valor atual
    if (typeof inputValue === 'number') {
      const curX = padding.left + ((inputValue - minX) / (maxX - minX)) * plotW;

      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(curX, padding.top);
      ctx.lineTo(curX, height - padding.bottom);
      ctx.stroke();
      ctx.restore();

      // Rótulo do valor no eixo X
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${inputValue} ${variable.unit || ''}`, curX, height - padding.bottom + 20);
    }
  }

  function renderRulesList(evaluatedRules) {
    if (!rulesContainer || !evaluatedRules) return;

    rulesContainer.innerHTML = '';

    // Ordena regras ativas primeiro
    const sorted = [...evaluatedRules].sort((a, b) => b.weight - a.weight);

    for (const item of sorted) {
      const el = document.createElement('div');
      el.className = `rule-item ${item.isActive ? 'active' : ''}`;

      const textSpan = document.createElement('span');
      textSpan.textContent = item.rule.text;

      const badge = document.createElement('span');
      badge.className = 'rule-weight-badge';
      badge.textContent = item.isActive ? `α = ${item.weight.toFixed(2)}` : 'Inativa';

      el.appendChild(textSpan);
      el.appendChild(badge);
      rulesContainer.appendChild(el);
    }
  }

  function updateVisualizer(state) {
    if (!state) return;
    currentData = state;

    resizeCanvas();
    const primaryKey = Object.keys(state.inputs)[0];
    drawCurves(state.system, primaryKey, state.inputs[primaryKey]);
    renderRulesList(state.result.evaluatedRules);
  }

  window.addEventListener('resize', () => {
    if (currentData) {
      resizeCanvas();
      const primaryKey = Object.keys(currentData.inputs)[0];
      drawCurves(currentData.system, primaryKey, currentData.inputs[primaryKey]);
    }
  });

  return { updateVisualizer };
}
