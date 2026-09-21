/**
 * Fuzzy Lab - Modelagem do Detector de Burnout / Sobrecarga
 * Entradas: Sono (0-12h), Prazos (0-10), Tela (0-14h)
 * Saída: Risco de Burnout (0-100%)
 */

import { MembershipFunctions } from './engine.js';

const { triangular, trapezoidal } = MembershipFunctions;

export const BurnoutSystem = {
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
    {
      id: 1,
      antecedents: { sleep: 'pouco', tasks: 'critico' },
      consequent: 'critico',
      text: 'SE Sono é Pouco E Prazos são Críticos ENTÃO Risco é Crítico'
    },
    {
      id: 2,
      antecedents: { sleep: 'pouco', screen: 'excessivo' },
      consequent: 'critico',
      text: 'SE Sono é Pouco E Tela é Excessiva ENTÃO Risco é Crítico'
    },
    {
      id: 3,
      antecedents: { sleep: 'adequado', tasks: 'tranquilo', screen: 'leve' },
      consequent: 'baixo',
      text: 'SE Sono é Adequado E Prazos são Tranquilos E Tela é Leve ENTÃO Risco é Baixo'
    },
    {
      id: 4,
      antecedents: { sleep: 'adequado', tasks: 'moderado' },
      consequent: 'moderado',
      text: 'SE Sono é Adequado E Prazos são Moderados ENTÃO Risco é Moderado'
    },
    {
      id: 5,
      antecedents: { sleep: 'muito', tasks: 'tranquilo' },
      consequent: 'baixo',
      text: 'SE Sono é Muito E Prazos são Tranquilos ENTÃO Risco é Baixo'
    },
    {
      id: 6,
      antecedents: { tasks: 'critico', screen: 'excessivo' },
      consequent: 'critico',
      text: 'SE Prazos são Críticos E Tela é Excessiva ENTÃO Risco é Crítico'
    },
    {
      id: 7,
      antecedents: { sleep: 'adequado', tasks: 'critico', screen: 'normal' },
      consequent: 'moderado',
      text: 'SE Sono é Adequado E Prazos são Críticos E Tela é Normal ENTÃO Risco é Moderado'
    },
    {
      id: 8,
      antecedents: { sleep: 'pouco', tasks: 'tranquilo', screen: 'normal' },
      consequent: 'moderado',
      text: 'SE Sono é Pouco E Prazos são Tranquilos E Tela é Normal ENTÃO Risco é Moderado'
    },
    {
      id: 9,
      antecedents: { screen: 'excessivo', sleep: 'adequado' },
      consequent: 'moderado',
      text: 'SE Tela é Excessiva E Sono é Adequado ENTÃO Risco é Moderado'
    },
    {
      id: 10,
      antecedents: { sleep: 'muito', tasks: 'critico' },
      consequent: 'moderado',
      text: 'SE Sono é Muito E Prazos são Críticos ENTÃO Risco é Moderado'
    },
    {
      id: 11,
      antecedents: { sleep: 'adequado', screen: 'leve' },
      consequent: 'baixo',
      text: 'SE Sono é Adequado E Tela é Leve ENTÃO Risco é Baixo'
    },
    {
      id: 12,
      antecedents: { sleep: 'pouco', tasks: 'moderado', screen: 'normal' },
      consequent: 'critico',
      text: 'SE Sono é Pouco E Prazos são Moderados E Tela é Normal ENTÃO Risco é Crítico'
    }
  ]
};
