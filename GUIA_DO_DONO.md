# Guia do dono — RotinaTEA

Para quem responde pelo projeto (Caio e Pedro). Atualizado em 24/11/2026, para a banca final. Escrito para ser lido em 10 minutos.

## 1. O que é, em uma frase

PWA de rotina visual para estudantes com TEA, com **registro de crise em 1 clique** que alimenta o relatório do **PEI**. O diferencial frente a Rotina Divertida, Tiimo e SymboTalk: eles organizam a rotina ou a comunicação; o RotinaTEA liga a rotina ao registro da crise e ao PEI.

TCC da FAMETRO, turma SIS231N01. Autores: Caio Victor Galvão do Nascimento e Pedro Neves Alberto. Orientadora: Profa. Luana Magalhães Leal.

## 2. Como o sistema funciona

- **Front-end:** React 18, TypeScript, Vite. PWA (vite-plugin-pwa), instalável e offline.
- **No aparelho:** IndexedDB guarda tudo. Nada depende da internet para operar.
- **Fila de sincronização:** o que foi gravado offline é enviado depois, em ordem, e só sai da fila após o servidor confirmar (RN03).
- **Nuvem:** Supabase (Postgres, Auth, RLS). Cada perfil só lê o que o RLS permite.
- **Perfis:** Responsável (nasce assim ao cadastrar), Professor, Coordenação; o Aluno usa a prancha sem login. O perfil é fixado no servidor; ninguém se promove sozinho.
- **Telas principais:** prancha visual com temporizador; crise em 1 clique; Coordenação/PEI com "Padrões observados" e relatório com gráficos; avaliação SUS (resultados agregados só para a Coordenação); 3 modos de contraste.
- **Figuras:** vêm da API do ARASAAC (precisa de internet na primeira carga).
- **Testes:** 121 em 10 arquivos (Vitest), incluindo integração do IndexedDB e da fila com um dublê do Supabase, e medição real de contraste. A integração contínua (GitHub Actions) roda tipos, testes e build a cada alteração.

## 3. Regras que não podem quebrar

- **RN01–RN05** (RN02: aluno só por código anonimizado, sem nome; RN03: gravar primeiro no aparelho e só tirar da fila após a confirmação do servidor; RN04: revogação do consentimento com confirmação).
- **LGPD:** consentimento com responsável real, IP mascarado, coleta bloqueada no aparelho se o consentimento for revogado.
- **WCAG 2.1 AA.**
- **Sem alarme sonoro e sem excesso de estímulo**, de propósito (público TEA).

Toda mudança deve dizer a qual pilar serve: 1 engenharia, 2 qualidade/testes, 3 governança/LGPD/segurança.

## 4. Estado real: o que está pronto e o que não está

| Item | Situação |
|---|---|
| Prancha, temporizador, crise em 1 clique, PEI, SUS (formulário), contraste | Implementado e testado |
| Questionário de validação com usuários | **22 respostas** (amostra de conveniência, 5 educadores); aceitação preliminar favorável; resultados em `VALIDACAO_PRODUTO.md` |
| Sincronização | Testada só contra um **dublê** do Supabase. **Falta teste ponta a ponta com conta real** |
| Migrações 1 a 7 | Aplicadas e conferidas no Supabase até 29/10/2026 |
| Publicação na Vercel | **Feita em 24/11/2026**: https://rotinatea.vercel.app, com `VITE_MODO_DEMO=false` (só contas reais). **Falta** configurar Site URL e Redirect URLs no Supabase Auth e rodar o teste com conta real. A demonstração da banca continua local (`npm run dev` em `app`) |
| Avaliação SUS com educadores | **Não feita.** Não há nota para citar. O protocolo está pronto: `PROTOCOLO_AVALIACAO_SUS.md` |
| Relatório do PEI impresso em papel | Não conferido |
| Leitor de tela, tablet, axe/Lighthouse | Não testados |
| Vídeo de demonstração no YouTube | Adiado; o link entra no README e no `LINKS_DO_PROJETO.md` |
| Chave anônima do Supabase | Apareceu no histórico do Git. É pública por definição (o RLS protege), mas deve ser **trocada** (`DEPLOY_VERCEL.md`, seção 2) |

Nunca digam à banca que a nuvem foi validada, que há resultado de usabilidade com educadores ou que o sistema reduz crises. As respostas honestas estão em `ROTEIRO_BANCA_FINAL.md`, seção 4.

