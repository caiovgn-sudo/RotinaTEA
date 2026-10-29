# Quadro Kanban e Backlog do Projeto — RotinaTEA

Acompanhamento ágil das entregas do projeto alinhadas ao cronograma de 14 semanas.

---

## 📋 Quadro Kanban Atual

### 📌 Backlog (A Fazer)
- [~] **US09**: Relatório PEI para impressão/PDF via `@media print` (parcial: sem gráficos dedicados nem geração de arquivo no servidor).
- [~] **US10**: Formulário SUS implementado (10 itens, cálculo e classificação); a resposta agora é **gravada** (local primeiro; envio ao Supabase pela fila, após aplicar a migração `20261028000003_respostas_sus.sql`); a aplicação com educadores não foi realizada.
- [x] **US11**: Modo de alto contraste preto/amarelo suave alternativo para baixa visão associada (seletor no Header).
- [x] **US12**: Integração remota com a API de busca online do ARASAAC quando houver conectividade (busca em tempo real no ConfiguracaoRotina).

### ⏳ To Do (Próximo Ciclo)
- [x] **US07**: Sistema de autenticação JWT com controle de rotas por perfis (Supabase Auth + RLS).
- [x] **US08**: Tela de edição e ordenação personalizada de rotinas pelo educador (ConfiguracaoRotina + drag-drop).

### ⚙️ Doing (Em Andamento / Implementação Atual)
- [x] **US01**: Prancha Visual com Pictogramas ARASAAC e Drag-and-Drop acessível.
- [x] **US02**: Temporizador Visual Progressivo sem sobrecarga sensorial.
- [x] **US03**: Botão de Registro de Crise em 1 Clique (Iniciar/Encerrar com timer visual).
- [x] **US04**: Persistência Offline-First via IndexedDB e simulador de conectividade + **Sincronização real com Supabase** (fila de sync, retry, deduplicação).
- [x] **US05**: Dashboard Analítico com anonimização na origem (Código do Aluno).
- [x] **US06**: Gestão de Consentimento e Direitos do Titular (LGPD).

### 🔍 Code Review / Qualidade
- [x] **QC01**: Verificação de contraste e foco visual de teclado (WCAG 2.1 AA).
- [~] **QC02**: Tolerância a falhas sem internet: implementada; testes automatizados cobrem a fila de sincronização (lógica pura). Testes de integração com IndexedDB e Supabase pendentes.
- [x] **QC03**: Verificação de anonimização estrita nos dados do aluno.

### ✅ Done (Concluído)
- [x] **DOC01**: Análise e síntese de todos os documentos do projeto (`RotinaTEA PréProjeto TCC.docx`, Slides, Cronograma, Diagramas).
- [x] **DOC02**: Elaboração do `README.md` com arquitetura e guia de execução.
- [x] **DOC03**: Documento de Planejamento Estratégico (`PLANEJAMENTO.md`).
- [x] **DOC04**: Documento de Arquitetura e Engenharia com ADRs (`ARQUITETURA_ENGENHARIA.md`).
- [x] **DOC05**: Diretrizes de UX e Acessibilidade Sensorial para TEA (`DIRETRIZES_UX_ACESSIBILIDADE.md`).
- [x] **DOC06**: Mapeamento de Processos e Fluxos BPMN (`PROCESSOS_FLUXOS.md`).
- [x] **DOC07**: Plano de Testes com Matriz de Rastreabilidade (`PLANO_TESTES_QUALIDADE.md`).
- [x] **DOC08**: Governança, Serviços ITIL e Indicadores KPIs (`GOVERNANCA_SERVICOS_METAS.md`).
- [x] **PWA01**: PWA completo — Manifest, Service Worker (Workbox), cache offline, instalação nativa, atualização automática.

---

## 📦 Resumo das Entregas Implementadas Nesta Sprint

### Frontend (React 18 + TypeScript + Vite)
| Componente | Status | Observações |
|------------|--------|-------------|
| `PranchaVisual` + `CartaoRotina` | ✅ | Drag & drop + teclado, pictogramas ARASAAC vetoriais |
| `TemporizadorVisual` | ✅ | Disco SVG regressivo, sem alarmes auditivos |
| `RegistroCrise` | ✅ | 1 clique, cronômetro tempo real, observações pós-crise |
| `ConfiguracaoRotina` | ✅ | CRUD de itens + **busca ARASAAC online** |
| `DashboardPEI` + `PainelPEI` | ✅ | Métricas anonimizadas, **exportação PDF via print** |
| `ConsentimentoLGPD` | ✅ | Aceite/revogação, auditoria IP, versão de termo |
| `Header` | ✅ | Perfils, conexão offline/online, **3 modos de contraste**, fonte ampliada |
| `Login` / `AuthContext` | ✅ | Supabase Auth, registro, logout, proteção de rotas |
| `FormularioSUS` | ✅ | 10 itens Likert, cálculo automático, classificação |

