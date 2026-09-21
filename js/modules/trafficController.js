/**
 * Fuzzy Lab - Controlador do Módulo do Semáforo Inteligente
 */

import { runFuzzySystem } from '../fuzzy/engine.js';
import { TrafficSystem } from '../fuzzy/trafficRules.js';

export function initTrafficController(onStateChange) {
  const mainInput = document.getElementById('traffic-main-input');
  const secInput = document.getElementById('traffic-sec-input');

  const mainValBadge = document.getElementById('traffic-main-val');
  const secValBadge = document.getElementById('traffic-sec-val');

  const greenTimeDisplay = document.getElementById('traffic-green-time');
  const diffPercentDisplay = document.getElementById('metric-diff-percent');
  const statusDesc = document.getElementById('traffic-status-desc');

  const lightRed = document.getElementById('light-red');
  const lightYellow = document.getElementById('light-yellow');
  const lightGreen = document.getElementById('light-green');

  function update() {
    const mainQueue = parseFloat(mainInput.value);
    const secQueue = parseFloat(secInput.value);

    // Atualiza badges das entradas
    mainValBadge.textContent = `${mainQueue} ${mainQueue === 1 ? 'carro' : 'carros'}`;
    secValBadge.textContent = `${secQueue} ${secQueue === 1 ? 'carro' : 'carros'}`;

    // Executa inferência fuzzy
    const result = runFuzzySystem(TrafficSystem, { mainQueue, secQueue });
    const greenTime = Math.round(result.crispOutput);

    // Atualiza display do tempo de verde
    greenTimeDisplay.textContent = `${greenTime}s`;

    // Comparativo contra semáforo estático (30s)
    const fixedTime = 30;
    const diff = Math.round(((greenTime - fixedTime) / fixedTime) * 100);
    const diffSign = diff >= 0 ? `+${diff}%` : `${diff}%`;
    diffPercentDisplay.textContent = diffSign;
    diffPercentDisplay.style.color = diff >= 0 ? 'var(--color-primary)' : 'var(--color-warning)';

    // Diagnóstico textual inteligente
    if (mainQueue > 35 && secQueue < 15) {
      statusDesc.textContent = 'Via principal com congestionamento severo e secundária livre. Sinal verde estendido ao máximo para escoamento rápido.';
    } else if (mainQueue < 15 && secQueue > 35) {
      statusDesc.textContent = 'Via principal com tráfego escasso enquanto a secundária acumula veículos. Sinal verde encurtado para liberar o cruzamento rapidamente.';
    } else if (mainQueue > 30 && secQueue > 30) {
      statusDesc.textContent = 'Ambas as vias congestionadas. Sinal ajustado para ciclo equilibrado de vazão mútua.';
    } else {
      statusDesc.textContent = 'Tráfego equilibrado em ambas as vias. Ciclo verde otimizado dinamicamente para manter fluidez contínua.';
    }

    // Atualiza estado do semáforo
    lightRed.classList.remove('active');
    lightYellow.classList.remove('active');
    lightGreen.classList.add('active');

    // Notifica visualizador global
    if (typeof onStateChange === 'function') {
      onStateChange({
        system: TrafficSystem,
        inputs: { mainQueue, secQueue },
        result
      });
    }
  }

  mainInput.addEventListener('input', update);
  secInput.addEventListener('input', update);

  // Disparo inicial
  update();

  return { update };
}
