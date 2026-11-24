# Protocolo de Avaliação de Usabilidade com Educadores (SUS) — RotinaTEA

> **Pilares:** 2 (qualidade e evidência de teste) e 3 (governança de dados e ética). Documento de **preparação**: a avaliação **ainda não foi aplicada**. Nenhum resultado deste protocolo pode ser citado antes da coleta. Elaborado em 24/11/2026 a partir da seção 3.4 do artigo (v11), dos requisitos RF12 e RNF07 e de `VALIDACAO_PRODUTO.md`.

## 1. Objetivo

Medir a usabilidade percebida do RotinaTEA por **educadores** (professores, mediadores e coordenadores pedagógicos) com o questionário System Usability Scale (SUS, BROOKE, 1996), comparando a média com a meta de **68 pontos** (RNF07), e registrar problemas observados. O questionário de validação de novembro (22 respostas) **não substitui** esta etapa: apenas 5 dos 22 participantes eram educadores.

## 2. Participantes

- **Quem:** educadores que atuam ou já atuaram com estudantes com TEA, maiores de 18 anos, convidados pela equipe ou pela coordenação.
- **Quantos:** sugestão de pelo menos 5 educadores. Com menos de 3 avaliações o sistema não mostra a média por pergunta (regra de privacidade do painel). O artigo deve informar o número real e dizer que a amostra é de conveniência.
- **Quem não participa:** alunos e crianças. Nenhum dado de estudante real é usado: o protótipo contém só dados fictícios.

## 3. Termo de consentimento (rascunho)

> **Situação:** texto **proposto**, ainda **não submetido** à orientadora nem a comitê de ética. O artigo não deve afirmar aprovação por comitê. Antes de aplicar, a equipe confirma com a orientadora se o termo precisa de aprovação formal.

**Termo de Consentimento Livre e Esclarecido (TCLE) — Avaliação de usabilidade do RotinaTEA**

Você está sendo convidado(a) a participar, de forma voluntária, da avaliação de um protótipo chamado RotinaTEA, desenvolvido por Caio Victor Galvão do Nascimento e Pedro Neves Alberto, sob orientação da Profa. Luana Magalhães Leal (CEUNI FAMETRO), como Trabalho de Conclusão de Curso.

- **O que será feito:** você usará o protótipo por cerca de 15 a 20 minutos, executará algumas tarefas e responderá a 10 afirmações sobre a facilidade de uso. A equipe anotará o tempo das tarefas e as dificuldades observadas.
- **Dados do sistema:** são todos fictícios. Nenhuma criança real e nenhum dado de aluno serão usados.
- **Seus dados:** o formulário não pede nome, e-mail nem outro contato. Registramos apenas a função (por exemplo, professor ou coordenador) e as respostas. Os resultados serão apresentados de forma agregada.
- **Riscos e benefícios:** o risco é mínimo (cansaço ou desconforto ao usar o sistema). O benefício é contribuir para melhorar uma ferramenta de apoio à inclusão escolar.
- **Voluntariedade:** você pode desistir a qualquer momento, sem prejuízo, e pedir a retirada de suas respostas enquanto elas puderem ser identificadas.
- **Contato da equipe:** informar o canal combinado com a orientadora.

Declaro que li e compreendi as informações e aceito participar.

Data: ____/____/______  Assinatura ou aceite registrado: ______________________

## 4. Preparo da sessão

| Item | Detalhe |
|---|---|
| Local e duração | Individual, presencial ou por videochamada com compartilhamento de tela; 15 a 20 minutos |
| Ambiente | Sistema rodando em `http://localhost:5173` (ou na Vercel, quando publicada), em **modo demonstração** (dados fictícios, sem senha) |
| Dispositivo | O que o educador usaria em sala (tablet, se houver); registrar o dispositivo usado |
| Material | TCLE, ficha de observação (seção 6), cronômetro, formulário SUS (seção 7) |
| Orientação ao participante | "Estamos avaliando o sistema, não você. Pense em voz alta. Pode dizer que algo ficou confuso." A equipe **não ajuda** durante a tarefa, salvo se o participante pedir; cada ajuda é anotada |

## 5. Tarefas

Cada participante executa as tarefas do seu perfil. A ordem é a mesma para todos.

