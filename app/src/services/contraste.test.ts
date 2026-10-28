import { describe, it, expect } from 'vitest';
import { razaoContraste, hexParaRgb, lerTokens } from '../utils/contraste';
import { readFileSync } from 'node:fs';

// Pilar 2 (Qualidade): a paleta real (src/index.css) precisa manter contraste >= 4,5:1 (WCAG 2.1 AA)
// nos três modos, para cada combinação de texto e fundo que a interface usa.

const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

const claro = lerTokens(css, [':root']);
const altoContraste = { ...claro, ...lerTokens(css, ['body.high-contrast']) };
// Amarelo/Preto tem prioridade sobre o alto contraste padrão quando ambos estão ativos
const amareloPreto = {
  ...altoContraste,
  ...lerTokens(css, ['body.high-contrast-yellow', 'body.high-contrast-yellow.high-contrast'])
};

const MODOS: Record<string, Record<string, string>> = {
  'Padrão': claro,
  'Alto Contraste': altoContraste,
  'Amarelo/Preto': amareloPreto
};

const cor = (t: Record<string, string>, nome: string): string => {
  const v = t[nome];
  if (!v || !hexParaRgb(v)) throw new Error('Token ' + nome + ' ausente ou não hexadecimal: ' + v);
  return v;
};

const TEXTOS = ['--text-main', '--text-muted', '--text-subtle', '--primary-text', '--success-text', '--crisis-text', '--warning-text'];
const SUPERFICIES = ['--bg-app', '--bg-surface', '--primary-light', '--success-light', '--crisis-light', '--warning-light'];
const PREENCHIMENTOS = ['--primary', '--success-fill', '--crisis-fill', '--success-hover', '--crisis-hover'];

describe('Contraste da paleta (WCAG 2.1 AA, mínimo 4,5:1)', () => {
  for (const [modo, tokens] of Object.entries(MODOS)) {
    describe(modo, () => {
      it('textos sobre as superfícies do modo', () => {
        const falhas: string[] = [];
        for (const t of TEXTOS) {
          for (const s of SUPERFICIES) {
            const r = razaoContraste(cor(tokens, t), cor(tokens, s));
            if (r < 4.5) falhas.push(t + ' sobre ' + s + ' = ' + r.toFixed(2));
          }
        }
        expect(falhas).toEqual([]);
      });

      it('texto sobre preenchimentos sólidos (botões e selos)', () => {
        const falhas: string[] = [];
        for (const p of PREENCHIMENTOS) {
          const r = razaoContraste(cor(tokens, '--on-fill'), cor(tokens, p));
          if (r < 4.5) falhas.push('--on-fill sobre ' + p + ' = ' + r.toFixed(2));
        }
        expect(falhas).toEqual([]);
      });

      it('texto invertido do botão de crise parado (fundo da página sobre texto principal)', () => {
        const r = razaoContraste(cor(tokens, '--bg-surface'), cor(tokens, '--text-main'));
        expect(r).toBeGreaterThanOrEqual(4.5);
      });
    });
  }
});

describe('Utilitário de contraste', () => {
  it('calcula os extremos e aceita hexadecimal curto', () => {
    expect(razaoContraste('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(razaoContraste('#FFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('rejeita cor inválida', () => {
    expect(hexParaRgb('azul')).toBeNull();
    expect(() => razaoContraste('azul', '#000000')).toThrow();
  });
});
