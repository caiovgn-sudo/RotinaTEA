// Serviço de Persistência Local (IndexedDB) - Arquitetura Offline-First (RN03)
import { Estudante, ItemRotina, RegistroCrise, RotinaVisual, ConsentimentoLGPD, RespostaSUS, PerfilUsuario, SyncItem, SyncPayload } from '../types';
import { calcularPontuacaoSUS, SUS_VERSAO_INSTRUMENTO, resumoDoServidor, type ResumoSUS } from '../utils/sus';
import { supabase, verificarConectividadeSupabase } from './supabase';
import { processarFilaSync } from './filaSync';
import { calcularDuracaoSegundos, podeExcluirCrise } from '../utils/regras';
import { logger } from '../utils/logger';
import { reativarItemFila } from '../utils/sync';

const DB_NAME = 'rotinatea_offline_db';
const DB_VERSION = 3;

let dbInstance: IDBDatabase | null = null;

// UUIDs canônicos para Seed e compatibilidade total com PostgreSQL/Supabase
export const SEED_ESTUDANTE_1_ID = 'e0000001-0000-4000-a000-000000000001';
export const SEED_ESTUDANTE_2_ID = 'e0000002-0000-4000-a000-000000000002';
export const SEED_ROTINA_1_ID = 'b0000001-0000-4000-a000-000000000001';
export const SEED_PROFESSOR_ID = 'd0000001-0000-4000-a000-000000000001';
export const SEED_RESPONSAVEL_ID = 'd0000002-0000-4000-a000-000000000002';

