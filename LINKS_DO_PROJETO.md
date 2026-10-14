# Links do Projeto RotinaTEA

> **Nota:** Os links abaixo estão marcados como "não confirmado" pois o deploy em produção e push para o GitHub remoto requerem credenciais e autorização manual que não foram executadas neste ambiente de desenvolvimento.

---

## 📦 Repositório GitHub

- **URL:** `https://github.com/<seu-usuario>/RotinaTEA` — **não confirmado**
- **Branch principal:** `main`
- **Último commit local:** Pendente de push autorizado

### Como confirmar:
```bash
# No diretório do projeto (docs/app)
git add .
git commit -m "feat: implementa sincronização Supabase, autenticação, PWA, SUS, ARASAAC e alto contraste amarelo/preto"
git push origin main
```

---

## 🌐 Site Publicado na Vercel

- **URL de Produção:** `https://rotinatea.vercel.app` — **não confirmado**
- **URL de Preview (PRs):** `https://rotinatea-git-main-<usuario>.vercel.app` — **não confirmado**

### Como confirmar:
1. Acesse [vercel.com](https://vercel.com) e importe o repositório GitHub
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL` = `https://<seu-projeto>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `<sua-chave-anonima>`
   - `VITE_APP_ENV` = `production`
3. Deploy automático na branch `main`

---

## 🗄️ Supabase (Backend)

- **Dashboard do Projeto:** `https://supabase.com/dashboard/project/<project-ref>` — **não confirmado**
- **API URL:** `https://<project-ref>.supabase.co` — **não confirmado**
- **Chave Anônima (anon):** Configurada nas variáveis de ambiente da Vercel — **não confirmado**

### Migração aplicada:
- Arquivo: `docs/app/supabase/migrations/20261013000001_schema_inicial.sql`
- Tabelas: `usuarios`, `estudantes`, `vinculos_usuario_estudante`, `rotinas_visuais`, `itens_rotina`, `registros_crise`, `consentimentos_lgpd`, `fila_sincronizacao`
- RLS: Políticas por `auth.uid()` e vínculos

---

## 📱 PWA - Instalação

Após o deploy na Vercel, o app pode ser instalado como PWA:

1. Acesse a URL no Chrome/Edge (desktop) ou Safari/Chrome (mobile)
2. Clique no ícone de instalação na barra de endereços ou no menu ⋮ → "Instalar RotinaTEA"
3. Funciona 100% offline após primeira carga (Service Worker + IndexedDB)

---

## 📋 Checklist de Deploy

- [ ] Push para `origin/main` autorizado
- [ ] Repositório importado na Vercel
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Build de produção bem-sucedido na Vercel
- [ ] URL de produção acessível
- [ ] Supabase project configurado com migração aplicada
- [ ] RLS policies validadas em produção
- [ ] PWA instalável verificado em dispositivo real
- [ ] `LINKS_DO_PROJETO.md` atualizado com URLs reais confirmadas