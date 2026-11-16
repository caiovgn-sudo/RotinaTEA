# Avaliação Heurística de Usabilidade — RotinaTEA

**Sistema:** RotinaTEA (PWA de rotina visual e registro de crises para alunos com TEA)
**Método:** inspeção pelas 10 heurísticas de Jakob Nielsen (NIELSEN, 1993), sobre as seis telas principais, em modo de demonstração (dados fictícios)
**Responsáveis:** Caio Victor Galvão do Nascimento e Pedro Neves Alberto, que também desenvolveram o sistema (avaliação interna) · **Data:** novembro de 2026
**Aderência aos eixos do TCC:** interação humano-computador, acessibilidade (WCAG 2.1 AA) e testes de usabilidade

> **Limite importante.** Esta é uma inspeção feita pelos próprios autores, e não uma avaliação por especialistas independentes nem um teste com usuários. Ela serve para registrar o que o projeto já atende, apontar melhorias e preparar o teste com educadores (SUS), que **ainda não foi aplicado**. Os achados descrevem o que foi observado nas telas e no código, e não medem a satisfação de nenhum usuário.

---

## 1. Escopo e procedimento

Telas inspecionadas: (1) entrada e perfis, (2) prancha do aluno, (3) temporizador visual, (4) registro de crise e sincronização, (5) painel do PEI e relatório, (6) formulário SUS. Os achados vêm do código-fonte, dos testes automatizados (incluindo a medição de contraste dos três modos: padrão, alto contraste e amarelo sobre preto) e do registro de melhorias do projeto (`MELHORIAS_UX_2026-10.md`). A escala de gravidade vai de 0 (não é problema) a 4 (catastrófico), conforme a proposta de Nielsen. **As gravidades são estimativas preliminares, redigidas com apoio de inteligência artificial, e os autores devem revisá-las antes da entrega.**

---

## 2. Análise por tela

### Tela 1 — Entrada e perfis

- **H1 (visibilidade do estado):** uma faixa permanente informa o tipo de acesso (Visitante, Conta real ou Modo demonstração), com cor e ícone próprios.
- **H2 (correspondência com o mundo real):** os motivos de bloqueio usam linguagem simples ("Exige login com uma conta de Professor"), e não códigos de perfil.
- **H3 (controle e liberdade):** a prancha do aluno não exige login; o visitante sempre pode voltar a ela. As visões bloqueadas mostram cadeado e o botão **Entrar**.
- **H5 (prevenção de erros):** o cadastro entra sempre como Responsável; o perfil é definido no servidor, e o usuário não escolhe o próprio.
- **H7 (flexibilidade):** a aba Demonstração dá acesso imediato, sem senha, para avaliadores.
- **Melhorias:** não há "Esqueci minha senha" (H3, gravidade 2); o botão "Mostrar senha" já é alcançável pelo teclado.

### Tela 2 — Prancha do aluno

- **H1:** cada cartão traz número da ordem, duração, categoria e estado (concluído ou não); uma região oculta com `aria-live` anuncia a mudança de estado para leitor de tela.
- **H2:** pictogramas do ARASAAC, padrão da comunicação visual para TEA, com título em texto.
- **H3:** o botão de concluir vira **Desfazer** após a conclusão, e a ordem pode ser mudada por botões "Mover para cima/baixo" (alternativa ao arrastar).
- **H4 (consistência):** todos os cartões seguem o mesmo molde e os mesmos rótulos.
- **H7:** conclusão por arrastar e soltar ou por botão; cada cartão é focável (`tabIndex`) e tem rótulo completo para leitor de tela.
- **H8 (design minimalista):** a visão do aluno oculta os controles de edição.
- **Melhorias:** o efeito do arrastar sobre a transição do aluno é uma hipótese de projeto, ainda não observada com alunos (H1, gravidade 1).

### Tela 3 — Temporizador visual

- **H1:** o tempo restante aparece em minutos e segundos, com um anel que se esvazia de forma contínua; o valor é anunciado com `aria-live="polite"`.
- **H5:** não há alarme sonoro; ao chegar a zero, a tela apenas muda de estado, o que evita susto (decisão de projeto ligada ao RNF01).
- **H3:** os botões pausar e reiniciar permitem corrigir o uso.
- **Melhorias:** o tempo de resposta e a leitura pelo aluno não foram medidos (H1, gravidade 2).

### Tela 4 — Registro de crise e sincronização

