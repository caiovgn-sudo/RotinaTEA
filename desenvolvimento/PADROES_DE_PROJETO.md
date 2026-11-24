# Padrões de Projeto e Decisões de Arquitetura — RotinaTEA

Documento da etapa de Desenvolvimento do TCC (CEUNI FAMETRO, turma SIS231N01). Descreve os padrões que existem no código do aplicativo (`app/src`), onde estão e por que foram adotados. Só constam padrões verificáveis no repositório; nada aqui descreve recurso não implementado.

**Autores:** Caio Victor Galvão do Nascimento e Pedro Neves Alberto · **Orientadora:** Profa. Luana Magalhães Leal · **Situação verificada em:** novembro de 2026

---

## 1. Visão geral

O RotinaTEA é um Progressive Web App (PWA) em React 18 e TypeScript, com persistência local-primeiro (IndexedDB) e banco remoto no Supabase (PostgreSQL, autenticação e Row Level Security, RLS). Não há servidor próprio: o navegador conversa diretamente com o Supabase, e a segurança dos dados fica nas políticas do banco.

| Camada | Pasta | Responsabilidade |
|---|---|---|
| Interface | `src/components` | Telas e componentes de apresentação (prancha, temporizador, registro de crise, painel do PEI, SUS, LGPD). |
| Estado de sessão | `src/context` e `src/hooks` | Sessão e perfil do usuário (`AuthContext`) e estado real da conexão (`useConexaoReal`). |
| Regras de negócio | `src/utils` | Funções puras e testáveis: `regras.ts` (RN01 a RN03), `acesso.ts`, `pei.ts`, `sus.ts`, `sync.ts`. |
| Acesso a dados | `src/services` | `db.ts` (IndexedDB), `filaSync.ts` (fila de envio) e `supabase.ts` (cliente remoto). |
| Banco remoto | `supabase/migrations` | Esquema, políticas RLS e funções administrativas, versionados em 7 migrações. |

---

## 2. Padrões adotados

### 2.1 Arquitetura em camadas com regras de negócio puras

- **Onde:** `src/utils/regras.ts`, `acesso.ts`, `pei.ts`, `sus.ts`.
- **O que faz:** as regras (duração da crise, quem pode registrar, quando a coleta é permitida, pontuação do SUS) são funções sem efeito colateral, que recebem dados e devolvem um resultado.
- **Por quê:** permite testar a regra sem abrir tela nem banco. Os 121 testes automatizados (Vitest, 10 arquivos) importam esse código real. A interface apenas chama a regra e mostra o resultado.
- **Exemplo:** `podeExcluirCrise(crise)` aplica a RN01 (não excluir registro sem fim); a mesma função é usada na tela e nos testes.

### 2.2 Offline-first com fila de saída (Outbox)

- **Onde:** `src/services/db.ts` (`adicionarAFilaSincronizacao`, `sincronizarFilaBatch`) e `src/services/filaSync.ts`.
- **O que faz:** toda gravação (crise, item de rotina, consentimento, resposta do SUS) vai primeiro ao IndexedDB, e um item é colocado em uma fila. Quando há conexão, a fila é enviada ao servidor em ordem de criação.
- **Por quê:** atende a RN03 (persistência local antes da rede) e a RNF02 (funcionar sem conexão). Uma queda de internet durante uma crise não perde o registro.
- **Política de falha:** até 3 tentativas por item (`MAX_TENTATIVAS_SYNC`); depois o item fica com status `ERRO` e pode ser reativado manualmente ("Tentar novamente").

### 2.3 Receptor idempotente (upsert pelo identificador)

- **Onde:** envio em `db.ts`; comentário de projeto em `filaSync.ts`.
- **O que faz:** o envio usa `upsert` com o UUID gerado no aparelho. Se o servidor recebeu o item mas a confirmação se perdeu, o reenvio não cria duplicata.
- **Por quê:** a rede móvel de escola é instável, e reenviar precisa ser seguro.

### 2.4 Injeção de dependências por manipuladores

- **Onde:** `ManipuladoresFila` em `filaSync.ts` (`enviar`, `aoSucesso`, `aoFalha`).
- **O que faz:** a lógica da fila não conhece o Supabase nem o IndexedDB; recebe funções que fazem o envio e a gravação.
- **Por quê:** o teste de integração (`integracao.test.ts`, 17 casos) troca o Supabase por um dublê e o IndexedDB por `fake-indexeddb`, sem alterar o código testado. Também resolve uma restrição do IndexedDB: não se faz `await` de rede dentro de uma transação, porque ela se encerra sozinha.

