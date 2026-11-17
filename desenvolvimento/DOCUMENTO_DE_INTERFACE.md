# Documento de Interface (wireframes e protótipo) — RotinaTEA

Documento de Desenvolvimento do TCC (CEUNI FAMETRO, turma SIS231N01). Reúne a estrutura de telas, os wireframes de baixa fidelidade e a relação entre cada tela e os requisitos. Atende ao item "Documentos de interface" do check-list de entrega da disciplina e ao Eixo 2 (IHC e UX/UI).

**Autores:** Caio Victor Galvão do Nascimento e Pedro Neves Alberto · **Orientadora:** Profa. Luana Magalhães Leal

> **Nota de transparência.** Os wireframes abaixo foram redesenhados **depois** da implementação, a partir das telas do sistema, para documentar a estrutura de cada visão. Não são os esboços do início do projeto e **não foram testados com usuários**. O protótipo funcional é o próprio sistema em modo de demonstração (dados fictícios, sem servidor). O documento foi produzido com apoio de inteligência artificial (Guia de IA da disciplina), e os autores devem validá-lo.

---

## 1. Princípios de interface

Os princípios vêm de `DIRETRIZES_UX_ACESSIBILIDADE.md` e valem para todas as telas.

| Princípio | Como aparece nas telas |
|---|---|
| Previsibilidade | A mesma barra de perfis no topo em todas as visões; a prancha lê-se sempre da esquerda para a direita |
| Baixa carga sensorial | Paleta atenuada (fundo `#F4F6F8`, azul `#3A6B7E`, terracota `#C85A54` só no botão de crise), sem animação brusca e **sem alarme sonoro** |
| Ícone e texto juntos | Cada cartão da rotina traz pictograma ARASAAC e legenda |
| Alvos de toque | Botões e cartões com pelo menos 48 px |
| Contraste e leitura | Três modos (padrão, alto contraste, amarelo sobre preto) e fonte ampliável; contraste mínimo de 4,5:1 medido por teste |
| Privacidade visível | O aluno aparece só pelo código (por exemplo, ALN-8921), em todas as visões (RN02) |
| Estado do sistema visível | Selo "Salva só neste aparelho" ou "Enviada" em cada registro e painel de sincronização (RN03) |

## 2. Mapa de navegação

A navegação é uma barra de perfis, sem menus aninhados.

| Visão | Acesso | O que contém |
|---|---|---|
| Aluno TEA | Livre, sem login | Temporizador visual e prancha de rotina |
| Professor | Login de Professor | Abas "Rotina & Crises" e "Configurar Cartões"; registro de crise em 1 clique; sincronização |
| Coordenação / PEI | Login de Coordenação | Painel com métricas anonimizadas, relatório do PEI e formulário SUS |
| Responsável LGPD | Login de Responsável | Consentimento do aluno, com confirmação na revogação |
| Sobre | Livre | Objetivo, perfis e regras do sistema |
| Entrada | Botão "Entrar" | Abas Entrar, Cadastrar e Demonstração |

As visões com cadeado exigem o perfil correspondente. A regra é aplicada na interface e no banco (RLS), conforme `ARQUITETURA_ENGENHARIA.md`.

## 3. Wireframes de baixa fidelidade

Os números em círculo remetem às tabelas de elementos. As caixas cinza indicam áreas de conteúdo, e as escuras indicam a ação principal.

### 3.1 Entrada e perfis

![Wireframe 1 — Entrada e perfis](imagens/wireframes/wf1-login.png)

**Figura 1 — Wireframe da entrada e seleção de perfis.** Fonte: elaboração própria (2026).

| Nº | Elemento | Função | Requisito |
|---|---|---|---|
| 1 | Painel lateral | Apresenta o sistema e seus quatro apoios (rotinas, PEI, LGPD, offline) | — |
| 2 | Abas Entrar, Cadastrar, Demonstração | Alterna entre acesso com conta e modo de demonstração (sem senha e sem servidor) | RF08 |
| 3 | Campos e-mail e senha | Autenticação por Supabase Auth | RF08 |
| 4 | Botão Entrar | Ação principal da tela | RF08 |
| 5 | Voltar para a Prancha do Aluno | Saída sem login, pois a prancha é livre | RF01 |

### 3.2 Prancha do aluno

![Wireframe 2 — Prancha do aluno](imagens/wireframes/wf2-prancha.png)

**Figura 2 — Wireframe da prancha do aluno com temporizador.** Fonte: elaboração própria (2026).

