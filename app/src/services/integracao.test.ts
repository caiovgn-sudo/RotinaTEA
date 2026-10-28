import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import type { RegistroCrise } from '../types';

// Pilar 2 (Qualidade): testes de integração do armazenamento local. Usam o código real de services/db.ts
// sobre um IndexedDB simulado (fake-indexeddb), com o cliente do Supabase substituído por um dublê.
// Cada teste começa com um banco novo, para não depender da ordem de execução.

const sb = vi.hoisted(() => ({
  sessao: null as null | { user: { id: string } },
  upsertErro: null as null | { message: string },
  chamadas: [] as { tabela: string; linha: Record<string, unknown>; opcoes: unknown }[],
  rpcDados: null as unknown,
  rpcErro: null as null | { message: string }
}));

vi.mock('./supabase', () => ({
  supabase: {
    auth: { getSession: async () => ({ data: { session: sb.sessao } }) },
    from: (tabela: string) => ({
      upsert: async (linha: Record<string, unknown>, opcoes: unknown) => {
        sb.chamadas.push({ tabela, linha, opcoes });
        return { error: sb.upsertErro };
      },
      delete: () => ({ eq: async () => ({ error: null }) })
    }),
    rpc: async () => ({ data: sb.rpcDados, error: sb.rpcErro })
  },
  verificarConectividadeSupabase: async () => true
}));

type Db = typeof import('./db');
let db: Db;

beforeEach(async () => {
  (globalThis as unknown as { indexedDB: IDBFactory }).indexedDB = new IDBFactory();
  vi.resetModules();
  sb.sessao = null;
  sb.upsertErro = null;
  sb.chamadas = [];
  sb.rpcDados = null;
  sb.rpcErro = null;
  db = await import('./db');
  await db.seedInitialDataIfEmpty();
});

describe('Dados iniciais (seed)', () => {
  it('cria 2 estudantes anonimizados, 6 cartões, o consentimento e 2 crises históricas', async () => {
    const estudantes = await db.carregarEstudantes();
    expect(estudantes.map((e) => e.codigoAnonimizado).sort()).toEqual(['ALN-4412', 'ALN-8921']);
    expect(await db.carregarItensRotina(db.SEED_ROTINA_1_ID)).toHaveLength(6);
    expect((await db.carregarConsentimento(db.SEED_ESTUDANTE_1_ID))?.ativo).toBe(true);
    expect(await db.carregarCrises(db.SEED_ESTUDANTE_1_ID)).toHaveLength(2);
  });

  it('é idempotente: rodar de novo não duplica nada', async () => {
    await db.seedInitialDataIfEmpty();
    expect(await db.carregarEstudantes()).toHaveLength(2);
    expect(await db.carregarCrises(db.SEED_ESTUDANTE_1_ID)).toHaveLength(2);
  });
});

