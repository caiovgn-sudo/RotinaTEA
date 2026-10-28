/**
 * Estado de sincronização em linguagem simples (sem dependência de navegador).
 * Pilar 1: transparência do offline-first (RN03); Pilar 2: lógica testável.
 */
import type { RegistroCrise, SyncItem } from '../types';
import { MAX_TENTATIVAS_SYNC } from './regras';

export type EstadoSyncCrise = 'SO_NESTE_APARELHO' | 'ENVIADA' | 'FALHOU';

export const ROTULO_ESTADO_SYNC: Record<EstadoSyncCrise, { texto: string; explicacao: string }> = {
  SO_NESTE_APARELHO: {
    texto: 'Salva só neste aparelho',
    explicacao: 'O registro está gravado neste aparelho e ainda não foi enviado ao servidor.'
  },
  ENVIADA: {
    texto: 'Enviada ao servidor',
    explicacao: 'O servidor confirmou o recebimento deste registro.'
  },
  FALHOU: {
    texto: 'Falhou o envio',
    explicacao: `O envio falhou ${MAX_TENTATIVAS_SYNC} vezes. O registro continua salvo neste aparelho; use “Tentar novamente” no painel de sincronização.`
  }
};

/**
 * No modo demonstração nada vai ao servidor, então toda crise fica só neste aparelho,
 * mesmo as de exemplo que vêm marcadas como enviadas.
 */
export function estadoSyncCrise(crise: RegistroCrise, fila: SyncItem[], modoDemo: boolean): EstadoSyncCrise {
  if (modoDemo) return 'SO_NESTE_APARELHO';
  if (crise.sincronizadoOffline) return 'ENVIADA';
  const falhou = fila.some(
    (i) => i.tipo === 'REGISTRO_CRISE' && (i.payload as RegistroCrise).id === crise.id && i.status === 'ERRO'
  );
  return falhou ? 'FALHOU' : 'SO_NESTE_APARELHO';
}

export interface ResumoFila {
  /** Aguardando envio (inclui os que já falharam, mas ainda têm tentativas). */
  pendentes: number;
  /** Esgotaram as tentativas e esperam ação do usuário. */
  comErro: number;
}

export function resumirFila(fila: SyncItem[]): ResumoFila {
  return {
    pendentes: fila.filter((i) => i.status === 'PENDENTE').length,
    comErro: fila.filter((i) => i.status === 'ERRO').length
  };
}

export const ROTULO_TIPO_SYNC: Record<SyncItem['tipo'], string> = {
  REGISTRO_CRISE: 'Registro de crise',
  ITEM_ROTINA: 'Cartão da rotina',
  CONSENTIMENTO: 'Consentimento LGPD'
};

export function descreverTentativas(item: SyncItem): string {
  return `${Math.min(item.tentativas, MAX_TENTATIVAS_SYNC)} de ${MAX_TENTATIVAS_SYNC} tentativas`;
}

/** “Tentar novamente”: devolve o item à fila com as tentativas zeradas, sem alterar o original. */
export function reativarItemFila(item: SyncItem): SyncItem {
  return { ...item, tentativas: 0, status: 'PENDENTE' };
}

/** A conexão efetiva é a real, a menos que o simulador de demonstração esteja forçando offline. */
export function conexaoEfetiva(real: boolean, simuladoOffline: boolean, simuladorDisponivel: boolean): boolean {
  return real && !(simuladorDisponivel && simuladoOffline);
}

export function rotuloConexao(real: boolean, simuladoOffline: boolean, simuladorDisponivel: boolean): string {
  if (!real) return 'Offline (sem internet neste aparelho)';
  if (simuladorDisponivel && simuladoOffline) return 'Offline (simulado)';
  return 'Online';
}
