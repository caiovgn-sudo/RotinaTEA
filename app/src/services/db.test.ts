import { describe, it, expect } from 'vitest';
import {
  calcularDuracaoSegundos,
  podeExcluirCrise,
  validarCodigoAnonimizado,
  mascararIp,
  statusAposFalha,
  MAX_TENTATIVAS_SYNC,
  PERFIL_PADRAO_CADASTRO,
  podeRegistrarCrise
} from '../utils/regras';
import { processarFilaSync } from './filaSync';
import { formatarTempo } from '../utils/tempo';
import type { SyncItem } from '../types';

// Estes testes importam o código REAL da aplicação (utils/regras, services/filaSync, utils/tempo).
// Pilar 2 (Qualidade): rastreabilidade RN01–RN03 ↔ código ↔ teste.

const criarItem = (id: string, criadoEm: string, tentativas = 0): SyncItem => ({
  id,
  tipo: 'REGISTRO_CRISE',
  payload: {
    id: 'crise-' + id,
    estudanteId: 'e1',
    professorId: 'p1',
    dataHoraInicio: '2026-09-21T10:00:00.000Z',
    dataHoraFim: '2026-09-21T10:05:30.000Z',
    duracaoSegundos: 330,
    sincronizadoOffline: false,
    criadoEmLocal: criadoEm
  },
  criadoEm,
  tentativas,
  status: 'PENDENTE'
});

describe('RN01 — Registro de crise', () => {
  it('calcula a duração em segundos a partir dos timestamps de início e fim', () => {
    expect(calcularDuracaoSegundos('2026-09-21T10:00:00.000Z', '2026-09-21T10:05:30.000Z')).toBe(330);
  });

  it('garante duração mínima de 1 segundo', () => {
    expect(calcularDuracaoSegundos('2026-09-21T10:00:00.000Z', '2026-09-21T10:00:00.100Z')).toBe(1);
  });

  it('rejeita fim anterior ao início e datas inválidas', () => {
    expect(() => calcularDuracaoSegundos('2026-09-21T10:05:00.000Z', '2026-09-21T10:00:00.000Z')).toThrow(/RN01/);
    expect(() => calcularDuracaoSegundos('invalida', '2026-09-21T10:00:00.000Z')).toThrow(/RN01/);
  });

  it('não permite excluir crise em andamento (sem fim), mas permite a encerrada', () => {
    expect(podeExcluirCrise({ dataHoraFim: null })).toBe(false);
    expect(podeExcluirCrise({ dataHoraFim: '2026-09-21T10:05:30.000Z' })).toBe(true);
  });
});

describe('RN02 — Anonimização (LGPD)', () => {
  it('aceita somente o formato ALN-XXXX', () => {
    expect(validarCodigoAnonimizado('ALN-8921')).toBe(true);
    expect(validarCodigoAnonimizado('ALN-441')).toBe(false);
    expect(validarCodigoAnonimizado('Maria Silva')).toBe(false);
    expect(validarCodigoAnonimizado('ALN-8921; DROP')).toBe(false);
  });

  it('mascara o endereço IP exibido na interface', () => {
    expect(mascararIp('189.102.45.12')).toBe('189.102.xxx.xxx');
    expect(mascararIp('2001:db8::1')).toBe('2001:…');
    expect(mascararIp('')).toBe('—');
    expect(mascararIp(undefined)).toBe('—');
  });
});

describe('Segurança — perfil de cadastro', () => {
  it('novas contas recebem o perfil de menor privilégio', () => {
    expect(PERFIL_PADRAO_CADASTRO).toBe('RESPONSAVEL');
  });

  it('somente Professor e Coordenação podem registrar crises (espelha a RLS)', () => {
    expect(podeRegistrarCrise('PROFESSOR')).toBe(true);
    expect(podeRegistrarCrise('COORDENACAO')).toBe(true);
    expect(podeRegistrarCrise('RESPONSAVEL')).toBe(false);
    expect(podeRegistrarCrise('ALUNO')).toBe(false);
    expect(podeRegistrarCrise(null)).toBe(false);
  });
});

