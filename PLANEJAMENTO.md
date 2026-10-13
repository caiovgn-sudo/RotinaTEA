# Planejamento do Projeto RotinaTEA

Documento consolidado de pré-projeto, escopo e planejamento estratégico do **RotinaTEA**.

---

## 1. Tema do Projeto
**RotinaTEA: Aplicativo Web/Mobile com Prancha de Rotina Visual Interativa e Temporizador Visual com Registro de Crises para Alunos com TEA**.

---

## 2. Problema de Pesquisa
> *Como um aplicativo web e mobile de rotina visual interativa pode auxiliar na redução do estresse e crises de ansiedade em alunos com TEA durante as transições de atividades escolares, otimizando simultaneamente o registro e o acompanhamento de ocorrências comportamentais por parte dos professores?*

---

## 3. Justificativa
- **Inclusão Escolar e Neurodiversidade**: A inclusão de estudantes com TEA em salas de aula regulares exige suporte pedagógico estruturado. Transições bruscas e imprevisíveis são os maiores causadores de sobrecarga sensorial e desregulação.
- **Sobrecarga do Docente**: O registro manual em fichas impressas durante a aula retira a atenção do professor e gera lacunas nos relatórios pedagógicos.
- **Alinhamento com os ODS da ONU**:
  - **ODS 4 (Educação de Qualidade)**: Garante ambientes de aprendizagem inclusivos e equitativos.
  - **ODS 10 (Redução das Desigualdades)**: Promove a permanência e autonomia de pessoas com deficiência.

---

## 4. Objetivos

### 4.1 Objetivo Geral
Desenvolver uma plataforma digital web e mobile (Progressive Web App) para gerenciamento de rotinas visuais escolares, fornecendo previsibilidade temporal e visual a estudantes com TEA e permitindo aos educadores registrar crises em 1 clique e cruzar dados comportamentais para o Plano de Ensino Individualizado (PEI).

### 4.2 Objetivos Específicos
1. Levantar requisitos fundamentados em acessibilidade cognitiva e normas WCAG 2.1;
2. Modelar a arquitetura cliente-servidor offline-first e persistência relacional com PostgreSQL e IndexedDB;
3. Implementar a prancha visual interativa com drag-and-drop acessível e biblioteca ARASAAC;
4. Desenvolver o temporizador regressivo progressivo suave, sem alarmes sonoros estridentes;
5. Criar o botão de registro de crises em 1 clique para o professor com cálculo automático de duração;
6. Desenvolver dashboard analítico de correlação entre tarefas e desregulações;
7. Validar o sistema por meio de questionário de usabilidade padronizado (SUS - System Usability Scale).

---

## 5. Personas e Perfis de Usuário

### Persona 1: Lucas (Aluno TEA — Nível 1/2 de Suporte)
- **Idade**: 8 anos, matriculado no 3º ano do Ensino Fundamental.
- **Características**: Pensamento visual predominante, sensibilidade a barulhos altos e mudanças repentinas de plano.
- **Necessidades no RotinaTEA**: Interface límpida, cartões visuais com pictogramas padronizados (ARASAAC), percepção clara de tempo restante sem números alarmantes e sensação de conquista ao concluir tarefas (drag-and-drop suave).

### Persona 2: Profa. Mariana (Docente Regente / Mediadora)
- **Perfil**: Professora regente de turma inclusiva com 25 alunos, incluindo 2 alunos com TEA.
- **Dores**: Não tem tempo para preencher relatórios extensos em papel durante a aula; necessita registrar crises imediatamente sem abandonar a mediação com a turma.
- **Necessidades no RotinaTEA**: Botão de registro em 1 clique acessível no tablet/celular; facilidade para criar a sequência do dia em menos de 2 minutos.

### Persona 3: Roberto (Responsável Legal)
- **Perfil**: Pai de aluno com TEA, acompanha o desenvolvimento escolar e intervenções terapêuticas.
- **Necessidades no RotinaTEA**: Transparência na rotina do filho, garantia legal de privacidade (LGPD) e facilidade para fornecer ou revogar consentimento de uso de dados.

### Persona 4: Coordenadora Helena (Gestão Pedagógica)
- **Perfil**: Coordenadora de Educação Especial da escola.
- **Necessidades no RotinaTEA**: Acesso a relatórios agregados e consolidados para elaboração do PEI, mantendo a anonimização estrita (códigos de estudante) para reuniões pedagógicas.

