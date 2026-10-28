import { describe, it, expect } from 'vitest';
import {
  estadoSyncCrise,
  resumirFila,
  reativarItemFila,
  descreverTentativas,
  conexaoEfetiva,
  rotuloConexao,
  ROTULO_ESTADO_SYNC
} from '../utils/sync';
import { MAX_TENTATIVAS_SYNC } from '../utils/regras';
import type { RegistroCrise, SyncItem } from '../types';

// Pilar 2 (Qualidade): estados de sincronização e conexão importados do código real (utils/sync).

const crise = (id: string, enviada: boolean): RegistroCrise => ({
  id,
  estudanteId: 'e1',
  professorId: 'p1',
  dataHoraInicio: '2026-10-28T10:00:00.000Z',
  dataHoraFim: '2026-10-28T10:05:00.000Z',
  duracaoSegundos: 300,
  sincronizadoOffline: enviada,
  criadoEmLocal: '2026-10-28T10:00:00.000Z'
});

const item = (c: RegistroCrise, status: SyncItem['status'], tentativas = 0): SyncItem => ({
  id: 'sync-' + c.id,
  tipo: 'REGISTRO_CRISE',
  payload: c,
  criadoEm: '2026-10-28T10:05:00.000Z',
  tentativas,
  status
});

describe('Selo de sincronização da crise', () => {
  it('crise confirmada pelo servidor aparece como enviada', () => {
    expect(estadoSyncCrise(crise('a', true), [], false)).toBe('ENVIADA');
  });

  it('crise não enviada e sem erro fica só neste aparelho', () => {
    const c = crise('b', false);
    expect(estadoSyncCrise(c, [item(c, 'PENDENTE', 1)], false)).toBe('SO_NESTE_APARELHO');
  });

  it('crise cujo item da fila esgotou as tentativas aparece como falha de envio', () => {
    const c = crise('c', false);
    expect(estadoSyncCrise(c, [item(c, 'ERRO', MAX_TENTATIVAS_SYNC)], false)).toBe('FALHOU');
  });

  it('erro de outra crise não contamina esta', () => {
    const c = crise('d', false);
    const outra = crise('e', false);
    expect(estadoSyncCrise(c, [item(outra, 'ERRO', MAX_TENTATIVAS_SYNC)], false)).toBe('SO_NESTE_APARELHO');
  });

  it('no modo demonstração nada é enviado, mesmo as crises de exemplo marcadas como enviadas', () => {
    expect(estadoSyncCrise(crise('f', true), [], true)).toBe('SO_NESTE_APARELHO');
  });

  it('os três estados têm texto e explicação em linguagem simples', () => {
    expect(ROTULO_ESTADO_SYNC.SO_NESTE_APARELHO.texto).toBe('Salva só neste aparelho');
    expect(ROTULO_ESTADO_SYNC.ENVIADA.texto).toBe('Enviada ao servidor');
    expect(ROTULO_ESTADO_SYNC.FALHOU.texto).toBe('Falhou o envio');
    expect(ROTULO_ESTADO_SYNC.FALHOU.explicacao).toContain(String(MAX_TENTATIVAS_SYNC));
  });
});

describe('Resumo e reativação da fila', () => {
  it('conta pendentes e com erro separadamente', () => {
    const a = crise('1', false);
    const b = crise('2', false);
    const c = crise('3', false);
    const fila = [item(a, 'PENDENTE'), item(b, 'ERRO', 3), item(c, 'PENDENTE', 2)];
    expect(resumirFila(fila)).toEqual({ pendentes: 2, comErro: 1 });
    expect(resumirFila([])).toEqual({ pendentes: 0, comErro: 0 });
  });

  it('“tentar novamente” zera as tentativas e volta a PENDENTE sem alterar o original', () => {
    const original = item(crise('4', false), 'ERRO', 3);
    const novo = reativarItemFila(original);
    expect(novo.status).toBe('PENDENTE');
    expect(novo.tentativas).toBe(0);
    expect(original.status).toBe('ERRO');
    expect(original.tentativas).toBe(3);
  });

  it('descreve as tentativas sem passar do limite', () => {
    expect(descreverTentativas(item(crise('5', false), 'PENDENTE', 1))).toBe(`1 de ${MAX_TENTATIVAS_SYNC} tentativas`);
    expect(descreverTentativas(item(crise('6', false), 'ERRO', 9))).toBe(`${MAX_TENTATIVAS_SYNC} de ${MAX_TENTATIVAS_SYNC} tentativas`);
  });
});

describe('Conexão real versus simulador', () => {
  it('sem simulador, vale apenas a conexão real', () => {
    expect(conexaoEfetiva(true, true, false)).toBe(true);
    expect(conexaoEfetiva(false, false, false)).toBe(false);
  });

  it('com simulador, a queda simulada derruba a conexão efetiva, mas não a restabelece sem rede real', () => {
    expect(conexaoEfetiva(true, true, true)).toBe(false);
    expect(conexaoEfetiva(false, false, true)).toBe(false);
    expect(conexaoEfetiva(true, false, true)).toBe(true);
  });

  it('o rótulo diferencia internet real de queda simulada', () => {
    expect(rotuloConexao(true, false, true)).toBe('Online');
    expect(rotuloConexao(true, true, true)).toBe('Offline (simulado)');
    expect(rotuloConexao(false, true, true)).toContain('sem internet');
    expect(rotuloConexao(true, true, false)).toBe('Online');
  });
});