### Serviços & Integração
| Arquivo | Status | Observações |
|---------|--------|-------------|
| `db.ts` (IndexedDB) | ✅ | Seed, CRUD, fila de sync com retry (máx. 3) e **upsert idempotente pelo UUID local**; rede fora das transações IndexedDB (`filaSync.ts`) |
| `supabase.ts` | ✅ | Cliente configurado, verificação de conectividade, persistência de sessão |
| `AuthContext.tsx` | ✅ | Perfil lido do servidor (`usuarios`); cadastro sempre como Responsável; **modo demonstração explícito, sem senha e sem acesso remoto** (`VITE_MODO_DEMO`) |
| `vite.config.ts` | ✅ | **PWA plugin** (manifest, SW, cache strategies para Supabase/ARASAAC) |

### Acessibilidade & PWA
- ✅ WCAG 2.1 AA: contraste, foco visível, touch targets ≥ 48px, `prefers-reduced-motion`
- ✅ 3 modos de contraste: Padrão / Alto Contraste / **Amarelo/Preto (baixa visão)**
- ✅ Fonte ampliada (A+)
- ✅ PWA: `manifest.webmanifest`, Service Worker (Workbox), cache offline-first, atalhos de app
- ✅ Ícones PWA gerados (72–512px)

### Testes & Build
- ✅ `npm run build` — TypeScript strict + Vite production build sem erros
- ✅ `npm test` — Vitest: 114 testes (9 arquivos) importando o código real (`utils/regras`, `services/filaSync`, `utils/tempo`): RN01, RN02, RN03, mascaramento de IP, perfil padrão, perfis que registram crise, visibilidade por perfil, estados de sincronização, registro de atividades, IP mascarado, bloqueio da coleta ao revogar, cálculo do SUS, agregações do PEI, integração do IndexedDB com a fila (fake-indexeddb), configuração de publicação e contraste da paleta (lê o `index.css`)
- ✅ Lint: sem warnings críticos, apenas aviso de dynamic import ineficaz (não bloqueante)

---

## 🚀 Próximos Passos (Pós-Entrega TCC)

1. **Deploy Vercel** — Conectar repositório, configurar variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
2. **Supabase Production** — Aplicar migração `20261013000001_schema_inicial.sql` no projeto produção, habilitar RLS
3. **Testes E2E** — Cypress/Playwright para fluxos críticos (crise 1-clique, sync offline→online, login)
4. **Coleta SUS Real** — Aplicar formulário com educadores parceiros, consolidar resultados no TCC
5. **Documentação Final** — Atualizar `README.md` com URLs de produção, gerar `LINKS_DO_PROJETO.md`

---

## 🔧 Revisão técnica de 28/10/2026 (estado real)

**Corrigido:** contas de teste com senha fixa removidas (modo demo sem senha, local); perfil definido no servidor (migração `20261028000001_endurece_perfis.sql`); `carregarCrises` não apaga mais dados; exclusão de crise em andamento bloqueada (RN01); sincronização sem `await` de rede dentro de transação IndexedDB, com upsert idempotente; IP mascarado na tela e IP de seed neutralizado; testes passam a importar o código real; chave do Supabase removida da documentação.

**Pendente / limitações conhecidas:** PDF é impressão do navegador; IDs de seed do IndexedDB precisam existir no banco remoto (FKs); testes de integração com IndexedDB/Supabase; deploy na Vercel; validação com educadores.

**28/10/2026 — RLS de crises (Pilar 3):** migração `20261028000002_restringe_crises.sql` substitui a política `FOR ALL` por políticas por operação: leitura para vinculados; inserção só por PROFESSOR/COORDENACAO vinculados com `professor_id = auth.uid()`; atualização só pelo autor; exclusão só de crise encerrada (RN01), pelo autor ou pela coordenação. A interface aplica a mesma regra (`podeRegistrarCrise`). Aplicada no Supabase em 28/10/2026 (4 políticas confirmadas em `pg_policies`).


---

## 🎨 Melhorias de UX e organização (28/10/2026)

Detalhes, antes/depois e roteiro de teste em [MELHORIAS_UX_2026-10.md](MELHORIAS_UX_2026-10.md).

