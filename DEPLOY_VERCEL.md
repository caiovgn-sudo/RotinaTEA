# Publicação na Vercel e teste de ponta a ponta com conta real

Este roteiro serve a dois objetivos: **publicar** o RotinaTEA (Pilar 1, Engenharia) e **provar a sincronização
com a nuvem** com uma conta real (RF09). Nada aqui foi executado em uma conta Vercel pela equipe de desenvolvimento
do código: a configuração está pronta e testada localmente (`configuracao.test.ts` e `npm run build`), mas a
publicação e a conferência final dependem do acesso de vocês à Vercel e ao Supabase.

## 1. Migrações do banco (ordem)

Todas estão em `app/supabase/migrations/` (e em cópia em `supabase/migrations/`). Rode no **SQL Editor** do
Supabase, uma por vez, na ordem:

| # | Arquivo | O que faz | Situação |
|---|---|---|---|
| 1 | `20261013000001_schema_inicial.sql` | Tabelas, RLS inicial | Aplicada |
| 2 | `20261026000001_ajustes_auth_rls.sql` | Integra `usuarios` ao Supabase Auth | Aplicada |
| 3 | `20261028000001_endurece_perfis.sql` | Perfil fixo no servidor | Aplicada |
| 4 | `20261028000002_restringe_crises.sql` | Gravação de crises só por professor e coordenação | Aplicada (4 políticas confirmadas) |
| 5 | `20261028000003_respostas_sus.sql` | Tabela das respostas do SUS | Aplicada (2 políticas confirmadas) |
| 6 | `20261029000001_resumo_sus.sql` | Função `resumo_sus()` (só agregados, só Coordenação) | Aplicada (função confirmada no servidor em 29/10/2026) |
| 7 | `20261029000002_dados_exemplo_remotos.sql` | Estudantes, rotina e cartões de exemplo no servidor | Aplicada (função confirmada no servidor em 29/10/2026) |

Conferência da 6 e da 7, em consultas separadas:

```sql
select proname from pg_proc where proname in ('resumo_sus', 'vincular_conta_aos_exemplos');
select codigo_anonimizado from estudantes order by 1;
```

Esperado: 2 funções e os códigos `ALN-4412` e `ALN-8921`.

## 2. Trocar a chave pública do Supabase

A chave anônima do projeto já apareceu no histórico do repositório. Ela é pública por definição (quem protege os
dados é o RLS), mas o correto é substituí-la:

1. No painel do Supabase, abra **Project Settings → API** (ou **API Keys**).
2. Gere uma nova chave pública (anon ou publishable) e **desative a antiga**. O nome dos botões varia conforme a versão do painel.
3. Use a nova chave em `app/.env` (desenvolvimento) e na Vercel (passo 3).

Não troque o segredo JWT do projeto sem necessidade: isso derruba as sessões e invalida outras chaves.

## 3. Projeto na Vercel

1. **Add New → Project** e importe o repositório do GitHub.
2. **Root Directory:** `app` (o repositório tem a raiz em `docs`, e o aplicativo fica na subpasta `app`).
3. O `vercel.json` já define o build (`npm run build`), a saída (`dist`), o redirecionamento das rotas para o `index.html`,
   o cache longo de `/assets`, o `sw.js` sem cache longo (para as atualizações do PWA chegarem) e os cabeçalhos de segurança.
4. **Environment Variables** (Production):

| Variável | Valor |
|---|---|
| `VITE_SUPABASE_URL` | endereço do projeto, `https://<projeto>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | a nova chave pública do passo 2 |
| `VITE_MODO_DEMO` | `false` |
| `VITE_SUS_ATALHOS_TESTE` | `false` |
| `VITE_APP_ENV` | `production` |

5. No Supabase, em **Authentication → URL Configuration**, ponha o endereço da Vercel em **Site URL** e em **Redirect URLs**.
   Sem isso, o link do e-mail de confirmação não leva ao site publicado.

### O que muda com `VITE_MODO_DEMO=false`
- O botão de demonstração e o simulador de conexão somem; só entram contas reais.
- Quem não está logado vê apenas a prancha do aluno, com a explicação do motivo nas demais telas.
- Os dados de exemplo continuam existindo no aparelho (IndexedDB) e agora também no servidor (migração 7).

## 4. Roteiro de teste de ponta a ponta (conta real)

Faça no site publicado (ou em `npm run dev` com o `.env` real e `VITE_MODO_DEMO=false`).

1. **Criar a conta** de teste na aba de cadastro (use um e-mail seu, com `+teste`). Ela nasce como **Responsável**. Confirme o e-mail, se o Supabase pedir.
2. **Promover e vincular** (SQL Editor, trocando o e-mail):
   ```sql
   update public.usuarios set perfil = 'COORDENACAO' where email = 'voce+teste@gmail.com';
   select public.vincular_conta_aos_exemplos('voce+teste@gmail.com');   -- deve devolver 2
   ```
   Para testar como professor, use `'PROFESSOR'` no lugar de `'COORDENACAO'`.
3. **Sair e entrar de novo** (o perfil é lido no login).
4. **Crise (RF09):** como Professor, inicie e encerre uma crise. Na tela, o selo da crise deve passar de "Só neste aparelho" para "Enviada". No SQL Editor:
   ```sql
   select id, estudante_id, professor_id, duracao_segundos, sincronizado_offline
   from public.registros_crise order by recebido_em desc limit 3;
   ```
5. **Sem internet:** ligue o modo avião, registre outra crise e confira o selo e o painel de sincronização; ao voltar a rede, o item deve ser enviado sozinho.
6. **SUS:** na Coordenação, responda o formulário. A mensagem deve dizer que foi enviada ao servidor. A tela **Resultados da avaliação de usabilidade** mostra o bloco "No servidor". Conferência:
   ```sql
   select perfil_avaliador, pontuacao, recebido_em from public.respostas_sus order by recebido_em desc limit 3;
   ```
7. **Consentimento:** como Responsável, revogue e reative. A linha em `consentimentos_lgpd` deve ter `responsavel_id` igual ao id da sua conta.
8. **Limpeza dos dados de teste**, antes da coleta oficial do SUS:
   ```sql
   delete from public.respostas_sus where avaliador_id = (select id from public.usuarios where email = 'voce+teste@gmail.com');
   delete from public.registros_crise where professor_id = (select id from public.usuarios where email = 'voce+teste@gmail.com');
   ```

## 5. O que este roteiro não cobre
- A **configuração do CSP** (política de conteúdo) não foi incluída: o aplicativo usa fontes do Google e pictogramas da API do ARASAAC, e uma política errada quebraria a tela sem que eu pudesse testá-la na Vercel. Fica como melhoria futura, de preferência primeiro em modo "somente relatório".
- A **sessão encerrada pelo servidor** e a **sincronização com conta real** estão implementadas e cobertas por testes com um dublê do Supabase, mas só este roteiro as exercita de verdade.
- O **consentimento** continua sendo gravado do aparelho para o servidor; a leitura do consentimento do servidor ao entrar em outro aparelho não existe ainda.
