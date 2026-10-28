# Melhorias de UX e organização — outubro de 2026

Objetivo: que um avaliador da banca, um educador ou um responsável entenda o que cada função do RotinaTEA faz **sem explicação oral**. Todas as regras existentes foram preservadas: RN01 (crise com início e fim; não excluir em andamento), RN02 (código ALN-XXXX), RN03 (persistência local primeiro), LGPD, WCAG 2.1 AA e ausência de alarmes sonoros e de sobrecarga sensorial.

Método: diagnóstico de 17 pontos (Etapa 0, aprovado antes de qualquer alteração) e cinco etapas, uma por commit, cada uma validada com `tsc --noEmit`, `npm test` e `npm run build`.

| Etapa | Commit | Pilar | Tema |
|---|---|---|---|
| 1 | `f9e3a92` | 1 | Orientação, navegação por perfil e página Sobre |
| 2 | `a464364` | 1 e 2 | Conexão real × simulador e painel de sincronização |
| 3 | `9c9a87b` | 1 (e 3) | Registro de atividades, confirmações e estados vazios |
| 4 | `5ac49a6` | 3 | Governança visível, acesso negado e sessão expirada |
| 5 | `812864b` | 2 (e 3) | Acessibilidade, contraste, SUS e responsividade |

Legenda dos pilares: **1** engenharia/arquitetura · **2** qualidade/testes · **3** governança/LGPD/segurança.

---

## 1. Antes e depois, tela a tela

### 1.1 Navegação entre visões (Etapa 1, Pilar 1)
- **Antes:** quatro abas sempre visíveis. Quem não tinha acesso caía numa tela de login, ou numa página "Acesso restrito" sem cabeçalho que mostrava o código técnico do perfil (`RESPONSAVEL`).
- **Depois:** as visões bloqueadas ficam com cadeado e itálico. Ao tocar, aparece um aviso que permanece até ser fechado, com o motivo em linguagem simples ("Exige login com uma conta de Professor") e o botão **Entrar**. O login abre sob demanda e mantém o cabeçalho.
- **Decisão:** a regra fica em `utils/acesso.ts`, uma função pura e testável. A interface só explica o que a conta pode abrir; a segurança continua no servidor (RLS).
- **Como testar:** sair da conta, tocar em "Professor" e conferir o aviso; entrar pela aba Demonstração e ver a visão abrir.

### 1.2 Frase de propósito por visão (Etapa 1, Pilar 1)
- **Antes:** só o título ("Visão do Educador — Mediação de Aula e Registro Rápido").
- **Depois:** abaixo do título, uma frase diz para quem é e para que serve (por exemplo, "Para educadores: registre e acompanhe crises durante a aula, com um clique…").
- **Como testar:** abrir cada uma das quatro visões.

### 1.3 Tipo de acesso sempre visível (Etapa 1, Pilares 1 e 3)
- **Antes:** "Modo: Demonstração" aparecia só dentro do painel de crise.
- **Depois:** faixa permanente sob o cabeçalho: **Visitante**, **Conta real** ou **Modo demonstração (dados fictícios, só neste navegador)**, com cores e ícones diferentes.
- **Como testar:** alternar entre visitante e demonstração e observar o selo.

### 1.4 Aba "Sobre o RotinaTEA" (Etapa 1, Pilar 1)
- **Antes:** não existia. O avaliador dependia de explicação oral.
- **Depois:** seis blocos: o que é, quem usa e o que cada pessoa faz, regras RN01–RN03 em linguagem simples, o caminho de uma crise (iniciar, encerrar, salvar neste aparelho, enviar ao servidor), conta real × demonstração e **estado atual do protótipo** (o que ainda não está pronto).
- **Como testar:** tocar em "Sobre" (funciona sem login).

### 1.5 Conexão real × simulador (Etapa 2, Pilares 1 e 2)
- **Antes:** o botão "Online/Offline" era um interruptor que parecia o estado real. O código nunca lia `navigator.onLine`, então perder a internet de verdade não mudava nada.
- **Depois:** o selo de conexão mostra o estado **real** do navegador ("Online", "Offline (sem internet neste aparelho)" ou "Offline (simulado)"). O simulador é um botão separado, tracejado, rotulado "Simulador de conexão (demonstração)", disponível só quando `VITE_MODO_DEMO` não é `false`. Ao reconectar, a fila é enviada, e as mensagens não afirmam envio no modo demonstração.
- **Como testar:** em modo demo, usar o simulador e registrar uma crise; para a conexão real, desligar o Wi-Fi ou usar "Offline" nas ferramentas do navegador.

### 1.6 Painel de sincronização (Etapa 2, Pilares 1 e 2)
- **Antes:** só um número no selo do cabeçalho.
- **Depois:** painel na visão do Professor: aguardando envio, com erro e crises já enviadas; lista com tipo, data e hora, tentativas ("1 de 3 tentativas") e situação; botões **Sincronizar agora** e **Tentar novamente**; explicação da política de 3 tentativas. No modo demonstração, avisa que nada é enviado.
- **Como testar:** simular queda, registrar uma crise e abrir o painel (visão Professor, aba Rotina & Crises).