| Nº | Elemento | Função | Requisito |
|---|---|---|---|
| 1 | Cabeçalho da visão | Mostra o código do aluno, nunca o nome | RN02 |
| 2 | Temporizador visual | Anel que se esvazia, com Iniciar e Reiniciar; sem som | RF02 |
| 3 | Título e progresso | "Minha Rotina Escolar" e quantas atividades foram concluídas | RF01 |
| 4 | Cartões da rotina | Pictograma, título, duração e categoria; o cartão atual fica destacado | RF01 |
| 5 | Concluir Tarefa | Conclui por clique; o cartão também pode ser arrastado, ou operado pelo teclado | RF01 |

### 3.3 Visão do educador e registro de crise

![Wireframe 3 — Visão do educador](imagens/wireframes/wf3-crise.png)

**Figura 3 — Wireframe da visão do educador com o registro de crise.** Fonte: elaboração própria (2026).

| Nº | Elemento | Função | Requisito |
|---|---|---|---|
| 1 | Cabeçalho da visão | Contexto do aluno ativo, só por código | RN02 |
| 2 | Abas Rotina & Crises e Configurar Cartões | Alterna entre registrar crises e montar a rotina | RF03, RF04 |
| 3 | Botão Iniciar Registro de Crise | Maior elemento da tela; um toque inicia e outro encerra, e a duração sai dos horários | RF03, RN01 |
| 4 | Histórico recente | Cada registro mostra se está "Salva só neste aparelho" ou já enviada | RN03 |
| 5 | Sincronização | Contadores de aguardando, com erro e enviadas, e botão "Sincronizar agora" | RF09 |

### 3.4 Painel do PEI

![Wireframe 4 — Painel do PEI](imagens/wireframes/wf4-painel.png)

**Figura 4 — Wireframe do painel do PEI (coordenação).** Fonte: elaboração própria (2026).

| Nº | Elemento | Função | Requisito |
|---|---|---|---|
| 1 | Cabeçalho e botão do formulário SUS | Contexto da coordenação e acesso à avaliação de usabilidade | RF12 |
| 2 | Relatório do PEI | Gera o relatório com gráficos para impressão ou PDF | RF10 |
| 3 | Seleção de estudante | Lista apenas códigos anonimizados | RN02, RN05 |
| 4 | Quatro indicadores | Conclusão de tarefas, registros, duração média e conformidade LGPD | RF05 |
| 5 | Padrões observados | Gráficos por dia, faixa de horário e dia da semana, com leitura textual ("indício, não diagnóstico") | RF05 |

## 4. Dos wireframes às telas implementadas

As capturas abaixo são do sistema em modo de demonstração, com dados fictícios.

![Tela implementada — Prancha do aluno](imagens/tela-2-prancha.jpg)

**Figura 5 — Prancha do aluno implementada.** Fonte: elaboração própria (2026), dados fictícios.

![Tela implementada — Registro de crise](imagens/tela-4-registro-crise.jpg)

**Figura 6 — Registro de crise implementado.** Fonte: elaboração própria (2026), dados fictícios.

![Tela implementada — Painel do PEI](imagens/tela-5-painel-pei.jpg)

**Figura 7 — Painel do PEI implementado.** Fonte: elaboração própria (2026), dados fictícios.

| Decisão | Wireframe | Tela final |
|---|---|---|
| Hierarquia | Ação principal em bloco escuro e largo | Botão de crise em terracota suave, em largura total |
| Anonimização | Rótulos "só por código" | Código ALN-8921 e aviso "Nomes reais não são armazenados" |
| Estado de envio | Selo em cada registro | Selo "Salva só neste aparelho" com ícone e texto, sem depender só da cor |
| Gráficos | Barras genéricas | Barras com valores, rótulos legíveis e leitura textual abaixo |

## 5. Estados da interface

| Estado | Comportamento | Regra |
|---|---|---|
| Crise em andamento | O botão passa a "Encerrar"; o registro em andamento não pode ser excluído | RN01 |
| Sem conexão | Os registros ficam salvos no aparelho, com selo "Salva só neste aparelho", e a fila reenvia quando a rede volta | RN03 |
| Consentimento revogado | Novos registros são bloqueados; a crise em andamento pode ser encerrada | RN04 |
| Visão sem permissão | O cadeado indica o perfil exigido, e a tela pede login | RF07 |
| Modo de demonstração | Aviso visível de que nada é enviado ao servidor | — |

## 6. Limitações

- Wireframes feitos depois da implementação; não registram as alternativas descartadas.
- Sem teste com usuários reais e sem teste com leitor de tela.
- Não há wireframe da visão do Responsável (consentimento) nem das telas de configuração e do formulário SUS; as capturas estão em `imagens/`.
- O protótipo navegável é o sistema em demonstração; não há protótipo separado em ferramenta de design.

## 7. Referências

NIELSEN, Jakob. **Usability engineering**. San Diego: Academic Press, 1993.

WORLD WIDE WEB CONSORTIUM. **Web Content Accessibility Guidelines (WCAG) 2.1**. [S. l.]: W3C, 2018.
