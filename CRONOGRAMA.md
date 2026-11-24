# Cronograma de Entregas — RotinaTEA (atualizado em 23/11/2026)

**Trabalho de Conclusão de Curso** · Sistemas de Informação · CEUNI FAMETRO · turma SIS231N01 · Manaus – AM
**Autores:** Caio Victor Galvão do Nascimento e Pedro Neves Alberto · **Orientadora:** Profa. Luana Magalhães Leal

> **Como ler.** A coluna "Data" repete as datas do cronograma da disciplina (turma noturna). A coluna "Situação" registra o que a equipe de fato entregou, com a data do arquivo no Drive quando há. As datas das etapas ainda abertas são **previsões da equipe**, baseadas no cronograma de 15 semanas do pré-projeto, e podem ser ajustadas pela orientadora. **A data da banca fica em branco**, conforme a orientação.

---

## 1. Cronograma

| Atividade | Data | Situação | Observação |
|---|---|---|---|
| Ideação, base e planejamento | 10/08 | Concluída | Tema aprovado; alinhamento aos eixos em `RotinaTEA - Alinhamento aos Eixos ENADE` |
| Pré-projeto | 17/08 | Concluída | `Pré Projeto RotinaTEA.docx` (Documentação) |
| Requisitos, regras de negócio e 3 sistemas semelhantes | 24/08 | Concluída | 12 RF, 7 RNF e 5 RN; correlatos: Rotina Divertida, Tiimo e SymboTalk |
| Questionário de validação da ideia (setembro) | Set. | Sem registro confiável | Os números antes citados (46 respostas, 85% e 92%) não puderam ser comprovados e foram retirados dos documentos; a pesquisa de validação válida é a de novembro, abaixo |
| Modelagem UML, arquitetura e testes (Eixo 2) | 07/09 | Concluída | Casos de uso, classes e sequência (21/09); arquitetura e plano de testes no repositório |
| Apresentação da ideia — Eixos 2 e 3 | 14/09 | Concluída | Apresentação RotinaTEA no Drive, alinhada aos Eixos 2 e 3 |
| Resultados da pesquisa, front end e acessibilidade | 21/09 | Concluída | Prancha, temporizador e painel do PEI; contraste medido (WCAG 2.1 AA) |
| Escrita do artigo | 28/09 | Concluída | Versão inicial de 14/10; versão atual: `Artigo_RotinaTEA_v11` |
| Entrega do artigo (Introdução, Referencial, Metodologia e referências ABNT) | 05/10 | Concluída | Normas NBR 6022, 6028, 10520 e 6023 revisadas |
| Artigo e back end funcional, página principal | 13/10 | Concluída | Supabase com autenticação e RLS (migrações aplicadas em 28/10/2026) |
| Back end para a pré-banca, conforme os requisitos funcionais | 19/10 | Concluída | 11 dos 12 RF implementados; envio à nuvem parcial |
| Pré-banca: slides e produto parcial | 22/10 | Concluída | Slides e vídeo no Drive, arquivos de 29/10/2026 |
| Documentos de desenvolvimento (requisitos, padrões, heurística e interface) | — | Concluída | Entre 16 e 17/11/2026; repositório no GitHub |
| Artigo, banner e slides na pasta Entrega Final | 23/11 | Concluída | Entregues em 23/11/2026 |
| Teste de validação do produto (questionário de 7 perguntas, mínimo de 20 respostas) | Nov. | Concluída | 22 respostas no formulário de validação; resultados em `VALIDACAO_PRODUTO.md` e no artigo (seção 4.1) |
| Avaliação de usabilidade com educadores (SUS) | 24/11 a 30/11 | Pendente | Instrumento implementado no sistema; **não aplicado**; só 5 dos 22 participantes do questionário eram educadores |
| Resultados e discussões com os dados da validação, considerações finais e resumo | 01/12 a 07/12 | Em andamento | Resultados do questionário já no artigo (v11); falta incluir o SUS, se aplicado |
| Teste de envio à nuvem com conta real e publicação (Vercel) | 08/12 a 14/12 | Pendente | Roteiro em `DEPLOY_VERCEL.md` |
| Correção do artigo conforme os comentários da orientadora (pasta "ARTIGOS PARA CORRIGIR - BANCA FINAL") | até 14/12 | Pendente | Aguardando os comentários |
| Entrega final: produto e projeto final | 15/12 a 22/12 | Pendente | Reserva (buffer) do cronograma de 15 semanas |
| Banca final | | | |

## 2. Alinhamento aos 5 eixos (situação atual)

| Eixo | Aplicação no RotinaTEA | Evidência |
|---|---|---|
| 1. Tecnologia e desenvolvimento de software | Engenharia de requisitos, UML, PWA em React e TypeScript, persistência local em IndexedDB e banco remoto no Supabase (PostgreSQL) | `REQUISITOS_E_REGRAS_DE_NEGOCIO.md`, diagramas, 114 testes automatizados |
| 2. IHC e UX/UI | Interface de baixa carga sensorial, WCAG 2.1 AA, três modos de contraste, avaliação heurística e SUS | `DOCUMENTO_DE_INTERFACE.md`, `AVALIACAO_HEURISTICA.md`; SUS ainda não aplicado |
| 3. Dados, inteligência e infraestrutura | Painel do PEI com gráficos, autenticação e controle de acesso por perfil (RLS), LGPD, nuvem | Painel do PEI; migrações do Supabase |
| 4. Gestão, negócios e governança de TI | Registro de crise em 1 clique, relatório do PEI, governança enxuta inspirada no ITIL | `GOVERNANCA_SERVICOS_METAS.md`, `PROCESSOS_FLUXOS.md` |
| 5. Ética, sustentabilidade e sociedade | ODS 4 (principal) e ODS 3 (complementar); anonimização na origem e consentimento revogável | Artigo (introdução); `ConsentimentoLGPD.tsx` |

> **Correções em relação ao cronograma de 02/09/2026:** a arquitetura deixou de usar uma API própria em Node.js com JWT e passou a usar o Supabase (Auth e RLS), e o ODS 10 foi substituído pelo ODS 3, que consta na lista de ODS indicada para SIS.

## 3. Riscos e pendências

- **Validação com usuários:** a meta de 20 respostas foi atingida (22), mas a amostra é de conveniência, com 5 educadores, 3 adultos no espectro, 8 responsáveis e 6 de outras áreas, e sem observação das tarefas. Os resultados indicam aceitação preliminar e não permitem generalizar. O SUS com educadores segue pendente.
- **Nuvem:** o envio ao Supabase foi testado com um dublê, e o teste com conta real e a publicação seguem pendentes.
- **Desempenho (RNF05):** há uma medição preliminar (cerca de 10 ms), a ser repetida em tablet com o sistema publicado.
- **Parecer pedagógico e comentários do artigo:** dependem da orientadora.
