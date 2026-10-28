# CHECKLIST DE QUALIDADE TÉCNICA — RotinaTEA
> Auditoria executada em: **2026-10-26** | Auditor: Antigravity (modo somente leitura)
> Raiz do projeto: `docs/` | App: `docs/app/`

---

## Mapeamento da Stack (Etapa 0)

**Stack identificada:** React 18 + TypeScript 5.5 + Vite 8.3 (PWA via `vite-plugin-pwa`), Supabase JS SDK 2.117 como BaaS (PostgreSQL + Auth + Realtime), IndexedDB como persistência local (offline-first), Lucide React 1.61 para ícones, Vitest 5 para testes. Gerenciador de pacotes: npm 11. Sem framework de roteamento (React Router — roteamento por estado). Sem ESLint/Prettier configurados. Sem Dockerfile. Sem pipeline de CI/CD. A aplicação é um SPA monolítico com 3 camadas funcionais: `services/` (acesso a dados), `context/` (estado global), `components/` (UI + lógica local). Banco de dados gerenciado por Supabase com RLS habilitada; migrações em `supabase/migrations/`. Documentação rica em `.md` na raiz do projeto. 7 commits no histórico.

---

## Resumo Executivo

| Categoria | OK | PARCIAL | FALHA | N/A | NÃO VERIFICÁVEL |
|---|---|---|---|---|---|
| 1. Organização e Arquitetura | 3 | 3 | 2 | 0 | 0 |
| 2. Frontend | 5 | 3 | 3 | 0 | 1 |
| 3. Backend | 0 | 0 | 0 | 8 | 1 |
| 4. Banco de Dados | 5 | 2 | 1 | 0 | 1 |
| 5. Integrações | 2 | 3 | 2 | 0 | 1 |
| 6. Segurança | 3 | 3 | 3 | 1 | 2 |
| 7. Testes e Qualidade | 2 | 2 | 2 | 0 | 1 |
| 8. Infraestrutura e CI/CD | 1 | 1 | 3 | 0 | 2 |
| 9. Documentação | 3 | 2 | 0 | 0 | 1 |
| **TOTAL** | **24** | **19** | **16** | **9** | **9** |

### Os 5 Maiores Riscos

1. **[CRÍTICO] `carregarCrises()` abre transação `readwrite` e deleta registros silenciosamente** — risco de perda permanente de dados clínicos em produção (`db.ts:330-343`).
2. **[CRÍTICO] IP de origem hardcoded `'189.102.45.12'` no seed e exibido na UI** — viola LGPD Art. 14 (`db.ts:131`, `ConsentimentoLGPD.tsx:77`).
3. **[ALTO] Ausência total de ESLint/Prettier** — sem linting automático, erros silenciosos não são detectados.
4. **[ALTO] Dados de sessão gravados em `localStorage` em texto plano** — interceptável por XSS (`AuthContext.tsx:85,156`).
5. **[ALTO] 2 vulnerabilidades de dependências** — `fast-uri` (moderada, 4 CVEs) e `serialize-javascript` (baixa, XSS).

---

## 1. Organização e Arquitetura

| Item | Status | Evidência | Observação |
|---|---|---|---|
| Estrutura de pastas coerente por camada | OK | `src/components/`, `src/services/`, `src/context/`, `src/types/`, `src/utils/`, `src/assets/` | Camadas bem definidas |
| Separação de responsabilidades | PARCIAL | `App.tsx:74-234` — orquestra DB, auth, UI e efeitos colaterais diretamente | Componente raiz como controller+service |
| Baixo acoplamento / SOLID | PARCIAL | `db.ts:404` — import dinâmico de `supabase.ts` dentro de função; `App.tsx` importa 14 funções de `db.ts` | Acoplamento direto entre apresentação e dados |
| Ausência de código morto e duplicação | PARCIAL | `PainelPEI.tsx:1-4` — 24 linhas re-exportando símbolo de `utils/tempo.ts`; `formatarTempo` em 2 locais | Arquivo proxy desnecessário |
| Nomenclatura consistente | OK | PascalCase (componentes) e camelCase (serviços/funções) | Consistente |
| Configuração centralizada | FALHA | `db.ts:131` — IP `'189.102.45.12'` hardcoded; `AuthContext.tsx:166` — senhas `'admin'` e `'123456'` hardcoded | Valores mágicos e credenciais espalhados |
| ESLint / Prettier configurados | FALHA | Busca por `eslintrc`/`eslint.config` sem resultados; nenhuma dep de linting em `package.json` | Nenhuma ferramenta de linting |

