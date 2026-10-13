// Serviço de Persistência Local (IndexedDB) - Arquitetura Offline-First (RN03)
import { Estudante, ItemRotina, RegistroCrise, RotinaVisual, ConsentimentoLGPD, SyncItem } from '../types';

const DB_NAME = 'rotinatea_offline_db';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

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

export async function adicionarItemRotina(novoItem: Omit<ItemRotina, 'id'>): Promise<ItemRotina> {
  const db = await getDB();
  const id = 'it-' + Date.now();
  const itemCompleto: ItemRotina = { ...novoItem, id };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('itens_rotina', 'readwrite');
    const store = tx.objectStore('itens_rotina');
    const req = store.put(itemCompleto);
    req.onsuccess = () => resolve(itemCompleto);
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
    const tx = db.transaction(['crises', 'sync_queue'], 'readwrite');
    const criseStore = tx.objectStore('crises');
    const queueStore = tx.objectStore('sync_queue');

    const getReq = criseStore.get(criseId);
    getReq.onsuccess = () => {
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

      // Se offline ou com envio assíncrono, adiciona à fila de sincronização
      if (!isOnline) {
        const syncItem: SyncItem = {
          id: 'sync-' + Date.now(),
          tipo: 'REGISTRO_CRISE',
          payload: crise,
          criadoEm: agora.toISOString(),
          tentativas: 0,
          status: 'PENDENTE'
        };
        queueStore.put(syncItem);
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
  return new Promise((resolve) => {
    const tx = db.transaction(['sync_queue', 'crises'], 'readwrite');
    const queueStore = tx.objectStore('sync_queue');
    const criseStore = tx.objectStore('crises');

    const req = queueStore.getAll();
    req.onsuccess = () => {
      const items: SyncItem[] = req.result || [];
      const total = items.length;

      items.forEach((item) => {
        if (item.tipo === 'REGISTRO_CRISE') {
          const crise: RegistroCrise = item.payload;
          crise.sincronizadoOffline = true;
          criseStore.put(crise);
        }
        queueStore.delete(item.id);
      });

      tx.oncomplete = () => resolve(total);
    };
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

export async function alternarConsentimento(consentimentoId: string): Promise<ConsentimentoLGPD> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('consentimentos', 'readwrite');
    const store = tx.objectStore('consentimentos');
    const req = store.get(consentimentoId);
    req.onsuccess = () => {
      const item: ConsentimentoLGPD = req.result;
      if (!item) return reject(new Error('Consentimento não encontrado'));
      item.ativo = !item.ativo;
      store.put(item);
      tx.oncomplete = () => resolve(item);
    };
    req.onerror = () => reject(req.error);
  });
}
