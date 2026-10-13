# Diretrizes de UX/UI e Acessibilidade — RotinaTEA

Manual de design sensorial, usabilidade cognitiva e conformidade com acessibilidade digital para pessoas no Espectro Autista (TEA).

---

## 1. Princípios de Acessibilidade Cognitiva para TEA

Pessoas com TEA frequentemente processam estímulos visuais, auditivos e espaciais com intensidade aumentada. O design da interface do RotinaTEA segue premissas de **baixa estimulação sensorial e máxima previsibilidade**:

1. **Previsibilidade Estrutural**: A disposição dos elementos não muda aleatoriamente entre as telas; a prancha de rotina mantém sempre a leitura linear (esquerda para a direita ou topo para a base).
2. **Cores Atenuadas (Muted & Pastel Palette)**: Proibição de cores primárias ultra saturadas ou fundos brancos ofuscantes. Utilização de tons pastéis e terrosos atenuados que transmitem acolhimento e estabilidade emocional.
3. **Ausência de Gatilhos Sensoriais**:
   - Zero animações piscantes ou transições repentinas;
   - Respeito à preferência do sistema `prefers-reduced-motion`;
   - Temporizador em disco contínuo ou barra suave, sem números decrescentes gigantes ou alarmes com sirene/apito estridente.
4. **Comunicação Visual Dupla (Ícone + Texto Claro)**: Todos os cartões de rotina utilizam pictogramas padronizados ARASAAC com legendas em caixa alta/baixa legíveis em fonte sem serifa.

---

## 2. Paleta de Cores Atenuada (Design Tokens)

| Token CSS | Cor Hexadecimal | Finalidade / Justificativa |
| :--- | :--- | :--- |
| `--cor-fundo` | `#F4F6F8` | Cinza claro suave, evita o brilho excessivo do branco puro (`#FFFFFF`). |
| `--cor-superficie` | `#FFFFFF` | Superfície dos cartões e módulos para manter contraste limpo. |
| `--cor-primaria` | `#3A6B7E` | Azul Sereno atenuado: transmite calma, estabilidade e foco cognitivo. |
| `--cor-secundaria` | `#5C8374` | Verde Sálvia: associado à tranquilidade e finalização de tarefas. |
| `--cor-alerta-suave`| `#D4A373` | Âmbar Suave: cor para o temporizador e atenção, sem o terror do vermelho puro. |
| `--cor-crise-ativo` | `#C85A54` | Terracota Suave: botão de crise do professor (visível sem alarmar o aluno). |
| `--cor-texto-forte` | `#1F2937` | Contraste de texto escuro com taxa >= 7:1 (WCAG AAA). |
| `--cor-texto-medio` | `#4B5563` | Texto secundário legível com taxa >= 4.5:1 (WCAG AA). |

---

## 3. Conformidade com os 4 Princípios WCAG 2.1

### 1. Perceptível
- **Contraste Mínimo**: Todos os textos atendem à taxa mínima de 4.5:1 para texto normal e 3:1 para componentes de interface.
- **Alternativas Textuais**: Cada pictograma possui `alt` descritivo e semântico.
- **Não depender apenas da cor**: O status de "concluído" utiliza ícone de check, texto explícito e estilização atenuada, nunca dependendo unicamente de cor verde.

### 2. Operável
- **Navegação 100% por Teclado**: Todo fluxo da prancha e temporizador pode ser executado pelas teclas `Tab`, `Shift+Tab`, `Enter` e `Espaço`.
- **Foco Visível e Nítido**: Outline de foco destacado (`3px solid #3A6B7E`) com contraste reforçado.
- **Áreas de Toque (Touch Targets)**: Dimensão mínima de **48x48px** em todos os botões e cartões interativos, prevenindo toques errôneos acidentais.

### 3. Compreensível
- **Linguagem Clara e Direta**: Textos objetivos, sem jargões ou termos ambíguos.
- **Prevenção de Erros**: O botão de registro de crise possui confirmação clara de status e cronômetro em andamento para evitar cliques duplicados.

### 4. Robusto
- **Código Semântico**: Uso de elementos nativos HTML5 (`<header>`, `<main>`, `<section>`, `<nav>`, `<button>`).
- **Compatibilidade com Leitores de Tela**: Regiões dinâmicas utilizam `aria-live="polite"` para anunciar a conclusão de tarefas sem interromper a leitura corrente.

---

## 4. Heurísticas de Usabilidade (Nielsen Adaptadas)
- **Status do Sistema**: O aluno visualiza qual atividade está ocorrendo no momento e quanto tempo resta; o professor visualiza se o modo crise está ativo e se os dados estão salvos localmente ou sincronizados.
- **Controle e Liberdade do Usuário**: Facilidade para desfazer a conclusão de um cartão caso tenha ocorrido clique não intencional.
- **Reconhecimento em vez de Memorização**: Pictogramas ARASAAC padronizados internacionalmente reduzem a necessidade de memorização textual.
