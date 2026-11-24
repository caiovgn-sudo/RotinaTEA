# Plano de Testes e Qualidade de Software — RotinaTEA

Estratégia de garantia da qualidade alinhada à norma **ISO/IEC 25010**, ao modelo de rastreabilidade do projeto e ao ciclo **PDCA**.

---

## 1. Modelo de Qualidade ISO/IEC 25010

- **Usabilidade / Acessibilidade Cognitiva**: Interface com paleta suave, pictogramas padronizados (ARASAAC), navegação total por teclado e áreas de toque com mínimo de 48px.
- **Confiabilidade / Tolerância a Falhas**: Arquitetura *offline-first* operante em salas de aula sem internet, persistindo 100% dos dados no IndexedDB.
- **Segurança / Confidencialidade**: Privacidade por Design (LGPD), anonimização mandante na origem de dados de menores e controle de acesso baseado em papéis (RBAC).

---

## 2. Aplicação do Ciclo PDCA

- **Plan (Planejar)**: Definição dos critérios de aceitação para cada estória de usuário e elaboração da matriz de rastreabilidade e casos de teste.
- **Do (Executar)**: Implementação do software e execução dos testes automatizados e empíricos.
- **Check (Verificar)**: Análise dos resultados dos testes, medição de cobertura de fluxos e validação de acessibilidade (contraste medido por varredura no navegador e por teste automatizado; axe-core foi executado sobre componentes em teste automatizado (seção 5); Lighthouse e axe na página inteira **não foram executados**) e questionário SUS com educadores (**não aplicado**).
- **Act (Agir)**: Correção de defeitos identificados, refinamento de fluxos visuais e atualização contínua da documentação técnica.

---

## 3. Matriz de Rastreabilidade

| Requisito de Origem | Regra de Negócio Vinculada | Caso de Teste (Validação) | Critério de Aceite |
| :--- | :--- | :--- | :--- |
| **RF03** (Registro de Crise em 1 clique) | **RN01** (Obrigatoriedade de Timestamps Início/Fim) | **CT01** | Crise salva com data início, data fim e duração em segundos calculada automaticamente. |
| **RNF02** (Offline-First) | **RN03** (Prioridade de Persistência Local) | **CT02** | Operação sem rede salva no IndexedDB e exibe aviso de sincronização pendente. |
| **RNF03** (Privacidade e LGPD) | **RN02** (Anonimização na Origem) | **CT03** | Relatórios e dashboards exibem estritamente códigos anonimizados (`ALN-8921`), sem nomes reais ou fotos. |
| **RF01** (Prancha Visual) | **RNF01** (Acessibilidade Cognitiva) | **CT04** | Cartão arrastado para área de concluído ou acionado por teclado atualiza o estado imediatamente. |
| **RF02** (Temporizador Visual) | **RNF01** (Mitigação de Sobrecarga) | **CT05** | Temporizador realiza contagem regressiva em disco suave sem alarmes estridentes. |
| **RF06** (Consentimento LGPD) | **RN04** (Revogação com confirmação) | **CT06** | Responsável pode revogar consentimento, suspendendo a coleta de métricas da criança. |

---

## 4. Especificação dos Casos de Teste

### Caso de Teste 01: Registro Rápido de Crise em 1 Clique (RF03 / RN01)
- **Cenário**: Professor precisa registrar uma crise durante a aula com rapidez absoluta.
- **Pré-condições**: Perfil de Professor ativo.
- **Ação**:
  1. Clicar no botão "Iniciar Crise".
  2. Aguardar alguns segundos (acompanhando o timer visual da crise).
  3. Clicar no botão "Encerrar Crise".
- **Resultado Esperado**:
  - Sistema grava `dataHoraInicio` e `dataHoraFim` com precisão de milissegundos;
  - Calcula a duração em segundos;
  - Exibe formulário opcional para observação qualitativa pós-crise;
  - Registro surge no histórico de desregulações do estudante.
- **Status de Aprovação**: Aprovado (automatizado em `integracao.test.ts` e `db.test.ts`; conferido no navegador em 28/10/2026).

### Caso de Teste 02: Resiliência em Cenário Desconectado / Offline (RNF02 / RN03)
- **Cenário**: Falha completa na rede Wi-Fi da escola durante o uso da prancha e registro de crise.
- **Pré-condições**: Aplicação aberta no navegador com modo de rede simulado como "Offline".
- **Ação**:
  1. Concluir um cartão de rotina.
  2. Iniciar e encerrar uma crise.
  3. Verificar o armazenamento do navegador (IndexedDB).
  4. Reconectar a rede ("Online").
- **Resultado Esperado**:
  - Nenhuma perda de dados ou mensagem de erro fatal na tela;
  - Gravação bem-sucedida no IndexedDB sob a tabela de fila de sincronização;
  - Notificação suave: *"Salvo localmente (offline)"*;
  - Ao voltar online, sistema dispara sincronização em lote e atualiza status para *"Sincronizado"*.
- **Status de Aprovação**: Aprovado.

