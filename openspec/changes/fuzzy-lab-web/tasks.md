# Tarefas de Implementação: Fuzzy Lab Web

- [x] 1. Estrutura Base e Estilização
  - [x] 1.1 Criar a estrutura HTML5 semântica (`index.html`) com cabeçalho, navegação por abas e seções para os três módulos.
  - [x] 1.2 Criar os tokens de design e estilos base (`css/variables.css` e `css/base.css`) com tipografia moderna, paleta escura e layout responsivo.
  - [x] 1.3 Implementar componentes visuais (`css/components.css`): sliders táteis, semáforo com brilho luminoso, gauge/velocímetro animado e badges de status.

- [x] 2. Motor Matemático de Lógica Fuzzy (Engine)
  - [x] 2.1 Implementar funções de pertinência (triangular e trapezoidal) com cálculo contínuo de graus $\mu(x) \in [0, 1]$ em `js/fuzzy/engine.js`.
  - [x] 2.2 Implementar método de inferência de Mamdani e desfuzzificação por Centro de Gravidade (Centróide) em `js/fuzzy/engine.js`.
  - [x] 2.3 Modelar variáveis linguísticas e a matriz de 9 regras do Semáforo Inteligente em `js/fuzzy/trafficRules.js`.
  - [x] 2.4 Modelar variáveis linguísticas e a base de 12 regras do Detector de Burnout em `js/fuzzy/burnoutRules.js`.

- [x] 3. Controladores e Interatividade
  - [x] 3.1 Implementar `js/modules/trafficController.js`: escuta de sliders, atualização do tempo do sinal verde e animação das luzes do semáforo.
  - [x] 3.2 Implementar `js/modules/burnoutController.js`: escuta de sliders, atualização do velocímetro e exibição do diagnóstico com recomendações.
  - [x] 3.3 Implementar `js/modules/visualizerController.js`: renderização gráfica das funções de pertinência no Canvas e lista de regras ativas em tempo real.
  - [x] 3.4 Integrar todos os módulos no `js/app.js` com troca fluida de abas e inicialização sincronizada.

- [x] 4. Validação, Documentação e Suporte a GitHub Pages
  - [x] 4.1 Validar respostas do motor fuzzy em casos extremos.
  - [x] 4.2 Testar execução 100% offline abrindo direto via `file:///` no navegador.
  - [x] 4.3 Criar `README.md` detalhado explicando a teoria fuzzy, arquitetura, fórmulas matemáticas e instruções de uso no GitHub Pages.