| N.º | Perfil | Tarefa | Conclusão esperada |
|---|---|---|---|
| T1 | Professor | Entrar em modo demonstração como Professor | Visão do Educador aberta |
| T2 | Professor | Configurar uma rotina: adicionar uma atividade com pictograma e duração | Atividade aparece na prancha |
| T3 | Professor | Iniciar e encerrar um registro de crise e acrescentar uma observação | Crise encerrada, com duração calculada |
| T4 | Professor | Abrir o painel de sincronização e dizer se o registro está só no aparelho ou enviado | Participante interpreta o selo corretamente |
| T5 | Coordenação | Abrir o painel do PEI e dizer qual faixa de horário teve mais crises | Resposta correta ou aviso de poucos dados |
| T6 | Coordenação | Abrir o relatório do PEI para impressão | Relatório exibido |
| T7 | Responsável | (se o participante for responsável ou coordenador) Localizar como revogar o consentimento | Participante encontra a opção, sem confirmar |

Tarefas T5 a T7 são feitas só por quem tem esse papel ou por escolha do participante. Os dados do painel são os de exemplo; se houver menos de 5 crises o sistema avisa, o que também é observado.

## 6. Ficha de observação (uma por participante)

| Campo | Registro |
|---|---|
| Código do participante (P01, P02, ...) | |
| Função (professor, mediador, coordenador, outra) | |
| Anos de experiência com alunos com TEA | |
| Dispositivo | |

| Tarefa | Tempo (s) | Concluiu? (sem ajuda / com ajuda / não) | Erros e dúvidas | Fala marcante |
|---|---|---|---|---|
| T1 | | | | |
| T2 | | | | |
| T3 | | | | |
| T4 | | | | |
| T5 | | | | |
| T6 | | | | |
| T7 | | | | |

## 7. Questionário SUS

O formulário do sistema usa a versão `SUS-10-pt-BR-v1` (arquivo `app/src/utils/sus.ts`). Para cada afirmação, o participante marca de 1 (Discordo totalmente) a 5 (Concordo totalmente):

1. Acho que gostaria de usar este sistema frequentemente.
2. Achei o sistema desnecessariamente complexo.
3. Achei o sistema fácil de usar.
4. Acho que precisaria da assistência de uma pessoa técnica para conseguir usar este sistema.
5. Achei que as várias funções deste sistema foram bem integradas.
6. Achei que havia muita inconsistência neste sistema.
7. Acho que a maioria das pessoas aprenderia a usar este sistema muito rapidamente.
8. Achei o sistema muito complicado de usar.
9. Me senti muito confiante usando o sistema.
10. Precisei aprender muitas coisas antes de poder usar este sistema.

**Como registrar no sistema.** Pelas regras do banco, **só o perfil Coordenação grava** respostas do SUS (tabela `respostas_sus`, com RLS). Há dois caminhos:

- **Conta real (recomendado, depois da publicação e do teste de sincronização):** a equipe cria uma conta com perfil Coordenação para a sessão; o participante responde na tela de SUS; a resposta é enviada pela fila de sincronização. A tela "Resultados do SUS" mostra só agregados.
- **Modo demonstração ou papel:** a resposta fica **só no aparelho** (o sistema avisa). Nesse caso a equipe copia as 10 notas para uma planilha própria e calcula a pontuação com a fórmula abaixo.

## 8. Cálculo e análise

Para cada participante: itens ímpares contribuem com (nota − 1); itens pares com (5 − nota); soma-se tudo e multiplica-se por 2,5, obtendo 0 a 100 (sem arredondar). A média da amostra é comparada com **68**.

Exemplo: notas 4, 2, 4, 2, 4, 2, 4, 2, 4, 2 resultam em (3+3+3+3+3+3+3+3+3+3) × 2,5 = 75.

Reportar no artigo (seção 4, depois da Tabela 1): número de participantes, média, mínimo e máximo, quantos ficaram acima de 68, tempo médio e taxa de conclusão por tarefa, e os problemas mais citados. **A classificação por faixas** (`classificarSUS`) está marcada como `REVISAR`: antes de usá-la, conferir as faixas na referência citada (SAURO; LEWIS) ou reportar só a média e a comparação com 68.

## 9. Limites a declarar

- Amostra pequena e de conveniência: não permite generalizar.
- Dados fictícios e sessão curta; não mede uso continuado em sala.
- Observação feita pelos próprios autores (possível viés).
- Não mede o efeito do sistema sobre as crises dos alunos.

## 10. Depois da coleta

1. Guardar as fichas e a planilha apenas com os códigos P01, P02, ...; não guardar nome nem contato.
2. Atualizar o artigo (seção 4 e Considerações Finais), o banner e o pitch com os números **reais**; trocar "SUS não aplicado" por "SUS aplicado a N educadores".
3. Atualizar `REQUISITOS_E_REGRAS_DE_NEGOCIO.md` (RNF07), `CRONOGRAMA.md`, `README.md` e `GUIA_DO_DONO.md`.
4. Se alguma conta de teste com perfil Coordenação foi criada, removê-la ou rebaixar o perfil.