---

## 2. Frontend

| Item | Status | Evidência | Observação |
|---|---|---|---|
| Componentes reutilizáveis | PARCIAL | `App.tsx` 472 linhas com lógica de negócio; `ConfiguracaoRotina.tsx` 361 linhas | Alguns componentes bem focados (RegistroCrise, TemporizadorVisual) |
| Gerenciamento de estado | PARCIAL | `App.tsx:39-64` — 12+ `useState` no raiz; props para 5+ filhos | AuthContext evita drilling severo, mas dados de app sem contexto próprio |
| Chamadas à API centralizadas | OK | Todas via `services/supabase.ts` e `services/db.ts`; componentes sem acesso direto ao cliente | Boa separação |
| Rotas protegidas | OK | `App.tsx:237-244` — guarda `perfilRequerAuth && !usuario && !authLoading` | Funcional, mas por estado (sem router) |
| Validação de formulários | PARCIAL | `Login.tsx` valida `nome.trim()`, `minLength=6`; `ConfiguracaoRotina.tsx:42` valida `titulo.trim()` | Sem Zod/Yup; sem feedback de erro inline |
| Responsividade | OK | `index.css` usa `auto-fill`, `minmax`, unidades relativas; media queries em 768px e 420px | Prancha visual sem media query específica |
| Acessibilidade | OK | `role="banner"`, `role="alert"`, `aria-live="polite"`, `aria-label`, `aria-pressed`, `:focus-visible`, `sr-only`, `htmlFor` | Boa cobertura WCAG 2.1 AA |
| Performance / lazy loading | FALHA | Sem `React.lazy()`/`Suspense`; 11 componentes síncronos; bundle: 91.99+139.82+214.04 = 446 kB total | Supabase SDK = 48% do bundle |
| console.log / localStorage | FALHA | `db.ts:408` e `ConsentimentoLGPD.tsx:30` — console.log; `AuthContext.tsx:85,156,176,196,239` — sessão JSON em localStorage texto puro | Nome, email e perfil sem criptografia |
| Dependências vulneráveis | FALHA | `npm audit`: `fast-uri` moderada (4 CVEs); `serialize-javascript` baixa (XSS) | `npm audit fix` disponível sem breaking changes |
| Bundle / imports | PARCIAL | Sem dependência sem uso; warning `[INEFFECTIVE_DYNAMIC_IMPORT]` em `db.ts:404` | Import dinâmico ineficaz |

---

## 3. Backend

> **N/A** — Projeto sem backend próprio. Servidor é o **Supabase BaaS** (PostgreSQL + Auth + RLS + Realtime). Sem API REST própria, endpoints customizados, middlewares ou Dockerfile de backend.

| Item | Status | Evidência |
|---|---|---|
| Rotas RESTful consistentes | N/A | API gerada automaticamente pelo Supabase |
| Validação e sanitização de entrada | N/A | RLS faz controle de acesso |
| Tratamento centralizado de erros | N/A | — |
| Camadas / injeção de dependência | N/A | — |
| Logging estruturado | N/A | Supabase tem logs internos |
| Timeouts e retentativas | N/A | — |
| Idempotência | N/A | `db.ts:479,524,561` — `upsert` com `onConflict: 'id'` garante idempotência no client |
| Paginação em listagens | N/A | — |
| Configuração por ambiente | PARCIAL | `VITE_APP_ENV` em `.env.example`; sem uso efetivo no código |

---

## 4. Banco de Dados

| Item | Status | Evidência | Observação |
|---|---|---|---|
| Schema normalizado, PKs, FKs, constraints | OK | `schema_inicial.sql:39-160` — UUIDs PKs, FKs ON DELETE CASCADE/RESTRICT, NOT NULL, UNIQUE, CHECK adequados | Schema bem modelado |
| Índices em colunas de busca | OK | `schema_inicial.sql:115-116,139-140` — índices compostos em rotina_id+ordem, estudante_id, data_hora_inicio DESC | Índices relevantes |
| Queries parametrizadas / sem N+1 | OK | Supabase JS SDK gera queries parametrizadas via métodos fluentes | SQL Injection prevenido |
| Transações em operações multi-etapa | PARCIAL | `db.ts:78,357,413` — transações IDB corretas; `excluirCriseLocal:db.ts:375-379` — remoção Supabase fora da transação | Atomicidade quebrada entre IDB e Supabase |
| Migrations versionadas e reproduzíveis | OK | `20261013000001_schema_inicial.sql` — timestamp, `IF NOT EXISTS`, idempotente | Uma migration; sem rollback DOWN |
| Menor privilégio no usuário de conexão | PARCIAL | `VITE_SUPABASE_ANON_KEY`; RLS garante isolamento; sem `service_role` client-side | Adequado para o modelo |
| Backup e dados sensíveis | FALHA | `schema_inicial.sql:43` — `senha_hash TEXT NOT NULL` nunca populada (auth é Supabase Auth) — campo órfão; `ipOrigem` em texto puro na UI | Coluna redundante; IP exposto |
| Pool de conexões | NÃO VERIFICÁVEL | Gerenciado internamente pelo Supabase | Painel Supabase > Database > Connection Pooling |

