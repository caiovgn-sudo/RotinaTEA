/**
 * Regras de negócio puras do RotinaTEA (sem dependência de navegador/IndexedDB).
 * Ficam isoladas aqui para serem testáveis em Node e reutilizadas pela interface.
 * Pilar 2 (Qualidade): rastreabilidade RN01–RN05 ↔ código ↔ testes.
 */
import type { PerfilUsuario, RegistroCrise } from '../types';

/** Perfil atribuído a qualquer novo cadastro. Perfis de maior privilégio são concedidos pela coordenação (RNF04). */
export const PERFIL_PADRAO_CADASTRO: PerfilUsuario = 'RESPONSAVEL';

/** RN01 — Duração da crise (em segundos) a partir dos timestamps de início e fim. */
export function calcularDuracaoSegundos(inicioIso: string, fimIso: string): number {
  const inicio = new Date(inicioIso).getTime();
  const fim = new Date(fimIso).getTime();
  if (Number.isNaN(inicio) || Number.isNaN(fim)) {
    throw new Error('RN01: timestamps de início e fim devem ser datas válidas.');
  }
  if (fim < inicio) {
    throw new Error('RN01: o fim da crise não pode ser anterior ao início.');
  }
  return Math.max(1, Math.round((fim - inicio) / 1000));
}

/** RN01 — Uma crise em andamento (sem timestamp de fim) não pode ser excluída. */
export function podeExcluirCrise(crise: Pick<RegistroCrise, 'dataHoraFim'>): boolean {
  return crise.dataHoraFim !== null;
}

/** Perfis autorizados a registrar crises; espelha a RLS de `registros_crise` (migração 20261028000002). */
export const PERFIS_REGISTRAM_CRISE: readonly PerfilUsuario[] = ['PROFESSOR', 'COORDENACAO'];

export function podeRegistrarCrise(perfil: PerfilUsuario | null | undefined): boolean {
  return !!perfil && PERFIS_REGISTRAM_CRISE.includes(perfil);
}

/** RN02 — Código anonimizado do aluno (ex.: ALN-8921). */
export const REGEX_CODIGO_ANONIMIZADO = /^ALN-\d{4}$/;

export function validarCodigoAnonimizado(codigo: string): boolean {
  return REGEX_CODIGO_ANONIMIZADO.test(codigo);
}

/** LGPD (princípio da necessidade) — mascara o IP para exibição na interface. */
export function mascararIp(ip?: string | null): string {
  if (!ip) return '—';
  const v4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (v4) return `${v4[1]}.${v4[2]}.xxx.xxx`;
  if (ip.includes(':')) return `${ip.split(':')[0] || '0'}:…`;
  return '—';
}

/**
 * Texto do IP para a tela do responsável. O IP nunca é exibido por inteiro; o valor neutro de
 * exemplo (0.0.0.0) e a ausência de IP aparecem como “Não registrado”.
 */
export function descreverIpRegistrado(ip?: string | null): string {
  if (!ip || ip === '0.0.0.0') return 'Não registrado';
  return mascararIp(ip) + ' (parte do número é ocultada por privacidade)';
}

/** RN03 — Política de tentativas da fila de sincronização. */
export const MAX_TENTATIVAS_SYNC = 3;

export function statusAposFalha(tentativas: number): 'PENDENTE' | 'ERRO' {
  return tentativas >= MAX_TENTATIVAS_SYNC ? 'ERRO' : 'PENDENTE';
}
