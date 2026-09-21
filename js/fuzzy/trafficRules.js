/**
 * Fuzzy Lab - Modelagem do Semáforo Inteligente
 * Entradas: Fila Via Principal (0-50), Fila Via Secundária (0-50)
 * Saída: Tempo de Sinal Verde da Via Principal (10-90 segundos)
 */

import { MembershipFunctions } from './engine.js';

const { triangular, trapezoidal } = MembershipFunctions;

export const TrafficSystem = {
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
    {
      id: 1,
      antecedents: { mainQueue: 'baixa', secQueue: 'baixa' },
      consequent: 'medio',
      text: 'SE Principal é Baixa E Secundária é Baixa ENTÃO Verde é Médio'
    },
    {
      id: 2,
      antecedents: { mainQueue: 'baixa', secQueue: 'media' },
      consequent: 'curto',
      text: 'SE Principal é Baixa E Secundária é Média ENTÃO Verde é Curto'
    },
    {
      id: 3,
      antecedents: { mainQueue: 'baixa', secQueue: 'alta' },
      consequent: 'curto',
      text: 'SE Principal é Baixa E Secundária é Alta ENTÃO Verde é Curto'
    },
    {
      id: 4,
      antecedents: { mainQueue: 'media', secQueue: 'baixa' },
      consequent: 'longo',
      text: 'SE Principal é Média E Secundária é Baixa ENTÃO Verde é Longo'
    },
    {
      id: 5,
      antecedents: { mainQueue: 'media', secQueue: 'media' },
      consequent: 'medio',
      text: 'SE Principal é Média E Secundária é Média ENTÃO Verde é Médio'
    },
    {
      id: 6,
      antecedents: { mainQueue: 'media', secQueue: 'alta' },
      consequent: 'curto',
      text: 'SE Principal é Média E Secundária é Alta ENTÃO Verde é Curto'
    },
    {
      id: 7,
      antecedents: { mainQueue: 'alta', secQueue: 'baixa' },
      consequent: 'longo',
      text: 'SE Principal é Alta E Secundária é Baixa ENTÃO Verde é Longo'
    },
    {
      id: 8,
      antecedents: { mainQueue: 'alta', secQueue: 'media' },
      consequent: 'longo',
      text: 'SE Principal é Alta E Secundária é Média ENTÃO Verde é Longo'
    },
    {
      id: 9,
      antecedents: { mainQueue: 'alta', secQueue: 'alta' },
      consequent: 'medio',
      text: 'SE Principal é Alta E Secundária é Alta ENTÃO Verde é Médio'
    }
  ]
};