## 5. O que fazer a seguir (ordem sugerida)

1. **SUS com educadores:** conseguir pelo menos 5 educadores e seguir `PROTOCOLO_AVALIACAO_SUS.md`; confirmar com a orientadora se o TCLE precisa de aprovação. Só então citar resultados.
2. Trocar a chave pública do Supabase (`DEPLOY_VERCEL.md`, seção 2).
3. (Vercel já criada e conectada ao GitHub: cada alteração na `main` publica sozinha) Configurar **Site URL** e **Redirect URLs** do Supabase Auth com `https://rotinatea.vercel.app`.
4. Teste ponta a ponta com conta real: cadastrar, promover a Professor via SQL, vincular aos exemplos, registrar uma crise e ver o selo mudar para "Enviada". Roteiro na seção 4 do `DEPLOY_VERCEL.md`.
5. Repetir a medição do botão de crise (RNF05) em um tablet e conferir o relatório do PEI impresso.
6. Gravar e publicar o vídeo de demonstração.
7. Corrigir o artigo conforme os comentários da orientadora (pasta "ARTIGOS PARA CORRIGIR - BANCA FINAL", que ela cria no Drive) e ensaiar o pitch.

## 6. Onde está cada coisa

Repositório: https://github.com/caiovgn-sudo/RotinaTEA (raiz Git em `docs`; o app fica em `docs/app`).

| Documento | Para quê |
|---|---|
| `README.md`, `ARQUITETURA_ENGENHARIA.md` | Visão geral e arquitetura |
| `desenvolvimento/` | Requisitos e regras, padrões de projeto, avaliação heurística, documento de interface |
| `PLANO_TESTES_QUALIDADE.md`, `CHECKLIST.md` (histórico de 26/10) | Pilar 2 |
| `GOVERNANCA_SERVICOS_METAS.md`, `PROCESSOS_FLUXOS.md` | Pilar 3 |
| `VALIDACAO_PRODUTO.md`, `PROTOCOLO_AVALIACAO_SUS.md` | Evidência com usuários e preparo do SUS |
| `DIRETRIZES_UX_ACESSIBILIDADE.md`, `MELHORIAS_UX_2026-10.md` | UX e acessibilidade |
| `DEPLOY_VERCEL.md` | Publicação e teste com conta real |
| `BACKLOG.md`, `PLANEJAMENTO.md`, `CRONOGRAMA.md` | O que falta e quando |
| `ROTEIRO_BANCA_FINAL.md` | Apresentação de 7 minutos, demo e perguntas |
| `app/supabase/migrations/` | As 7 migrações, em ordem |

Arquivos do TCC (Drive, pasta Entrega Final): `Artigo_RotinaTEA_v11`, `Banner_RotinaTEA_v11` e `Pitch_Final_RotinaTEA_v11` (.pptx e .pdf), além de `RotinaTEA Web.mp4`. No repositório há duas peças históricas de setembro, o pré-projeto (`RotinaTEA PréProjeto TCC.docx`) e o primeiro deck (`RotinaTEA-ApresentaçãoSlide TCC.pptx`), que ainda citam a API Node.js e o JWT do desenho inicial; valem como registro, não como versão atual.

## 7. Pontos que só vocês podem resolver

- **TCLE:** o texto do `PROTOCOLO_AVALIACAO_SUS.md` é um rascunho, não aprovado. O artigo não afirma aprovação por comitê; mantenham assim até confirmar.
- **Declaração de uso de IA:** confirmem a distribuição das finalidades entre as ferramentas.
- **Data da banca:** fica em branco no cronograma, por orientação.
- **Comentários da orientadora:** dependem dela.

## 8. Rotina de trabalho com o código

- Um commit por etapa, mensagem em português; commitar antes de mudanças grandes.
- Antes de qualquer entrega: `npx tsc --noEmit`, `npm test` e `npm run build` em `docs/app`.
- A pasta `.claude/` não deve ir para o Git.

## 9. Se perguntarem na banca

- "Foi testado com educadores?" Ainda não; o questionário teve 22 pessoas, só 5 educadores, e indica aceitação preliminar. O SUS está pronto e é o próximo passo.
- "A nuvem funciona?" Fila implementada e coberta por 17 testes de integração com dublê; falta a validação com conta real.
- "Diagnostica ou prevê crise?" Não. São contagens simples, com aviso quando há menos de 5 crises.
- "E sem internet?" Funciona; envia depois, em ordem.
