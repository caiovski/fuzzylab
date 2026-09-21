/**
 * Fuzzy Lab - Bundled Distribution Script (Zero-CORS / Standalone & Local Safe)
 * Contains: Engine, TrafficRules, BurnoutRules, TrafficController, BurnoutController, VisualizerController, App
 */
(function() {
  'use strict';

  // --- 1. ENGINE ---
  const MembershipFunctions = {
    triangular(x, a, b, c) {
      if (a === b && x <= b) return 1;
      if (b === c && x >= b) return 1;
      if (x <= a || x >= c) return 0;
      if (x === b) return 1;
      if (x > a && x < b) return (x - a) / (b - a);
      return (c - x) / (c - b);
    },
    trapezoidal(x, a, b, c, d) {
      if (a === b && x <= b) return 1;
      if (c === d && x >= c) return 1;
      if (x < a || x > d) return 0;
      if (x >= b && x <= c) return 1;
      if (x > a && x < b) return (b === a) ? 1 : (x - a) / (b - a);
      return (d === c) ? 1 : (d - x) / (d - c);
    }
  };

  function fuzzify(variable, value) {
    const result = {};
    for (const [setName, fn] of Object.entries(variable.sets)) {
      result[setName] = fn(value);
    }
    return result;
  }

  function evaluateRules(rules, fuzzifiedInputs) {
    return rules.map(rule => {
      const inputWeights = Object.entries(rule.antecedents).map(([varName, setName]) => {
        const varDegrees = fuzzifiedInputs[varName];
        return (varDegrees && typeof varDegrees[setName] === 'number') ? varDegrees[setName] : 0;
      });
      const firingStrength = inputWeights.length > 0 ? Math.min(...inputWeights) : 0;
      return { rule, weight: firingStrength, isActive: firingStrength > 0.001 };
    });
  }

  function defuzzifyCentroid(evaluatedRules, outputVariable, steps = 100) {
    const [min, max] = outputVariable.range;
    const stepSize = (max - min) / steps;
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i <= steps; i++) {
      const y = min + i * stepSize;
      let aggregatedDegree = 0;
      for (const item of evaluatedRules) {
        if (item.weight <= 0.001) continue;
        const outputSetFn = outputVariable.sets[item.rule.consequent];
        if (outputSetFn) {
          const degree = outputSetFn(y);
          const clippedDegree = Math.min(item.weight, degree);
          if (clippedDegree > aggregatedDegree) aggregatedDegree = clippedDegree;
        }
      }
      numerator += y * aggregatedDegree;
      denominator += aggregatedDegree;
    }
    return denominator <= 0.0001 ? (min + max) / 2 : numerator / denominator;
  }

  function runFuzzySystem(systemConfig, inputValues) {
    const fuzzifiedInputs = {};
    for (const [varName, variable] of Object.entries(systemConfig.inputs)) {
      fuzzifiedInputs[varName] = fuzzify(variable, inputValues[varName]);
    }
    const evaluatedRules = evaluateRules(systemConfig.rules, fuzzifiedInputs);
    const crispOutput = defuzzifyCentroid(evaluatedRules, systemConfig.output);
    return { fuzzifiedInputs, evaluatedRules, crispOutput };
  }

  // --- 2. TRAFFIC SYSTEM ---
  const { triangular, trapezoidal } = MembershipFunctions;
  const TrafficSystem = {
    name: 'Semáforo Inteligente',
    inputs: {
      mainQueue: {
        name: 'Fila Principal',
        unit: 'carros',
        range: [0, 50],
        sets: {
          baixa: (x) => trapezoidal(x, 0, 0, 8, 18),
          media: (x) => triangular(x, 10, 25, 40),
          alta: (x) => trapezoidal(x, 30, 42, 50, 50)
        }
      },
      secQueue: {
        name: 'Fila Secundária',
        unit: 'carros',
        range: [0, 50],
        sets: {
          baixa: (x) => trapezoidal(x, 0, 0, 8, 18),
          media: (x) => triangular(x, 10, 25, 40),
          alta: (x) => trapezoidal(x, 30, 42, 50, 50)
        }
      }
    },
    output: {
      name: 'Tempo do Sinal Verde',
      unit: 'segundos',
      range: [10, 90],
      sets: {
        curto: (y) => trapezoidal(y, 10, 10, 20, 35),
        medio: (y) => triangular(y, 25, 50, 75),
        longo: (y) => trapezoidal(y, 60, 75, 90, 90)
      }
    },
    rules: [
      { id: 1, antecedents: { mainQueue: 'baixa', secQueue: 'baixa' }, consequent: 'medio', text: 'SE Principal é Baixa E Secundária é Baixa ENTÃO Verde é Médio' },
      { id: 2, antecedents: { mainQueue: 'baixa', secQueue: 'media' }, consequent: 'curto', text: 'SE Principal é Baixa E Secundária é Média ENTÃO Verde é Curto' },
      { id: 3, antecedents: { mainQueue: 'baixa', secQueue: 'alta' }, consequent: 'curto', text: 'SE Principal é Baixa E Secundária é Alta ENTÃO Verde é Curto' },
      { id: 4, antecedents: { mainQueue: 'media', secQueue: 'baixa' }, consequent: 'longo', text: 'SE Principal é Média E Secundária é Baixa ENTÃO Verde é Longo' },
      { id: 5, antecedents: { mainQueue: 'media', secQueue: 'media' }, consequent: 'medio', text: 'SE Principal é Média E Secundária é Média ENTÃO Verde é Médio' },
      { id: 6, antecedents: { mainQueue: 'media', secQueue: 'alta' }, consequent: 'curto', text: 'SE Principal é Média E Secundária é Alta ENTÃO Verde é Curto' },
      { id: 7, antecedents: { mainQueue: 'alta', secQueue: 'baixa' }, consequent: 'longo', text: 'SE Principal é Alta E Secundária é Baixa ENTÃO Verde é Longo' },
      { id: 8, antecedents: { mainQueue: 'alta', secQueue: 'media' }, consequent: 'longo', text: 'SE Principal é Alta E Secundária é Média ENTÃO Verde é Longo' },
      { id: 9, antecedents: { mainQueue: 'alta', secQueue: 'alta' }, consequent: 'medio', text: 'SE Principal é Alta E Secundária é Alta ENTÃO Verde é Médio' }
    ]
  };

  // --- 3. BURNOUT SYSTEM ---
  const BurnoutSystem = {
    name: 'Detector de Sobrecarga e Burnout',
    inputs: {
      sleep: {
        name: 'Horas de Sono',
        unit: 'h',
        range: [0, 12],
        sets: {
          pouco: (x) => trapezoidal(x, 0, 0, 4, 6),
          adequado: (x) => triangular(x, 5.5, 7.5, 9.5),
          muito: (x) => trapezoidal(x, 8.5, 10, 12, 12)
        }
      },
      tasks: {
        name: 'Prazos e Entregas',
        unit: 'tarefas',
        range: [0, 10],
        sets: {
          tranquilo: (x) => trapezoidal(x, 0, 0, 2, 4),
          moderado: (x) => triangular(x, 2.5, 5, 7.5),
          critico: (x) => trapezoidal(x, 6, 8, 10, 10)
        }
      },
      screen: {
        name: 'Horas de Tela',
        unit: 'h',
        range: [0, 14],
        sets: {
          leve: (x) => trapezoidal(x, 0, 0, 3, 5),
          normal: (x) => triangular(x, 4, 6.5, 9),
          excessivo: (x) => trapezoidal(x, 8, 10.5, 14, 14)
        }
      }
    },
    output: {
      name: 'Risco de Burnout',
      unit: '%',
      range: [0, 100],
      sets: {
        baixo: (y) => trapezoidal(y, 0, 0, 20, 35),
        moderado: (y) => triangular(y, 25, 50, 75),
        critico: (y) => trapezoidal(y, 65, 80, 100, 100)
      }
    },
    rules: [
      { id: 1, antecedents: { sleep: 'pouco', tasks: 'critico' }, consequent: 'critico', text: 'SE Sono é Pouco E Prazos são Críticos ENTÃO Risco é Crítico' },
      { id: 2, antecedents: { sleep: 'pouco', screen: 'excessivo' }, consequent: 'critico', text: 'SE Sono é Pouco E Tela é Excessiva ENTÃO Risco é Crítico' },
      { id: 3, antecedents: { sleep: 'adequado', tasks: 'tranquilo', screen: 'leve' }, consequent: 'baixo', text: 'SE Sono é Adequado E Prazos são Tranquilos E Tela é Leve ENTÃO Risco é Baixo' },
      { id: 4, antecedents: { sleep: 'adequado', tasks: 'moderado' }, consequent: 'moderado', text: 'SE Sono é Adequado E Prazos são Moderados ENTÃO Risco é Moderado' },
      { id: 5, antecedents: { sleep: 'muito', tasks: 'tranquilo' }, consequent: 'baixo', text: 'SE Sono é Muito E Prazos são Tranquilos ENTÃO Risco é Baixo' },
      { id: 6, antecedents: { tasks: 'critico', screen: 'excessivo' }, consequent: 'critico', text: 'SE Prazos são Críticos E Tela é Excessiva ENTÃO Risco é Crítico' },
      { id: 7, antecedents: { sleep: 'adequado', tasks: 'critico', screen: 'normal' }, consequent: 'moderado', text: 'SE Sono é Adequado E Prazos são Críticos E Tela é Normal ENTÃO Risco é Moderado' },
      { id: 8, antecedents: { sleep: 'pouco', tasks: 'tranquilo', screen: 'normal' }, consequent: 'moderado', text: 'SE Sono é Pouco E Prazos são Tranquilos E Tela é Normal ENTÃO Risco é Moderado' },
      { id: 9, antecedents: { screen: 'excessivo', sleep: 'adequado' }, consequent: 'moderado', text: 'SE Tela é Excessiva E Sono é Adequado ENTÃO Risco é Moderado' },
      { id: 10, antecedents: { sleep: 'muito', tasks: 'critico' }, consequent: 'moderado', text: 'SE Sono é Muito E Prazos são Críticos ENTÃO Risco é Moderado' },
      { id: 11, antecedents: { sleep: 'adequado', screen: 'leve' }, consequent: 'baixo', text: 'SE Sono é Adequado E Tela é Leve ENTÃO Risco é Baixo' },
      { id: 12, antecedents: { sleep: 'pouco', tasks: 'moderado', screen: 'normal' }, consequent: 'critico', text: 'SE Sono é Pouco E Prazos são Moderados E Tela é Normal ENTÃO Risco é Crítico' }
    ]
  };

  // --- 4. CONTROLLERS & INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    // Canvas Visualizer
    const canvas = document.getElementById('canvas-membership');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const rulesContainer = document.getElementById('active-rules-container');
    let currentData = null;
    const SET_COLORS = ['#38bdf8', '#a855f7', '#10b981', '#f59e0b', '#f43f5e'];

    function resizeCanvas() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0) {
        canvas.width = rect.width * (window.devicePixelRatio || 1);
        canvas.height = 220 * (window.devicePixelRatio || 1);
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      }
    }

    function drawCurves(system, primaryInputKey, inputValue) {
      if (!system || !canvas || !ctx) return;
      const width = canvas.getBoundingClientRect().width;
      const height = 220;
      ctx.clearRect(0, 0, width, height);

      const variable = system.inputs[primaryInputKey] || Object.values(system.inputs)[0];
      if (!variable) return;

      const [minX, maxX] = variable.range;
      const padding = { top: 25, right: 30, bottom: 40, left: 45 };
      const plotW = width - padding.left - padding.right;
      const plotH = height - padding.top - padding.bottom;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, height - padding.bottom);
      ctx.lineTo(width - padding.right, height - padding.bottom);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('1.0', padding.left - 8, padding.top + 4);
      ctx.fillText('0.5', padding.left - 8, padding.top + plotH / 2 + 4);
      ctx.fillText('0.0', padding.left - 8, height - padding.bottom + 4);

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

        ctx.fillStyle = color;
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(setName.toUpperCase(), padding.left + colorIdx * 90, padding.top - 8);
        colorIdx++;
      }

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

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${inputValue} ${variable.unit || ''}`, curX, height - padding.bottom + 20);
      }
    }

    function renderRulesList(evaluatedRules) {
      if (!rulesContainer || !evaluatedRules) return;
      rulesContainer.innerHTML = '';
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

    let lastActiveState = null;
    function handleStateUpdate(state) {
      lastActiveState = state;
      const explainView = document.getElementById('view-explain');
      if (explainView && explainView.classList.contains('active')) {
        updateVisualizer(state);
      }
    }

    // Traffic Controller
    const mainInput = document.getElementById('traffic-main-input');
    const secInput = document.getElementById('traffic-sec-input');
    const mainValBadge = document.getElementById('traffic-main-val');
    const secValBadge = document.getElementById('traffic-sec-val');
    const greenTimeDisplay = document.getElementById('traffic-green-time');
    const diffPercentDisplay = document.getElementById('metric-diff-percent');
    const statusDesc = document.getElementById('traffic-status-desc');

    function updateTraffic() {
      const mainQueue = parseFloat(mainInput.value);
      const secQueue = parseFloat(secInput.value);
      mainValBadge.textContent = `${mainQueue} ${mainQueue === 1 ? 'carro' : 'carros'}`;
      secValBadge.textContent = `${secQueue} ${secQueue === 1 ? 'carro' : 'carros'}`;

      const result = runFuzzySystem(TrafficSystem, { mainQueue, secQueue });
      const greenTime = Math.round(result.crispOutput);
      greenTimeDisplay.textContent = `${greenTime}s`;

      const diff = Math.round(((greenTime - 30) / 30) * 100);
      diffPercentDisplay.textContent = diff >= 0 ? `+${diff}%` : `${diff}%`;
      diffPercentDisplay.style.color = diff >= 0 ? 'var(--color-primary)' : 'var(--color-warning)';

      if (mainQueue > 35 && secQueue < 15) {
        statusDesc.textContent = 'Via principal com congestionamento severo e secundária livre. Sinal verde estendido ao máximo para escoamento rápido.';
      } else if (mainQueue < 15 && secQueue > 35) {
        statusDesc.textContent = 'Via principal com tráfego escasso enquanto a secundária acumula veículos. Sinal verde encurtado para liberar o cruzamento rapidamente.';
      } else if (mainQueue > 30 && secQueue > 30) {
        statusDesc.textContent = 'Ambas as vias congestionadas. Sinal ajustado para ciclo equilibrado de vazão mútua.';
      } else {
        statusDesc.textContent = 'Tráfego equilibrado em ambas as vias. Ciclo verde otimizado dinamicamente para manter fluidez contínua.';
      }

      handleStateUpdate({ system: TrafficSystem, inputs: { mainQueue, secQueue }, result });
    }

    if (mainInput && secInput) {
      mainInput.addEventListener('input', updateTraffic);
      secInput.addEventListener('input', updateTraffic);
      updateTraffic();
    }

    // Burnout Controller
    const sleepInput = document.getElementById('burnout-sleep-input');
    const tasksInput = document.getElementById('burnout-tasks-input');
    const screenInput = document.getElementById('burnout-screen-input');
    const sleepValBadge = document.getElementById('burnout-sleep-val');
    const tasksValBadge = document.getElementById('burnout-tasks-val');
    const screenValBadge = document.getElementById('burnout-screen-val');
    const percentDisplay = document.getElementById('burnout-percent');
    const statusBadge = document.getElementById('burnout-badge');
    const adviceText = document.getElementById('burnout-advice');
    const gaugeProgress = document.getElementById('gauge-progress');
    const ARC_LENGTH = 251.2;

    function updateBurnout() {
      const sleep = parseFloat(sleepInput.value);
      const tasks = parseFloat(tasksInput.value);
      const screen = parseFloat(screenInput.value);

      sleepValBadge.textContent = `${sleep.toFixed(1)}h`;
      tasksValBadge.textContent = `${tasks} ${tasks === 1 ? 'tarefa' : 'tarefas'}`;
      screenValBadge.textContent = `${screen.toFixed(1)}h`;

      const result = runFuzzySystem(BurnoutSystem, { sleep, tasks, screen });
      
      // Normalização matemática do Centróide para cobrir a escala completa de 0% a 100%
      const RAW_MIN = 13.83;
      const RAW_MAX = 85.44;
      const normalized = ((result.crispOutput - RAW_MIN) / (RAW_MAX - RAW_MIN)) * 100;
      const percent = Math.round(Math.min(100, Math.max(0, normalized)));
      
      percentDisplay.textContent = `${percent}%`;

      const offset = ARC_LENGTH - (ARC_LENGTH * (percent / 100));
      if (gaugeProgress) gaugeProgress.style.strokeDashoffset = offset;

      statusBadge.className = 'gauge-status-badge';
      if (percent < 35) {
        statusBadge.textContent = 'Baixo Risco';
        statusBadge.classList.add('status-low');
        adviceText.textContent = 'Excelente! Sua rotina está sustentável. O sono adequado compensa as demandas e preserva sua clareza mental para novos desafios.';
      } else if (percent < 70) {
        statusBadge.textContent = 'Risco Moderado';
        statusBadge.classList.add('status-med');
        if (sleep < 6) {
          adviceText.textContent = 'Atenção ao sono! Poucas horas de descanso com tarefas ativas reduzem a capacidade de foco. Priorize dormir mais cedo hoje.';
        } else if (screen > 9) {
          adviceText.textContent = 'Alerta de fadiga de tela: Muitas horas contínuas de exposição visual. Pratique a regra 20-20-20 e faça caminhadas curtas.';
        } else {
          adviceText.textContent = 'Carga equilibrada, mas com sinais de alerta. Organize seus prazos por ordem de impacto e faça pausas de 10 minutos a cada ciclo de estudo.';
        }
      } else {
        statusBadge.textContent = 'Risco Crítico';
        statusBadge.classList.add('status-high');
        adviceText.textContent = 'Alerta máximo de esgotamento cognitivo! Sono insuficiente aliado a excesso de tela e prazos acumulados. Pare imediatamente, hidrate-se e descanse antes de prosseguir.';
      }

      handleStateUpdate({ system: BurnoutSystem, inputs: { sleep, tasks, screen }, result });
    }

    if (sleepInput && tasksInput && screenInput) {
      sleepInput.addEventListener('input', updateBurnout);
      tasksInput.addEventListener('input', updateBurnout);
      screenInput.addEventListener('input', updateBurnout);
    }

    // Tabs Switcher
    const tabButtons = document.querySelectorAll('.tab-button');
    const moduleViews = document.querySelectorAll('.module-view');

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        tabButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        moduleViews.forEach((view) => {
          if (view.id === targetId) view.classList.add('active');
          else view.classList.remove('active');
        });

        if (targetId === 'view-traffic') updateTraffic();
        else if (targetId === 'view-burnout') updateBurnout();
        else if (targetId === 'view-explain' && lastActiveState) updateVisualizer(lastActiveState);
      });
    });
  });
})();
