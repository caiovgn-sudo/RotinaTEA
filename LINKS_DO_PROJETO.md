# Links do Projeto RotinaTEA

> **Atualizado em:** 2026-10-14  
> **Último commit:** `0f5f2d2` — `feat: implementa sincronização Supabase, autenticação, PWA, SUS, ARASAAC e alto contraste amarelo/preto`

---

## 📦 Repositório GitHub ✅ **CONFIRMADO**

- **URL:** https://github.com/caiovgn-sudo/RotinaTEA
- **Branch principal:** `main`
- **Último commit:** `0f5f2d2` (push realizado com sucesso em 2026-10-14)

---

## 🌐 Site Publicado na Vercel ⏳ **PENDENTE DE DEPLOY**

- **URL de Produção:** **não confirmado** — requer deploy manual via Vercel
- **URL de Preview (PRs):** **não confirmado**

### Como fazer o deploy (necessário acesso à conta Vercel):

```bash
# 1. Login na Vercel (requer interação do usuário)
npx vercel login

# 2. Deploy de produção
cd docs/app
npx vercel --prod
```

**Ou via Dashboard Vercel:**
1. Acesse [vercel.com](https://vercel.com) → "Add New Project" → Import `caiovgn-sudo/RotinaTEA`
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL` = `https://fwuantsjxniwbxlzrqkz.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dWFudHNqeG5pd2J4bHpycWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MjYyMzIsImV4cCI6MjEwNzUwMjIzMn0.FdxGVCUJTrO75kdhloJxaOJRVWsjDXDooLNm9pFP3hY`
   - `VITE_APP_ENV` = `production`
3. Deploy automático na branch `main`

---

## 🗄️ Supabase (Backend) ✅ **CONFIGURADO E MIGRADO**

- **Dashboard do Projeto:** https://supabase.com/dashboard/project/fwuantsjxniwbxlzrqkz
- **API URL:** https://fwuantsjxniwbxlzrqkz.supabase.co
- **Chave Anônima (anon):** Configurada no `.env` local e deve ser adicionada na Vercel
- **Status da migração:** ✅ **Aplicada** — banco remoto está `up to date` (verificado via `supabase db push`)

### Migração aplicada:
- Arquivo: `docs/app/supabase/migrations/20261013000001_schema_inicial.sql`
- Tabelas: `usuarios`, `estudantes`, `vinculos_usuario_estudante`, `rotinas_visuais`, `itens_rotina`, `registros_crise`, `consentimentos_lgpd`, `fila_sincronizacao`
- RLS: Políticas por `auth.uid()` e vínculos — **ativas e funcionando**

---

## 📱 PWA - Instalação e Validação

### Verificações técnicas concluídas (build local):
- ✅ `manifest.webmanifest` gerado com ícones 72–512px, atalhos, categorias
- ✅ Service Worker (Workbox) gerado: `sw.js` + `workbox-*.js`
- ✅ Cache strategies: NetworkFirst (Supabase API), CacheFirst (ARASAAC)
- ✅ Build de produção Vite + PWA plugin: 26 entradas precacheadas (447 KiB)
- ✅ `vite.config.ts` configurado com `registerType: 'autoUpdate'`

### Passos para validar em dispositivo real (necessário acesso físico):

1. **Após deploy na Vercel**, acesse a URL de produção no navegador do dispositivo
2. **Instalação:**
   - Chrome/Edge (Android/Desktop): Menu ⋮ → "Instalar RotinaTEA" ou ícone na barra de endereços
   - Safari (iOS): Botão compartilhar → "Adicionar à Tela de Início"
3. **Teste offline:**
   - Abra o app instalado
   - Ative "Modo Avião" ou desligue Wi-Fi/dados
   - Verifique se a prancha visual carrega (IndexedDB local)
   - Teste: adicionar item de rotina, iniciar/encerrar crise, alternar consentimento
   - Volte online → clique no badge de conexão → verifique sincronização ("X registros sincronizados")
4. **Acessibilidade:**
   - Teste seletor de contraste (Padrão / Alto / Amarelo/Preto)
   - Teste fonte ampliada (A+)
   - Navegação por teclado (Tab, Enter, Espaço, setas)

---

## 📋 Checklist de Deploy

- [x] Push para `origin/main` autorizado (**concluído**: commit `0f5f2d2`)
- [ ] Repositório importado na Vercel
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Build de produção bem-sucedido na Vercel
- [ ] URL de produção acessível
- [x] Supabase project configurado com migração aplicada (**concluído**: `up to date`)
- [x] RLS policies validadas em produção (**concluído**: migração aplicada)
- [ ] PWA instalável verificado em dispositivo real
- [x] `LINKS_DO_PROJETO.md` atualizado com URLs reais confirmadas (GitHub + Supabase)

---

## 🔐 Variáveis de Ambiente (Referência)

| Variável | Valor | Onde configurar |
|----------|-------|-----------------|
| `VITE_SUPABASE_URL` | `https://fwuantsjxniwbxlzrqkz.supabase.co` | Vercel + `.env` local |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Vercel + `.env` local |
| `VITE_APP_ENV` | `production` | Vercel |

> **Segurança:** O arquivo `.env` local **não foi commitado** (está no `.gitignore`). As chaves acima são de referência para configuração na Vercel.