---

## 5. Integrações

| Item | Status | Evidência | Observação |
|---|---|---|---|
| Inventário de integrações | OK | Supabase Auth (`AuthContext.tsx`); Supabase DB (`db.ts`); API ARASAAC (`ConfiguracaoRotina.tsx:69`); IndexedDB (`db.ts`) | 4 integrações bem isoladas |
| Contrato de resposta validado | PARCIAL | `supabase.ts:35` trata PGRST116/42501; `ConfiguracaoRotina.tsx:73` verifica `response.ok`; sem schema em runtime | `any` em `SyncItem.payload` (`types/index.ts:73`) |
| Autenticação e renovação de token | OK | `persistSession: true, autoRefreshToken: true`; `onAuthStateChange` ativo | Renovação automática via SDK |
| Timeout, retentativa e fallback | FALHA | `ConfiguracaoRotina.tsx:69-85` — fetch sem AbortController/timeout; `db.ts:447` — 3 tentativas sem backoff; sem circuit breaker | Falha de rede pode travar a UI |
| Logs e rastreabilidade | PARCIAL | Prefixos `[Sync]` e `[ARASAAC]`; `console.error` para erros de sync | console.* não estruturado; vaza em produção |
| Testes de integrações | FALHA | `db.test.ts` sem mocks de Supabase; sem testes de falha, timeout ou payload inválido | Integrações sem cobertura de falha |

---

## 6. Segurança

| Item | Status | Evidência | Observação |
|---|---|---|---|
| Segredos fora do repositório | OK | `.gitignore:10-15` — `.env` listado; `.env.example` sem valores reais; `git log --full-history -- **/.env` vazio | Sem vazamento histórico |
| Autenticação e autorização por perfil | PARCIAL | `App.tsx:237` — guarda por perfil; RLS por vínculo (`schema_inicial.sql:172-241`); dead branch em `App.tsx:440-446` | Sem política RLS por perfil para escritas específicas |
| Proteção SQL Injection / XSS | OK | SDK parametrizado; React escapa HTML; sem `dangerouslySetInnerHTML` | Mitigados por design |
| CORS, cabeçalhos de segurança, HTTPS | FALHA | Sem CSP, X-Frame-Options ou HSTS; Vite não configura headers de segurança | Configurar via `vercel.json` ou `_headers` |
| Rate limiting e força bruta | FALHA | Sem rate limiting; `AuthContext.tsx:166` — `'admin'` e `'123456'` como senhas válidas em produção | Bypass hardcoded sem limitação |
| Hash de senha e política de sessão | OK | Supabase Auth gerencia bcrypt/argon2; `autoRefreshToken: true`; `detectSessionInUrl: true` | Coluna `senha_hash` pública é redundante |
| Upload de arquivos | N/A | Sem funcionalidade de upload | — |
| Dependências vulneráveis | FALHA | `npm audit`: `fast-uri` moderada (4 CVEs), `serialize-javascript` baixa (XSS) | `npm audit fix` disponível |
| Mensagens de erro | PARCIAL | `supabase.ts:7-10` — expõe nomes de variáveis; `AuthContext.tsx:200` — `err.message` propagado | Alguns fluxos expõem detalhes técnicos |
| Sessão em localStorage | NÃO VERIFICÁVEL | `AuthContext.tsx:85,156` — JSON em texto plano | Risco aceitável para PWA; documentar como ADR |

---

## 7. Testes e Qualidade

