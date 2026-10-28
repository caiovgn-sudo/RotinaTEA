/**
 * Agregações do relatório do PEI e dos "insights" do painel (sem dependência de navegador).
 * Pilar 1 (Engenharia): lógica separada da interface. Pilar 3 (Governança): só dados agregados (RN05).
 * Só entram crises encerradas, pois uma crise em andamento ainda não tem duração (RN01).
 */
import type { RegistroCrise } from '../types';
import { formatarTempo } from './tempo';

export interface PontoGrafico {
  rotulo: string;
  valor: number;
}

export interface ResumoCrises {
  total: number;
  mediaSegundos: number;
  maximoSegundos: number;
  totalSegundos: number;
}

/** Quantidade mínima de crises para o painel apontar padrões; abaixo disso ele avisa que são poucos dados. */
export const MINIMO_PARA_PADRAO = 5;

export const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;
const DIAS_SEMANA_EXTENSO = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];

export const FAIXAS_HORARIAS = [
  { rotulo: 'Antes das 9h', de: 0, ate: 9 },
  { rotulo: '9h às 11h', de: 9, ate: 11 },
  { rotulo: '11h às 13h', de: 11, ate: 13 },
  { rotulo: '13h às 15h', de: 13, ate: 15 },
  { rotulo: 'Após as 15h', de: 15, ate: 24 }
] as const;

export function crisesEncerradas(crises: RegistroCrise[]): RegistroCrise[] {
  return crises.filter((c) => c.dataHoraFim !== null);
}

export function resumirCrises(crises: RegistroCrise[]): ResumoCrises {
  const lista = crisesEncerradas(crises);
  const totalSegundos = lista.reduce((acc, c) => acc + c.duracaoSegundos, 0);
  return {
    total: lista.length,
    mediaSegundos: lista.length > 0 ? Math.round(totalSegundos / lista.length) : 0,
    maximoSegundos: lista.reduce((m, c) => Math.max(m, c.duracaoSegundos), 0),
    totalSegundos
  };
}

const chaveDia = (d: Date) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
const doisDigitos = (n: number) => String(n).padStart(2, '0');

/** Crises por dia nos últimos `dias` dias (do mais antigo ao de hoje), contando também os dias sem crise. */
export function crisesPorDia(crises: RegistroCrise[], hoje: Date, dias = 14): PontoGrafico[] {
  const contagem = new Map<number, number>();
  for (const c of crisesEncerradas(crises)) {
    const k = chaveDia(new Date(c.dataHoraInicio));
    contagem.set(k, (contagem.get(k) ?? 0) + 1);
  }
  const pontos: PontoGrafico[] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - i);
    pontos.push({ rotulo: doisDigitos(d.getDate()) + '/' + doisDigitos(d.getMonth() + 1), valor: contagem.get(chaveDia(d)) ?? 0 });
  }
  return pontos;
}

export function crisesPorFaixaHoraria(crises: RegistroCrise[]): PontoGrafico[] {
  const valores = FAIXAS_HORARIAS.map(() => 0);
  for (const c of crisesEncerradas(crises)) {
    const h = new Date(c.dataHoraInicio).getHours();
    const i = FAIXAS_HORARIAS.findIndex((f) => h >= f.de && h < f.ate);
    if (i >= 0) valores[i] += 1;
  }
  return FAIXAS_HORARIAS.map((f, i) => ({ rotulo: f.rotulo, valor: valores[i] }));
}

/** Segunda a domingo (a semana escolar começa na segunda). */
export function crisesPorDiaSemana(crises: RegistroCrise[]): PontoGrafico[] {
  const valores = DIAS_SEMANA.map(() => 0);
  for (const c of crisesEncerradas(crises)) {
    const dow = new Date(c.dataHoraInicio).getDay(); // 0 = domingo
    valores[(dow + 6) % 7] += 1;
  }
  return DIAS_SEMANA.map((rotulo, i) => ({ rotulo, valor: valores[i] }));
}

function maiores(pontos: PontoGrafico[]): PontoGrafico[] {
  const topo = Math.max(...pontos.map((p) => p.valor));
  return topo > 0 ? pontos.filter((p) => p.valor === topo) : [];
}

function juntar(nomes: string[]): string {
  return nomes.length <= 1 ? nomes.join('') : nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1];
}

/**
 * Frases de apoio ao professor. São indícios sobre o que foi registrado, não diagnóstico:
 * com menos de MINIMO_PARA_PADRAO crises encerradas o painel só avisa que há poucos dados.
 */
export function gerarInsights(crises: RegistroCrise[], hoje: Date): string[] {
  const lista = crisesEncerradas(crises);
  if (lista.length === 0) {
    return ['Ainda não há crises encerradas. Os padrões aparecem a partir de ' + MINIMO_PARA_PADRAO + ' registros.'];
  }
  if (lista.length < MINIMO_PARA_PADRAO) {
    return [
      'Há ' + lista.length + (lista.length === 1 ? ' crise registrada' : ' crises registradas') +
        ', o que é pouco para indicar padrões (o mínimo usado é ' + MINIMO_PARA_PADRAO + ').'
    ];
  }

  const frases: string[] = [];
  const faixas = maiores(crisesPorFaixaHoraria(lista));
  if (faixas.length === 1) {
    frases.push('A faixa com mais registros é "' + faixas[0].rotulo + '" (' + faixas[0].valor + ' de ' + lista.length + ' episódios).');
  } else if (faixas.length > 1) {
    frases.push('Há empate entre as faixas ' + juntar(faixas.map((f) => '"' + f.rotulo + '"')) + ' (' + faixas[0].valor + ' episódios cada).');
  }

  const dias = maiores(crisesPorDiaSemana(lista));
  if (dias.length === 1) {
    const nome = DIAS_SEMANA_EXTENSO[DIAS_SEMANA.indexOf(dias[0].rotulo as (typeof DIAS_SEMANA)[number])];
    frases.push('O dia da semana com mais registros é ' + nome + ' (' + dias[0].valor + ' episódios).');
  }

  const porDia = crisesPorDia(lista, hoje, 14);
  const anterior = porDia.slice(0, 7).reduce((a, p) => a + p.valor, 0);
  const recente = porDia.slice(7).reduce((a, p) => a + p.valor, 0);
  if (anterior + recente >= 3) {
    if (recente > anterior) {
      frases.push('Nos últimos 7 dias houve ' + recente + ' crises, contra ' + anterior + ' nos 7 dias anteriores (aumento).');
    } else if (recente < anterior) {
      frases.push('Nos últimos 7 dias houve ' + recente + ' crises, contra ' + anterior + ' nos 7 dias anteriores (redução).');
    } else {
      frases.push('O número de crises ficou igual nos últimos 7 dias e nos 7 dias anteriores (' + recente + ' em cada período).');
    }
  }

  const r = resumirCrises(lista);
  frases.push('A duração média é de ' + formatarTempo(r.mediaSegundos) + ' e a crise mais longa durou ' + formatarTempo(r.maximoSegundos) + '.');
  return frases;
}
