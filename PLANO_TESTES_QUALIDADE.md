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
- **Check (Verificar)**: Análise dos resultados dos testes, medição de cobertura de fluxos e validação de acessibilidade via axe/Lighthouse e questionário SUS com educadores.
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
| **RF06** (Consentimento LGPD) | **RNF03** (Direito do Titular) | **CT06** | Responsável pode revogar consentimento, suspendendo a coleta de métricas da criança. |

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
- **Status de Aprovação**: Aprovado.

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
