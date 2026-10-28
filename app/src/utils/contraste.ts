/**
 * Cálculo de contraste WCAG 2.1 (sem dependência de navegador).
 * Pilar 2 (Qualidade): permite testar automaticamente a paleta de cores do sistema.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Converte "#RGB" ou "#RRGGBB" em componentes; retorna null para valores que não são hexadecimais. */
export function hexParaRgb(hex: string): Rgb | null {
  const m = hex.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

/** Luminância relativa (WCAG 2.1, 1.4.3). */
export function luminancia({ r, g, b }: Rgb): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** Razão de contraste entre duas cores hexadecimais (1 a 21). */
export function razaoContraste(hexA: string, hexB: string): number {
  const a = hexParaRgb(hexA);
  const b = hexParaRgb(hexB);
  if (!a || !b) throw new Error('Cor inválida: ' + hexA + ' / ' + hexB);
  const l1 = luminancia(a);
  const l2 = luminancia(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Lê as variáveis CSS declaradas em blocos simples cujo seletor é exatamente um dos informados. */
export function lerTokens(css: string, seletores: string[]): Record<string, string> {
  const tokens: Record<string, string> = {};
  const blocos = css.matchAll(/([^{}]+)\{([^{}]*)\}/g);
  for (const [, sel, corpo] of blocos) {
    const lista = sel
      .split(',')
      .map((s) => s.trim().split('\n').pop()!.trim())
      .filter(Boolean);
    if (!lista.some((s) => seletores.includes(s))) continue;
    for (const [, nome, valor] of corpo.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      tokens[nome] = valor.replace(/\/\*.*?\*\//g, '').trim();
    }
  }
  return tokens;
}
