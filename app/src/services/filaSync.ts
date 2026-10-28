/**
 * Processamento da fila de sincronização (RN03) — lógica pura e testável.
 *
 * Por que existe: o IndexedDB encerra a transação automaticamente quando não há
 * requisições pendentes. Fazer `await` de chamadas de rede DENTRO de uma transação
 * faz com que as gravações seguintes falhem. Aqui a rede e o armazenamento local são
 * etapas separadas: `enviar` (rede) → `aoSucesso`/`aoFalha` (transações curtas).
 */
import type { SyncItem } from '../types';
import { statusAposFalha } from '../utils/regras';

export interface ManipuladoresFila {
  /** Envia o item ao servidor. Deve ser idempotente (upsert pelo id do registro). */
  enviar: (item: SyncItem) => Promise<boolean>;
  /** Chamado após o servidor confirmar: remove da fila e marca o registro local como sincronizado. */
  aoSucesso: (item: SyncItem) => Promise<void>;
  /** Chamado após falha: persiste o item com tentativas/status atualizados. */
  aoFalha: (item: SyncItem) => Promise<void>;
}

/** Processa os itens em ordem de criação. Retorna quantos foram sincronizados com sucesso. */
export async function processarFilaSync(itens: SyncItem[], h: ManipuladoresFila): Promise<number> {
  const ordenados = [...itens].sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
  let sincronizados = 0;

  for (const original of ordenados) {
    const item: SyncItem = { ...original };

    let enviado = false;
    try {
      enviado = await h.enviar(item);
    } catch {
      enviado = false;
    }

    if (enviado) {
      try {
        await h.aoSucesso(item);
        sincronizados++;
      } catch {
        // O servidor já recebeu. Como o envio é idempotente, o item permanece na fila
        // e será reenviado sem criar duplicata.
      }
      continue;
    }

    item.tentativas += 1;
    item.status = statusAposFalha(item.tentativas);
    try {
      await h.aoFalha(item);
    } catch {
      // Falha ao registrar a tentativa: o item original continua na fila.
    }
  }

  return sincronizados;
}