- **H1:** cada crise exibe hora, duração e um selo de situação de envio com ícone e texto (**Salva só neste aparelho**, **Enviada ao servidor**, **Falhou o envio**), iguais nas telas do Professor e da Coordenação. O painel de sincronização mostra a fila, as tentativas ("1 de 3") e a situação.
- **H3:** "Sincronizar agora" e "Tentar novamente" dão controle sobre a fila. A confirmação de exclusão e de revogação usa diálogo acessível (foco no botão seguro, Esc cancela).
- **H5:** a exclusão de crise em andamento é bloqueada (RN01), e o botão de iniciar fica inativo, com o motivo explicado, quando o consentimento está revogado.
- **H6 (reconhecer em vez de lembrar):** estados vazios dizem o que fazer ("Use o botão vermelho quando um episódio começar…"), e o registro de atividades lista as últimas 30 ações.
- **H9 (ajudar a reconhecer e corrigir erros):** o aviso de sessão encerrada diz que os registros salvos no aparelho não foram perdidos.
- **Melhorias:** o tempo de resposta do botão (RNF05, menos de 1 segundo) ainda **não foi medido** (gravidade 3 para a validação, pois é critério de sucesso do projeto).

### Tela 5 — Painel do PEI e relatório

- **H1:** quatro indicadores no topo e três gráficos (por dia, por faixa de horário, por dia da semana), com o valor escrito sobre a barra.
- **H2:** frases de leitura em linguagem comum, que só aparecem com 5 ou mais crises encerradas; um empate é dito como empate.
- **H8:** só dados agregados e anonimizados (RN02 e RN05); o aluno aparece pelo código.
- **H10 (ajuda e documentação):** a aba **Sobre** explica perfis, regras e o caminho de uma crise sem exigir explicação oral.
- **Acessibilidade:** gráficos em SVG com descrição para leitor de tela e tabela equivalente oculta.
- **Melhorias:** o relatório não foi conferido impresso em papel; o PDF depende da opção "Salvar como PDF" do navegador (H7, gravidade 1).

### Tela 6 — Formulário SUS

- **H2:** 10 afirmações da escala, respostas de 1 a 5 e instruções antes do envio.
- **H5:** as etiquetas "Positivo/Negativo" foram retiradas por poderem enviesar a resposta; os atalhos de teste só aparecem com a variável `VITE_SUS_ATALHOS_TESTE=true`.
- **H1:** após o envio, a tela diz onde a resposta ficou (só neste aparelho, enviada ou aguardando conexão).
- **Melhorias:** só a Coordenação grava no servidor, pelas regras de RLS; é preciso decidir se o Professor também deve enviar (H4, gravidade 2).

---

## 3. Síntese por heurística

| Heurística | Situação observada | Gravidade da maior pendência |
|---|---|---|
| H1 Visibilidade do estado do sistema | Atendida: selos de envio, faixa de acesso, temporizador e fila | 2 |
| H2 Correspondência com o mundo real | Atendida: linguagem simples e pictogramas do ARASAAC | 1 |
| H3 Controle e liberdade do usuário | Parcial: falta recuperação de senha | 2 |
| H4 Consistência e padrões | Atendida nas telas; decidir quem envia o SUS | 2 |
| H5 Prevenção de erros | Atendida: RN01, perfil no servidor, bloqueio com consentimento revogado | 1 |
| H6 Reconhecer em vez de lembrar | Atendida: estados vazios e registro de atividades | 1 |
| H7 Flexibilidade e eficiência | Atendida: arrastar ou botão, teclado, demonstração | 1 |
| H8 Estética e design minimalista | Atendida: visão do aluno sem controles de edição | 1 |
| H9 Ajudar a reconhecer e corrigir erros | Atendida: avisos persistentes com motivo e ação | 1 |
| H10 Ajuda e documentação | Atendida: aba Sobre; sem tutorial guiado | 1 |

## 4. Acessibilidade (WCAG 2.1 AA)

- Alvos de toque de pelo menos 48 px (RNF01), conferidos nas abas, nos campos do login e nos botões.
- Contraste do texto de pelo menos 4,5:1 nos três modos, verificado por teste automatizado (`contraste.test.ts`). A medição cobre texto, e não bordas, ícones nem o anel do temporizador.
- Cartões e controles principais focáveis pelo teclado, com rótulos `aria-label` (conferidos no código; um percurso completo só pelo teclado ainda não foi registrado).
- **Não houve teste com leitor de tela real**; os atributos ARIA foram conferidos no código.

## 5. Próximos passos

1. Aplicar o SUS e o teste de tarefas com educadores (ainda não feito) e comparar com esta inspeção.
2. Acrescentar a recuperação de senha e decidir o envio do SUS pelo Professor.
3. Medir o tempo de resposta do botão de crise (RNF05) e testar com um leitor de tela.

## Referência

NIELSEN, Jakob. **Usability engineering**. Boston: Academic Press, 1993.
