# Governança, Serviços e Indicadores de Desempenho — RotinaTEA

Estrutura de governança ágil, gerenciamento de serviços inspirado no ITIL (de forma proporcional e sem burocracia excessiva) e catálogo de indicadores (KPIs).

---

## 1. Estrutura de Papéis e Responsabilidades (Matriz RACI)

| Atividade do Projeto | Alunos Desenvolvedores (Caio / Pedro) | Professora Orientadora (Luana Leal) | Educadores Testadores | Coordenação / Gestão |
| :--- | :---: | :---: | :---: | :---: |
| Engenharia de Requisitos e Modelagem | **R / A** | **C** | **I** | **I** |
| Desenvolvimento do Software (PWA Core) | **R / A** | **C** | **I** | **I** |
| Revisão Ética e Conformidade LGPD | **R** | **A** | **I** | **C** |
| Testes de Usabilidade em Sala (SUS) | **R** | **A** | **R** | **I** |
| Homologação e Defesa do TCC | **R** | **A** | **I** | **C** |

*Legenda: R = Responsável pela Execução, A = Aprovador Final, C = Consultado, I = Informado.*

---

## 2. Gestão de Incidentes e Mudanças (ITIL Enxuto)

### Níveis de Severidade de Incidentes
- **P1 — Crítico**: Falha na persistência local de crises ou bloqueio na interface durante a aula. Resolução imediata prioritária.
- **P2 — Alto**: Falha na sincronização de dados com a API ou problema na renderização de pictogramas ARASAAC. Resolução em até 24h.
- **P3 — Médio**: Inconsistência de layout em telas secundárias ou pequenos atrasos na renderização de gráficos. Tratado no ciclo do sprint.
- **P4 — Baixo**: Melhorias cosméticas ou sugestões de novos pictogramas escolares. Registrado no backlog para triagem.

### Processo de Solicitação de Mudanças (RFC)
1. **Registro**: Proposta de nova funcionalidade ou alteração técnica registrada no `BACKLOG.md`.
2. **Avaliação de Impacto**: Verificação do impacto na acessibilidade cognitiva do aluno com TEA e na conformidade LGPD.
3. **Aprovação**: Validação pela orientação acadêmica.
4. **Implementação & Testes**: Execução via ciclo PDCA com testes automatizados e manuais.

---

## 3. Matriz de Riscos e Planos de Contingência

| Risco | Probabilidade | Impacto | Plano de Mitigação / Contingência |
| :--- | :---: | :---: | :--- |
| **Sobrecarga Sensorial no Aluno** | Baixa | Alto | Adoção estrita de paleta de cores atenuadas, zero sirenes estridentes e ausência de animações bruscas. |
| **Queda de Internet na Sala** | Alta | Alto | Arquitetura offline-first nativa com gravação imediata no IndexedDB antes de qualquer tentativa de rede (RN03). |
| **Vazamento de Dados de Menores** | Muito Baixa | Crítico | Anonimização na origem (RN02), impedindo que nomes ou fotos componham relatórios e dashboards. |
| **Resistência do Professor por Falta de Tempo** | Média | Alto | Redução do fluxo de registro de crise a **1 clique** para iniciar e **1 clique** para finalizar. |

---

## 4. Metas e Indicadores de Sucesso (KPIs)

| Indicador (KPI) | Objetivo | Forma de Medição | Meta Inicial | Frequência | Responsável |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Taxa de Disparo de Crise (Agilidade)** | Assegurar que o registro não atrapalhe a aula | Tempo medido entre o clique e o início do cronômetro | < 1,0 segundo | Contínua | Devs |
| **Taxa de Sucesso Offline** | Garantir que nenhum dado seja perdido sem internet | % de eventos de crise gravados localmente sem erro | 100% | Por versão | Devs |
| **Conformidade com Acessibilidade** | Aderir às normas de inclusão digital | Pontuação nos testes automatizados axe-core / Lighthouse | >= 95% | Quinzenal | Devs |
| **Índice de Usabilidade SUS** | Validar a facilidade de uso com educadores | Aplicação de questionário padronizado System Usability Scale | >= 75 pontos | Mensal | Educadores / Devs |
| **Conclusão de Rotinas pelos Alunos** | Medir a efetividade da tecnologia assistiva | % de tarefas diárias marcadas como concluídas | >= 80% | Semanal | Professores |
| **Incidentes de Vazamento LGPD** | Garantir proteção de dados sensíveis | Auditoria de dados exportados e payloads de API | 0 incidentes | Contínua | Equipe |
