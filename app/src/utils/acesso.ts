/**
 * Regras de visibilidade das visões por perfil e tipo de acesso (sem dependência de React).
 * Pilar 1 (Engenharia): navegação coerente com o perfil; Pilar 3: o servidor continua sendo
 * a fonte de verdade (RLS) — esta lógica apenas explica ao usuário o que ele pode abrir.
 */
import type { PerfilUsuario, Usuario } from '../types';

export const NOME_PERFIL: Record<PerfilUsuario, string> = {
  ALUNO: 'Aluno',
  PROFESSOR: 'Professor',
  COORDENACAO: 'Coordenação pedagógica',
  RESPONSAVEL: 'Responsável legal'
};

/** Para quem é cada visão e para que serve, em linguagem simples. */
export const PROPOSITO_VISAO: Record<PerfilUsuario, string> = {
  ALUNO: 'Para o aluno: veja a sequência do dia em cartões e acompanhe o tempo de cada atividade. Não precisa de login.',
  PROFESSOR: 'Para educadores: registre e acompanhe crises durante a aula, com um clique, e monte a rotina do aluno.',
  COORDENACAO: 'Para a coordenação: acompanhe métricas anonimizadas para o PEI. Nenhum nome de aluno é exibido.',
  RESPONSAVEL: 'Para responsáveis legais: veja quais dados são tratados e autorize ou revogue o consentimento.'
};

export type TipoAcesso = 'VISITANTE' | 'CONTA_REAL' | 'DEMONSTRACAO';

export function tipoAcesso(usuario: Usuario | null, demo: boolean): TipoAcesso {
  if (!usuario) return 'VISITANTE';
  return demo ? 'DEMONSTRACAO' : 'CONTA_REAL';
}

export const ROTULO_TIPO_ACESSO: Record<TipoAcesso, { titulo: string; detalhe: string }> = {
  VISITANTE: {
    titulo: 'Visitante',
    detalhe: 'Sem login: apenas a prancha do aluno está liberada.'
  },
  CONTA_REAL: {
    titulo: 'Conta real',
    detalhe: 'Você entrou com uma conta cadastrada. Os registros são enviados ao servidor quando há conexão.'
  },
  DEMONSTRACAO: {
    titulo: 'Modo demonstração (dados fictícios, só neste navegador)',
    detalhe: 'Nada é enviado ao servidor. Use para conhecer o sistema sem criar conta.'
  }
};

export interface AcessoVisao {
  perfil: PerfilUsuario;
  permitida: boolean;
  /** Explicação em linguagem simples quando a visão está bloqueada. */
  motivo: string | null;
}

export function acessoVisao(perfil: PerfilUsuario, usuario: Usuario | null, demo: boolean): AcessoVisao {
  if (perfil === 'ALUNO') return { perfil, permitida: true, motivo: null };

  if (!usuario) {
    return { perfil, permitida: false, motivo: `Exige login com uma conta de ${NOME_PERFIL[perfil]}.` };
  }
  if (demo || usuario.perfil === perfil) return { perfil, permitida: true, motivo: null };

  return {
    perfil,
    permitida: false,
    motivo: `Sua conta é de ${NOME_PERFIL[usuario.perfil]}; esta visão é exclusiva de ${NOME_PERFIL[perfil]}.`
  };
}

export const ORDEM_VISOES: readonly PerfilUsuario[] = ['ALUNO', 'PROFESSOR', 'COORDENACAO', 'RESPONSAVEL'];

export function acessoVisoes(usuario: Usuario | null, demo: boolean): AcessoVisao[] {
  return ORDEM_VISOES.map((p) => acessoVisao(p, usuario, demo));
}