**Concluído (verificado com tsc, 114 testes e build; telas conferidas no navegador):**
- [x] **UX01** (Pilar 1): frase de propósito por visão, navegação com visões bloqueadas explicadas, faixa de tipo de acesso (visitante, conta real, demonstração) e aba "Sobre o RotinaTEA".
- [x] **UX02** (Pilares 1 e 2): conexão real (`navigator.onLine`) separada do simulador de demonstração; painel de sincronização com "Sincronizar agora" e "Tentar novamente"; selos "Salva só neste aparelho", "Enviada ao servidor" e "Falhou o envio".
- [x] **UX03** (Pilar 1): registro local de atividades sem dados pessoais, diálogo de confirmação acessível e estados vazios explicativos.
- [x] **UX04** (Pilar 3): painel do Responsável com o que é coletado, finalidade, base legal, versão, data do aceite, IP mascarado e como revogar; aviso de anonimização; mensagens de acesso negado e de sessão encerrada.
- [x] **UX12** (Pilar 1): publicação na Vercel preparada: `vercel.json` com `sw.js` sem cache longo, `configuracao.test.ts` (variáveis de ambiente e cabeçalhos) e roteiro em [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md), com a troca da chave pública e o teste de ponta a ponta. **A publicação em si depende do acesso da equipe à Vercel e ao Supabase.**
- [x] **UX11** (Pilar 2): 17 testes de integração do armazenamento local (`integracao.test.ts`, IndexedDB simulado e dublê do Supabase): seed idempotente, ciclo da crise, RN01, consentimento, SUS, envio por upsert, tentativas até ERRO e "tentar novamente". Duas alterações deliberadas no código foram acusadas pelos testes.
- [x] **UX10** (Pilar 1): dados de exemplo no banco remoto (migração `20261029000002`) para a fila não falhar nas chaves estrangeiras, função administrativa `vincular_conta_aos_exemplos` e consentimento enviado com a conta autenticada como responsável. **Falta aplicar a migração e rodar o roteiro com conta real.**
- [x] **UX09** (Pilares 2 e 3): tela de resultados do SUS para a Coordenação (função `resumo_sus()`: só agregados, só Coordenação, média por pergunta só com 3 ou mais avaliações). **Falta aplicar a migração `20261029000001`.**
- [x] **UX08b** (Pilares 1 e 2): relatório do PEI com gráficos (crises por dia, por faixa de horário e por dia da semana), leituras de padrão (só com 5 ou mais crises encerradas; empate dito como empate) e impressão ou PDF pelo navegador. Resolve o RF10 "Parcial".
- [x] **UX08** (Pilares 1 e 2): o SUS grava as respostas (IndexedDB v3, fila de envio, tabela `respostas_sus` com RLS: só COORDENACAO insere e cada avaliador lê as próprias; imutável). Cálculo movido para `utils/sus.ts` com 8 testes e sem arredondar (97,5 em vez de 98); em modo demonstração a resposta fica só no aparelho e a tela diz isso.
- [x] **UX07** (Pilar 3): a revogação do consentimento agora **bloqueia o início de novos registros de crise** (regra `coletaPermitida`, 5 testes; o botão fica inativo com explicação e o clique também é barrado relendo o termo salvo). Uma crise já em andamento pode ser encerrada (RN01) e os registros anteriores permanecem.
- [x] **UX06** (Pilar 2): contraste dos componentes antigos corrigido com tokens separados de texto e de preenchimento (`--*-text`, `--*-fill`, `--on-fill`); 78 estados e 10.813 textos medidos sem falhas nos 3 modos; `contraste.test.ts` protege a paleta contra regressão.
- [x] **UX05** (Pilar 2): alvos de toque ≥ 48px, contraste dos elementos alterados, "Mostrar senha" acessível por teclado, SUS sem etiquetas Positivo/Negativo e cabeçalho sem rolagem horizontal no celular.

**Limitações restantes (não concluído):**
- A migração do SUS foi aplicada no Supabase (2 políticas confirmadas em 28/10/2026); as migrações `20261029000001` e `20261029000002` foram aplicadas (funções `resumo_sus` e `vincular_conta_aos_exemplos` confirmadas no servidor em 29/10/2026; os códigos ALN-4412 e ALN-8921 conferidos no SQL Editor), e o envio com conta real **não foi testado** (roteiro em DEPLOY_VERCEL.md).
- O relatório do PEI usa a impressão do navegador (a opção de salvar em PDF vem do próprio navegador); a aparência impressa não foi conferida em papel nem em outros navegadores. As leituras de padrão são indícios estatísticos simples, não diagnóstico.
- O CSP (política de conteúdo) não foi configurado na Vercel; o aplicativo usa fontes do Google e a API do ARASAAC. Não há tela que consolide as respostas (consulta por SQL) e as faixas de classificação têm `REVISAR` (conferir a referência no artigo).
- O bloqueio ao revogar vale **no aparelho** (estado local, IndexedDB): não há regra no servidor (RLS) que impeça um educador de gravar crises de um aluno com consentimento revogado, e a revogação feita em outro aparelho só chega aqui quando houver sincronização do termo. Também não apaga dados já coletados.
- O IP do aceite não é capturado pelo aplicativo (aparece "Não registrado").
- A redação da base legal (LGPD arts. 11 e 14) precisa de revisão antes da banca.
- A medição de contraste cobre só **texto**; contraste de elementos que não são texto (bordas, ícones, anel do temporizador), foco e hover por tela não são medidos (apenas os tokens de hover são testados).
- Sem teste com leitor de tela, sem testes de componente e sem teste da sessão encerrada nem da sincronização com conta real do Supabase.
- O registro de atividades é local e não é trilha de auditoria.
- Desativar o simulador em produção também remove o login de demonstração (`VITE_MODO_DEMO=false`).