### 1.7 Selos de envio por crise (Etapa 2, Pilar 1)
- **Antes:** "Salvo Offline" no Professor e "Em Fila Local" na Coordenação, para o mesmo estado. Não havia o estado de falha. No modo demo, as crises de exemplo apareciam como "Sincronizado", o que era falso.
- **Depois:** três selos iguais nas duas telas, com ícone e texto: **Salva só neste aparelho**, **Enviada ao servidor**, **Falhou o envio**. No modo demonstração, todas aparecem como "Salva só neste aparelho".
- **Como testar:** comparar o histórico do Professor com a tabela da Coordenação.

### 1.8 Registro de atividades (Etapa 3, Pilares 1 e 3)
- **Antes:** avisos que sumiam em 4 segundos.
- **Depois:** seção "Atividades recentes" com as últimas 30 ações (crise iniciada e encerrada, consentimento, conexão, sincronização, acesso). Fica só no navegador e remove código de aluno, e-mail e CPF do texto antes de guardar (RN02).
- **Como testar:** executar algumas ações e ver a lista; "Limpar registro" apaga.

### 1.9 Confirmações (Etapa 3, Pilares 1 e 3)
- **Antes:** a revogação usava a caixa nativa `window.confirm`, com texto técnico e promessas que o sistema não cumpre ("assinatura presencial", "paralisará o aplicativo").
- **Depois:** diálogo acessível próprio ("Revogar o consentimento?", "Sim, revogar" / "Não, manter"). O foco inicial fica no botão seguro, Esc cancela, Tab circula e o foco retorna ao botão de origem. O mesmo diálogo protege a exclusão de crise (somente de crise encerrada, RN01).
- **Como testar:** visão Responsável, "Revogar Consentimento", testar Esc.

### 1.10 Estados vazios (Etapa 3, Pilar 1)
- **Antes:** tela em branco sem orientação.
- **Depois:** mensagens que dizem o que fazer, por exemplo, "Nenhuma crise registrada ainda. Use o botão vermelho quando um episódio começar…". Em: histórico de crises, prancha, tabela da Coordenação, fila de sincronização e registro de atividades.
- **Como testar:** apagar os dados do site (IndexedDB) ou ver o registro de atividades logo no primeiro acesso.

### 1.11 Painel do Responsável (Etapa 4, Pilar 3)
- **Antes:** termo corrido, com IP exibido como `0.0.xxx.xxx`.
- **Depois:** blocos: *seu filho aparece só por um código*; *o que é coletado*; *para que serve*; *base legal* (LGPD arts. 11 e 14); *seu consentimento* (situação, versão do termo, data do aceite, IP); *como revogar* em três passos. O IP nunca aparece inteiro, e o valor de exemplo aparece como "Não registrado".
- **Como testar:** entrar como Responsável (demo) e percorrer os blocos.

### 1.12 Aviso de anonimização (Etapa 4, Pilar 3)
- **Antes:** o código ALN-8921 aparecia, mas sem explicação.
- **Depois:** em todas as visões, uma linha informa que o aluno aparece só pelo código e que nomes reais não são armazenados.

### 1.13 Acesso negado e sessão encerrada (Etapa 4, Pilar 3)
- **Antes:** tela de erro com termos técnicos, e nenhum aviso quando o servidor encerrava a sessão.
- **Depois:** aviso persistente com motivo e ação. Se o servidor encerrar a sessão (diferente de o usuário sair), o aviso diz: "Sua sessão terminou… Os registros salvos neste aparelho não foram perdidos."

### 1.14 Formulário SUS (Etapa 5, Pilares 2 e 3)
- **Antes:** cada pergunta trazia a etiqueta "Positivo" ou "Negativo", que revela a lógica de pontuação e pode enviesar a resposta; os botões "Todos Neutro/Concordo" geravam dados inválidos.
- **Depois:** sem etiquetas. Os atalhos só aparecem com `VITE_SUS_ATALHOS_TESTE=true`. A nota continua calculada do mesmo jeito.

### 1.15 Acessibilidade e responsividade (Etapa 5, Pilar 2)
- **Antes:** alvos de toque de 24 a 46px (abas e campos do login, "Mostrar senha", botões pequenos, botão de fechar do SUS); "Mostrar senha" inalcançável pelo teclado (`tabIndex=-1`); no celular com fonte ampliada, rolagem horizontal de 654px em 375px; títulos com 2,5:1 de contraste no Alto Contraste.
- **Depois:** todos os alvos ≥ 48px; "Mostrar senha" alcançável pelo teclado; abas, ações e tabelas quebram ou rolam dentro do próprio quadro; token `--cor-titulo` para títulos legíveis nos três modos.

