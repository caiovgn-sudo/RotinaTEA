# Mapeamento de Processos e Fluxos do Sistema — RotinaTEA

Modelagem dos processos essenciais do sistema com notação de fluxo operacional e diagramas Mermaid.

---

## 1. Fluxo Principal: Execução da Rotina pelo Aluno com TEA

Representa o percurso diário da criança interagindo com a tecnologia assistiva para ter previsibilidade e concluir suas atividades.

```mermaid
flowchart TD
    Inicio([Início da Aula]) --> Acessar[Aluno acessa a Prancha Visual no Tablet]
    Acessar --> Visualizar[Visualiza a sequência de cartões com pictogramas ARASAAC]
    Visualizar --> Ativa[Identifica o cartão da atividade atual em destaque]
    Ativa --> Tempo[Acompanha o Temporizador Visual suave em regressão]
    Tempo --> Acao{Como conclui a tarefa?}
    Acao -- Arrastar e Soltar --> Drop[Arrasta o cartão para o cesto de Concluído]
    Acao -- Toque / Teclado --> Click[Toca no botão Concluir ou pressiona Espaço]
    Drop --> Feedback[Feedback visual atenuado de tarefa cumprida, sem som]
    Click --> Feedback
    Feedback --> Proxima[Próxima atividade assume a posição de destaque]
    Proxima --> Fim([Fim do Período Escolar])
```

---

## 2. Fluxo do Professor: Registro Rápido de Crise em 1 Clique (Offline-First)

Mapeamento do processo crítico em momento de estresse em sala de aula. Atualizado em 24/11/2026 para a arquitetura implementada (Supabase em vez da API Node.js prevista no desenho inicial e no Diagrama de Sequência de setembro; ver ADR em `ARQUITETURA_ENGENHARIA.md`).

```mermaid
sequenceDiagram
    autonumber
    actor Professor as Professor / Docente
    participant PWA as Interface PWA
    participant IDB as Banco Local (IndexedDB)
    participant Sync as Fila de Sincronização
    participant SB as Supabase (Auth + API + RLS)
    participant BD as Banco Central (PostgreSQL)

    Note over Professor,PWA: Momento de desregulação sensorial da criança
    Professor->>PWA: Clica no botão "Iniciar Crise" (1 clique)
    PWA->>IDB: Grava timestamp dataHoraInicio + estudanteId
    IDB-->>PWA: Confirmação de gravação local (RN03)
    PWA-->>Professor: Botão alterna para "Encerrar Crise" + cronômetro ativo

    Note over Professor,PWA: Crise é acolhida e estabilizada
    Professor->>PWA: Clica no botão "Encerrar Crise" (1 clique)
    PWA->>IDB: Grava dataHoraFim e calcula duracaoSegundos
    PWA->>Sync: Enfileira o registro (status pendente)

    alt Com conexão e sessão ativa
        Sync->>SB: upsert do registro pelo UUID local (idempotente)
        SB->>BD: INSERT/UPDATE sob RLS (só professor ou coordenação vinculados)
        BD-->>SB: Confirmação
        SB-->>Sync: Resposta de sucesso
        Sync-->>PWA: Item sai da fila; selo "Enviada ao servidor"
    else Sem conexão ou falha de envio
        Sync-->>PWA: Item permanece na fila; selo "Salva só neste aparelho"
        Note over Sync,SB: Nova tentativa quando a conexão voltar (até 3 tentativas; depois "Falhou o envio" e botão "Tentar novamente")
    end
```

---

## 3. Fluxo de Governança e Consentimento LGPD (Responsável Legal)

```mermaid
flowchart TD
    InicioResp([Responsável acessa a plataforma]) --> Termo[Visualiza Termo de Consentimento LGPD]
    Termo --> Explicacao[Consulta finalidade do uso de dados comportamentais]
    Explicacao --> Decisao{Decisão do Responsável}
    Decisao -- Aceitar --> GravaAceite[Registra aceite, timestamp e IP de origem]
    Decisao -- Revogar / Recusar --> GravaRevoga[Registra revogação formal de consentimento]
    GravaAceite --> Libera[Plataforma autoriza registro da rotina e histórico]
    GravaRevoga --> Bloqueia[Suspende coleta de dados comportamentais do estudante]
```

---

## 4. Fluxo de Tratamento de Exceções e Resolução de Erros
- **Desconexão Inesperada**: O sistema detecta o evento `window.addEventListener('offline')` e exibe um badge discreto: *"Modo Offline Ativo — Todos os dados continuam sendo salvos normalmente"*.
- **Tentativa de Sair com Crise Aberta (RN01)**: Se o usuário tentar fechar a janela com uma crise iniciada, o navegador intercepta a ação com `beforeunload` e modal de confirmação para impedir perda do encerramento da crise.
- **Falha de Carregamento de Recursos**: Caso algum pictograma remoto falhe na rede, o sistema realiza fallback automático para os pictogramas SVG embutidos localmente.
