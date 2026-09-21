# Design Técnico: Fuzzy Lab Web

## 1. Arquitetura Geral do Sistema
A aplicação é construída sem frameworks pesados, garantindo execução instantânea tanto via protocolo local (`file:///`) quanto via **GitHub Pages**, sem etapas de build ou transpilação.

```
projeto_fuzzy/
├── index.html                    # Estrutura semântica principal
├── css/
│   ├── variables.css             # Design tokens: paleta HSL, tipografia, elevação
│   ├── base.css                  # Reset, layout responsivo, sistema de abas
│   └── components.css            # Sliders, gauge animado, semáforo, cards, gráficos
└── js/
    ├── fuzzy/
    │   ├── engine.js             # Motor genérico de inferência Fuzzy (Mamdani + Centróide)
    │   ├── trafficRules.js       # Modelagem e base de regras do Semáforo
    │   └── burnoutRules.js       # Modelagem e base de regras do Burnout
    ├── modules/
    │   ├── trafficController.js  # Controle da interface e simulação do semáforo
    │   ├── burnoutController.js  # Controle da interface e medidor de sobrecarga
    │   └── visualizerController.js # Renderização dos gráficos de pertinência e regras
    └── app.js                    # Ponto de entrada e gerenciador de navegação entre abas
```

---

## 2. Modelagem Matemática do Motor Fuzzy (`engine.js`)

O motor é genérico, desacoplado da interface e reutilizado por ambos os módulos.

### 2.1 Funções de Pertinência
1. **Triangular:** definida por 3 pontos $(a, b, c)$:
   $$\mu_{tri}(x; a, b, c) = \max\left(0, \min\left(\frac{x - a}{b - a}, \frac{c - x}{c - b}\right)\right)$$
2. **Trapezoidal:** definida por 4 pontos $(a, b, c, d)$:
   $$\mu_{trap}(x; a, b, c, d) = \max\left(0, \min\left(\frac{x - a}{b - a}, 1, \frac{d - x}{d - c}\right)\right)$$

### 2.2 Método de Inferência de Mamdani
* **Operador E (Conjunção):** T-norma de Mínimo:
  $$\alpha_r = \min(\mu_1(x_1), \mu_2(x_2), \dots)$$
* **Implicação:** Mínimo (corta o conjunto de saída na altura $\alpha_r$).
* **Agregação:** S-norma de Máximo:
  $$\mu_{out}(y) = \max_{r}(\min(\alpha_r, \mu_{consequente, r}(y)))$$

### 2.3 Desfuzzificação (Centro de Gravidade / Centróide)
A saída nítida (*crisp*) é calculada discretizando o domínio da saída em $N$ pontos de amostragem ($N = 100$):
$$y^* = \frac{\sum_{i=1}^N y_i \cdot \mu_{out}(y_i)}{\sum_{i=1}^N \mu_{out}(y_i)}$$

---

## 3. Especificação dos Módulos

### 3.1 Módulo Semáforo Inteligente
* **Universo de Discurso (Entradas):**
  * $V_{principal} \in [0, 50]$ carros: `Baixa` (trapezoidal: 0, 0, 8, 16), `Média` (triangular: 10, 22, 35), `Alta` (trapezoidal: 28, 38, 50, 50).
  * $V_{secundaria} \in [0, 50]$ carros: `Baixa` (0, 0, 8, 16), `Média` (10, 22, 35), `Alta` (28, 38, 50, 50).
* **Universo de Discurso (Saída):**
  * $T_{verde} \in [10, 90]$ segundos: `Curto` (trapezoidal: 10, 10, 20, 35), `Médio` (triangular: 25, 45, 65), `Longo` (trapezoidal: 55, 75, 90, 90).
* **Matriz de Regras (9 Regras):**
  1. SE Principal Baixa E Secundária Baixa $\to$ Verde Médio
  2. SE Principal Baixa E Secundária Média $\to$ Verde Curto
  3. SE Principal Baixa E Secundária Alta $\to$ Verde Curto
  4. SE Principal Média E Secundária Baixa $\to$ Verde Longo
  5. SE Principal Média E Secundária Média $\to$ Verde Médio
  6. SE Principal Média E Secundária Alta $\to$ Verde Curto
  7. SE Principal Alta E Secundária Baixa $\to$ Verde Longo
  8. SE Principal Alta E Secundária Média $\to$ Verde Longo
  9. SE Principal Alta E Secundária Alta $\to$ Verde Médio

### 3.2 Módulo Detector de Burnout
* **Universo de Discurso (Entradas):**
  * $Sono \in [0, 12]$ horas: `Pouco` (0, 0, 4, 6), `Adequado` (5, 7, 8, 9), `Muito` (8, 9.5, 12, 12).
  * $Prazos \in [0, 10]$ itens: `Tranquilo` (0, 0, 2, 4), `Moderado` (3, 5, 7), `Crítico` (6, 8, 10, 10).
  * $Tela \in [0, 14]$ horas: `Leve` (0, 0, 3, 5), `Normal` (4, 6, 8), `Excessivo` (7, 9.5, 14, 14).
* **Universo de Discurso (Saída):**
  * $Risco \in [0, 100]\%$: `Baixo` (0, 0, 25, 40), `Moderado` (30, 50, 70), `Crítico` (60, 75, 100, 100).
* **Base de Regras (12 Regras selecionadas de alta coerência psicológica):**
  - Mapeiam combinações extremas (ex: sono pouco + prazos críticos $\to$ risco crítico) e compensatórias (ex: sono adequado ameniza prazos moderados).

### 3.3 Módulo Visualizador Didático
* Elemento `<canvas>` para plotar as curvas de pertinência com marcadores verticais em tempo real.
* Tabela responsiva com badges dinâmicos das regras ativadas e porcentagem de contribuição no cálculo do centróide.

---

## 4. Diretrizes de UI/UX
* **Tema Escuro Profissional:** Fundo grafite profundo (`#0f172a`), superfícies com leve elevação de vidro (*glassmorphism* suave `#1e293b`), destaques em esmeralda/ciano para valores seguros e carmesim/âmbar para alertas.
* **Tipografia:** Google Fonts `Inter` para clareza em numerais e tabelas.
* **Interatividade Suave:** Sliders táteis com exibição numérica instantânea, ponteiro do velocímetro com transição CSS cúbica suave.
