# Requisitos e Regras de Negócio — RotinaTEA

Documento de Desenvolvimento do TCC (CEUNI FAMETRO, turma SIS231N01). Reúne em um só lugar os requisitos funcionais, os não funcionais e as regras de negócio do RotinaTEA, com a situação verificada em **28/10/2026** e o teste ou a evidência de cada um. A mesma numeração está no artigo (Quadros 2, 3 e 4) e nos diagramas UML.

**Autores:** Caio Victor Galvão do Nascimento e Pedro Neves Alberto · **Orientadora:** Profa. Luana Magalhães Leal

---

## 1. Contexto

O RotinaTEA é um Progressive Web App com prancha de rotina visual para o aluno com Transtorno do Espectro Autista (TEA), temporizador visual sem alarme sonoro e registro de crise em um clique para o professor, cujos dados alimentam o Plano de Ensino Individualizado (PEI). Quatro perfis usam o sistema: Aluno, Professor, Coordenação e Responsável legal.

---

## 2. Requisitos funcionais

| Código | Descrição | Situação | Evidência | Prioridade |
|---|---|---|---|---|
| RF01 | Prancha visual interativa: cartões de rotina com pictograma, conclusão por arrastar e soltar e alternativa por teclado | Implementado | Figura 5 do artigo; `PranchaVisual.tsx` | Essencial |
| RF02 | Temporizador visual progressivo, sem alarme sonoro | Implementado | Figura 6; `TemporizadorVisual.tsx`; `tempo.ts` | Essencial |
| RF03 | Registro rápido de crise em um clique, com início, fim, duração calculada e observação posterior | Implementado (gravação local; envio à nuvem parcial) | Figura 7; `regras.ts`; `integracao.test.ts` | Essencial |
| RF04 | Configuração das rotinas do aluno pelo educador (título, duração e categoria) | Implementado | `ConfiguracaoRotina.tsx` | Importante |
| RF05 | Painel do PEI com métricas agregadas e anonimizadas | Implementado | Figura 8; `pei.test.ts` | Essencial |
| RF06 | Gestão de consentimento LGPD pelo responsável, com confirmação na revogação e bloqueio de novos registros enquanto revogado | Implementado | `ConsentimentoLGPD.tsx`; `db.test.ts` | Essencial |
| RF07 | Seleção de perfil com visões distintas | Implementado (perfil definido no servidor) | Figura 4; `acesso.test.ts`; migração `20261028000001` | Importante |
| RF08 | Autenticação e controle de sessão por perfil | Implementado (Supabase Auth) | `AuthContext.tsx` | Importante |
| RF09 | Sincronização da fila local com o banco remoto | Parcial (fila idempotente; teste com conta real pendente) | `filaSync.ts`; `sync.test.ts` | Essencial |
| RF10 | Exportação do relatório do PEI em PDF | Implementado (relatório com gráficos; o PDF sai da opção de salvar do navegador) | `RelatorioPEI.tsx` | Desejável |
| RF11 | Busca de pictogramas na API do ARASAAC ao criar atividades | Implementado | `ConfiguracaoRotina.tsx` | Desejável |
| RF12 | Formulário SUS integrado para coleta de usabilidade | Implementado (cálculo, gravação local e envio por fila; envio com conta real não testado) | Figura 9; `sus.test.ts` | Importante |

> **Prioridade (MoSCoW, proposta dos autores em 24/11/2026):** Essencial = sem ele o sistema não cumpre o objetivo; Importante = necessário para o uso, mas com alternativa provisória; Desejável = melhora a experiência. A classificação deve ser confirmada com a orientadora.

## 3. Requisitos não funcionais

| Código | Categoria | Descrição | Situação | Prioridade |
|---|---|---|---|---|
| RNF01 | Acessibilidade cognitiva | WCAG 2.1 nível AA, paleta atenuada e áreas de toque de pelo menos 48 px | Contraste do texto medido por teste; sem teste com leitor de tela | Essencial |
| RNF02 | Disponibilidade offline | Registro de crise e prancha sem conexão, com gravação prévia em IndexedDB | Verificado por `integracao.test.ts` (IndexedDB simulado) | Essencial |
| RNF03 | Privacidade | Anonimização na origem e consentimento revogável (LGPD, arts. 11 e 14) | Implementado; sem regra de revogação no servidor | Essencial |
| RNF04 | Segurança | Supabase Auth, perfil fixado no servidor e RLS, com gravação de crises restrita a professor e coordenação | Migrações aplicadas em 28/10/2026 (4 políticas confirmadas) | Essencial |
| RNF05 | Desempenho | Botão de crise com resposta em menos de 1 segundo, mesmo sem rede | Medição preliminar em 17/11/2026: cerca de 10 ms online e no máximo 14 ms offline simulado (ver seção 5.1) | Importante |
| RNF06 | Manutenibilidade | Separação entre interface, regras e dados; testes automatizados | 121 testes em 10 arquivos, sem falhas | Importante |
| RNF07 | Usabilidade | Pontuação SUS medida com educadores (meta: 68 pontos) | **SUS não aplicado** | Importante |

