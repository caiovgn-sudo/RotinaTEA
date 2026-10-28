import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Pilar 1 (Engenharia): protege a configuração de publicação (Vercel + variáveis de ambiente) contra descuido.

const ler = (caminho: string) => readFileSync(new URL(caminho, import.meta.url), 'utf8');

describe('Variáveis de ambiente', () => {
  const exemplo = ler('../../.env.example');
  const usadas = [
    ler('../components/FormularioSUS.tsx'),
    ler('../context/AuthContext.tsx'),
    ler('./supabase.ts')
  ]
    .flatMap((codigo) => [...codigo.matchAll(/import\.meta\.env\.(VITE_[A-Z_]+)/g)].map((m) => m[1]));

  it('todas as variáveis VITE_ usadas no código constam no .env.example', () => {
    expect(usadas.length).toBeGreaterThanOrEqual(4);
    for (const nome of new Set(usadas)) {
      expect(exemplo, nome + ' falta no .env.example').toMatch(new RegExp('^' + nome + '=', 'm'));
    }
  });

  it('o .env.example não traz chave ou endereço reais do Supabase', () => {
    expect(exemplo).toMatch(/VITE_SUPABASE_URL=https:\/\/<seu-projeto>\.supabase\.co/);
    expect(exemplo).toMatch(/VITE_SUPABASE_ANON_KEY=<sua-chave-anonima-publica>/);
    expect(exemplo).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}/);
  });

  it('os atalhos de teste do SUS vêm desligados por padrão', () => {
    expect(exemplo).toMatch(/^VITE_SUS_ATALHOS_TESTE=false/m);
  });
});

describe('vercel.json', () => {
  const config = JSON.parse(ler('../../vercel.json')) as {
    rewrites: { source: string; destination: string }[];
    headers: { source: string; headers: { key: string; value: string }[] }[];
  };
  const valor = (fonte: string, chave: string) =>
    config.headers.find((h) => h.source === fonte)?.headers.find((h) => h.key === chave)?.value;

  it('devolve o index.html para as rotas do aplicativo de página única', () => {
    expect(config.rewrites).toContainEqual({ source: '/(.*)', destination: '/index.html' });
  });

  it('o service worker nunca fica em cache longo, para as atualizações chegarem', () => {
    expect(valor('/sw.js', 'Cache-Control')).toMatch(/max-age=0/);
  });

  it('os arquivos com hash em /assets têm cache longo e imutável', () => {
    expect(valor('/assets/(.*)', 'Cache-Control')).toMatch(/immutable/);
  });

  it('mantém os cabeçalhos de segurança básicos', () => {
    expect(valor('/(.*)', 'X-Content-Type-Options')).toBe('nosniff');
    expect(valor('/(.*)', 'X-Frame-Options')).toBe('DENY');
    expect(valor('/(.*)', 'Referrer-Policy')).toBeTruthy();
  });
});
