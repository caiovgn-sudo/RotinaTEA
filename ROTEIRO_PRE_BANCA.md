# Roteiro da pré-banca — RotinaTEA (7 minutos)

Apresentadores: Caio (C) e Pedro (P). Meta: 6 min 30 s de fala, 30 s de folga. Slides: `Apresentacao_Pitch_RotinaTEA.pptx`.

## 1. Divisão do tempo

| Min | Slide | Quem | Tempo | O que dizer (ideia central) |
|---|---|---|---|---|
| 0:00 | 1 Capa | C | 0:20 | Nome do projeto, curso, orientadora. "Em 7 minutos: o problema, a solução e o sistema funcionando." |
| 0:20 | 2 O Problema | C | 0:50 | Na inclusão escolar, a rotina visual e o registro de crises são feitos em papel. O PEI precisa de dados e o professor não tem tempo de anotar no meio da crise. Correlatos (Rotina Divertida, Tiimo, SymboTalk) organizam a rotina, mas nenhum liga o registro da crise ao PEI. |
| 1:10 | 3 A Solução | P | 0:50 | Três pilares: prancha visual com temporizador; registro de crise em 1 clique; dados organizados para o PEI. Funciona sem internet e não usa o nome do aluno. |
| 2:00 | 4 Tecnologias | P | 0:45 | React + TypeScript + Vite; PWA com IndexedDB (offline); Supabase com Postgres, Auth e RLS por perfil; Vitest, Vercel e Git. Uma frase por bloco, sem detalhar. |
| 2:45 | 5 e 6 Demonstração | C e P | 2:15 | **Demonstração ao vivo** (roteiro na seção 2). Os slides 5 e 6 são o plano B se o site falhar. |
| 5:00 | 7 Diferenciais e resultados | P | 0:50 | 114 testes automatizados; 3 perfis com RLS; 3 modos de contraste; crise em 1 clique; nenhum nome de aluno armazenado; regras RN01 a RN03. Próximos passos: avaliação SUS com educadores, publicação na Vercel e teste ponta a ponta. |
| 5:50 | 8 Conclusão | C | 0:40 | Contribuição: transforma o registro de crise em dado útil para o PEI, com privacidade (LGPD) e acessibilidade (WCAG 2.1 AA). Agradecer e abrir para perguntas. |
| 6:30 | Folga | | 0:30 | |

Se estourar o tempo, corte primeiro a lista de tecnologias (slide 4) e a segunda metade do slide 7.

## 2. Demonstração ao vivo (2 min 15 s)

Antes de começar: servidor rodando em http://localhost:5173, navegador já aberto na página inicial, zoom em 110% a 125% para a banca enxergar, outras abas fechadas.

1. **Entrada (15 s, C):** Entrar, Demonstração, escolher o perfil **Professor**. Dizer: "É modo de demonstração, com dados fictícios e alunos só por código."
2. **Prancha e rotina (30 s, C):** mostrar a rotina visual do aluno e o temporizador. Frase: "Sem som de alarme e sem excesso de estímulo, de propósito."
3. **Crise em 1 clique (30 s, P):** iniciar o registro de crise e encerrar. Frase: "Um toque inicia, outro encerra; a duração sai dos horários, o professor não digita nada na hora."
4. **Coordenação / PEI (45 s, P):** trocar para o perfil Coordenação, abrir Coordenação / PEI. Mostrar "Padrões observados" (crises por dia, faixa de horário, dia da semana) e o botão do relatório. Frase: "É isso que vai para a reunião do PEI. Com menos de 5 crises o sistema avisa que são poucos dados em vez de apontar padrão."
5. **Contraste (15 s, C):** trocar o modo de contraste. Frase: "Três modos, com o contraste medido por teste automatizado."

Se algo travar: dizer "vou mostrar pelo slide" e ir para o slide 5 ou 6, sem tentar consertar ao vivo.

## 3. Riscos da demonstração

- **Internet:** as figuras dos cartões vêm da API do ARASAAC e as fontes do Google. Teste a rede do local antes; sem rede, algumas imagens podem não aparecer. Os slides 5 e 6 cobrem isso.
- **Servidor local:** o site não está publicado na Vercel. Suba o servidor antes (`npm run dev` em `app`) e abra a página uma vez para o PWA carregar.
- **Fonte Montserrat:** se o computador da banca não tiver a fonte, o PowerPoint troca por outra. Leve o PDF do deck como reserva (Arquivo, Exportar, PDF) ou apresente do seu notebook.
- **Slide final:** o QR Code e o e-mail do Pedro estão pendentes; ou preencha antes, ou não cite o QR em voz alta.

## 4. Perguntas prováveis e respostas honestas

1. **Já foi testado com educadores?** Ainda não. A avaliação de usabilidade (SUS) está implementada e é o próximo passo; não temos nota para apresentar.
2. **A sincronização com a nuvem funciona?** A fila de sincronização está implementada e testada com um dublê do Supabase (17 testes de integração). Falta o teste ponta a ponta com conta real no servidor.
3. **Como protege dados de crianças (LGPD)?** O aluno é identificado só por código anonimizado (RN02), o IP é mascarado, existe termo de consentimento e a coleta é bloqueada se o consentimento for revogado. RLS limita o que cada perfil lê.
4. **E se a internet cair na sala?** O app guarda tudo no IndexedDB e envia depois, em ordem, e só apaga da fila após a confirmação do servidor (RN03).
5. **Qual a diferença para o Tiimo ou o Rotina Divertida?** Eles organizam a rotina; o RotinaTEA liga a rotina ao registro de crise e ao relatório do PEI.
6. **O sistema diagnostica ou prevê crises?** Não. As leituras de padrão são contagens simples, com aviso de poucos dados; a interpretação é da equipe do PEI.
7. **Por que PWA e não app nativo?** Instala sem loja, funciona offline, uma base de código para tablet e celular da escola.
8. **Como garantem a qualidade?** 114 testes automatizados (unitários e de integração), verificação de tipos e testes que medem o contraste real das cores.
9. **O que falta?** Publicação na Vercel, conta real de ponta a ponta, avaliação SUS com educadores e conferir o relatório do PEI impresso em papel.

## 5. Checklist de ensaio

- [ ] Cronometrar duas execuções completas; o alvo é 6:30.
- [ ] Combinar quem troca de slide e quem opera o site.
- [ ] Decorar a frase de abertura e a de fechamento.
- [ ] Servidor no ar, rede testada, PDF do deck no pendrive.
- [ ] Preencher QR Code e e-mail do Pedro, ou aceitar o slide como está.