### 2.5 Provedor de contexto (Context Provider)

- **Onde:** `src/context/AuthContext.tsx`.
- **O que faz:** mantém sessão, perfil e modo (visitante, conta real ou demonstração) e os oferece a toda a árvore de componentes, sem repassar propriedades de nível em nível.
- **Por quê:** vários componentes dependem do mesmo estado de acesso; o contexto evita duplicar essa leitura.

### 2.6 Defesa em profundidade (regra na interface e no banco)

- **Onde:** `utils/acesso.ts` e `utils/regras.ts` (interface) e as migrações `20261028000001` e `20261028000002` (RLS).
- **O que faz:** a interface explica e bloqueia o que o perfil não pode fazer, mas a decisão final é do banco. Por exemplo, só PROFESSOR e COORDENACAO vinculados inserem crises (`professor_id = auth.uid()`), e só crise encerrada pode ser excluída.
- **Por quê:** esconder um botão não é controle de acesso. A mesma regra existe nas duas camadas, e a do banco vale mesmo que a interface seja contornada.

### 2.7 Privacidade desde a concepção (Privacy by Design)

- **Onde:** `REGEX_CODIGO_ANONIMIZADO` e `validarCodigoAnonimizado` (RN02); `mascararIp`; `descricaoSegura` em `utils/atividades.ts`.
- **O que faz:** o aluno só existe no sistema por um código (`ALN-0000`); o IP do aceite é exibido mascarado; textos de registro de atividade passam por um filtro que oculta e-mail, CPF e código antes de serem guardados.
- **Por quê:** os dados são sensíveis e de menores (LGPD, arts. 11 e 14). Reduzir o dado coletado é a medida mais segura.
- **Limite:** nomes digitados à mão em campos livres não são detectados; o relatório do PEI avisa isso.

### 2.8 Gancho personalizado para o estado externo

- **Onde:** `src/hooks/useConexaoReal.ts`.
- **O que faz:** isola a leitura de `navigator.onLine` e dos eventos de conexão. O simulador de conexão da demonstração é um estado separado, e a função `conexaoEfetiva` (em `utils/sync.ts`) combina os dois.
- **Por quê:** antes, o botão "Online/Offline" era só um interruptor e o código nunca lia a conexão real (registrado em `MELHORIAS_UX_2026-10.md`).

---

## 3. Decisões arquiteturais registradas

| Decisão | Motivo | Consequência |
|---|---|---|
| PWA com React, TypeScript e Vite | Mesmo código em tablet e computador, instalável sem loja | Funciona offline via service worker (vite-plugin-pwa) |
| IndexedDB como armazenamento primário | Rede escolar instável | Toda leitura e escrita passam pelo banco local |
| Supabase em vez de API própria | Reduz código de servidor; RLS aplica a separação por perfil | Corrige o desenho inicial (ARQUITETURA_ENGENHARIA.md previa uma API Node.js) |
| Pictogramas do ARASAAC | Padrão de comunicação visual para TEA | Busca por API ao criar atividades (RF11), com biblioteca local curada como alternativa |
| Perfil definido no servidor | Evitar que o usuário escolha o próprio perfil | Cadastro entra sempre como Responsável; Professor e Coordenação são concedidos por administrador |

---

## 4. Rastreabilidade com os testes

| Padrão | Arquivo de teste | O que verifica |
|---|---|---|
| Regras puras | `db.test.ts`, `acesso.test.ts` | RN01, RN02, perfis e bloqueio da coleta com consentimento revogado |
| Fila e idempotência | `sync.test.ts`, `integracao.test.ts` | Estados da fila, 3 tentativas até ERRO, reenvio sem duplicar |
| Privacidade | `atividades.test.ts` | Máscara de e-mail, CPF e código nos registros |
| Painel e SUS | `pei.test.ts`, `sus.test.ts` | Agregações do PEI e cálculo da pontuação de 0 a 100 |
| Acessibilidade | `contraste.test.ts` | Contraste mínimo da paleta nos três modos |

## 5. Limitações

- A sincronização com o Supabase foi testada com um dublê; o teste ponta a ponta com conta real está pendente.
- A revogação do consentimento bloqueia novos registros apenas no aparelho; ainda não há regra equivalente no servidor.
- Não há política de segurança de conteúdo (CSP) configurada.
