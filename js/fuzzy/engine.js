/**
 * Fuzzy Lab - Motor Genérico de Inferência Nebulosa (Mamdani + Centróide)
 */

export const MembershipFunctions = {
  /**
   * Função de pertinência triangular (a, b, c)
   */
  triangular(x, a, b, c) {
    if (a === b && x <= b) return 1;
    if (b === c && x >= b) return 1;
    if (x <= a || x >= c) return 0;
    if (x === b) return 1;
    if (x > a && x < b) return (x - a) / (b - a);
    return (c - x) / (c - b);
  },

  /**
   * Função de pertinência trapezoidal (a, b, c, d)
   */
  trapezoidal(x, a, b, c, d) {
    // Ombro esquerdo (left shoulder)
    if (a === b && x <= b) return 1;
    // Ombro direito (right shoulder)
    if (c === d && x >= c) return 1;
    
    if (x < a || x > d) return 0;
    if (x >= b && x <= c) return 1;
    if (x > a && x < b) return (b === a) ? 1 : (x - a) / (b - a);
    return (d === c) ? 1 : (d - x) / (d - c);
  }
};

/**
 * Avalia o valor nítido (crisp) em todos os conjuntos linguísticos de uma variável
 */
export function fuzzify(variable, value) {
  const result = {};
  for (const [setName, fn] of Object.entries(variable.sets)) {
    result[setName] = fn(value);
  }
  return result;
}

/**
 * Avalia as regras de inferência de Mamdani
 * Operador E (AND) = Mínimo
 */
export function evaluateRules(rules, fuzzifiedInputs) {
  return rules.map(rule => {
    const inputWeights = Object.entries(rule.antecedents).map(([varName, setName]) => {
      const varDegrees = fuzzifiedInputs[varName];
      return (varDegrees && typeof varDegrees[setName] === 'number') ? varDegrees[setName] : 0;
    });

    // Operador E (conjunção): Mínimo
    const firingStrength = inputWeights.length > 0 ? Math.min(...inputWeights) : 0;

    return {
      rule,
      weight: firingStrength,
      isActive: firingStrength > 0.001
    };
  });
}

/**
 * Desfuzzificação pelo método do Centro de Gravidade (Centróide / COG)
 */
export function defuzzifyCentroid(evaluatedRules, outputVariable, steps = 100) {
  const [min, max] = outputVariable.range;
  const stepSize = (max - min) / steps;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i <= steps; i++) {
    const y = min + i * stepSize;

    // Agregação de Mamdani (MAX de todos os MIN(corte, pertinência))
    let aggregatedDegree = 0;

    for (const item of evaluatedRules) {
      if (item.weight <= 0.001) continue;

      const outputSetFn = outputVariable.sets[item.rule.consequent];
      if (outputSetFn) {
        const degree = outputSetFn(y);
        const clippedDegree = Math.min(item.weight, degree);
        if (clippedDegree > aggregatedDegree) {
          aggregatedDegree = clippedDegree;
        }
      }
    }

    numerator += y * aggregatedDegree;
    denominator += aggregatedDegree;
  }

  // Se nenhuma regra foi ativada, retorna o ponto médio
  if (denominator <= 0.0001) {
    return (min + max) / 2;
  }

  return numerator / denominator;
}

/**
 * Executa o ciclo completo de inferência fuzzy para um sistema
 */
export function runFuzzySystem(systemConfig, inputValues) {
  const fuzzifiedInputs = {};

  for (const [varName, variable] of Object.entries(systemConfig.inputs)) {
    fuzzifiedInputs[varName] = fuzzify(variable, inputValues[varName]);
  }

  const evaluatedRules = evaluateRules(systemConfig.rules, fuzzifiedInputs);
  const crispOutput = defuzzifyCentroid(evaluatedRules, systemConfig.output);

  return {
    fuzzifiedInputs,
    evaluatedRules,
    crispOutput
  };
}
