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
| 5b | ver `git log` | 2 | Contraste dos componentes antigos: tokens de texto x preenchimento e teste da paleta |

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

### 1.16 Contraste dos componentes antigos (rodada 2, Pilar 2)
- **Antes:** uma varredura de todos os textos (não só dos elementos novos) achou cerca de 50 combinações abaixo de 4,5:1. No modo Padrão: botão de crise (4,16:1), "Concluir" (4,24:1), selo "Concluído" (4,24:1), tipos do cartão (4,3:1), "Tarefa Concluída!" (3,22:1) e texto da área de soltar (3,80:1). No Alto Contraste: botões de ordem, selo do código, título da marca, métricas e tempo do temporizador. No Amarelo/Preto: **texto branco fixo sobre amarelo (1,4:1)** em botões, selos e números dos cartões. No login, o texto translúcido do painel de marca ficava entre 3,0:1 e 4,1:1.
- **Depois:** zero falhas. A causa era uma só: as mesmas variáveis (`--primary`, `--success`, `--crisis`) serviam para **texto** e para **preenchimento**, e o texto sobre preenchimento era branco fixo. Foram criados tokens separados, com valor próprio em cada modo:

| Token | Uso | Padrão | Alto Contraste | Amarelo/Preto |
|---|---|---|---|---|
| `--primary-text` | texto no tom principal | #3A6B7E | #8CC4DA | #FFD700 |
| `--success-text` | texto de sucesso | #3A5F50 | #9AD3BA | #00FF00 |
| `--crisis-text` | texto de alerta | #A03E38 | #F5948E | #FF6B6B |
| `--warning-text` | texto de atenção | #7A5524 | #E8B987 | #FFD700 |
| `--success-fill` | fundo de botões e selos de sucesso | #466B5B | igual | #00FF00 |
| `--crisis-fill` | fundo de botões e selos de alerta | #AE443B | igual | #FF0000 |
| `--on-fill` | texto sobre os preenchimentos | #FFFFFF | igual | #000000 |