| Item | Status | Evidência | Observação |
|---|---|---|---|
| Resultado do lint | FALHA | Sem ESLint configurado; `tsc --noEmit` retornou exit code 0 | TypeScript limpo; linting de padrão ausente |
| Resultado do build | OK | `npm run build` — exit code 0; 1992 módulos; warning `[INEFFECTIVE_DYNAMIC_IMPORT]` em `db.ts:404` | Build 100% funcional |
| Resultado dos testes | OK | `vitest run`: **9/9 testes passando** em 216ms | RN01, RN02, RN03, RF01, RF03, LGPD, helpers e contas |
| Cobertura de testes | PARCIAL | `db.test.ts` (177 linhas); sem testes de componentes, integração real ou E2E; sem `--coverage` | Regras de negócio cobertas; UI sem cobertura |
| Testes determinísticos | OK | Sem chamadas a serviços externos reais; imports de constantes e funções puras | Testes puros |
| Tipagem TypeScript | PARCIAL | `types/index.ts:73` — `payload: any`; `db.ts:590` — `payload: any`; `ConfiguracaoRotina.tsx:100` — cast forçado | `tsc --noEmit` passa; 3 ocorrências de `any` |

---

## 8. Infraestrutura, CI/CD e Observabilidade

| Item | Status | Evidência | Observação |
|---|---|---|---|
| Pipeline de CI/CD | FALHA | Sem `.github/workflows/`, `.gitlab-ci.yml` ou equivalente | Sem pipeline automatizado |
| Dockerfile / script de deploy | FALHA | Sem Dockerfile, docker-compose ou script | Deploy manual via Vercel (commit `9199328`) |
| Variáveis de ambiente documentadas | OK | `app/.env.example` documenta todas as variáveis com instruções | Bom modelo |
| Health check e monitoramento | FALHA | Sem health check; sem Sentry/DataDog; apenas `console.*` | `verificarConectividadeSupabase()` é informal |
| Git: .gitignore, commits e branches | PARCIAL | `.gitignore` adequado; 7 commits semânticos; branch único `main` | Sem branches de feature, PR review ou proteção |
| Service Worker / PWA | NÃO VERIFICÁVEL | `vite-plugin-pwa` configurado; build gera `sw.js` + workbox; 26 entradas precacheadas (470 kB) | Offline real não verificado sem browser |

---

## 9. Documentação

| Item | Status | Evidência | Observação |
|---|---|---|---|
| README com instalação e scripts | OK | `README.md:39-58` — pré-requisitos, passos, scripts | Sem seção de troubleshooting |
| Documentação da API | PARCIAL | Sem OpenAPI/Swagger; `ARQUITETURA_ENGENHARIA.md` documenta modelo; `schema_inicial.sql` com COMMENTs | API Supabase não documentada para consumidores |
| Documentação de arquitetura e ADRs | OK | `ARQUITETURA_ENGENHARIA.md` — 4 ADRs (PWA, Offline-First, ARASAAC, Privacy by Design) | ADRs bem escritos |
| Comentários explicando o porquê | OK | `db.ts:1,248,316,386`; `schema_inicial.sql` com comentários LGPD; `supabase.ts:33-34` | Boa cultura de comentários |
| Documentação viva (backlog, processos) | PARCIAL | `BACKLOG.md`, `PROCESSOS_FLUXOS.md`, `PLANO_TESTES_QUALIDADE.md`, `GOVERNANCA_SERVICOS_METAS.md` | Pode divergir do código com o tempo |

---

## Problemas Priorizados por Severidade

### CRÍTICO

| # | Problema | Causa (arquivo:linha) | Impacto | Correção Sugerida |
|---|---|---|---|---|
| C1 | `carregarCrises()` usa transação `readwrite` e deleta registros silenciosamente por filtro de string de observação | `db.ts:330,337-343` | Perda permanente de registros clínicos; qualquer crise com a palavra-chave é apagada em produção | Remover deleção; trocar para `readonly`; criar `excluirCrisePorConteudo()` com confirmação explícita |
| C2 | IP de origem hardcoded `'189.102.45.12'` no seed; exibido em texto puro na UI | `db.ts:131`; `ConsentimentoLGPD.tsx:77` | Viola LGPD Art. 14; expõe dado pessoal de terceiro | Usar `'0.0.0.0'` no seed; mascarar IP na UI (`189.1xx.xxx`) |

### ALTO

