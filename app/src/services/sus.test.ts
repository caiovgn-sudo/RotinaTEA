import { describe, it, expect } from 'vitest';
import {
  PERGUNTAS_SUS,
  calcularPontuacaoSUS,
  classificarSUS,
  formatarPontuacaoSUS,
  respostasSusValidas,
  resumirSUS,
  resumoDoServidor
} from '../utils/sus';

// Pilar 2 (Qualidade): o cálculo do SUS importa o código real e confere casos conhecidos do instrumento.

const todas = (v: number) => PERGUNTAS_SUS.map(() => v);
// Melhor resposta possível: concorda com os itens positivos e discorda dos negativos
const melhor: number[] = PERGUNTAS_SUS.map((p) => (p.positivo ? 5 : 1));
const pior: number[] = PERGUNTAS_SUS.map((p) => (p.positivo ? 1 : 5));

describe('SUS — pontuação', () => {
  it('tem 10 perguntas, ímpares positivas e pares negativas', () => {
    expect(PERGUNTAS_SUS).toHaveLength(10);
    PERGUNTAS_SUS.forEach((p) => expect(p.positivo).toBe(p.id % 2 === 1));
  });

  it('extremos: 100 no melhor caso e 0 no pior', () => {
    expect(calcularPontuacaoSUS(melhor)).toBe(100);
    expect(calcularPontuacaoSUS(pior)).toBe(0);
  });

  it('todas neutras (3) dá 50', () => {
    expect(calcularPontuacaoSUS(todas(3))).toBe(50);
  });

  it('todas "concordo" (4): positivos valem 3 e negativos valem 1, total 20 x 2,5 = 50', () => {
    expect(calcularPontuacaoSUS(todas(4))).toBe(50);
  });

  it('mantém a casa decimal em vez de arredondar', () => {
    const r = [...melhor];
    r[0] = 4; // perde 1 ponto bruto: 39 x 2,5 = 97,5
    expect(calcularPontuacaoSUS(r)).toBe(97.5);
  });

  it('rejeita respostas incompletas, fora da escala ou não inteiras', () => {
    expect(() => calcularPontuacaoSUS([1, 2, 3])).toThrow();
    expect(() => calcularPontuacaoSUS([...melhor.slice(0, 9), 6])).toThrow();
    expect(() => calcularPontuacaoSUS([...melhor.slice(0, 9), 0])).toThrow();
    expect(respostasSusValidas([...melhor.slice(0, 9), 2.5])).toBe(false);
    expect(respostasSusValidas(melhor)).toBe(true);
  });
});

describe('SUS — classificação e formatação', () => {
  it('usa a média de referência 68 como divisa', () => {
    expect(classificarSUS(67.5)).toMatch(/Regular/);
    expect(classificarSUS(68)).toMatch(/Boa/);
    expect(classificarSUS(80.3)).toMatch(/Excelente/);
    expect(classificarSUS(50)).toMatch(/Ruim/);
  });

  it('formata com vírgula só quando há fração', () => {
    expect(formatarPontuacaoSUS(77.5)).toBe('77,5');
    expect(formatarPontuacaoSUS(80)).toBe('80');
  });
});

describe('SUS — resumo das avaliações', () => {
  const ava = (r: number[]) => ({ respostas: r });

  it('sem avaliações, devolve zeros e nenhum detalhe por pergunta', () => {
    expect(resumirSUS([])).toEqual({ total: 0, media: 0, minimo: 0, maximo: 0, acimaDaMeta: 0, mediaPorItem: null });
  });

  it('calcula média, extremos e quantas atingiram a meta de 68', () => {
    const r = resumirSUS([ava(melhor), ava(pior)]);
    expect(r).toMatchObject({ total: 2, media: 50, minimo: 0, maximo: 100, acimaDaMeta: 1 });
  });

  it('só mostra a média por pergunta com 3 ou mais avaliações', () => {
    expect(resumirSUS([ava(melhor), ava(melhor)]).mediaPorItem).toBeNull();
    const r = resumirSUS([ava(melhor), ava(melhor), ava(pior)]);
    expect(r.mediaPorItem).toHaveLength(10);
    expect(r.mediaPorItem![0]).toBeCloseTo((5 + 5 + 1) / 3, 2);
  });

  it('ignora avaliações inválidas em vez de quebrar', () => {
    expect(resumirSUS([ava([1, 2]), ava(melhor)]).total).toBe(1);
  });

  it('converte a resposta do servidor e rejeita formato inesperado', () => {
    const ok = resumoDoServidor({ total: 3, media: 72.5, minimo: 60, maximo: 85, acima_meta: 2, media_por_item: [4, 2, 4, 2, 4, 2, 4, 2, 4, 2] });
    expect(ok).toMatchObject({ total: 3, media: 72.5, acimaDaMeta: 2 });
    expect(ok!.mediaPorItem).toHaveLength(10);
    expect(resumoDoServidor({ total: 1, media: 70, minimo: 70, maximo: 70, acima_meta: 1, media_por_item: null })!.mediaPorItem).toBeNull();
    expect(resumoDoServidor(null)).toBeNull();
    expect(resumoDoServidor({ total: 'x' })).toBeNull();
  });
});
