export type PerfilUsuario = 'ALUNO' | 'PROFESSOR' | 'COORDENACAO' | 'RESPONSAVEL';

export type PapelVinculo = 'DOCENTE_REGENTE' | 'MEDIADOR' | 'RESPONSAVEL_LEGAL' | 'COORDENADOR';

export type StatusRotina = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
}

export interface Estudante {
  id: string;
  codigoAnonimizado: string; // Ex: "ALN-8921" (RN02: anonimização obrigatória na origem)
  turma: string;
  nivelSuporte: 1 | 2 | 3; // 1: Leve, 2: Moderado, 3: Substancial
}

export interface VinculoUsuarioEstudante {
  id: string;
  usuarioId: string;
  estudanteId: string;
  papel: PapelVinculo;
  dataInicio: string;
}

export interface ItemRotina {
  id: string;
  rotinaId: string;
  titulo: string;
  categoria: string;
  pictogramaKey: string;
  ordem: number;
  duracaoMinutos: number;
  concluido: boolean;
}

export interface RotinaVisual {
  id: string;
  estudanteId: string;
  data: string;
  status: StatusRotina;
  itens: ItemRotina[];
}

export interface RegistroCrise {
  id: string;
  estudanteId: string;
  professorId: string;
  dataHoraInicio: string; // ISO string com timestamp
  dataHoraFim: string | null; // ISO string
  duracaoSegundos: number;
  observacoes?: string;
  sincronizadoOffline: boolean; // RN03
  criadoEmLocal: string;
}

export interface ConsentimentoLGPD {
  id: string;
  estudanteId: string;
  responsavelId: string;
  dataAceite: string;
  ipOrigem: string;
  ativo: boolean;
  termoVersao: string;
}

export interface SyncItem {
  id: string;
  tipo: 'REGISTRO_CRISE' | 'ITEM_ROTINA' | 'CONSENTIMENTO';
  payload: any;
  criadoEm: string;
  tentativas: number;
  status: 'PENDENTE' | 'ENVIADO' | 'ERRO';
}
