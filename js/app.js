/**
 * Fuzzy Lab - Ponto de Entrada Principal da Aplicação
 */

import { initTrafficController } from './modules/trafficController.js';
import { initBurnoutController } from './modules/burnoutController.js';
import { initVisualizerController } from './modules/visualizerController.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o visualizador didático
  const visualizer = initVisualizerController();

  let lastActiveState = null;

  function handleStateUpdate(state) {
    lastActiveState = state;
    // Se a aba do visualizador estiver ativa, atualiza os gráficos
    const explainView = document.getElementById('view-explain');
    if (explainView && explainView.classList.contains('active')) {
      visualizer.updateVisualizer(state);
    }
  }

  // Inicializa os módulos de controle
  const trafficCtrl = initTrafficController((state) => {
    handleStateUpdate(state);
  });

  const burnoutCtrl = initBurnoutController((state) => {
    handleStateUpdate(state);
  });

  // Gerenciador de Abas de Navegação
  const tabButtons = document.querySelectorAll('.tab-button');
  const moduleViews = document.querySelectorAll('.module-view');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      // Atualiza botões
      tabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Alterna seções
      moduleViews.forEach((view) => {
        if (view.id === targetId) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });

      // Se entrou na aba didática, renderiza com o estado mais recente
      if (targetId === 'view-explain' && lastActiveState) {
        visualizer.updateVisualizer(lastActiveState);
      }
    });
  });

  console.log('🚀 Fuzzy Lab inicializado com sucesso!');
});