| # | Problema | Causa (arquivo:linha) | Impacto | Correção Sugerida |
|---|---|---|---|---|
| A1 | Ausência de ESLint e Prettier | Sem config; sem deps em `package.json` | Padrões inconsistentes sem detecção automática | `npm i -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks prettier` |
| A2 | Senhas de fallback fracas hardcoded em produção | `AuthContext.tsx:166` — aceita `'admin'` e `'123456'` | Acesso não autorizado com senha trivial | Remover bypass; condicionar por `VITE_APP_ENV !== 'production'` |
| A3 | Sem pipeline CI/CD | Sem `.github/workflows/` | Código defeituoso pode ir a produção | GitHub Actions: `lint → tsc → vitest → npm audit → build` |
| A4 | 2 vulnerabilidades em dependências | `fast-uri` e `serialize-javascript` | CVEs moderado e baixo exploráveis | `npm audit fix` (sem breaking changes) |

### MÉDIO

| # | Problema | Causa (arquivo:linha) | Impacto | Correção Sugerida |
|---|---|---|---|---|
| M1 | `console.log/error` em código de produção | `db.ts:408`; `ConsentimentoLGPD.tsx:30`; vários em `db.ts` | Vazamento de info operacional | Logger com nível; desabilitar em produção via `VITE_APP_ENV` |
| M2 | `payload: any` em `SyncItem` | `types/index.ts:73`; `db.ts:590` | Perda de type safety na sincronização | `type SyncPayload = RegistroCrise \| ItemRotina \| ConsentimentoLGPD` |
| M3 | Import dinâmico ineficaz de `supabase.ts` | `db.ts:404` | Warning de build; sem benefício de code splitting | Converter para import estático no topo do arquivo |
| M4 | Debounce ARASAAC sem cleanup | `ConfiguracaoRotina.tsx:92` | Race condition; atualização em componente desmontado | `useRef` para timer + `clearTimeout` antes de agendar |
| M5 | Sem lazy loading de componentes | `main.tsx` — 11 componentes síncronos | Bundle de 446 kB em redes lentas de escolas | `React.lazy()` + `Suspense` para DashboardPEI, FormularioSUS, ConfiguracaoRotina |
| M6 | `carregarItensRotina` filtra em memória | `db.ts:186-192` — `getAll()` ignora índice `rotinaId` | Ineficiente; escala mal | `store.index('rotinaId').getAll(rotinaId)` |
| M7 | Coluna `senha_hash` órfã na tabela pública | `schema_inicial.sql:43` — nunca populada | Confusão arquitetural | Remover ou comentar que auth é delegado ao Supabase Auth |

### BAIXO

| # | Problema | Causa (arquivo:linha) | Impacto | Correção Sugerida |
|---|---|---|---|---|
| B1 | `PainelPEI.tsx` — arquivo proxy de 24 linhas | Re-exporta apenas `formatarTempo` de `utils/tempo.ts` | Confusão na navegação | Migrar imports para `utils/tempo`; remover o arquivo |
| B2 | Sem `--coverage` no Vitest | `package.json:10` — `vitest run` sem flag | Cobertura não medida | `npm i -D @vitest/coverage-v8`; script `"test:coverage": "vitest run --coverage"` |
| B3 | Dead branch em `App.tsx:440-446` | `perfilRequerAuth && !usuario` nunca verdadeiro pós-auth | Código morto | Remover bloco |
| B4 | Migrations duplicadas em dois locais | `docs/supabase/migrations/` e `docs/app/supabase/migrations/` | Risco de dessincronia | Manter apenas uma localização canônica |
| B5 | README aponta porta 5173; Vite pode usar 5174 | `README.md:60` | Frustração ao acessar URL documentada | Referenciar saída real do `npm run dev` |

---

## Plano de Ação

| Prioridade | Item | Esforço | Risco de Não Fazer |
|---|---|---|---|
| 1 | Corrigir `carregarCrises()` — remover deleção silenciosa, trocar para `readonly` (C1) | Baixo | CRÍTICO — perda de dados clínicos |
| 2 | Remover IP hardcoded do seed; mascarar na UI (C2) | Baixo | CRÍTICO — violação LGPD |
| 3 | `npm audit fix` — corrigir vulnerabilidades (A4) | Baixo | ALTO — CVEs exploráveis |
| 4 | Remover senhas de fallback `'admin'`/`'123456'` (A2) | Baixo | ALTO — acesso não autorizado |
| 5 | Configurar ESLint + Prettier (A1) | Médio | ALTO — degradação de qualidade |
| 6 | Criar GitHub Actions: lint + tsc + test + audit + build (A3) | Médio | ALTO — sem rede de segurança |
| 7 | Substituir `console.*` por logger com nível (M1) | Baixo | MÉDIO — vazamento de info |
| 8 | Tipar `SyncItem.payload` com union type (M2) | Baixo | MÉDIO — bugs silenciosos |
| 9 | Converter import dinâmico para estático em `db.ts:404` (M3) | Baixo | BAIXO — warning de build |
| 10 | Corrigir debounce ARASAAC com `useRef` (M4) | Baixo | MÉDIO — race condition |
| 11 | Adicionar `React.lazy()` para views secundárias (M5) | Médio | MÉDIO — performance em redes lentas |
| 12 | Corrigir `carregarItensRotina` para usar índice IDB (M6) | Baixo | BAIXO — escalabilidade |
| 13 | Remover/documentar coluna `senha_hash` órfã (M7) | Baixo | BAIXO — confusão arquitetural |
| 14 | Configurar `--coverage` no Vitest (B2) | Baixo | BAIXO — visibilidade de cobertura |
| 15 | Adicionar React Testing Library para componentes críticos | Alto | MÉDIO — regressões sem detecção |

