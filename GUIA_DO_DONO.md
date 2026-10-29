# Guia do dono — RotinaTEA

Para quem responde pelo projeto (Caio e Pedro). Atualizado em 29/10/2026. Escrito para ser lido em 10 minutos antes da banca.

## 1. O que é, em uma frase

PWA de rotina visual para estudantes com TEA, com **registro de crise em 1 clique** que alimenta o relatório do **PEI**. O diferencial frente a Rotina Divertida, Tiimo e SymboTalk: eles organizam a rotina; o RotinaTEA liga a rotina ao registro da crise e ao PEI.

TCC da FAMETRO, turma SIS231N01. Autores: Caio Victor Galvão do Nascimento e Pedro Neves Alberto. Orientadora: Profa. Luana Magalhães Leal.

## 2. Como o sistema funciona

- **Front-end:** React 18, TypeScript, Vite. PWA (vite-plugin-pwa), instalável e offline.
- **No aparelho:** IndexedDB guarda tudo. Nada depende da internet para operar.
- **Fila de sincronização:** o que foi gravado offline é enviado depois, em ordem, e só sai da fila após o servidor confirmar (RN03).
- **Nuvem:** Supabase (Postgres, Auth, RLS). Cada perfil só lê o que o RLS permite.
- **Perfis:** Responsável (nasce assim ao cadastrar), Professor, Coordenação. O perfil é fixado no servidor; ninguém se promove sozinho.
- **Telas principais:** prancha visual com temporizador; crise em 1 clique; Coordenação/PEI com "Padrões observados" e relatório com gráficos; avaliação SUS (resultados agregados só para a Coordenação); 3 modos de contraste.
- **Figuras:** vêm da API do ARASAAC (precisa de internet na primeira carga).
- **Testes:** 114 em 9 arquivos (Vitest), incluindo integração do IndexedDB e da fila com um dublê do Supabase, e medição real de contraste.

## 3. Regras que não podem quebrar

- **RN01–RN03** (RN02: aluno só por código anonimizado, sem nome; RN03: não apagar da fila antes da confirmação do servidor).
- **LGPD:** consentimento com responsável real, IP mascarado, coleta bloqueada se o consentimento for revogado.
- **WCAG 2.1 AA.**
- **Sem alarme sonoro e sem excesso de estímulo**, de propósito (público TEA).

Toda mudança deve dizer a qual pilar serve: 1 engenharia, 2 qualidade/testes, 3 governança/LGPD/segurança.

## 4. Estado real: o que está pronto e o que não está

| Item | Situação |
|---|---|
| Prancha, temporizador, crise em 1 clique, PEI, SUS, contraste | Implementado e testado |
| Sincronização | Testada só contra um **dublê** do Supabase. **Falta teste ponta a ponta com conta real** |
| Migrações 1 a 5 | Aplicadas no Supabase |
| Migrações 6 (`resumo_sus`) e 7 (dados de exemplo) | Aplicadas e conferidas em 29/10/2026: as duas funções existem e os códigos `ALN-4412` e `ALN-8921` aparecem no SQL Editor |
| Publicação na Vercel | **Não feita.** O app só roda local (`npm run dev` em `app`) |
| Avaliação SUS com educadores | **Não feita.** Não há nota para citar |
| Relatório do PEI impresso em papel | Não conferido |
| Chave anônima do Supabase | Apareceu no histórico do Git. É pública por definição (o RLS protege), mas deve ser **trocada** |

Nunca digam à banca que a nuvem foi validada com usuários ou que há resultado de usabilidade. As respostas honestas estão no `ROTEIRO_PRE_BANCA.md`, seção 4.

## 5. O que fazer a seguir (ordem sugerida)

1. (Feito) Migrações 6 e 7 conferidas no servidor.
2. Trocar a chave pública do Supabase (seção 2 do mesmo documento).
3. Criar o projeto na Vercel: Root Directory `app`, `VITE_MODO_DEMO=false`, demais variáveis da seção 3. Configurar Site URL e Redirect URLs no Supabase Auth.
4. Teste ponta a ponta com conta real: cadastrar, promover a Professor via SQL, vincular aos exemplos, registrar uma crise e ver o selo mudar para "Enviada". Roteiro completo na seção 4 do `DEPLOY_VERCEL.md`.
5. Aplicar o SUS com educadores e só então citar resultados.
6. Conferir o relatório do PEI impresso.
7. Preencher QR Code e e-mail do Pedro no último slide; atualizar "15 testes" no deck antigo.

## 6. Onde está cada coisa

Repositório: https://github.com/caiovgn-sudo/RotinaTEA (raiz Git em `docs`; o app fica em `docs/app`).

| Documento | Para quê |
|---|---|
| `README.md`, `ARQUITETURA_ENGENHARIA.md` | Visão geral e arquitetura |
| `PLANO_TESTES_QUALIDADE.md`, `CHECKLIST.md` | Pilar 2 |
| `GOVERNANCA_SERVICOS_METAS.md`, `PROCESSOS_FLUXOS.md` | Pilar 3 |
| `DIRETRIZES_UX_ACESSIBILIDADE.md`, `MELHORIAS_UX_2026-10.md` | UX e acessibilidade |
| `DEPLOY_VERCEL.md` | Publicação e teste com conta real |
| `BACKLOG.md`, `PLANEJAMENTO.md` | O que falta |
| `ROTEIRO_PRE_BANCA.md` | Apresentação de 7 minutos, demo e perguntas |
| `app/supabase/migrations/` | As 7 migrações, em ordem |

Arquivos do TCC: `Artigo_RotinaTEA_v3.docx` (pasta RotinaTEA no Drive e na Área de Trabalho; o original do Drive não foi alterado) e `Apresentacao_Pitch_RotinaTEA.pptx`.

## 7. Pontos do artigo que só vocês podem resolver

- **TCLE:** o artigo diz que foi aprovado pelo comitê de ética. Confirmem; se não for verdade, corrijam.
- **Declaração de uso de IA:** confirmem a distribuição das finalidades entre as ferramentas.
- **Cronograma:** falta no padrão KIRA (datas por semana, foco, tarefas). Precisa das datas oficiais.
- **Resumo/abstract:** mantidos; retirem se a coordenação exigir só o resumo.

## 8. Rotina de trabalho com o código

- Um commit por etapa, mensagem em português; commitar antes de mudanças grandes.
- Antes de qualquer entrega: `npm test` e `npm run build` em `docs/app`.
- Há arquivos não versionados: `ROTEIRO_PRE_BANCA.md`, `GUIA_DO_DONO.md` e a pasta `.claude/` (esta última não deve ir para o Git).

## 9. Se perguntarem na banca

- "Foi testado com educadores?" Ainda não; o SUS está pronto e é o próximo passo.
- "A nuvem funciona?" Fila implementada e coberta por 17 testes de integração com dublê; falta a validação com conta real.
- "Diagnostica ou prevê crise?" Não. São contagens simples, com aviso quando há menos de 5 crises.
- "E sem internet?" Funciona; envia depois, em ordem.
