# Proposta: Fuzzy Lab Web (Semáforo Inteligente & Detector de Burnout)

## 1. Contexto e Motivação
Na disciplina da faculdade, é necessária a apresentação de um projeto prático aplicando **Lógica Fuzzy (Nebulosa)**. A maioria dos trabalhos acadêmicos tradicionais recorre a questionários estáticos em escala Likert (1 a 5) que apenas calculam médias ponderadas simplistas. 

Para se destacar, este projeto visa demonstrar a verdadeira essência da Lógica Fuzzy em dois domínios reais e contrastantes:
1. **Engenharia e Controle de Sistemas (Semáforo Inteligente):** controle contínuo e em tempo real de hardware/máquina.
2. **Sistemas Especialistas e Apoio à Decisão (Detector de Burnout do Estudante/Dev):** inferência sobre estados humanos subjetivos baseada em variáveis contínuas do cotidiano acadêmico.

Além disso, como a apresentação ocorrerá nos computadores da faculdade (onde permissões de administrador são restritas e ambientes Python/pip frequentemente enfrentam bloqueios), a solução deve ser **100% web, zero dependências externas, compatível com execução offline direta no navegador e publicável no GitHub Pages**.

---

## 2. O que será construído
Uma aplicação web moderna, rica visualmente e interativa dividida em três seções principais navegáveis por abas:

### Módulo 1: Semáforo Inteligente (Automação e Controle)
- **Entradas Contínuas:** 
  - Fila na Via Principal ($0$ a $50$ veículos).
  * Fila na Via Secundária ($0$ a $50$ veículos).
  * Fluxo de Pedestres (Baixo, Médio, Alto).
- **Saída Fuzzy:** 
  - Tempo de Sinal Verde da Via Principal ($10$ a $90$ segundos).
- **Recursos Visuais:**
  - Simulação de cruzamento com semáforo interativo cujas luzes e cronômetro se adaptam em tempo real aos sliders.
  - Comparativo dinâmico: *Semáforo de Tempo Fixo (30s)* vs. *Semáforo Fuzzy Inteligente*.

### Módulo 2: Detector de Burnout do Estudante/Dev (Apoio à Decisão)
- **Entradas Contínuas:**
  - Horas de Sono na noite anterior ($0$ a $12$ horas).
  - Prazos/Entregas Críticas na semana ($0$ a $10$ entregas).
  - Horas de Estudo/Tela no dia ($0$ a $14$ horas).
- **Saída Fuzzy:**
  - Nível de Risco de Sobrecarga ($0\%$ a $100\%$) classificado em Leve, Moderado ou Crítico.
- **Recursos Visuais:**
  - Medidor em arco (*gauge/velocímetro*) animado com transição de cores suave.
  - Cartão de diagnóstico dinâmico com recomendações práticas em tempo real.

### Módulo 3: Painel Didático "Como Funciona o Motor Fuzzy"
- **Gráficos de Pertinência Interativos (SVG/Canvas):**
  - Funções de pertinência triangulares e trapezoidais desenhadas dinamicamente.
  - Linha de corte vertical acompanhando a movimentação dos sliders dos módulos, evidenciando a *Fuzzificação*.
- **Matriz de Regras (Mamdani):**
  - Lista de regras *SE ... ENTÃO ...* com destaque visual dinâmico para as regras que estão ativas no momento e o grau de ativação de cada uma.
- **Desfuzzificação:**
  - Demonstração do cálculo do Centro de Gravidade (Centróide) para gerar o valor real final.

---

## 3. Benefícios e Diferenciais
- **Zero Configuração:** Basta abrir o `index.html` ou o link do GitHub Pages no projetor da faculdade.
- **Didática Visual Imbatível:** O professor consegue ver a matemática acontecendo ao vivo ao mover qualquer slider.
- **Dois Exemplos em Um:** Abrange os dois principais ramos de aplicação prática da lógica fuzzy na indústria.
- **Design de Alto Padrão:** Interface estética escura (*dark mode* premium), tipografia moderna (Google Fonts Inter), transições fluidas e sem bibliotecas pesadas.