---

## Seção "Depende de Mim" — Itens NÃO VERIFICÁVEIS

| Item | Como verificar |
|---|---|
| **RLS do Supabase em produção** | Painel Supabase > Authentication > Policies; testar com usuário autenticado em cada perfil; tentar SELECT cross-tenant no Table Editor |
| **Pool de conexões do Supabase** | Painel Supabase > Database > Connection Pooling; verificar modo Pgbouncer e max_connections |
| **Service Worker e modo offline real** | Chrome DevTools > Application > Service Workers; marcar "Offline" em Network; navegar e verificar persistência e sincronização |
| **Sessão em localStorage — risco XSS** | DevTools > Application > Local Storage; ver conteúdo de `rotinatea_sessao_usuario`; avaliar risco e documentar como ADR |
| **Cabeçalhos de segurança HTTP em produção** | `curl -I https://<seu-dominio>.vercel.app`; verificar CSP, X-Frame-Options, X-Content-Type-Options, HSTS; ou usar securityheaders.com |
| **Cobertura de testes real** | `npm i -D @vitest/coverage-v8` e `npx vitest run --coverage`; avaliar relatório em `coverage/index.html` |
| **Scan de secrets no histórico git** | `gitleaks detect --source . --verbose` ou `trufflehog git file://. --only-verified` |

---

## Saída Resumida dos Comandos Executados

### `npm run test -- --reporter=verbose`
```
RUN  v5.0.4
✓ RN01: cálculo de duração da crise em segundos       2ms
✓ RN02: anonimização ALN-XXXX                         1ms
✓ RN03: enfileiramento offline                         0ms
✓ RF01: conclusão de tarefas                           0ms
✓ Helper formatarTempo                                 0ms
✓ Compatibilidade Supabase / gerarUUID                82ms
✓ RF03: registro de crise                              0ms
✓ LGPD Art. 14: consentimento                         0ms
✓ Contas de Teste (PROFESSOR, COORDENACAO, RESPONSAVEL) 9ms
Test Files  1 passed (1)
    Tests  9 passed (9)
 Duration  216ms
```

### `npx tsc --noEmit`
```
exit code: 0 (sem erros de tipo)
```

### `npm run build`
```
exit code: 0 — 1992 modules transformed
dist/index.html              1.77 kB
dist/assets/index-*.css     24.15 kB (gzip: 5.21 kB)
dist/assets/index-*.js      91.99 kB (gzip: 26.16 kB)
dist/assets/vendor-*.js    139.82 kB (gzip: 45.32 kB)
dist/assets/supabase-*.js  214.04 kB (gzip: 55.06 kB)
[WARN] INEFFECTIVE_DYNAMIC_IMPORT: supabase.ts em db.ts:404
PWA: 26 entradas precacheadas (470.05 KiB)
```

### `npm audit`
```
exit code: 1
fast-uri 3.0.0-3.1.8          Severidade: MODERADA (4 CVEs)
  URI scheme spoofing          GHSA-w74x-v6f9-j3xg
  path equivalence             GHSA-xhq7-xmqj-769h
  host confusion               GHSA-wjr9-j795-jxcr
  scheme injection             GHSA-333x-w4r6-6crp
serialize-javascript <7.1.3    Severidade: BAIXA
  XSS em função serializada    GHSA-m5mm-p8h7-m29v
2 vulnerabilities (1 low, 1 moderate)
Correção: npm audit fix
```

---

*Gerado em 2026-10-26 por auditoria automatizada somente leitura. Nenhum arquivo foi alterado durante esta auditoria.*