describe('Crise: ciclo local (RN01 e RN03)', () => {
  it('inicia, aparece como ativa e, ao encerrar offline, grava fim, duração e item na fila', async () => {
    const nova = await db.iniciarCriseLocal(db.SEED_ESTUDANTE_1_ID, 'prof-1');
    expect((await db.obterCriseAtiva())?.id).toBe(nova.id);

    const encerrada = await db.encerrarCriseLocal(nova.id, 'ruído no corredor', false);
    expect(encerrada.dataHoraFim).not.toBeNull();
    expect(encerrada.duracaoSegundos).toBeGreaterThanOrEqual(1);
    expect(encerrada.observacoes).toBe('ruído no corredor');
    expect(encerrada.sincronizadoOffline).toBe(false); // só vira true após a confirmação do servidor
    expect(await db.obterCriseAtiva()).toBeNull();

    const fila = await db.carregarItensFilaSync();
    expect(fila).toHaveLength(1);
    expect(fila[0]).toMatchObject({ tipo: 'REGISTRO_CRISE', status: 'PENDENTE' });
    expect((fila[0].payload as RegistroCrise).id).toBe(nova.id);
  });

  it('online e sem sessão real, não enfileira (o dado fica só no aparelho)', async () => {
    const nova = await db.iniciarCriseLocal(db.SEED_ESTUDANTE_1_ID, 'prof-1');
    await db.encerrarCriseLocal(nova.id, undefined, true);
    expect(await db.carregarItensFilaSync()).toHaveLength(0);
  });

  it('RN01: não exclui crise em andamento e a mantém salva', async () => {
    const nova = await db.iniciarCriseLocal(db.SEED_ESTUDANTE_1_ID, 'prof-1');
    await expect(db.excluirCriseLocal(nova.id)).rejects.toThrow(/RN01/);
    expect((await db.obterCriseAtiva())?.id).toBe(nova.id);
  });

  it('exclui crise encerrada e remove também o item dela da fila', async () => {
    const nova = await db.iniciarCriseLocal(db.SEED_ESTUDANTE_1_ID, 'prof-1');
    await db.encerrarCriseLocal(nova.id, undefined, false);
    expect(await db.carregarItensFilaSync()).toHaveLength(1);

    await db.excluirCriseLocal(nova.id);
    expect((await db.carregarCrises(db.SEED_ESTUDANTE_1_ID)).some((c) => c.id === nova.id)).toBe(false);
    expect(await db.carregarItensFilaSync()).toHaveLength(0);
  });

  it('carregar crises é só leitura: consultar duas vezes devolve o mesmo e nada é apagado', async () => {
    const a = await db.carregarCrises(db.SEED_ESTUDANTE_1_ID);
    const b = await db.carregarCrises(db.SEED_ESTUDANTE_1_ID);
    expect(b).toEqual(a);
    expect(a).toHaveLength(2);
  });
});

describe('Consentimento (LGPD)', () => {
  it('revoga e reativa, registrando a data e enfileirando a alteração offline', async () => {
    const inicial = await db.carregarConsentimento(db.SEED_ESTUDANTE_1_ID);
    const revogado = await db.alternarConsentimento(inicial!.id, false);
    expect(revogado.ativo).toBe(false);
    expect(revogado.revogadoEm).toBeTruthy();
    expect((await db.carregarConsentimento(db.SEED_ESTUDANTE_1_ID))?.ativo).toBe(false);
    expect((await db.carregarItensFilaSync()).map((i) => i.tipo)).toEqual(['CONSENTIMENTO']);

    const reativado = await db.alternarConsentimento(inicial!.id, false);
    expect(reativado.ativo).toBe(true);
    expect(reativado.revogadoEm).toBeUndefined();
  });
});

describe('Avaliação SUS', () => {
  const respostas = [5, 1, 5, 1, 5, 1, 5, 1, 5, 1];

  it('grava local primeiro, calcula a nota e enfileira quando está offline', async () => {
    const r = await db.salvarRespostaSUS({ id: 'avaliador-1', perfil: 'COORDENACAO' }, respostas, false);
    expect(r.pontuacao).toBe(100);
    expect(await db.contarRespostasSUS('avaliador-1')).toBe(1);
    expect(await db.contarRespostasSUS('outro')).toBe(0);
    expect(await db.carregarRespostasSUS()).toHaveLength(1);
    expect((await db.carregarItensFilaSync()).map((i) => i.tipo)).toEqual(['RESPOSTA_SUS']);
  });

  it('rejeita respostas inválidas sem gravar nada', async () => {
    await expect(db.salvarRespostaSUS({ id: 'a', perfil: 'COORDENACAO' }, [1, 2, 3], false)).rejects.toThrow();
    expect(await db.carregarRespostasSUS()).toHaveLength(0);
  });

  it('resumo remoto: devolve null sem sessão e converte o resultado com sessão', async () => {
    sb.rpcDados = { total: 3, media: 72.5, minimo: 60, maximo: 85, acima_meta: 2, media_por_item: null };
    expect(await db.buscarResumoSUSRemoto()).toBeNull();

    sb.sessao = { user: { id: 'coord-1' } };
    expect(await db.buscarResumoSUSRemoto()).toMatchObject({ total: 3, media: 72.5, acimaDaMeta: 2 });

    sb.rpcErro = { message: 'permissão negada' };
    expect(await db.buscarResumoSUSRemoto()).toBeNull();
  });
});