describe('RN03 — Fila de sincronização offline-first', () => {
  it('statusAposFalha: PENDENTE até o limite de tentativas, depois ERRO', () => {
    expect(statusAposFalha(1)).toBe('PENDENTE');
    expect(statusAposFalha(MAX_TENTATIVAS_SYNC - 1)).toBe('PENDENTE');
    expect(statusAposFalha(MAX_TENTATIVAS_SYNC)).toBe('ERRO');
  });

  it('envia em ordem de criação e remove da fila apenas após confirmação', async () => {
    const itens = [criarItem('b', '2026-09-21T10:02:00.000Z'), criarItem('a', '2026-09-21T10:01:00.000Z')];
    const enviados: string[] = [];
    const concluidos: string[] = [];

    const total = await processarFilaSync(itens, {
      enviar: async (i) => {
        enviados.push(i.id);
        return true;
      },
      aoSucesso: async (i) => {
        concluidos.push(i.id);
      },
      aoFalha: async () => {
        throw new Error('não deveria falhar');
      }
    });

    expect(total).toBe(2);
    expect(enviados).toEqual(['a', 'b']);
    expect(concluidos).toEqual(['a', 'b']);
  });

  it('em falha, incrementa tentativas, marca ERRO ao atingir o limite e mantém o item', async () => {
    const falhas: SyncItem[] = [];
    const total = await processarFilaSync([criarItem('x', '2026-09-21T10:01:00.000Z', 2)], {
      enviar: async () => false,
      aoSucesso: async () => {
        throw new Error('não deveria concluir');
      },
      aoFalha: async (i) => {
        falhas.push(i);
      }
    });

    expect(total).toBe(0);
    expect(falhas).toHaveLength(1);
    expect(falhas[0].tentativas).toBe(3);
    expect(falhas[0].status).toBe('ERRO');
  });

  it('exceção de rede é tratada como falha e não interrompe os demais itens', async () => {
    const itens = [criarItem('1', '2026-09-21T10:01:00.000Z'), criarItem('2', '2026-09-21T10:02:00.000Z')];
    const concluidos: string[] = [];
    const total = await processarFilaSync(itens, {
      enviar: async (i) => {
        if (i.id === '1') throw new Error('rede');
        return true;
      },
      aoSucesso: async (i) => {
        concluidos.push(i.id);
      },
      aoFalha: async () => {}
    });
    expect(total).toBe(1);
    expect(concluidos).toEqual(['2']);
  });

  it('idempotência: se o servidor confirmou mas a limpeza local falhou, o item continua na fila', async () => {
    const item = criarItem('z', '2026-09-21T10:01:00.000Z');
    let aoFalhaChamado = false;
    const total = await processarFilaSync([item], {
      enviar: async () => true,
      aoSucesso: async () => {
        throw new Error('IndexedDB indisponível');
      },
      aoFalha: async () => {
        aoFalhaChamado = true;
      }
    });
    // Não conta como sincronizado nem é marcado como falha: será reenviado (upsert idempotente).
    expect(total).toBe(0);
    expect(aoFalhaChamado).toBe(false);
  });

  it('não altera os objetos originais recebidos', async () => {
    const item = criarItem('o', '2026-09-21T10:01:00.000Z');
    await processarFilaSync([item], { enviar: async () => false, aoSucesso: async () => {}, aoFalha: async () => {} });
    expect(item.tentativas).toBe(0);
    expect(item.status).toBe('PENDENTE');
  });
});

describe('Formatação de tempo', () => {
  it('formata segundos em minutos e segundos', () => {
    expect(formatarTempo(310)).toBe('5m 10s');
    expect(formatarTempo(60)).toBe('1m');
    expect(formatarTempo(45)).toBe('45s');
  });
});
