# Roteiro da banca final — RotinaTEA (7 minutos)

Apresentadores: Caio (C) e Pedro (P). Meta: 6 min 30 s de fala e 30 s de folga. Slides: `Pitch_Final_RotinaTEA_v11.pptx` (7 slides, com o tempo de cada um nas notas; PDF de reserva). Atualizado em 24/11/2026; substitui o roteiro da pré-banca. **A data da banca não está definida neste repositório** (a orientação pede deixá-la em branco no cronograma).

## 1. Divisão do tempo

| Tempo | Slide | Quem | O que dizer |
|---|---|---|---|
| 0:00–0:15 | 1 Capa | C | Nome, curso, orientadora e a frase de uma linha. Entrar logo no problema. |
| 0:15–1:15 | 2 O problema | C | O professor interrompe a mediação para anotar a crise e o PEI chega à reunião com relatos soltos. Citar a fonte (Silva e Camargo, 2021). **Não citar número de pesquisa própria sobre a dor.** |
| 1:15–2:00 | 3 A solução | P | Prancha e temporizador visual; crise em 1 clique; painel do PEI anonimizado. Falar pelo benefício. |
| 2:00–4:30 | 4 Demonstração | C e P | Ao vivo, no modo Demonstração (seção 2). Plano B: `RotinaTEA Web.mp4` aberto em outra aba. |
| 4:30–5:15 | 5 Tecnologias | P | Uma escolha: dado gravado primeiro no aparelho (IndexedDB) e enviado depois ao Supabase, porque a internet das escolas é instável. |
| 5:15–6:00 | 6 Resultados | P | 114 testes; 11 de 12 requisitos; cerca de 10 ms no botão de crise (medição preliminar); questionário com 22 participantes. **Dizer que o SUS com educadores não foi aplicado.** |
| 6:00–6:30 | 7 Encerramento | C | Retomar o problema em uma frase, agradecer e deixar o slide aberto para as perguntas. |

Se estourar o tempo, corte primeiro a lista de tecnologias e depois a segunda metade dos resultados.

### Números do slide 6 e do questionário (todos rastreáveis)

| Afirmação | Origem |
|---|---|
| 114 testes sem falhas | `npm test` (9 arquivos) |
| 11 de 12 requisitos | `desenvolvimento/REQUISITOS_E_REGRAS_DE_NEGOCIO.md` (RF09 parcial) |
| cerca de 10 ms | seção 5.1 do mesmo documento (computador, modo Demonstração) |
| 22 participantes; 77,3% com nota 4 ou 5 na facilidade; 77,3% sem ajuda; 86,4% recomendariam, os demais "talvez" | `VALIDACAO_PRODUTO.md` |

## 2. Demonstração ao vivo (2 min 30 s)

Antes: servidor rodando (`npm run dev` em `app`, http://localhost:5173), página aberta, zoom de 110% a 125%, outras abas fechadas, `RotinaTEA Web.mp4` pronto.

1. **Entrada (15 s, C):** Entrar, Demonstração, perfil Professor. "Dados fictícios; alunos só por código."
2. **Prancha e temporizador (35 s, C):** rotina do aluno e anel de tempo. "Sem alarme sonoro, de propósito."
3. **Crise em 1 clique (40 s, P):** iniciar e encerrar. "A duração sai dos horários; o professor não digita nada na hora."
4. **Coordenação / PEI (45 s, P):** padrões por dia, faixa de horário e dia da semana; relatório. "Com menos de 5 crises o sistema avisa que são poucos dados."
5. **Contraste (15 s, C):** trocar o modo. "Três modos, medidos por teste automatizado."

Se algo travar, dizer "vou mostrar pelo vídeo" e abrir o vídeo, sem tentar consertar ao vivo.

## 3. Riscos da demonstração

- **Internet:** as figuras vêm da API do ARASAAC e as fontes do Google; sem rede algumas imagens podem faltar. O vídeo cobre isso.
- **Site não publicado:** o sistema roda localmente. O slide 7 já diz que a publicação está em preparação; não afirmar o contrário.
- **Fonte Montserrat:** se o computador não tiver a fonte, o PowerPoint troca por outra. Levar o PDF do pitch.
- **QR Code do slide 7:** leva ao repositório; conferir se abre antes.

## 4. Perguntas prováveis e respostas honestas

1. **Foi testado com educadores?** Ainda não. O SUS está implementado e há um protocolo de aplicação (`PROTOCOLO_AVALIACAO_SUS.md`); não temos nota para apresentar. O questionário de validação teve 22 participantes, só 5 educadores.
2. **O questionário prova que o sistema funciona?** Não. É amostra de conveniência, autodeclarada, e indica aceitação preliminar; não permite generalizar nem afirmar redução de crises.
3. **A nuvem funciona?** A fila de sincronização é idempotente e foi testada com um dublê do Supabase (17 testes de integração). Falta o teste ponta a ponta com conta real.
4. **Como protege dados de crianças (LGPD)?** Aluno só por código anonimizado (RN02), IP mascarado, termo de consentimento revogável com bloqueio de novos registros no aparelho, RLS por perfil. Limitação: sem regra equivalente de revogação no servidor.
5. **E se a internet cair?** Grava no IndexedDB, envia depois em ordem e só tira da fila após a confirmação do servidor (RN03).
6. **Diferença para Tiimo, Rotina Divertida e SymboTalk?** Eles organizam a rotina ou a comunicação; o RotinaTEA liga a rotina ao registro de crise e ao relatório do PEI.
7. **Diagnostica ou prevê crises?** Não. São contagens simples, com aviso quando há menos de 5 crises.
8. **Por que PWA?** Instala sem loja, funciona offline e usa uma base de código para tablet e celular.
9. **O que falta?** SUS com educadores, publicação na Vercel, teste de sincronização com conta real, teste em tablet e com leitor de tela, e o vídeo de demonstração no YouTube.
10. **Por que mudaram de API própria para Supabase?** Para reduzir código e superfície de ataque em um projeto de dois autores; o RLS aplica a separação por perfil (ADR em `ARQUITETURA_ENGENHARIA.md`).

## 5. Checklist de ensaio

- [ ] Cronometrar duas execuções completas; alvo de 6:30.
- [ ] Combinar quem troca de slide e quem opera o site.
- [ ] Servidor no ar, rede testada, PDF do pitch e vídeo no pendrive.
- [ ] Banner (90 × 120 cm) impresso a partir de `Banner_RotinaTEA_v11.pdf`.
- [ ] Ensaiar a resposta sobre os limites da validação (perguntas 1 e 2).