export function gerarUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('estudantes')) {
        db.createObjectStore('estudantes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('rotinas')) {
        db.createObjectStore('rotinas', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('itens_rotina')) {
        const itemStore = db.createObjectStore('itens_rotina', { keyPath: 'id' });
        itemStore.createIndex('rotinaId', 'rotinaId', { unique: false });
        itemStore.createIndex('ordem', 'ordem', { unique: false });
      }
      if (!db.objectStoreNames.contains('crises')) {
        const criseStore = db.createObjectStore('crises', { keyPath: 'id' });
        criseStore.createIndex('estudanteId', 'estudanteId', { unique: false });
        criseStore.createIndex('sincronizadoOffline', 'sincronizadoOffline', { unique: false });
      }
      if (!db.objectStoreNames.contains('consentimentos')) {
        db.createObjectStore('consentimentos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sus_respostas')) {
        db.createObjectStore('sus_respostas', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Inicialização com dados iniciais (Seed Data)
export async function seedInitialDataIfEmpty(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['estudantes', 'rotinas', 'itens_rotina', 'consentimentos', 'crises'], 'readwrite');
  const estudanteStore = tx.objectStore('estudantes');

  const countReq = estudanteStore.count();
  countReq.onsuccess = () => {
    if (countReq.result === 0) {
      // Estudante 1 anonimizado (RN02)
      const estudante1: Estudante = {
        id: SEED_ESTUDANTE_1_ID,
        codigoAnonimizado: 'ALN-8921',
        turma: '3º Ano B - Manhã',
        nivelSuporte: 1
      };
      // Estudante 2 anonimizado
      const estudante2: Estudante = {
        id: SEED_ESTUDANTE_2_ID,
        codigoAnonimizado: 'ALN-4412',
        turma: '2º Ano A - Tarde',
        nivelSuporte: 2
      };

      estudanteStore.put(estudante1);
      estudanteStore.put(estudante2);

      // Rotina visual inicial
      const rotina1: RotinaVisual = {
        id: SEED_ROTINA_1_ID,
        estudanteId: SEED_ESTUDANTE_1_ID,
        data: new Date().toISOString().split('T')[0],
        status: 'EM_ANDAMENTO',
        itens: []
      };
      tx.objectStore('rotinas').put(rotina1);

      // Itens da rotina com pictogramas ARASAAC
      const itensIniciais: ItemRotina[] = [
        { id: 'c0000001-0000-4000-a000-000000000001', rotinaId: SEED_ROTINA_1_ID, titulo: 'Entrada e Acolhimento', categoria: 'Transição', pictogramaKey: 'acolhimento', ordem: 1, duracaoMinutos: 15, concluido: true },
        { id: 'c0000001-0000-4000-a000-000000000002', rotinaId: SEED_ROTINA_1_ID, titulo: 'Roda de Conversa', categoria: 'Interação', pictogramaKey: 'roda_conversa', ordem: 2, duracaoMinutos: 20, concluido: true },
        { id: 'c0000001-0000-4000-a000-000000000003', rotinaId: SEED_ROTINA_1_ID, titulo: 'Atividade no Caderno', categoria: 'Pedagógico', pictogramaKey: 'atividade_mesa', ordem: 3, duracaoMinutos: 30, concluido: false },
        { id: 'c0000001-0000-4000-a000-000000000004', rotinaId: SEED_ROTINA_1_ID, titulo: 'Lavar Mãos e Lanche', categoria: 'Alimentação', pictogramaKey: 'lanche', ordem: 4, duracaoMinutos: 25, concluido: false },
        { id: 'c0000001-0000-4000-a000-000000000005', rotinaId: SEED_ROTINA_1_ID, titulo: 'Parque / Recreio', categoria: 'Lazer', pictogramaKey: 'parque', ordem: 5, duracaoMinutos: 30, concluido: false },
        { id: 'c0000001-0000-4000-a000-000000000006', rotinaId: SEED_ROTINA_1_ID, titulo: 'Guardar Mochila e Saída', categoria: 'Transição', pictogramaKey: 'saida', ordem: 6, duracaoMinutos: 15, concluido: false }
      ];

      const itemStore = tx.objectStore('itens_rotina');
      itensIniciais.forEach((it) => itemStore.put(it));

      // Consentimento inicial LGPD
      const consentimento1: ConsentimentoLGPD = {
        id: 'a0000001-0000-4000-a000-000000000001',
        estudanteId: SEED_ESTUDANTE_1_ID,
        responsavelId: SEED_RESPONSAVEL_ID,
        dataAceite: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        ipOrigem: '0.0.0.0',
        ativo: true,
        termoVersao: 'v1.2-2026'
      };
      tx.objectStore('consentimentos').put(consentimento1);

      // Crises históricas para visualização analítica no PEI
      const crisesIniciais: RegistroCrise[] = [
        {
          id: 'f0000001-0000-4000-a000-000000000001',
          estudanteId: SEED_ESTUDANTE_1_ID,
          professorId: SEED_PROFESSOR_ID,
          dataHoraInicio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 3600 * 1000).toISOString(),
          dataHoraFim: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 3600 * 1000 + 380 * 1000).toISOString(),
          duracaoSegundos: 380,
          observacoes: 'Desregulação sensorial durante a transição da sala para o pátio.',
          sincronizadoOffline: true,
          criadoEmLocal: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'f0000001-0000-4000-a000-000000000002',
          estudanteId: SEED_ESTUDANTE_1_ID,
          professorId: SEED_PROFESSOR_ID,
          dataHoraInicio: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 11 * 3600 * 1000).toISOString(),
          dataHoraFim: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 11 * 3600 * 1000 + 240 * 1000).toISOString(),
          duracaoSegundos: 240,
          observacoes: 'Estresse com ruído súbito do sinal de troca de aula.',
          sincronizadoOffline: true,
          criadoEmLocal: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      const criseStore = tx.objectStore('crises');
      crisesIniciais.forEach((c) => criseStore.put(c));
    }
  };
}

// -------------------------------------------------------------
// Operações de Rotina e Itens
// -------------------------------------------------------------

export async function carregarEstudantes(): Promise<Estudante[]> {
  const db = await getDB();
  return new Promise((resolve) => {
    const tx = db.transaction('estudantes', 'readonly');
    const req = tx.objectStore('estudantes').getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}

export async function carregarItensRotina(rotinaId: string): Promise<ItemRotina[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('itens_rotina', 'readonly');
    const req = tx.objectStore('itens_rotina').index('rotinaId').getAll(rotinaId);
    req.onsuccess = () => {
      const items: ItemRotina[] = req.result || [];
      items.sort((x, y) => x.ordem - y.ordem);
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function alternarStatusItem(itemId: string): Promise<ItemRotina> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('itens_rotina', 'readwrite');
    const store = tx.objectStore('itens_rotina');
    const getReq = store.get(itemId);

    getReq.onsuccess = () => {
      const item: ItemRotina = getReq.result;
      if (!item) return reject(new Error('Item não encontrado'));

      item.concluido = !item.concluido;
      const putReq = store.put(item);
      putReq.onsuccess = () => resolve(item);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function salvarOrdemItens(itensAtualizados: ItemRotina[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('itens_rotina', 'readwrite');
    const store = tx.objectStore('itens_rotina');
    itensAtualizados.forEach((it, idx) => {
      it.ordem = idx + 1;
      store.put(it);
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Há sessão autenticada no Supabase? Só então faz sentido enviar dados ao servidor (RLS). */
async function sessaoRemotaAtiva(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch {
    return false;
  }
}

/** Dispara a sincronização em segundo plano, sem bloquear nem derrubar a operação local (RN03). */
function solicitarSincronizacao(isOnline: boolean): void {
  if (!isOnline) return;
  void sincronizarFilaBatch().catch((err) => logger.erro('[Sync] Falha em segundo plano', err));
}

/** Persistência local primeiro (RN03); a fila é gravada em transação separada, sem await de rede. */
async function registrarNaFilaSeNecessario(
  tipo: SyncItem['tipo'],
  payload: SyncPayload,
  isOnline: boolean
): Promise<void> {
  if (!isOnline || (await sessaoRemotaAtiva())) {
    await adicionarAFilaSincronizacao(tipo, payload);
  }
  solicitarSincronizacao(isOnline);
}

function aguardarTransacao(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('Transação abortada'));
  });
}

export async function adicionarItemRotina(novoItem: Omit<ItemRotina, 'id'>, isOnline = true): Promise<ItemRotina> {
  const db = await getDB();
  const itemCompleto: ItemRotina = { ...novoItem, id: gerarUUID() };
  const tx = db.transaction('itens_rotina', 'readwrite');
  tx.objectStore('itens_rotina').put(itemCompleto);
  await aguardarTransacao(tx);
  await registrarNaFilaSeNecessario('ITEM_ROTINA', itemCompleto, isOnline);
  return itemCompleto;
}

// -------------------------------------------------------------
// Operações de Registro de Crise (RF03, RN01, RN03)
// -------------------------------------------------------------

export async function obterCriseAtiva(): Promise<RegistroCrise | null> {
  const db = await getDB();
  return new Promise((resolve) => {
    const tx = db.transaction('crises', 'readonly');
    const store = tx.objectStore('crises');
    const req = store.getAll();
    req.onsuccess = () => {
      const crises: RegistroCrise[] = req.result || [];
      const ativa = crises.find((c) => c.dataHoraFim === null);
      resolve(ativa || null);
    };
  });
}

export async function iniciarCriseLocal(estudanteId: string, professorId: string): Promise<RegistroCrise> {
  const db = await getDB();
  const agora = new Date().toISOString();
  const novaCrise: RegistroCrise = {
    id: gerarUUID(),
    estudanteId,
    professorId,
    dataHoraInicio: agora,
    dataHoraFim: null,
    duracaoSegundos: 0,
    sincronizadoOffline: false,
    criadoEmLocal: agora
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('crises', 'readwrite');
    const store = tx.objectStore('crises');
    const req = store.put(novaCrise);
    req.onsuccess = () => resolve(novaCrise);
    req.onerror = () => reject(req.error);
  });
}

export async function encerrarCriseLocal(
  criseId: string,
  observacoes?: string,
  isOnline = true
): Promise<RegistroCrise> {
  const db = await getDB();
  const agora = new Date().toISOString();

  const tx = db.transaction('crises', 'readwrite');
  const store = tx.objectStore('crises');
  const crise = await new Promise<RegistroCrise>((resolve, reject) => {
    const getReq = store.get(criseId);
    getReq.onsuccess = () => {
      const atual: RegistroCrise | undefined = getReq.result;
      if (!atual) return reject(new Error('Crise não encontrada'));
      try {
        atual.dataHoraFim = agora;
        atual.duracaoSegundos = calcularDuracaoSegundos(atual.dataHoraInicio, agora);
      } catch (e) {
        tx.abort();
        return reject(e);
      }
      if (observacoes !== undefined) atual.observacoes = observacoes;
      atual.sincronizadoOffline = false; // só vira true após confirmação do servidor
      store.put(atual);
      resolve(atual);
    };
    getReq.onerror = () => reject(getReq.error);
  });
  await aguardarTransacao(tx);

  await registrarNaFilaSeNecessario('REGISTRO_CRISE', crise, isOnline);
  return crise;
}

export async function carregarCrises(estudanteId?: string): Promise<RegistroCrise[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    // Somente leitura: consultar nunca altera nem apaga dados clínicos.
    const tx = db.transaction('crises', 'readonly');
    const req = tx.objectStore('crises').getAll();
    req.onsuccess = () => {
      let result: RegistroCrise[] = req.result || [];
      if (estudanteId) {
        result = result.filter((c) => c.estudanteId === estudanteId);
      }
      result.sort((x, y) => new Date(y.dataHoraInicio).getTime() - new Date(x.dataHoraInicio).getTime());
      resolve(result);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function excluirCriseLocal(criseId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['crises', 'sync_queue'], 'readwrite');
  const store = tx.objectStore('crises');
  const syncStore = tx.objectStore('sync_queue');

  await new Promise<void>((resolve, reject) => {
    const getReq = store.get(criseId);
    getReq.onsuccess = () => {
      const crise: RegistroCrise | undefined = getReq.result;
      if (!crise) return resolve();
      if (!podeExcluirCrise(crise)) {
        tx.abort();
        return reject(new Error('RN01: uma crise em andamento não pode ser excluída. Encerre-a primeiro.'));
      }
      store.delete(criseId);
      const qReq = syncStore.getAll();
      qReq.onsuccess = () => {
        (qReq.result as SyncItem[]).forEach((item) => {
          if (item.tipo === 'REGISTRO_CRISE' && (item.payload as RegistroCrise).id === criseId) {
            syncStore.delete(item.id);
          }
        });
        resolve();
      };
      qReq.onerror = () => reject(qReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
  await aguardarTransacao(tx);

  // Exclusão remota apenas se houver sessão (best-effort; RLS decide a permissão)
  if (await sessaoRemotaAtiva()) {
    try {
      await supabase.from('registros_crise').delete().eq('id', criseId);
    } catch {
      // offline: o registro local já foi removido
    }
  }
}

// -------------------------------------------------------------
// Fila de Sincronização Offline (RN03)
// -------------------------------------------------------------

export async function carregarItensFilaSync(): Promise<SyncItem[]> {
  const db = await getDB();
  return new Promise((resolve) => {
    const tx = db.transaction('sync_queue', 'readonly');
    const store = tx.objectStore('sync_queue');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}

let sincronizacaoEmAndamento: Promise<number> | null = null;

/** Envia a fila ao Supabase. Chamadas simultâneas compartilham a mesma execução (sem duplicar envios). */
export function sincronizarFilaBatch(): Promise<number> {
  if (!sincronizacaoEmAndamento) {
    sincronizacaoEmAndamento = executarSincronizacao().finally(() => {
      sincronizacaoEmAndamento = null;
    });
  }
  return sincronizacaoEmAndamento;
}

async function executarSincronizacao(): Promise<number> {
  if (!(await verificarConectividadeSupabase())) {
    logger.info('[Sync] Offline — sincronização adiada');
    return 0;
  }
  if (!(await sessaoRemotaAtiva())) {
    logger.info('[Sync] Sem sessão autenticada — itens permanecem na fila local');
    return 0;
  }

  const itens = await carregarItensFilaSync();
  return processarFilaSync(
    itens.filter((i) => i.status !== 'ERRO'),
    {
      enviar: enviarItemParaSupabase,
      aoSucesso: concluirItemLocal,
      aoFalha: registrarFalhaLocal
    }
  );
}

// --- Envio por tipo: sempre idempotente (upsert pelo mesmo UUID local) ---

async function enviarItemParaSupabase(item: SyncItem): Promise<boolean> {
  switch (item.tipo) {
    case 'REGISTRO_CRISE':
      return enviarCrise(item.payload as RegistroCrise);
    case 'ITEM_ROTINA':
      return enviarItemRotina(item.payload as ItemRotina);
    case 'CONSENTIMENTO':
      return enviarConsentimento(item.payload as ConsentimentoLGPD);
    case 'RESPOSTA_SUS':
      return enviarRespostaSUS(item.payload as RespostaSUS);
    default:
      return false;
  }
}

async function enviarCrise(crise: RegistroCrise): Promise<boolean> {
  const { error } = await supabase.from('registros_crise').upsert(
    {
      id: crise.id,
      estudante_id: crise.estudanteId,
      professor_id: crise.professorId,
      data_hora_inicio: crise.dataHoraInicio,
      data_hora_fim: crise.dataHoraFim,
      duracao_segundos: crise.duracaoSegundos,
      observacoes: crise.observacoes ?? null,
      sincronizado_offline: true,
      criado_em_local: crise.criadoEmLocal,
      recebido_em: new Date().toISOString()
    },
    { onConflict: 'id' }
  );
  if (error) logger.erro('[Sync] Erro ao sincronizar crise', error);
  return !error;
}

async function enviarItemRotina(it: ItemRotina): Promise<boolean> {
  const { error } = await supabase.from('itens_rotina').upsert(
    {
      id: it.id,
      rotina_id: it.rotinaId,
      titulo: it.titulo,
      categoria: it.categoria,
      pictograma_key: it.pictogramaKey,
      ordem: it.ordem,
      duracao_minutos: it.duracaoMinutos,
      concluido: it.concluido
    },
    { onConflict: 'id' }
  );
  if (error) logger.erro('[Sync] Erro ao sincronizar item de rotina', error);
  return !error;
}

async function enviarConsentimento(c: ConsentimentoLGPD): Promise<boolean> {
  const { error } = await supabase.from('consentimentos_lgpd').upsert(
    {
      id: c.id,
      estudante_id: c.estudanteId,
      responsavel_id: c.responsavelId,
      data_aceite: c.dataAceite,
      ip_origem: c.ipOrigem,
      ativo: c.ativo,
      termo_versao: c.termoVersao,
      revogado_em: c.ativo ? null : c.revogadoEm ?? new Date().toISOString()
    },
    { onConflict: 'id' }
  );
  if (error) logger.erro('[Sync] Erro ao sincronizar consentimento', error);
  return !error;
}

async function enviarRespostaSUS(r: RespostaSUS): Promise<boolean> {
  // A resposta é imutável no servidor: reenvio do mesmo id é ignorado (ON CONFLICT DO NOTHING).
  const { error } = await supabase.from('respostas_sus').upsert(
    {
      id: r.id,
      avaliador_id: r.avaliadorId,
      perfil_avaliador: r.perfilAvaliador,
      respostas: r.respostas,
      pontuacao: r.pontuacao,
      versao_instrumento: r.versaoInstrumento,
      criado_em_local: r.criadoEmLocal
    },
    { onConflict: 'id', ignoreDuplicates: true }
  );
  if (error) logger.erro('[Sync] Erro ao sincronizar resposta SUS', error);
  return !error;
}

// --- Etapas locais curtas (uma transação por etapa, sem rede dentro) ---

async function concluirItemLocal(item: SyncItem): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['sync_queue', 'crises'], 'readwrite');
  tx.objectStore('sync_queue').delete(item.id);
  if (item.tipo === 'REGISTRO_CRISE') {
    const criseStore = tx.objectStore('crises');
    const id = (item.payload as RegistroCrise).id;
    const getReq = criseStore.get(id);
    getReq.onsuccess = () => {
      const atual: RegistroCrise | undefined = getReq.result;
      if (atual) {
        atual.sincronizadoOffline = true;
        criseStore.put(atual);
      }
    };
  }
  await aguardarTransacao(tx);
}

async function registrarFalhaLocal(item: SyncItem): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  tx.objectStore('sync_queue').put(item);
  await aguardarTransacao(tx);
}

/** “Tentar novamente”: zera as tentativas de um item com erro para que volte a ser enviado. */
export async function reativarItemNaFila(itemId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  const store = tx.objectStore('sync_queue');
  const item: SyncItem | undefined = await new Promise((resolve, reject) => {
    const req = store.get(itemId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  if (item) store.put(reativarItemFila(item));
  await aguardarTransacao(tx);
}

/** Adiciona à fila de sincronização (usada pelas operações CRUD). */
export async function adicionarAFilaSincronizacao(tipo: SyncItem['tipo'], payload: SyncPayload): Promise<void> {
  const db = await getDB();
  const syncItem: SyncItem = {
    id: 'sync-' + Date.now() + '-' + gerarUUID().slice(0, 8),
    tipo,
    payload,
    criadoEm: new Date().toISOString(),
    tentativas: 0,
    status: 'PENDENTE'
  };
  const tx = db.transaction('sync_queue', 'readwrite');
  tx.objectStore('sync_queue').put(syncItem);
  await aguardarTransacao(tx);
}

// -------------------------------------------------------------
// Avaliação de usabilidade (SUS): local primeiro (RN03), envio pela fila
// -------------------------------------------------------------

/** Grava a resposta neste aparelho e, havendo sessão real ou falta de conexão, na fila de envio. */
export async function salvarRespostaSUS(
  avaliador: { id: string; perfil: PerfilUsuario },
  respostas: number[],
  isOnline = true
): Promise<RespostaSUS> {
  const registro: RespostaSUS = {
    id: gerarUUID(),
    avaliadorId: avaliador.id,
    perfilAvaliador: avaliador.perfil,
    respostas: [...respostas],
    pontuacao: calcularPontuacaoSUS(respostas),
    versaoInstrumento: SUS_VERSAO_INSTRUMENTO,
    criadoEmLocal: new Date().toISOString()
  };
  const db = await getDB();
  const tx = db.transaction('sus_respostas', 'readwrite');
  tx.objectStore('sus_respostas').put(registro);
  await aguardarTransacao(tx);
  await registrarNaFilaSeNecessario('RESPOSTA_SUS', registro, isOnline);
  return registro;
}

/** Quantas avaliações SUS este aparelho guarda para o avaliador. */
export async function contarRespostasSUS(avaliadorId: string): Promise<number> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('sus_respostas', 'readonly').objectStore('sus_respostas').getAll();
    req.onsuccess = () => resolve(((req.result || []) as RespostaSUS[]).filter((r) => r.avaliadorId === avaliadorId).length);
    req.onerror = () => reject(req.error);
  });
}

/** Todas as avaliações SUS guardadas neste aparelho (usadas para o resumo local). */
export async function carregarRespostasSUS(): Promise<RespostaSUS[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('sus_respostas', 'readonly').objectStore('sus_respostas').getAll();
    req.onsuccess = () => resolve((req.result || []) as RespostaSUS[]);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Resumo agregado de todas as avaliações no servidor (função resumo_sus, restrita à Coordenação).
 * Devolve null quando não há sessão, a conexão falha ou o perfil não tem permissão.
 */
export async function buscarResumoSUSRemoto(): Promise<ResumoSUS | null> {
  if (!(await sessaoRemotaAtiva())) return null;
  try {
    const { data, error } = await supabase.rpc('resumo_sus');
    if (error) {
      logger.erro('[SUS] Resumo remoto indisponível', error);
      return null;
    }
    return resumoDoServidor(data);
  } catch (err) {
    logger.erro('[SUS] Falha ao consultar o resumo remoto', err);
    return null;
  }
}

// -------------------------------------------------------------
// Consentimento LGPD
// -------------------------------------------------------------

export async function carregarConsentimento(estudanteId: string): Promise<ConsentimentoLGPD | null> {
  const db = await getDB();
  return new Promise((resolve) => {
    const tx = db.transaction('consentimentos', 'readonly');
    const store = tx.objectStore('consentimentos');
    const req = store.getAll();
    req.onsuccess = () => {
      const items: ConsentimentoLGPD[] = req.result || [];
      const item = items.find((c) => c.estudanteId === estudanteId);
      resolve(item || null);
    };
  });
}

export async function alternarConsentimento(consentimentoId: string, isOnline = true): Promise<ConsentimentoLGPD> {
  const db = await getDB();
  const tx = db.transaction('consentimentos', 'readwrite');
  const store = tx.objectStore('consentimentos');
  const item = await new Promise<ConsentimentoLGPD>((resolve, reject) => {
    const req = store.get(consentimentoId);
    req.onsuccess = () => {
      const atual: ConsentimentoLGPD | undefined = req.result;
      if (!atual) return reject(new Error('Consentimento não encontrado'));
      atual.ativo = !atual.ativo;
      atual.revogadoEm = atual.ativo ? undefined : new Date().toISOString();
      store.put(atual);
      resolve(atual);
    };
    req.onerror = () => reject(req.error);
  });
  await aguardarTransacao(tx);
  await registrarNaFilaSeNecessario('CONSENTIMENTO', item, isOnline);
  return item;
}
