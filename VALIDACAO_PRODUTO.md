# Validação do Produto com Usuários — RotinaTEA

> **Pilares atendidos:** 2 (qualidade e evidência de teste) e 3 (governança de dados: formulário anônimo, sem nome nem contato). Última atualização: 24/11/2026.

## 1. O que foi feito

Questionário eletrônico (Google Forms) respondido de forma **voluntária e anônima**, após o uso do RotinaTEA. Há três perguntas de perfil e **7 perguntas de validação**, conforme o modelo indicado pela orientação da disciplina. O formulário não pede nome, e-mail nem outro contato; sexo e faixa etária são opcionais e servem apenas para descrever o grupo.

- **Respostas válidas:** 22 (meta mínima: 20).
- **Período:** novembro de 2026.
- **Amostra:** de conveniência (pessoas acessíveis à equipe).
- **Dados do sistema usados nos testes:** fictícios.

## 2. Resultados (n = 22)

| Pergunta | Resultado |
|---|---|
| Perfil | Responsável por pessoa com TEA 8 (36,4%); educador ou profissional da educação 5 (22,7%); adulto no espectro 3 (13,6%); outra área 3 (13,6%); outro 3 (13,6%) |
| Sexo (opcional) | Masculino 16 (72,7%); feminino 6 (27,3%) |
| Faixa etária (opcional) | Até 20 anos 4 (18,2%); 21 a 30 anos 14 (63,6%); 31 a 40 anos 3 (13,6%); 41 a 50 anos 1 (4,5%) |
| Versão testada | Site 14 (63,6%); aplicativo 2 (9,1%); os dois 6 (27,3%) |
| Foi fácil usar? (1 a 5) | Média 4,32; nota 5: 15; nota 4: 2; nota 3: 3; nota 2: 1; nota 1: 1 (77,3% com nota 4 ou 5) |
| Fez o que queria sem ajuda? | Sem ajuda 17 (77,3%); com ajuda 5 (22,7%); não conseguiu 0 |
| Atendeu às expectativas? | Superou 10 (45,5%); atendeu bem 12 (54,5%); em parte ou não 0 |
| Funcionou bem no dispositivo? (1 a 5) | Média 4,86; nota 5: 19 (86,4%); nota 4: 3 (13,6%) |
| Recomendaria? | Sim 19 (86,4%); talvez 3 (13,6%); não 0 |

### Pergunta aberta: "O que podemos melhorar?" (17 respostas)

Classificação feita pelos autores; uma resposta pode ter mais de uma sugestão.

| Tema | Respostas |
|---|---|
| Sem sugestão ("nada", "perfeito" e equivalentes) | 4 |
| Remete a formulário anterior, sem conteúdo novo | 1 |
| Aparência da interface (layout, letras maiores, mais cores) | 5 |
| Mais figuras, mais categorias, uso de fotos do aluno | 3 |
| Mais opções de personalização | 1 |
| Tutorial de uso | 1 |
| Uso em mais de um aparelho ao mesmo tempo | 1 |
| Etiquetas rápidas de observação e leitura em voz alta dos cartões | 1 |

**Cautelas para o backlog:** leitura em voz alta deve ser opcional e testada com famílias e educadores (o projeto evita alarmes sonoros, RF02); uso em vários aparelhos depende do teste de sincronização com conta real; fotos do aluno conflitam com a anonimização na origem (RN02) e exigem análise sob a LGPD.

## 3. Limites (o que estes dados não provam)

1. Amostra de conveniência de 22 pessoas, com perfil autodeclarado e não verificado.
2. Só 5 participantes eram educadores e 3 eram adultos no espectro; o formulário não tinha categoria para estudantes.
3. 20 de 22 usaram o site; só 2 usaram apenas o aplicativo, então a instalação como PWA foi pouco avaliada.
4. Respostas autodeclaradas, sem observação das tarefas e sem medição de tempo ou de cliques.
5. **O SUS não foi aplicado.** Este questionário não substitui a avaliação de usabilidade com educadores.
6. Os resultados indicam **aceitação preliminar**. Não permitem generalizar nem afirmar que o sistema reduz as crises dos alunos.

## 4. Histórico e correção de dados

- Documentos anteriores citavam "46 respostas (20 educadores, 15 responsáveis e 11 adultos do espectro)", "85% dos professores registram crises de forma manual" e "92% dos responsáveis consideram útil a notificação digital". Esses números **não puderam ser comprovados** com os arquivos disponíveis e foram **retirados** do artigo, do banner, do pitch e do cronograma em 24/11/2026.
- Uma versão anterior do formulário (sem perguntas de perfil) foi encerrada com 19 respostas e **não entra** nesta análise.
- A pesquisa "Pesquisa: RotinaTEA" da pasta Entrega Parcial do Drive tem apenas 4 respostas e não é usada.

## 5. Como reproduzir os números

As respostas estão na aba "Respostas" do formulário de validação (Google Forms, conta da equipe). Os percentuais usam 22 como base e foram arredondados a uma casa decimal. As médias são: facilidade de uso (1×1 + 2×1 + 3×3 + 4×2 + 5×15) ÷ 22 = 4,32; funcionamento (4×3 + 5×19) ÷ 22 = 4,86.
