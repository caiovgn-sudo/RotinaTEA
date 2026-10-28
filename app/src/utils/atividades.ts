/**
 * Registro local de atividades (últimas ações do usuário), sem dados pessoais.
 * Pilar 1: feedback persistente em vez de avisos que somem; Pilar 3 (RN02): nada que
 * identifique o aluno ou a pessoa é guardado no registro.
 */
export type TipoAtividade =
  | 'CRISE_INICIADA'
  | 'CRISE_ENCERRADA'
  | 'CRISE_EXCLUIDA'
  | 'CONSENTIMENTO'
  | 'SINCRONIZACAO'
  | 'CONEXAO'
  | 'ACESSO'
  | 'ROTINA'
  | 'SUS';

export interface Atividade {
  id: string;
  tipo: TipoAtividade;
  descricao: string;
  /** ISO 8601 */
  em: string;
}

export const LIMITE_ATIVIDADES = 30;
export const CHAVE_ATIVIDADES = 'rotinatea_atividades';

/** RN02: remove códigos de aluno (ALN-XXXX), e-mails e números longos (CPF, telefone) do texto. */
export function descricaoSegura(texto: string): string {
  return texto
    .replace(/ALN-\d{4}/gi, '[código do aluno]')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[e-mail]')
    .replace(/\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2}/g, '[número]')
    .trim();
}

/** Adiciona a atividade mais recente no topo, respeitando o limite. Não altera a lista original. */
export function registrarAtividade(
  lista: Atividade[],
  tipo: TipoAtividade,
  descricao: string,
  em: string = new Date().toISOString(),
  id: string = em + '-' + lista.length
): Atividade[] {
  const nova: Atividade = { id, tipo, descricao: descricaoSegura(descricao), em };
  return [nova, ...lista].slice(0, LIMITE_ATIVIDADES);
}

const TIPOS_VALIDOS: readonly TipoAtividade[] = [
  'CRISE_INICIADA',
  'CRISE_ENCERRADA',
  'CRISE_EXCLUIDA',
  'CONSENTIMENTO',
  'SINCRONIZACAO',
  'CONEXAO',
  'ACESSO',
  'ROTINA',
  'SUS'
];

function ehAtividade(v: unknown): v is Atividade {
  if (!v || typeof v !== 'object') return false;
  const a = v as Record<string, unknown>;
  return (
    typeof a.id === 'string' &&
    typeof a.descricao === 'string' &&
    typeof a.em === 'string' &&
    !Number.isNaN(Date.parse(a.em)) &&
    TIPOS_VALIDOS.includes(a.tipo as TipoAtividade)
  );
}

type Leitura = Pick<Storage, 'getItem'>;
type Gravacao = Pick<Storage, 'setItem'>;

/** Lê o registro guardado; qualquer dado inválido ou ausência de armazenamento resulta em lista vazia. */
export function lerAtividades(armazenamento: Leitura | null | undefined): Atividade[] {
  try {
    const bruto = armazenamento?.getItem(CHAVE_ATIVIDADES);
    if (!bruto) return [];
    const dados: unknown = JSON.parse(bruto);
    if (!Array.isArray(dados)) return [];
    return dados.filter(ehAtividade).slice(0, LIMITE_ATIVIDADES);
  } catch {
    return [];
  }
}

export function gravarAtividades(armazenamento: Gravacao | null | undefined, lista: Atividade[]): void {
  try {
    armazenamento?.setItem(CHAVE_ATIVIDADES, JSON.stringify(lista.slice(0, LIMITE_ATIVIDADES)));
  } catch {
    // armazenamento indisponível ou cheio: o registro continua só em memória
  }
}
