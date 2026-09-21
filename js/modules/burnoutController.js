/**
 * Fuzzy Lab - Controlador do Módulo do Detector de Burnout
 */

import { runFuzzySystem } from '../fuzzy/engine.js';
import { BurnoutSystem } from '../fuzzy/burnoutRules.js';

export function initBurnoutController(onStateChange) {
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

  const ARC_LENGTH = 251.2; // Comprimento total do arco SVG (raio 80)

  function update() {
    const sleep = parseFloat(sleepInput.value);
    const tasks = parseFloat(tasksInput.value);
    const screen = parseFloat(screenInput.value);

    // Atualiza badges
    sleepValBadge.textContent = `${sleep.toFixed(1)}h`;
    tasksValBadge.textContent = `${tasks} ${tasks === 1 ? 'tarefa' : 'tarefas'}`;
    screenValBadge.textContent = `${screen.toFixed(1)}h`;

    // Executa inferência fuzzy
    const result = runFuzzySystem(BurnoutSystem, { sleep, tasks, screen });
    
    // Normalização matemática do Centróide para cobrir a escala completa de 0% a 100%
    const RAW_MIN = 13.83;
    const RAW_MAX = 85.44;
    const normalized = ((result.crispOutput - RAW_MIN) / (RAW_MAX - RAW_MIN)) * 100;
    const percent = Math.round(Math.min(100, Math.max(0, normalized)));

    // Atualiza mostrador do velocímetro
    percentDisplay.textContent = `${percent}%`;

    // Atualiza arco SVG
    const offset = ARC_LENGTH - (ARC_LENGTH * (percent / 100));
    gaugeProgress.style.strokeDashoffset = offset;

    // Atualiza status e recomendações
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

    // Notifica visualizador global
    if (typeof onStateChange === 'function') {
      onStateChange({
        system: BurnoutSystem,
        inputs: { sleep, tasks, screen },
        result
      });
    }
  }

  sleepInput.addEventListener('input', update);
  tasksInput.addEventListener('input', update);
  screenInput.addEventListener('input', update);

  update();

  return { update };
}