---

## 2. Decisões aprovadas na Etapa 0

1. **"Sobre" como aba fixa**, visível também sem login (em vez de página inicial).
2. **Simulador de conexão** só em demonstração, rotulado como ferramenta; some quando `VITE_MODO_DEMO=false`.
3. **SUS** sem etiquetas e sem atalhos na versão do avaliador.
4. **Base legal**: texto redigido por mim e marcado para revisão (comentário `REVISAR` em `ConsentimentoLGPD.tsx`).

---

## 3. Verificação

| Verificação | Resultado |
|---|---|
| `npx tsc --noEmit` | sem erros |
| `npm test` | **43 testes aprovados** em 4 arquivos (eram 15; +28 nesta rodada) |
| `npm run build` | sem erros (PWA gerado) |
| Auditoria no navegador (alvos, contraste e nome acessível) | 30 combinações (3 contrastes × 2 tamanhos de fonte × 5 visões) mais login (3 abas × 3 modos) e SUS (3 modos): **0 alvos < 48px, 0 falhas de contraste nos elementos criados ou alterados, 0 controles sem nome** |
| Celular (375px, fonte ampliada) | sem rolagem horizontal nas 5 visões |

Testes novos: `acesso.test.ts` (visibilidade por perfil), `sync.test.ts` (selos, fila, conexão), `atividades.test.ts` (privacidade, limite, armazenamento) e um caso em `db.test.ts` (IP). Todos importam o código real.

---

## 4. Limitações restantes (o que **não** está concluído)

1. **A revogação não bloqueia a coleta.** Nenhum código lê `consentimento.ativo`. A tela diz isso com franqueza: a revogação é registrada, mas o bloqueio automático não existe.
2. **O IP do aceite não é capturado pelo aplicativo** (o dado de exemplo é `0.0.0.0`); por isso a tela mostra "Não registrado".
3. **Redação jurídica da base legal** (arts. 11 e 14) precisa de revisão da orientadora ou de assessoria jurídica antes da banca.
4. **Contraste fora do escopo alterado.** Uma varredura geral de 531 textos por modo achou falhas em componentes antigos, que não foram mexidos:
   - modo Padrão: botão de crise (4,16:1), botão "Concluir" (4,24:1), selo "Concluído" (4,24:1), tipos do cartão como "Transição" (4,33:1), "Tarefa Concluída!" (3,22:1) e texto da área de soltar (3,80:1);
   - modo Alto Contraste, também: botões de ordem, selo do código ALN, título da marca, valores das métricas e o tempo do temporizador.

   Causa comum: `--success` e `--crisis` do tema claro com texto branco, e `--primary` sem ajuste no Alto Contraste. A correção exige separar tokens de texto e de fundo; não foi feita para não alterar a paleta documentada sem validação.
5. **Sem teste com leitor de tela** e sem teste manual por teclado além do diálogo; as medições usaram o Chromium do painel do app e o celular apenas emulado (375px). Firefox e Safari não foram testados.
6. **Sem testes de componente** (React Testing Library): só a lógica pura é testada automaticamente; as telas foram verificadas manualmente.
7. **Sessão encerrada pelo servidor** e **painel de sincronização com conta real**: implementados, mas sem teste com o Supabase real (não há credenciais de teste aqui) e sem teste automatizado.
8. **Registro de atividades** é local (30 itens por navegador) e pode ser limpo por qualquer pessoa; **não é uma trilha de auditoria**.
9. **Desativar o simulador em produção** exige `VITE_MODO_DEMO=false`, que também remove o login de demonstração (as duas funções estão acopladas).
10. A lógica de visibilidade por perfil é só experiência de uso; **a segurança continua no servidor** (RLS e gatilho de perfil).

Pendências antigas, não tratadas aqui: gravação das respostas do SUS, PDF do PEI com gráficos, testes de integração com IndexedDB e Supabase, alinhamento dos IDs de seed ao banco remoto, deploy na Vercel e troca da chave anon do Supabase.

---

## 5. Roteiro de demonstração para a banca (cerca de 8 minutos)

1. Abrir o site sem login: mostrar o selo **Visitante** e as visões com cadeado.
2. Tocar em **Sobre**: objetivo, perfis, regras e caminho da crise.
3. **Entrar > Demonstração > Prof. Helena**: selo laranja de demonstração.
4. **Simulador > simular queda**, iniciar e encerrar uma crise: selo "Salva só neste aparelho" e fila com 1 item no painel de sincronização.
5. **Restabelecer**: aviso explicando que, em demonstração, nada é enviado.
6. **Coordenação**: mesmos selos na tabela, painel anonimizado, formulário SUS sem etiquetas.
7. **Responsável**: blocos da LGPD, "Revogar" com diálogo, Esc para cancelar, conferir o **Atividades recentes**.
8. Alternar os três modos de contraste e a fonte ampliada.