---

## 6. Jornada Principal do Usuário

### Jornada 1: Aluno com TEA (Previsibilidade e Autonomia)
1. **Início do Dia**: Aluno abre a prancha visual no tablet da sala de aula e visualiza as 5 etapas da manhã.
2. **Execução**: Ao iniciar a atividade de leitura, acompanha o temporizador circular diminuindo suavemente.
3. **Conclusão**: Ao terminar a tarefa, arrasta o cartão para o cesto de "Concluído" (ou clica no botão acessível), recebendo feedback visual atenuado.
4. **Transição**: O próximo cartão assume a posição ativa, eliminando o susto da mudança de atividade.

### Jornada 2: Professor (Acompanhamento e Registro Rápido)
1. **Configuração**: Professor define a sequência das atividades escolares do dia.
2. **Intercorrência**: Caso ocorra uma crise de desregulação sensorial, o professor toca em **"Iniciar Crise"** (1 clique). O sistema grava o timestamp e exibe o cronômetro visual em segundo plano.
3. **Estabilização**: Ao término da crise, o professor toca em **"Encerrar Crise"**. O sistema calcula a duração exata e salva localmente no IndexedDB.
4. **Pós-aula**: Com calma, o professor pode adicionar uma breve observação ("Gatilho: barulho da reforma da quadra") e os dados são sincronizados automaticamente.

---

## 7. Escopo Inicial (MVP) e Itens Fora do Escopo

### No Escopo (Fase 1 - MVP Demonstrável)
- Prancha de rotina visual interativa com cartões e pictogramas ARASAAC;
- Mecanismo de drag-and-drop e fallback por botões acessíveis;
- Temporizador visual adaptado em disco e barra com paleta atenuada;
- Botão de registro de crise em 1 clique com cálculo de duração e timestamps;
- Persistência offline-first via IndexedDB com status de sincronização;
- Seletor de 4 perfis de usuário com visualização adaptada;
- Dashboard analítico correlacionando tarefas x crises com anonimização na origem;
- Termo de consentimento LGPD para responsáveis;
- Acessibilidade WCAG 2.1 AA (navegação por teclado, contraste atenuado, leitor de tela).

### Fora do Escopo (Evoluções Futuras)
- Modelos preditivos de Machine Learning para prever crises com meses de antecedência;
- Integração bidirecional com sistemas legados de secretarias de educação municipal/estadual;
- Reconhecimento facial ou biometria (vedado por princípios de ética de dados e LGPD).

---

## 8. Critérios de Sucesso
1. **Acessibilidade**: 100% dos fluxos principais operáveis via teclado e conformidade com WCAG 2.1 AA.
2. **Agilidade**: Tempo de disparo do registro de crise inferior a **1 segundo** (1 único clique).
3. **Resiliência Offline**: Gravação garantida de 100% dos eventos locais mesmo sem conexão de rede.
4. **Privacidade**: 0 ocorrências de nomes completos ou fotos de alunos em dashboards ou relatórios exportados.
5. **Usabilidade**: Pontuação média superior a 75 pontos na escala SUS com educadores.

---

## 9. Backlog Inicial Priorizado (Kanban)

| ID | Item de Trabalho | Prioridade | Módulo |
| :--- | :--- | :--- | :--- |
| **US01** | Prancha Visual com Pictogramas ARASAAC e Drag-and-Drop | Crítica (P1) | Core Aluno |
| **US02** | Temporizador Visual Progressivo sem Sobrecarga Sensorial | Crítica (P1) | Core Aluno |
| **US03** | Botão de Registro de Crise em 1 Clique (Iniciar/Encerrar) | Crítica (P1) | Core Docente |
| **US04** | Persistência Offline-First em IndexedDB e Fila de Sincronização | Crítica (P1) | Arquitetura |
| **US05** | Dashboard Analítico com Anonimização de Estudante (LGPD) | Alta (P2) | Gestão/PEI |
| **US06** | Gestão de Consentimento e Direitos do Titular (LGPD) | Alta (P2) | Conformidade |
| **US07** | Seletor e Isolamento de Perfis (Aluno, Professor, Gestor, Responsável) | Média (P3) | Autenticação |
| **US08** | Configuração Personalizada de Rotinas pelo Educador | Média (P3) | Gestão Rotina |