## 4. Regras de negócio

| Código | Regra | Onde é aplicada | Prioridade |
|---|---|---|---|
| RN01 | Todo registro de crise guarda timestamp de início e de fim; não é permitida a exclusão de um registro em andamento sem conclusão | `podeExcluirCrise` (interface) e política RLS de exclusão (banco) | Essencial |
| RN02 | O aluno é identificado só por código anonimizado (por exemplo, ALN-8921); é proibido exibir nome completo, CPF ou fotos identificáveis em relatórios e painéis | `validarCodigoAnonimizado`; `descricaoSegura` | Essencial |
| RN03 | Com instabilidade de rede, interações e registros são gravados primeiro no banco local (IndexedDB) e só depois enviados | `db.ts` e `filaSync.ts` | Essencial |
| RN04 | O responsável legal pode revogar o consentimento a qualquer momento, mediante confirmação explícita para evitar revogação acidental | `DialogoConfirmacao.tsx`; `coletaPermitida` | Essencial |
| RN05 | O painel e os relatórios exibem apenas métricas agregadas e anonimizadas | `pei.ts`; `RelatorioPEI.tsx` | Essencial |

## 5. Critérios de sucesso do projeto

| Critério | Meta | Situação |
|---|---|---|
| Acessibilidade | Fluxos principais operáveis por teclado, WCAG 2.1 AA | Parcial (contraste medido; teclado e leitor de tela sem registro completo) |
| Agilidade | Registro de crise em menos de 1 segundo | Medição preliminar: cerca de 10 ms (ver seção 5.1); falta medir em tablet real |
| Resiliência offline | 100% dos eventos gravados localmente sem conexão | Verificado em teste com IndexedDB simulado |
| Privacidade | Nenhum nome ou foto de aluno em painéis ou relatórios | Verificado por regra e teste (código ALN-0000) |
| Usabilidade | Média SUS de pelo menos 68 pontos | Não aplicado |

> A meta do SUS é **68**, a média de referência da escala (BROOKE, 1996; SAURO; LEWIS), e é o valor usado no artigo e no sistema. Documentos antigos do projeto citavam 75; foram alinhados a 68.

### 5.1 Medição preliminar do RNF05 (17/11/2026)

- **Método:** no modo de demonstração (perfil Professor), com o servidor de desenvolvimento (Vite), um script no navegador registrou o tempo entre o clique em "Iniciar registro de crise" e o aparecimento do botão "Encerrar" no DOM. Foram 10 repetições com conexão e 10 com a queda simulada pelo botão de demonstração.
- **Resultado:** online, de 7,0 a 10,3 ms; offline simulado, de 10,2 a 14,0 ms. Todos muito abaixo do limite de 1 segundo.
- **Limites:** clique disparado por script (não inclui a latência do toque), computador de desenvolvimento (não um tablet escolar), build de desenvolvimento (não o de produção), tempo até a atualização do DOM (não inclui a pintura nem a gravação no IndexedDB) e queda de rede simulada pelo sistema (não o Wi-Fi desligado). Para a banca, repetir em um tablet com o build publicado.

## 6. Rastreabilidade resumida

| Requisito | Regra | Caso de teste (PLANO_TESTES_QUALIDADE.md) |
|---|---|---|
| RF03 | RN01 | CT01 |
| RNF02 | RN03 | CT02 |
| RNF03 | RN02 | CT03 |
| RF01, RNF01 | — | CT04 |
| RF02, RNF01 | — | CT05 |
| RF06, RNF03 | RN04 | CT06 |

## 7. Matriz de rastreabilidade dos objetivos específicos

Mesma matriz do Quadro 5 do artigo (v11). Liga cada objetivo específico aos requisitos e regras que o concretizam e à verificação disponível.

| Objetivo específico | Requisitos e regras | Prioridade | Verificação |
|---|---|---|---|
| a) Requisitos e modelagem | RF01 a RF12; RNF01 a RNF07; RN01 a RN05 | Essencial | Este documento; diagramas UML; wireframes (`DOCUMENTO_DE_INTERFACE.md`) |
| b) Prancha, temporizador e crise em um clique | RF01, RF02, RF03; RNF01, RNF05; RN01 | Essencial | Testes de regras e de integração; medição preliminar do RNF05 (seção 5.1) |
| c) Persistência local e fila de sincronização | RF09; RNF02, RNF04; RN03 | Essencial | `integracao.test.ts`, `sync.test.ts`; envio com conta real pendente |
| d) Anonimização e consentimento (LGPD) | RF05, RF06; RNF03; RN02, RN04, RN05 | Essencial | Testes de anonimização e de bloqueio da coleta; revogação válida só no aparelho |
| e) Avaliação de usabilidade (SUS) | RF12; RNF07 | Importante | Formulário implementado; aplicação com educadores pendente (`PROTOCOLO_AVALIACAO_SUS.md`) |

Fluxo do registro de crise (decisões e tentativas de envio): diagrama de atividades em `PROCESSOS_FLUXOS.md`, seção 2.1, e `imagens/diagramas/atividades-registro-crise.png`.