describe('Sincronização com o servidor (dublê do Supabase)', () => {
  async function enfileirarCrise() {
    const nova = await db.iniciarCriseLocal(db.SEED_ESTUDANTE_1_ID, 'prof-1');
    await db.encerrarCriseLocal(nova.id, undefined, false);
    return nova.id;
  }

  it('sem sessão, nada é enviado e a fila continua intacta', async () => {
    await enfileirarCrise();
    expect(await db.sincronizarFilaBatch()).toBe(0);
    expect(sb.chamadas).toHaveLength(0);
    expect(await db.carregarItensFilaSync()).toHaveLength(1);
  });

  it('com sessão, envia por upsert com o UUID local, esvazia a fila e marca a crise como enviada', async () => {
    const id = await enfileirarCrise();
    sb.sessao = { user: { id: 'prof-1' } };

    expect(await db.sincronizarFilaBatch()).toBe(1);
    expect(sb.chamadas[0]).toMatchObject({ tabela: 'registros_crise', opcoes: { onConflict: 'id' } });
    expect(sb.chamadas[0].linha.id).toBe(id);
    expect(await db.carregarItensFilaSync()).toHaveLength(0);
    const enviada = (await db.carregarCrises(db.SEED_ESTUDANTE_1_ID)).find((c) => c.id === id);
    expect(enviada?.sincronizadoOffline).toBe(true);
  });

  it('em falha, conta tentativas, marca ERRO na terceira e deixa de reenviar esse item', async () => {
    await enfileirarCrise();
    sb.sessao = { user: { id: 'prof-1' } };
    sb.upsertErro = { message: 'violação de chave estrangeira' };

    for (let i = 1; i <= 3; i++) {
      expect(await db.sincronizarFilaBatch()).toBe(0);
      expect((await db.carregarItensFilaSync())[0].tentativas).toBe(i);
    }
    expect((await db.carregarItensFilaSync())[0].status).toBe('ERRO');

    const antes = sb.chamadas.length;
    await db.sincronizarFilaBatch();
    expect(sb.chamadas.length).toBe(antes);
  });

  it('"tentar novamente" devolve o item com erro à fila e o envio passa a funcionar', async () => {
    await enfileirarCrise();
    sb.sessao = { user: { id: 'prof-1' } };
    sb.upsertErro = { message: 'falha' };
    for (let i = 0; i < 3; i++) await db.sincronizarFilaBatch();
    const item = (await db.carregarItensFilaSync())[0];
    expect(item.status).toBe('ERRO');

    sb.upsertErro = null;
    await db.reativarItemNaFila(item.id);
    expect(await db.sincronizarFilaBatch()).toBe(1);
    expect(await db.carregarItensFilaSync()).toHaveLength(0);
  });

  it('o consentimento vai com a conta autenticada como responsável, não com o responsável fictício', async () => {
    const termo = await db.carregarConsentimento(db.SEED_ESTUDANTE_1_ID);
    await db.alternarConsentimento(termo!.id, false);
    sb.sessao = { user: { id: 'conta-responsavel' } };

    await db.sincronizarFilaBatch();
    const envio = sb.chamadas.find((c) => c.tabela === 'consentimentos_lgpd');
    expect(envio?.linha.responsavel_id).toBe('conta-responsavel');
    expect(envio?.linha.ativo).toBe(false);
    expect(envio?.linha.revogado_em).toBeTruthy();
  });

  it('a avaliação SUS é enviada sem sobrescrever o que já existe (ignoreDuplicates)', async () => {
    await db.salvarRespostaSUS({ id: 'coord-1', perfil: 'COORDENACAO' }, [5, 1, 5, 1, 5, 1, 5, 1, 5, 1], false);
    sb.sessao = { user: { id: 'coord-1' } };

    await db.sincronizarFilaBatch();
    const envio = sb.chamadas.find((c) => c.tabela === 'respostas_sus');
    expect(envio?.opcoes).toMatchObject({ onConflict: 'id', ignoreDuplicates: true });
    expect(envio?.linha).toMatchObject({ avaliador_id: 'coord-1', perfil_avaliador: 'COORDENACAO', pontuacao: 100 });
  });
});