- **Decisões:** o terracota do botão de crise ficou um pouco mais profundo (#C85A54 para #AE443B) para chegar a 5,7:1 com texto branco; o painel de marca do login usa fundo preto e texto amarelo no modo Amarelo/Preto, porque o gradiente começaria em amarelo; o hover do botão de crise nesse modo é mais claro (#FF4D4D), pois #E60000 dava 4,36:1 com texto preto. Os tons do tema claro que já eram usados como borda e ícone não mudaram.
- **Como testar:** em cada um dos 3 modos, abrir Professor, iniciar uma crise e conferir o botão e o cartão "Concluído"; abrir o login no modo Amarelo/Preto.

### 1.17 Bloqueio da coleta ao revogar o consentimento (rodada 3, Pilar 3)
- **Antes:** a revogação era apenas registrada; nenhum código lia `consentimento.ativo`, e a tela avisava isso.
- **Depois:** com o consentimento revogado, o botão "Iniciar Registro de Crise" fica inativo (continua focável, com `aria-disabled` e `aria-describedby`) e mostra o motivo e como desbloquear. O clique também é barrado no tratamento da ação, que relê o termo salvo no aparelho (defesa em profundidade contra tela desatualizada). A tentativa bloqueada vai para o registro de atividades.
- **Regra (`utils/regras.ts`, `coletaPermitida`):** só um termo existente e revogado bloqueia; sem termo carregado a coleta segue permitida. Encerrar uma crise em andamento continua possível (RN01: não se perde um registro aberto), e o histórico permanece.
- **Texto ao responsável:** a nota da tela LGPD e o diálogo de revogação passaram a dizer o que de fato acontece, sem prometer exclusão de dados.
- **Testes:** 5 casos em `db.test.ts` (ativo, revogado, reativado, sem termo, mensagem). Navegador: revogar no Responsável, abrir Professor, botão inativo e clique sem efeito; reativar e botão volta ao normal.
- **Como testar:** Responsável, "Revogar Consentimento" e "Sim, revogar"; abrir Professor. Reativar e conferir que o botão volta.

### 1.18 SUS passa a gravar as respostas (rodada 3, Pilares 1 e 2)
- **Antes:** o formulário calculava a nota e a descartava (o `insert` estava só em comentário), então a avaliação de usabilidade do TCC não deixava dado nenhum.
- **Depois:** a resposta é gravada primeiro no aparelho (IndexedDB, versão 3 do banco, loja `sus_respostas`; RN03) e, com sessão real, entra na fila de envio como `RESPOSTA_SUS`, que reaproveita as tentativas e o painel de sincronização. A tela informa onde ficou salva: só neste aparelho (demonstração), enviada em segundo plano ou aguardando conexão.
- **Servidor:** migração `20261028000003_respostas_sus.sql` cria `respostas_sus` (10 respostas de 1 a 5, nota de 0 a 100, versão do instrumento). RLS: só COORDENACAO insere, com `avaliador_id = auth.uid()`; cada avaliador lê só as próprias; sem UPDATE e sem DELETE. Sem ligação com estudante e sem nome do avaliador (minimização, Pilar 3).
- **Cálculo (`utils/sus.ts`):** extraído do componente, com 8 testes (extremos 0 e 100, neutro 50, validação, casa decimal). Deixou de arredondar (97,5 era exibido como 98). As faixas antigas citavam percentuais sem fonte ("melhor que 99% dos sistemas"); passaram a usar a média 68 e os cortes 80,3 e 51 de Sauro e Lewis, marcadas com `REVISAR`.
- **Como testar:** em Coordenação, abrir "Formulário SUS", responder as 10 perguntas e enviar; conferir a mensagem de onde foi salvo. Para o servidor, aplicar a migração e repetir com conta real de Coordenação.

### 1.19 Relatório do PEI com gráficos e leituras de padrão (rodada 4, Pilares 1 e 2)
- **Antes:** o botão "Exportar Relatório PEI" só chamava a impressão da própria tela, sem gráficos, e o painel não apontava padrão nenhum.
- **Depois:** o painel ganhou "Padrões observados" (crises por dia nos últimos 14 dias, por faixa de horário e por dia da semana, mais frases de leitura) e o botão abre um **relatório** próprio, com cabeçalho do aluno só pelo código, resumo, os gráficos, as leituras e a tabela de episódios. A impressão mostra só o relatório (CSS `@media print`); o PDF sai da opção "Salvar como PDF" do navegador.
- **Lógica (`utils/pei.ts`, 12 testes):** só entram crises encerradas (RN01); os dias sem crise aparecem com zero; semana começa na segunda; os limites das faixas são conferidos (9h entra em "9h às 11h").
- **Honestidade dos números:** com menos de 5 crises encerradas o painel diz que são poucos dados em vez de apontar padrão; um empate é dito como empate; a tendência compara os últimos 7 dias com os 7 anteriores e só aparece com 3 ou mais crises no período.
- **Acessibilidade:** gráficos em SVG sem biblioteca, com o valor escrito sobre a barra, descrição para leitor de tela e uma tabela equivalente oculta; o relatório é uma caixa de diálogo com foco no título, Esc para fechar e foco devolvido ao botão. Um teste mede a cor das barras (3:1) nos 3 modos e já acusou 2,57:1 no Alto Contraste, o que levou a usar a cor de texto de alerta nas barras.
- **Privacidade:** observações do educador passam por `descricaoSegura` (mascara e-mail, CPF e códigos), e o rodapé avisa que nomes digitados à mão não são detectados.
- **Como testar:** em Coordenação, rolar até "Padrões observados" e abrir "Relatório do PEI"; conferir Esc, a impressão (Ctrl+P) e os 3 modos de contraste.

### 1.20 Resultados do SUS na Coordenação (rodada 4, Pilares 2 e 3)
- **Antes:** as notas só podiam ser consultadas por SQL, e cada avaliador lê apenas as próprias respostas.
- **Depois:** a tela "Resultados da avaliação de usabilidade (SUS)" mostra total, média, menor e maior nota, quantas ficaram acima da meta de 68 e a média por pergunta, para o aparelho e, com conta real, para o servidor.
- **Servidor:** a função `resumo_sus()` (migração `20261029000001`) devolve só agregados, só para a Coordenação, e não calcula a média por pergunta com menos de 3 avaliações, para não expor a resposta de uma pessoa.
- **Testes:** `resumirSUS` e `resumoDoServidor` (5 casos). **Pendente:** aplicar a migração.

### 1.21 Dados de exemplo no servidor e consentimento com a conta real (rodada 4, Pilar 1)
- **Antes:** estudantes, rotina e cartões existiam só no IndexedDB, então a fila falhava nas chaves estrangeiras; o consentimento de exemplo citava um responsável fictício que não existe em `usuarios`.
- **Depois:** a migração `20261029000002` cria no servidor os mesmos identificadores (idempotente) e a função administrativa `vincular_conta_aos_exemplos(email)`, que só o SQL Editor executa. O consentimento é enviado com a conta autenticada como responsável (`responsavelParaEnvio`, 3 testes).
- **Pendente:** aplicar a migração e rodar o roteiro de DEPLOY_VERCEL.md com conta real.

### 1.22 Testes de integração e publicação (rodada 4, Pilares 1 e 2)
- **Integração (`integracao.test.ts`, 17 testes):** o código real de `services/db.ts` sobre IndexedDB simulado e um dublê do Supabase. Cobre seed, ciclo da crise, RN01, consentimento, SUS, upsert com o UUID local, três tentativas até ERRO, "tentar novamente" e o responsável do consentimento. Validação do teste: duas alterações deliberadas no código foram acusadas e depois revertidas.
- **Publicação:** `vercel.json` ganhou `sw.js` sem cache longo; `configuracao.test.ts` garante que toda variável `VITE_` usada está no `.env.example` (sem chave real) e que os cabeçalhos e o redirecionamento existem. O passo a passo, incluindo a troca da chave pública, está em [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md).
- **Não feito:** a publicação em si e o CSP.

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
| `npm test` | **114 testes aprovados** em 9 arquivos (eram 15 antes das melhorias de UX; +99 desde então) |
| `npm run build` | sem erros (PWA gerado) |
| Auditoria no navegador (alvos, contraste e nome acessível) | Etapa 5: 30 combinações (3 contrastes × 2 tamanhos de fonte × 5 visões) mais login e SUS: **0 alvos < 48px, 0 controles sem nome**. Rodada 2 (contraste): **78 estados** (login em 3 abas, 5 visões, crise em andamento, modal de observação, configuração de cartões, SUS e diálogo de revogação × 3 modos × 2 tamanhos de fonte), **10.813 textos medidos, 0 falhas de contraste**, incluindo o pior ponto de fundos com gradiente |
| Celular (375px, fonte ampliada) | sem rolagem horizontal nas 5 visões |

Testes novos: `acesso.test.ts` (visibilidade por perfil), `sync.test.ts` (selos, fila, conexão), `atividades.test.ts` (privacidade, limite, armazenamento), um caso em `db.test.ts` (IP) e `contraste.test.ts`, que **lê o `index.css` real** e confere, nos 3 modos, 4,5:1 para cada texto sobre cada superfície e para o texto sobre cada preenchimento. Esse teste já pegou uma falha que a auditoria visual não via (o hover do botão de crise no modo Amarelo/Preto) e falha se alguém reintroduzir o verde antigo. Todos importam o código real.

---

## 4. Limitações restantes (o que **não** está concluído)

1. **O bloqueio ao revogar vale só no aparelho.** O início de novos registros de crise é barrado pelo aplicativo (seção 1.17), mas não há regra no servidor (RLS) que impeça a gravação, a revogação feita em outro aparelho só chega aqui depois da sincronização do termo, e os dados já coletados não são apagados.
2. **O IP do aceite não é capturado pelo aplicativo** (o dado de exemplo é `0.0.0.0`); por isso a tela mostra "Não registrado".
3. **Redação jurídica da base legal** (arts. 11 e 14) precisa de revisão da orientadora ou de assessoria jurídica antes da banca.
4. **Contraste: o que a medição cobre e o que não cobre.** Depois da correção dos componentes antigos (seção 1.16), a varredura de texto passou a dar zero falhas, mas ela **não mede**: contraste de elementos que não são texto (bordas, ícones, anel do temporizador; exigência de 3:1), estados de foco e `:hover` (só os tokens de hover são testados, não cada tela) e imagens ou pictogramas.
5. **SUS no servidor não testado.** A migração do SUS já foi aplicada (2 políticas confirmadas), mas o envio com conta real de Coordenação não foi exercitado; não existe tela de consolidação (consulta por SQL).
6. **Sem teste com leitor de tela** e sem teste manual por teclado além do diálogo; as medições usaram o Chromium do painel do app e o celular apenas emulado (375px). Firefox e Safari não foram testados.
7. **Sem testes de componente** (React Testing Library): só a lógica pura é testada automaticamente; as telas foram verificadas manualmente.
8. **Sessão encerrada pelo servidor** e **painel de sincronização com conta real**: implementados, mas sem teste com o Supabase real (não há credenciais de teste aqui) e sem teste automatizado.
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
