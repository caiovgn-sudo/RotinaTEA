# Requisitos e Regras de Negócio — RotinaTEA

Documento de Desenvolvimento do TCC (CEUNI FAMETRO, turma SIS231N01). Reúne em um só lugar os requisitos funcionais, os não funcionais e as regras de negócio do RotinaTEA, com a situação verificada em **28/10/2026** e o teste ou a evidência de cada um. A mesma numeração está no artigo (Quadros 2, 3 e 4) e nos diagramas UML.

**Autores:** Caio Victor Galvão do Nascimento e Pedro Neves Alberto · **Orientadora:** Profa. Luana Magalhães Leal

---

## 1. Contexto

O RotinaTEA é um Progressive Web App com prancha de rotina visual para o aluno com Transtorno do Espectro Autista (TEA), temporizador visual sem alarme sonoro e registro de crise em um clique para o professor, cujos dados alimentam o Plano de Ensino Individualizado (PEI). Quatro perfis usam o sistema: Aluno, Professor, Coordenação e Responsável legal.

---

## 2. Requisitos funcionais

| Código | Descrição | Situação | Evidência |
|---|---|---|---|
| RF01 | Prancha visual interativa: cartões de rotina com pictograma, conclusão por arrastar e soltar e alternativa por teclado | Implementado | Figura 5 do artigo; `PranchaVisual.tsx` |
| RF02 | Temporizador visual progressivo, sem alarme sonoro | Implementado | Figura 6; `TemporizadorVisual.tsx`; `tempo.ts` |
| RF03 | Registro rápido de crise em um clique, com início, fim, duração calculada e observação posterior | Implementado (gravação local; envio à nuvem parcial) | Figura 7; `regras.ts`; `integracao.test.ts` |
| RF04 | Configuração das rotinas do aluno pelo educador (título, duração e categoria) | Implementado | `ConfiguracaoRotina.tsx` |
| RF05 | Painel do PEI com métricas agregadas e anonimizadas | Implementado | Figura 8; `pei.test.ts` |
| RF06 | Gestão de consentimento LGPD pelo responsável, com confirmação na revogação e bloqueio de novos registros enquanto revogado | Implementado | `ConsentimentoLGPD.tsx`; `db.test.ts` |
| RF07 | Seleção de perfil com visões distintas | Implementado (perfil definido no servidor) | Figura 4; `acesso.test.ts`; migração `20261028000001` |
| RF08 | Autenticação e controle de sessão por perfil | Implementado (Supabase Auth) | `AuthContext.tsx` |
| RF09 | Sincronização da fila local com o banco remoto | Parcial (fila idempotente; teste com conta real pendente) | `filaSync.ts`; `sync.test.ts` |
| RF10 | Exportação do relatório do PEI em PDF | Implementado (relatório com gráficos; o PDF sai da opção de salvar do navegador) | `RelatorioPEI.tsx` |
| RF11 | Busca de pictogramas na API do ARASAAC ao criar atividades | Implementado | `ConfiguracaoRotina.tsx` |
| RF12 | Formulário SUS integrado para coleta de usabilidade | Implementado (cálculo, gravação local e envio por fila; envio com conta real não testado) | Figura 9; `sus.test.ts` |

## 3. Requisitos não funcionais

| Código | Categoria | Descrição | Situação |
|---|---|---|---|
| RNF01 | Acessibilidade cognitiva | WCAG 2.1 nível AA, paleta atenuada e áreas de toque de pelo menos 48 px | Contraste do texto medido por teste; sem teste com leitor de tela |
| RNF02 | Disponibilidade offline | Registro de crise e prancha sem conexão, com gravação prévia em IndexedDB | Verificado por `integracao.test.ts` (IndexedDB simulado) |
| RNF03 | Privacidade | Anonimização na origem e consentimento revogável (LGPD, arts. 11 e 14) | Implementado; sem regra de revogação no servidor |
| RNF04 | Segurança | Supabase Auth, perfil fixado no servidor e RLS, com gravação de crises restrita a professor e coordenação | Migrações aplicadas em 28/10/2026 (4 políticas confirmadas) |
| RNF05 | Desempenho | Botão de crise com resposta em menos de 1 segundo, mesmo sem rede | **Não medido** |
| RNF06 | Manutenibilidade | Separação entre interface, regras e dados; testes automatizados | 114 testes em 9 arquivos, sem falhas |
| RNF07 | Usabilidade | Pontuação SUS medida com educadores (meta: 68 pontos) | **SUS não aplicado** |

## 4. Regras de negócio

| Código | Regra | Onde é aplicada |
|---|---|---|
| RN01 | Todo registro de crise guarda timestamp de início e de fim; não é permitida a exclusão de um registro em andamento sem conclusão | `podeExcluirCrise` (interface) e política RLS de exclusão (banco) |
| RN02 | O aluno é identificado só por código anonimizado (por exemplo, ALN-8921); é proibido exibir nome completo, CPF ou fotos identificáveis em relatórios e painéis | `validarCodigoAnonimizado`; `descricaoSegura` |
| RN03 | Com instabilidade de rede, interações e registros são gravados primeiro no banco local (IndexedDB) e só depois enviados | `db.ts` e `filaSync.ts` |
| RN04 | O responsável legal pode revogar o consentimento a qualquer momento, mediante confirmação explícita para evitar revogação acidental | `DialogoConfirmacao.tsx`; `coletaPermitida` |
| RN05 | O painel e os relatórios exibem apenas métricas agregadas e anonimizadas | `pei.ts`; `RelatorioPEI.tsx` |

## 5. Critérios de sucesso do projeto

| Critério | Meta | Situação |
|---|---|---|
| Acessibilidade | Fluxos principais operáveis por teclado, WCAG 2.1 AA | Parcial (contraste medido; teclado e leitor de tela sem registro completo) |
| Agilidade | Registro de crise em menos de 1 segundo | Não medido |
| Resiliência offline | 100% dos eventos gravados localmente sem conexão | Verificado em teste com IndexedDB simulado |
| Privacidade | Nenhum nome ou foto de aluno em painéis ou relatórios | Verificado por regra e teste (código ALN-0000) |
| Usabilidade | Média SUS de pelo menos 68 pontos | Não aplicado |

> A meta do SUS é **68**, a média de referência da escala (BROOKE, 1996; SAURO; LEWIS), e é o valor usado no artigo e no sistema. Documentos antigos do projeto citavam 75; foram alinhados a 68.

## 6. Rastreabilidade resumida

| Requisito | Regra | Caso de teste (PLANO_TESTES_QUALIDADE.md) |
|---|---|---|
| RF03 | RN01 | CT01 |
| RNF02 | RN03 | CT02 |
| RNF03 | RN02 | CT03 |
| RF01, RNF01 | — | CT04 |
| RF02, RNF01 | — | CT05 |
| RF06, RNF03 | RN04 | CT06 |
