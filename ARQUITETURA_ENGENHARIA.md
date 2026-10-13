# Arquitetura e Engenharia de Software — RotinaTEA

Documento técnico com a definição de padrões arquiteturais, modelo de dados, camadas do sistema e Registros de Decisões Arquiteturais (ADRs).

---

## 1. Visão Arquitetural em Camadas

O RotinaTEA adota uma arquitetura desacoplada e modular baseada no princípio de **Persistência Local Prioritária (Offline-First)**:

```
┌───────────────────────────────────────────────────────────────┐
│                      INTERFACE DO USUÁRIO                     │
│    (React PWA / TypeScript / Design System Acessível WCAG)    │
│  - Prancha Visual (Drag & Drop + Teclado)                     │
│  - Temporizador Visual Progressivo                            │
│  - Botão de Registro Rápido de Crise (1 Clique)               │
│  - Dashboards Analíticos (Chart.js)                           │
└──────────────┬────────────────────────────────┬───────────────┘
               │                                │
               ▼                                ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│       REGRAS DE NEGÓCIO      │ │     GERENCIADOR OFFLINE      │
│  - Cálculo de Duração Crise  │ │  - Detecção de Conexão       │
│  - Validação de Timestamps   │ │  - Fila de Sincronização     │
│  - Anonimização LGPD         │ │  - Sincronização em Lote     │
└──────────────┬───────────────┘ └──────────────┬───────────────┘
               │                                │
               ▼                                ▼
┌───────────────────────────────────────────────────────────────┐
│                  CAMADA DE PERSISTÊNCIA LOCAL                 │
│                 (IndexedDB do Navegador / PWA)                │
│    - Tabelas: usuarios, rotinas, itens, crises, fila_sync     │
└──────────────────────────────┬────────────────────────────────┘
                               │ (Quando online - segundo plano)
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                      API BACKEND (Node.js)                    │
│      - RESTful API / JWT Auth / Endpoints de Sincronização    │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                  BANCO DE DADOS (PostgreSQL)                  │
│       - Persistência estruturada em servidor central          │
└───────────────────────────────────────────────────────────────┘
```

---

## 2. Modelo de Dados

Em alinhamento direto com o **Diagrama de Classes** oficial do projeto:

### Entidade: `Usuario`
- `id`: UUID (Chave primária)
- `nome`: string
- `email`: string
- `senhaHash`: string
- `perfil`: Enum (`ALUNO`, `PROFESSOR`, `COORDENACAO`, `RESPONSAVEL`)

### Entidade: `Estudante`
- `id`: UUID
- `codigoAnonimizado`: string (ex.: `ALN-8921`) — **RN02: anonimização obrigatória**
- `turma`: string
- `nivelSuporte`: integer (1 = Leve, 2 = Moderado, 3 = Severo)

### Entidade: `VinculoUsuarioEstudante`
- `id`: UUID
- `usuarioId`: UUID (FK)
- `estudanteId`: UUID (FK)
- `papel`: Enum (`PROFESSOR_REGENTE`, `MEDIADOR`, `RESPONSAVEL_LEGAL`, `COORDENADOR`)
- `dataInicio`: Date

### Entidade: `RotinaVisual`
- `id`: UUID
- `estudanteId`: UUID (FK)
- `data`: Date
- `status`: Enum (`PENDENTE`, `EM_ANDAMENTO`, `CONCLUIDA`)

### Entidade: `ItemRotina`
- `id`: UUID
- `rotinaId`: UUID (FK)
- `titulo`: string
- `pictogramaUrl`: string (referência ARASAAC)
- `ordem`: integer
- `duracaoMinutos`: integer
- `concluido`: boolean

### Entidade: `RegistroCrise`
- `id`: UUID
- `estudanteId`: UUID (FK)
- `professorId`: UUID (FK)
- `dataHoraInicio`: Date (timestamp milissegundos)
- `dataHoraFim`: Date (timestamp milissegundos)
- `duracaoSegundos`: integer
- `observacoes`: string (opcional e assíncrona)
- `sincronizadoOffline`: boolean

### Entidade: `Consentimento`
- `id`: UUID
- `estudanteId`: UUID (FK)
- `responsavelId`: UUID (FK)
- `dataAceite`: Date
- `ipOrigem`: string
- `ativo`: boolean

---

## 3. Registros de Decisões Arquiteturais (ADRs)

### ADR 01: Adoção de Progressive Web App (PWA) com React + TypeScript e Vite
- **Contexto**: A solução precisa ser utilizada em tablets escolares (Android/iOS) e computadores com a mesma base de código, instalável sem obrigatoriedade de lojas de aplicativos pagas.
- **Decisão**: Utilizar React com Vite e TypeScript.
- **Consequência**: Carregamento instantâneo, tipagem estática e facilidade de suporte a Service Workers para funcionamento offline.

### ADR 02: Persistência Offline-First Obrigatória via IndexedDB
- **Contexto**: A infraestrutura de internet em escolas públicas e privadas é historicamente instável. Uma perda de conexão durante uma crise não pode perder dados do educador.
- **Decisão**: Toda escrita de crise ou alteração na rotina é primeiramente gravada no `IndexedDB` local. Uma fila de sincronização em segundo plano despacha para a API quando a conectividade for confirmada (RN03).
- **Consequência**: Zero perda de dados e experiência fluida para o professor.

### ADR 03: Biblioteca Curada Local de Pictogramas ARASAAC
- **Contexto**: O acervo completo do ARASAAC possui dezenas de milhares de símbolos e depende de requisições de rede externas.
- **Decisão**: Empacotar localmente na aplicação um conjunto essencial e curado de pictogramas escolares padronizados (Acolhimento, Lanche, Atividade de Mesa, Parque, Música, Banheiro, Guardar Material, Saída) em formato vetorial SVG, garantindo independência de internet.
- **Consequência**: Autonomia offline completa e velocidade imediata de renderização.

### ADR 04: Princípio de Privacy by Design e Anonimização na Origem (LGPD)
- **Contexto**: O Artigo 14 da LGPD exige tratamento estrito de dados pessoais de crianças e adolescentes. O diagnóstico e dados comportamentais de TEA são dados de saúde sensíveis.
- **Decisão**: Identificadores pessoais diretos (nome completo, CPF, foto) não transitam para relatórios gerais e dashboards. Toda agregação analítica é associada unicamente ao `codigoAnonimizado` do aluno.
- **Consequência**: Conformidade com a legislação e preservação ética da identidade do menor.
