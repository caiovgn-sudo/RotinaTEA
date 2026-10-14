# Quadro Kanban e Backlog do Projeto — RotinaTEA

Acompanhamento ágil das entregas do projeto alinhadas ao cronograma de 14 semanas.

---

## 📋 Quadro Kanban Atual

### 📌 Backlog (A Fazer)
- [x] **US09**: Geração de relatórios consolidados em arquivo PDF formatado para prontuário PEI (via `@media print` + CSS otimizado).
- [x] **US10**: Aplicação empírica do formulário padronizado SUS (System Usability Scale) com educadores de escolas parceiras (modal integrado no Dashboard PEI).
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
- [x] **QC02**: Validação de tolerância a falhas sem internet (IndexedDB local-first).
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
| `db.ts` (IndexedDB) | ✅ | Seed, CRUD, **fila de sync com retry (max 3)**, deduplicação via mapa ID local→remoto |
| `supabase.ts` | ✅ | Cliente configurado, verificação de conectividade, persistência de sessão |
| `AuthContext.tsx` | ✅ | Login, signup, logout, refresh, associação `usuarios` table |
| `vite.config.ts` | ✅ | **PWA plugin** (manifest, SW, cache strategies para Supabase/ARASAAC) |

### Acessibilidade & PWA
- ✅ WCAG 2.1 AA: contraste, foco visível, touch targets ≥ 48px, `prefers-reduced-motion`
- ✅ 3 modos de contraste: Padrão / Alto Contraste / **Amarelo/Preto (baixa visão)**
- ✅ Fonte ampliada (A+)
- ✅ PWA: `manifest.webmanifest`, Service Worker (Workbox), cache offline-first, atalhos de app
- ✅ Ícones PWA gerados (72–512px)

### Testes & Build
- ✅ `npm run build` — TypeScript strict + Vite production build sem erros
- ✅ `npm test` — Vitest: 5/5 testes unitários passando (RN01, RN02, RN03, RF01, helpers)
- ✅ Lint: sem warnings críticos, apenas aviso de dynamic import ineficaz (não bloqueante)

---

## 🚀 Próximos Passos (Pós-Entrega TCC)

1. **Deploy Vercel** — Conectar repositório, configurar variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
2. **Supabase Production** — Aplicar migração `20261013000001_schema_inicial.sql` no projeto produção, habilitar RLS
3. **Testes E2E** — Cypress/Playwright para fluxos críticos (crise 1-clique, sync offline→online, login)
4. **Coleta SUS Real** — Aplicar formulário com educadores parceiros, consolidar resultados no TCC
5. **Documentação Final** — Atualizar `README.md` com URLs de produção, gerar `LINKS_DO_PROJETO.md`