// Serviço de Persistência Local (IndexedDB) - Arquitetura Offline-First (RN03)
import { Estudante, ItemRotina, RegistroCrise, RotinaVisual, ConsentimentoLGPD, SyncItem } from '../types';
import { supabase } from './supabase';

const DB_NAME = 'rotinatea_offline_db';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

// Mapeamento de IDs locais para UUIDs remotos (para evitar duplicatas em re-sync)
const idMapLocalParaRemoto = new Map<string, string>();

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
        id: 'est-001',
        codigoAnonimizado: 'ALN-8921',
        turma: '3º Ano B - Manhã',
        nivelSuporte: 1
      };
      // Estudante 2 anonimizado
      const estudante2: Estudante = {
        id: 'est-002',
        codigoAnonimizado: 'ALN-4412',
        turma: '2º Ano A - Tarde',
        nivelSuporte: 2
      };

      estudanteStore.put(estudante1);
      estudanteStore.put(estudante2);

      // Rotina visual inicial
      const rotina1: RotinaVisual = {
        id: 'rot-001',
        estudanteId: 'est-001',
        data: new Date().toISOString().split('T')[0],
        status: 'EM_ANDAMENTO',
        itens: []
      };
      tx.objectStore('rotinas').put(rotina1);

      // Itens da rotina com pictogramas ARASAAC
      const itensIniciais: ItemRotina[] = [
        { id: 'it-1', rotinaId: 'rot-001', titulo: 'Entrada e Acolhimento', categoria: 'Transição', pictogramaKey: 'acolhimento', ordem: 1, duracaoMinutos: 15, concluido: true },
        { id: 'it-2', rotinaId: 'rot-001', titulo: 'Roda de Conversa', categoria: 'Interação', pictogramaKey: 'roda_conversa', ordem: 2, duracaoMinutos: 20, concluido: true },
        { id: 'it-3', rotinaId: 'rot-001', titulo: 'Atividade no Caderno', categoria: 'Pedagógico', pictogramaKey: 'atividade_mesa', ordem: 3, duracaoMinutos: 30, concluido: false },
        { id: 'it-4', rotinaId: 'rot-001', titulo: 'Lavar Mãos e Lanche', categoria: 'Alimentação', pictogramaKey: 'lanche', ordem: 4, duracaoMinutos: 25, concluido: false },
        { id: 'it-5', rotinaId: 'rot-001', titulo: 'Parque / Recreio', categoria: 'Lazer', pictogramaKey: 'parque', ordem: 5, duracaoMinutos: 30, concluido: false },
        { id: 'it-6', rotinaId: 'rot-001', titulo: 'Guardar Mochila e Saída', categoria: 'Transição', pictogramaKey: 'saida', ordem: 6, duracaoMinutos: 15, concluido: false }
      ];

      const itemStore = tx.objectStore('itens_rotina');
      itensIniciais.forEach((it) => itemStore.put(it));

      // Consentimento inicial LGPD
      const consentimento1: ConsentimentoLGPD = {
        id: 'cns-001',
        estudanteId: 'est-001',
        responsavelId: 'usr-resp-01',
        dataAceite: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        ipOrigem: '189.102.45.12',
        ativo: true,
        termoVersao: 'v1.2-2026'
      };
      tx.objectStore('consentimentos').put(consentimento1);

      // Crises históricas para visualização analítica no PEI
      const crisesIniciais: RegistroCrise[] = [
        {
          id: 'crs-001',
          estudanteId: 'est-001',
          professorId: 'usr-prof-01',
          dataHoraInicio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 3600 * 1000).toISOString(),
          dataHoraFim: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 3600 * 1000 + 380 * 1000).toISOString(),
          duracaoSegundos: 380,
          observacoes: 'Desregulação sensorial durante a transição da sala para o pátio.',
          sincronizadoOffline: true,
          criadoEmLocal: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'crs-002',
          estudanteId: 'est-001',
          professorId: 'usr-prof-01',
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
  return new Promise((resolve) => {
    const tx = db.transaction('itens_rotina', 'readonly');
    const store = tx.objectStore('itens_rotina');
    const req = store.getAll();
    req.onsuccess = () => {
      const items: ItemRotina[] = (req.result || []).filter((it: ItemRotina) => it.rotinaId === rotinaId);
      items.sort((a, b) => a.ordem - b.ordem);
      resolve(items);
    };
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

export async function adicionarItemRotina(novoItem: Omit<ItemRotina, 'id'>, isOnline = true): Promise<ItemRotina> {
  const db = await getDB();
  const id = 'it-' + Date.now();
  const itemCompleto: ItemRotina = { ...novoItem, id };

  return new Promise(async (resolve, reject) => {
    const tx = db.transaction('itens_rotina', 'readwrite');
    const store = tx.objectStore('itens_rotina');
    const req = store.put(itemCompleto);
    req.onsuccess = async () => {
      if (!isOnline) {
        await adicionarAFilaSincronizacao('ITEM_ROTINA', itemCompleto);
      }
      resolve(itemCompleto);
    };
    req.onerror = () => reject(req.error);
  });
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
    id: 'crs-' + Date.now(),
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
  const agora = new Date();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('crises', 'readwrite');
    const criseStore = tx.objectStore('crises');

    const getReq = criseStore.get(criseId);
    getReq.onsuccess = async () => {
      const crise: RegistroCrise = getReq.result;
      if (!crise) return reject(new Error('Crise não encontrada'));

      crise.dataHoraFim = agora.toISOString();
      const inicioMs = new Date(crise.dataHoraInicio).getTime();
      const fimMs = agora.getTime();
      crise.duracaoSegundos = Math.max(1, Math.round((fimMs - inicioMs) / 1000));
      if (observacoes !== undefined) {
        crise.observacoes = observacoes;
      }
      crise.sincronizadoOffline = isOnline;

      criseStore.put(crise);

      // Se offline, adiciona à fila de sincronização para envio posterior
      if (!isOnline) {
        await adicionarAFilaSincronizacao('REGISTRO_CRISE', crise);
      }

      tx.oncomplete = () => resolve(crise);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function carregarCrises(estudanteId?: string): Promise<RegistroCrise[]> {
  const db = await getDB();
  return new Promise((resolve) => {
    const tx = db.transaction('crises', 'readonly');
    const store = tx.objectStore('crises');
    const req = store.getAll();
    req.onsuccess = () => {
      let result: RegistroCrise[] = req.result || [];
      if (estudanteId) {
        result = result.filter((c) => c.estudanteId === estudanteId);
      }
      result.sort((a, b) => new Date(b.dataHoraInicio).getTime() - new Date(a.dataHoraInicio).getTime());
      resolve(result);
    };
  });
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

export async function sincronizarFilaBatch(): Promise<number> {
  const db = await getDB();
  
  // Primeiro, verifica conectividade
  const { verificarConectividadeSupabase } = await import('./supabase');
  const online = await verificarConectividadeSupabase();
  
  if (!online) {
    console.log('[Sync] Offline — sincronização adiada');
    return 0;
  }

  return new Promise(async (resolve, reject) => {
    const tx = db.transaction(['sync_queue', 'crises', 'itens_rotina', 'consentimentos'], 'readwrite');
    const queueStore = tx.objectStore('sync_queue');
    const criseStore = tx.objectStore('crises');
    const itemStore = tx.objectStore('itens_rotina');
    const consentStore = tx.objectStore('consentimentos');

    const req = queueStore.getAll();
    req.onsuccess = async () => {
      const items: SyncItem[] = req.result || [];
      let sincronizados = 0;

      for (const item of items) {
        try {
          let sucesso = false;

          switch (item.tipo) {
            case 'REGISTRO_CRISE':
              sucesso = await sincronizarCriseComSupabase(item, criseStore);
              break;
            case 'ITEM_ROTINA':
              sucesso = await sincronizarItemRotinaComSupabase(item, itemStore);
              break;
            case 'CONSENTIMENTO':
              sucesso = await sincronizarConsentimentoComSupabase(item, consentStore);
              break;
          }

          if (sucesso) {
            sincronizados++;
            // Remove da fila local apenas após sucesso no Supabase
            queueStore.delete(item.id);
          } else {
            // Incrementa tentativas e mantém na fila
            item.tentativas += 1;
            item.status = item.tentativas >= 3 ? 'ERRO' : 'PENDENTE';
            queueStore.put(item);
          }
        } catch (err) {
          console.error('[Sync] Erro ao processar item:', item.id, err);
          item.tentativas += 1;
          item.status = item.tentativas >= 3 ? 'ERRO' : 'PENDENTE';
          queueStore.put(item);
        }
      }

      tx.oncomplete = () => resolve(sincronizados);
      tx.onerror = () => reject(tx.error);
    };
    req.onerror = () => reject(req.error);
  });
}

// --- Helpers de Sincronização por Tipo ---

async function sincronizarCriseComSupabase(
  item: SyncItem,
  criseStore: IDBObjectStore
): Promise<boolean> {
  const crise: RegistroCrise = item.payload;
  
  try {
    // Converte IDs locais para UUIDs se necessário (usa mapa ou gera novo)
    const remotoId = idMapLocalParaRemoto.get(crise.id) || crypto.randomUUID();
    
    const { error } = await supabase
      .from('registros_crise')
      .upsert({
        id: remotoId,
        estudante_id: crise.estudanteId,
        professor_id: crise.professorId,
        data_hora_inicio: crise.dataHoraInicio,
        data_hora_fim: crise.dataHoraFim,
        duracao_segundos: crise.duracaoSegundos,
        observacoes: crise.observacoes,
        sincronizado_offline: true,
        criado_em_local: crise.criadoEmLocal,
        recebido_em: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('[Sync] Erro ao sincronizar crise:', error);
      return false;
    }

    // Atualiza mapa de IDs
    idMapLocalParaRemoto.set(crise.id, remotoId);
    
    // Atualiza registro local
    crise.sincronizadoOffline = true;
    criseStore.put(crise);
    
    return true;
  } catch (err) {
    console.error('[Sync] Exceção ao sincronizar crise:', err);
    return false;
  }
}

async function sincronizarItemRotinaComSupabase(
  item: SyncItem,
  _itemStore: IDBObjectStore
): Promise<boolean> {
  const itemRotina: ItemRotina = item.payload;
  
  try {
    const remotoId = idMapLocalParaRemoto.get(itemRotina.id) || crypto.randomUUID();
    
    const { error } = await supabase
      .from('itens_rotina')
      .upsert({
        id: remotoId,
        rotina_id: itemRotina.rotinaId,
        titulo: itemRotina.titulo,
        categoria: itemRotina.categoria,
        pictograma_key: itemRotina.pictogramaKey,
        ordem: itemRotina.ordem,
        duracao_minutos: itemRotina.duracaoMinutos,
        concluido: itemRotina.concluido
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('[Sync] Erro ao sincronizar item rotina:', error);
      return false;
    }

    idMapLocalParaRemoto.set(itemRotina.id, remotoId);
    return true;
  } catch (err) {
    console.error('[Sync] Exceção ao sincronizar item rotina:', err);
    return false;
  }
}

async function sincronizarConsentimentoComSupabase(
  item: SyncItem,
  _consentStore: IDBObjectStore
): Promise<boolean> {
  const consentimento: ConsentimentoLGPD = item.payload;
  
  try {
    const remotoId = idMapLocalParaRemoto.get(consentimento.id) || crypto.randomUUID();
    
    const { error } = await supabase
      .from('consentimentos_lgpd')
      .upsert({
        id: remotoId,
        estudante_id: consentimento.estudanteId,
        responsavel_id: consentimento.responsavelId,
        data_aceite: consentimento.dataAceite,
        ip_origem: consentimento.ipOrigem,
        ativo: consentimento.ativo,
        termo_versao: consentimento.termoVersao,
        revogado_em: consentimento.ativo ? null : new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('[Sync] Erro ao sincronizar consentimento:', error);
      return false;
    }

    idMapLocalParaRemoto.set(consentimento.id, remotoId);
    return true;
  } catch (err) {
    console.error('[Sync] Exceção ao sincronizar consentimento:', err);
    return false;
  }
}

// Função para adicionar itens à fila de sincronização (usada pelas operações CRUD)
export async function adicionarAFilaSincronizacao(
  tipo: SyncItem['tipo'],
  payload: any
): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const syncItem: SyncItem = {
      id: 'sync-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      tipo,
      payload,
      criadoEm: new Date().toISOString(),
      tentativas: 0,
      status: 'PENDENTE'
    };
    const req = store.put(syncItem);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
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
  return new Promise(async (resolve, reject) => {
    const tx = db.transaction('consentimentos', 'readwrite');
    const store = tx.objectStore('consentimentos');
    const req = store.get(consentimentoId);
    req.onsuccess = async () => {
      const item: ConsentimentoLGPD = req.result;
      if (!item) return reject(new Error('Consentimento não encontrado'));
      item.ativo = !item.ativo;
      store.put(item);
      
      if (!isOnline) {
        await adicionarAFilaSincronizacao('CONSENTIMENTO', item);
      }
      
      tx.oncomplete = () => resolve(item);
    };
    req.onerror = () => reject(req.error);
  });
}
