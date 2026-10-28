# RotinaTEA — Plataforma Digital de Tecnologia Assistiva

> **Solução digital centrada nas necessidades reais de alunos com Transtorno do Espectro Autista (TEA), educadores, familiares e gestores escolares.**

O **RotinaTEA** é um Progressive Web App (PWA) acessível, intuitivo e com arquitetura *offline-first*, desenvolvido para promover previsibilidade, reduzir a sobrecarga sensorial e mitigar crises de ansiedade durante transições de atividades escolares, otimizando simultaneamente o registro e a análise comportamental pelos docentes para alimentar o Plano de Ensino Individualizado (PEI).

---

## 🎯 Diferencial Inovador

Enquanto ferramentas existentes focam exclusivamente em comunicação alternativa (SymboTalk), gamificação sem métricas (Rotina Divertida) ou possuem alta complexidade voltada a adultos (Tiimo), o **RotinaTEA integra duas frentes simultâneas**:
1. **Para o Aluno com TEA**: Prancha visual interativa com pictogramas padronizados (ARASAAC), drag-and-drop acessível e temporizador regressivo suave (sem gatilhos sensoriais).
2. **Para o Professor**: Botão de registro rápido de crises em **1 clique**, persistência imediata local (IndexedDB) e sincronização automática em lote, cruzando tarefas realizadas e gatilhos de desregulação.

---

## 🏛️ Alinhamento aos 5 Eixos Acadêmicos (CEUNI FAMETRO / ENADE)

1. **Eixo 1 — Tecnologia e Desenvolvimento de Software**: Engenharia de requisitos com foco em acessibilidade cognitiva, modelagem UML (casos de uso, classes, sequência), arquitetura cliente-servidor e frontend reativo PWA.
2. **Eixo 2 — Interação Humano-Computador (IHC) e UX/UI**: Design centrado no usuário neurodivergente, conformidade WCAG 2.1 AA/AAA, paleta de cores atenuadas, navegação por teclado e testes empíricos de usabilidade (SUS).
3. **Eixo 3 — Dados, Inteligência e Infraestrutura**: Persistência relacional e local (IndexedDB offline-first), painéis analíticos com correlação temporal e autenticação segura (RBAC/JWT).
4. **Eixo 4 — Gestão, Negócios e Governança de TI**: Otimização processual em sala de aula (registro sem sobrecarga), governança baseada em ITIL enxuto e exportação estruturada para o PEI.
5. **Eixo 5 — Transversal: Ética, Sustentabilidade e Sociedade (ODS)**: Alinhamento aos ODS 4 (Educação de Qualidade) e ODS 10 (Redução das Desigualdades); conformidade rigorosa com a LGPD (anonimização na origem de dados de menores).

---

## 📂 Estrutura de Documentação do Projeto

- [README.md](file:///c:/Users/raiderZ/Documents/Projetos/RotinaTEA/docs/README.md): Visão geral, guia de instalação e execução.
- [PLANEJAMENTO.md](file:///c:/Users/raiderZ/Documents/Projetos/RotinaTEA/docs/PLANEJAMENTO.md): Tema, problema de pesquisa, personas, jornada do usuário, escopo e backlog priorizado (Kanban).
- [ARQUITETURA_ENGENHARIA.md](file:///c:/Users/raiderZ/Documents/Projetos/RotinaTEA/docs/ARQUITETURA_ENGENHARIA.md): Arquitetura de software, offline-first, modelo de dados e decisões técnicas (ADR).
- [DIRETRIZES_UX_ACESSIBILIDADE.md](file:///c:/Users/raiderZ/Documents/Projetos/RotinaTEA/docs/DIRETRIZES_UX_ACESSIBILIDADE.md): Acessibilidade cognitiva para TEA, paleta de cores, pictogramas ARASAAC e checklist WCAG.
- [PROCESSOS_FLUXOS.md](file:///c:/Users/raiderZ/Documents/Projetos/RotinaTEA/docs/PROCESSOS_FLUXOS.md): Mapeamento de processos e fluxos BPMN (Mermaid).
- [PLANO_TESTES_QUALIDADE.md](file:///c:/Users/raiderZ/Documents/Projetos/RotinaTEA/docs/PLANO_TESTES_QUALIDADE.md): Matriz de rastreabilidade, casos de teste (ISO/IEC 25010) e ciclo PDCA.
- [GOVERNANCA_SERVICOS_METAS.md](file:///c:/Users/raiderZ/Documents/Projetos/RotinaTEA/docs/GOVERNANCA_SERVICOS_METAS.md): Gestão de incidentes (ITIL enxuto), matriz de riscos, indicadores e metas (KPIs).

---

## 🚀 Como Executar a Aplicação Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior — testado no v24.21.0)
- **NPM** (versão 9 ou superior — testado no 11.19.0)

### Passos de Instalação e Execução
```bash
# 1. Navegue até a pasta da aplicação
cd app

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Execute os testes automatizados
npm test
```

A aplicação estará disponível em `http://localhost:5173`.


---

## 🧭 Como navegar pelo sistema (para avaliadores, educadores e responsáveis)

Abra a aba **Sobre** para ver o objetivo, os quatro perfis, as regras RN01 a RN03 e o caminho de uma crise. Abaixo do cabeçalho, uma faixa informa o tipo de acesso: **Visitante**, **Conta real** ou **Modo demonstração** (dados fictícios, só neste navegador).

| Perfil | Como entrar | O que faz |
|---|---|---|
| Aluno | sem login | rotina visual em cartões e temporizador |
| Professor | login ou demonstração | registro de crise em 1 clique, configuração da rotina, painel de sincronização |
| Coordenação | login ou demonstração | painel anonimizado do PEI e formulário SUS |
| Responsável | login ou demonstração | termo da LGPD, consentimento e como revogar |

Em **demonstração** não existe senha e nada é enviado ao servidor. Contas reais são criadas na aba **Cadastrar** e entram sempre como Responsável; Professor e Coordenação são concedidos por um administrador (consulte o fim de `app/supabase/migrations/20261028000001_endurece_perfis.sql`).

### Variáveis de ambiente de interface (`app/.env.example`)

| Variável | Efeito |
|---|---|
| `VITE_MODO_DEMO` | `true` habilita o login de demonstração e o simulador de conexão. Use `false` em produção. |
| `VITE_SUS_ATALHOS_TESTE` | `true` mostra no SUS os atalhos "Todos Neutro/Concordo". Use só em desenvolvimento. |

### Melhorias de UX (outubro de 2026)

Orientação por visão, navegação com visões bloqueadas explicadas, conexão real separada do simulador, painel de sincronização, selos de envio por crise, registro de atividades, diálogo de confirmação, painel da LGPD detalhado e ajustes de acessibilidade. Antes e depois, decisões e roteiro de teste: [MELHORIAS_UX_2026-10.md](MELHORIAS_UX_2026-10.md).

**Limitações (não concluído):** a revogação do consentimento é registrada, mas ainda não bloqueia a coleta; o IP do aceite não é capturado; a redação da base legal precisa de revisão; componentes antigos têm falhas de contraste listadas no documento; não houve teste com leitor de tela nem com conta real do Supabase para a sessão encerrada e a sincronização.
