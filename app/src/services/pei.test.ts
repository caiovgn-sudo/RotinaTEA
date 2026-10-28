import { describe, it, expect } from 'vitest';
import {
  resumirCrises,
  crisesPorDia,
  crisesPorFaixaHoraria,
  crisesPorDiaSemana,
  gerarInsights,
  MINIMO_PARA_PADRAO
} from '../utils/pei';
import type { RegistroCrise } from '../types';

// Pilar 2 (Qualidade): as agregações do relatório do PEI importam o código real.
// As datas usam componentes locais (ano, mês, dia, hora) para o teste não depender do fuso.

const HOJE = new Date(2026, 9, 28, 12, 0); // quarta-feira, 28/10/2026

function crise(dia: number, hora: number, segundos = 120, encerrada = true, mes = 9): RegistroCrise {
  const ini = new Date(2026, mes, dia, hora, 0);
  return {
    id: 'c-' + mes + '-' + dia + '-' + hora + '-' + segundos,
    estudanteId: 'e1',
    professorId: 'p1',
    dataHoraInicio: ini.toISOString(),
    dataHoraFim: encerrada ? new Date(ini.getTime() + segundos * 1000).toISOString() : null,
    duracaoSegundos: segundos,
    sincronizadoOffline: false,
    criadoEmLocal: ini.toISOString()
  };
}

describe('Resumo das crises', () => {
  it('lista vazia resulta em zeros, sem dividir por zero', () => {
    expect(resumirCrises([])).toEqual({ total: 0, mediaSegundos: 0, maximoSegundos: 0, totalSegundos: 0 });
  });

  it('calcula média, máximo e total só com crises encerradas (RN01)', () => {
    const r = resumirCrises([crise(27, 9, 100), crise(26, 10, 200), crise(25, 11, 999, false)]);
    expect(r).toEqual({ total: 2, mediaSegundos: 150, maximoSegundos: 200, totalSegundos: 300 });
  });
});

describe('Crises por dia', () => {
  it('devolve 14 dias, do mais antigo ao de hoje, incluindo dias sem crise', () => {
    const pontos = crisesPorDia([crise(28, 9), crise(28, 14), crise(27, 9)], HOJE);
    expect(pontos).toHaveLength(14);
    expect(pontos[13]).toEqual({ rotulo: '28/10', valor: 2 });
    expect(pontos[12]).toEqual({ rotulo: '27/10', valor: 1 });
    expect(pontos[0].rotulo).toBe('15/10');
    expect(pontos[0].valor).toBe(0);
  });

  it('atravessa a virada de mês e ignora crises fora da janela', () => {
    const pontos = crisesPorDia([crise(2, 9, 120, true, 9), crise(5, 9, 120, true, 8)], new Date(2026, 10, 3));
    expect(pontos[0].rotulo).toBe('21/10');
    expect(pontos[pontos.length - 1].rotulo).toBe('03/11');
    expect(pontos.reduce((a, p) => a + p.valor, 0)).toBe(0);
  });
});

describe('Crises por faixa horária e por dia da semana', () => {
  it('distribui pelas faixas e respeita os limites (9h entra na faixa de 9h às 11h)', () => {
    const p = crisesPorFaixaHoraria([crise(27, 8), crise(27, 9), crise(27, 10), crise(27, 11), crise(27, 14), crise(27, 16)]);
    expect(p.map((x) => x.valor)).toEqual([1, 2, 1, 1, 1]);
    expect(p[1].rotulo).toBe('9h às 11h');
  });

  it('começa a semana na segunda e coloca o domingo por último', () => {
    // 26/10/2026 é segunda-feira e 25/10/2026 é domingo
    const p = crisesPorDiaSemana([crise(26, 9), crise(25, 9), crise(25, 10)]);
    expect(p[0]).toEqual({ rotulo: 'Seg', valor: 1 });
    expect(p[6]).toEqual({ rotulo: 'Dom', valor: 2 });
  });
});

describe('Insights do painel', () => {
  it('sem crises, avisa em vez de inventar padrão', () => {
    const f = gerarInsights([], HOJE);
    expect(f).toHaveLength(1);
    expect(f[0]).toMatch(/Ainda não há/);
  });

  it('com poucos registros, diz que são poucos e não aponta padrão', () => {
    const f = gerarInsights([crise(27, 9), crise(26, 9)], HOJE);
    expect(f).toHaveLength(1);
    expect(f[0]).toMatch(/pouco/);
    expect(MINIMO_PARA_PADRAO).toBe(5);
  });

  it('crise em andamento não conta para o mínimo', () => {
    const lista = [crise(27, 9), crise(26, 9), crise(25, 9), crise(24, 9), crise(23, 9, 120, false)];
    expect(gerarInsights(lista, HOJE)[0]).toMatch(/pouco/);
  });

  it('com dados suficientes, aponta a faixa, o dia da semana, a tendência e a duração', () => {
    const lista = [
      crise(28, 9, 100), crise(27, 10, 200), crise(26, 9, 300), // últimos 7 dias: 3 crises
      crise(21, 9, 60), crise(20, 14, 60) // 7 dias anteriores, 2 crises
    ];
    const f = gerarInsights(lista, HOJE);
    expect(f.join(' ')).toMatch(/"9h às 11h" \(4 de 5 episódios\)/);
    expect(f.join(' ')).toMatch(/3 crises, contra 2 nos 7 dias anteriores \(aumento\)/);
    expect(f.join(' ')).toMatch(/duração média é de/);
  });

  it('empate entre faixas é dito como empate, sem escolher uma por acaso', () => {
    const lista = [crise(27, 8), crise(26, 8), crise(25, 14), crise(24, 14), crise(23, 17)];
    const f = gerarInsights(lista, HOJE).join(' ');
    expect(f).toMatch(/empate entre as faixas "Antes das 9h" e "13h às 15h"/);
  });

  it('indica redução quando a semana recente tem menos crises', () => {
    const lista = [crise(28, 9), crise(21, 9), crise(20, 9), crise(19, 10), crise(18, 10)];
    expect(gerarInsights(lista, HOJE).join(' ')).toMatch(/\(redução\)/);
  });
});