### Caso de Teste 03: Validação de Anonimização na Origem LGPD (RNF03 / RN02)
- **Cenário**: Coordenação pedagógica acessa o painel de relatórios para exportar dados para o PEI.
- **Pré-condições**: Registros de estudantes e crises cadastrados no sistema.
- **Ação**:
  1. Acessar a aba "Coordenação / PEI".
  2. Inspecionar a tabela de estudantes e gráficos de incidência.
  3. Clicar em "Exportar Relatório para PEI".
- **Resultado Esperado**:
  - O relatório e as tabelas exibem exclusivamente o `codigoAnonimizado` (ex.: `ALN-8921`), a turma e o nível de suporte;
  - Nomes civis, documentos ou fotos pessoais não são expostos.
- **Status de Aprovação**: Aprovado.

### Caso de Teste 04: Acessibilidade e Operação via Teclado (RF01 / RNF01)
- **Cenário**: Usuário sem uso de mouse operando a prancha visual.
- **Pré-condições**: Prancha com cartões carregados.
- **Ação**:
  1. Utilizar apenas `Tab` para navegar até o cartão de tarefa.
  2. Pressionar `Espaço` ou `Enter` no botão de alternar estado / concluir.
- **Resultado Esperado**:
  - Anel de foco nítido e visível (`outline: 3px solid #3A6B7E`);
  - O cartão transita para "Concluído" com anúncio em leitor de tela (`aria-live`).
- **Status de Aprovação**: Aprovado.

### Caso de Teste 05: Temporizador sem alarme sonoro (RF02 / RNF01)
- **Cenário**: o aluno acompanha o tempo restante de uma atividade sem estímulo sonoro.
- **Pré-condições**: prancha com um cartão em andamento e duração configurada.
- **Ação**: iniciar o temporizador e deixar o tempo chegar a zero.
- **Resultado Esperado**: o anel se esvazia de forma contínua; o código não contém nenhuma chamada de áudio (busca por Audio, AudioContext e speechSynthesis sem resultados); o estado é anunciado por texto (`aria-live`); com `prefers-reduced-motion` a animação é reduzida.
- **Status de Aprovação**: Aprovado na inspeção do código e no navegador; o cálculo do tempo é coberto por `tempo` nos testes automatizados. Sem teste com leitor de tela.

### Caso de Teste 06: Revogação do consentimento (RF06 / RN04 / RNF03)
- **Cenário**: o responsável revoga o consentimento e a coleta de novos registros de crise deve parar.
- **Pré-condições**: consentimento ativo; perfil Responsável.
- **Ação**: (1) revogar, confirmando no diálogo; (2) tentar iniciar uma crise como Professor.
- **Resultado Esperado**: a revogação só ocorre após a confirmação explícita; o botão de iniciar crise fica inativo com explicação e o clique é barrado relendo o termo salvo; uma crise já em andamento pode ser encerrada (RN01) e os registros anteriores permanecem.
- **Status de Aprovação**: Aprovado (`coletaPermitida`, 5 testes; `integracao.test.ts`). **Limitação:** o bloqueio vale no aparelho; não há regra equivalente no servidor.

---

## 5. Evidências executadas (24/11/2026)

| Verificação | Resultado |
| :--- | :--- |
| `npx tsc --noEmit` (TypeScript estrito) | Sem erros |
| `npm test` (Vitest) | **121 testes aprovados em 10 arquivos** |
| `npm run build` (Vite + PWA) | Build concluído; 26 entradas precacheadas (523 KiB) |
| `npm audit --omit=dev` | 0 vulnerabilidades nas dependências de produção |
| `npm audit` (todas) | 4 avisos moderados em ferramentas de build (`glob`/`minimatch`, via Workbox); a correção exige atualização com mudança de versão e não afeta o código enviado ao navegador |
| Acessibilidade automática (axe-core 4, regras WCAG 2.1 A e AA) | 7 testes em `acessibilidade.test.tsx` sobre Sobre, diálogo de confirmação, gráfico, temporizador, cartão de rotina (aluno e educador), painel de sincronização, registro de atividades e selo de sincronização: **0 violações**. Limites: jsdom não mede contraste nem layout (regra `color-contrast` desligada; o contraste é medido em `contraste.test.ts`); não cobre Login, Header, formulário SUS, consentimento e relatório do PEI; não substitui leitor de tela |
| Contraste (WCAG 2.1 AA, texto) | 10.813 textos em 78 estados, nos 3 modos, sem falhas; protegido por `contraste.test.ts` |
| Desempenho do botão de crise (RNF05) | Medição preliminar de cerca de 10 ms em computador (ver `desenvolvimento/REQUISITOS_E_REGRAS_DE_NEGOCIO.md`, seção 5.1) |

### Lacunas de qualidade (não executado)

- Lighthouse e axe na página inteira (inclui Login, Header, SUS, consentimento e relatório do PEI); teste com leitor de tela; teste em outros navegadores e em tablet.
- Teste de ponta a ponta da sincronização com conta real do Supabase (a fila foi testada com um dublê).
- Avaliação de usabilidade com educadores (SUS): ver `PROTOCOLO_AVALIACAO_SUS.md`.
- Testes de componente (React Testing Library) e E2E (Playwright/Cypress).
