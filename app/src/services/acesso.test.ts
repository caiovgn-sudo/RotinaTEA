import { describe, it, expect } from 'vitest';
import {
  acessoVisao,
  acessoVisoes,
  tipoAcesso,
  NOME_PERFIL,
  PROPOSITO_VISAO,
  ORDEM_VISOES
} from '../utils/acesso';
import type { Usuario } from '../types';

// Pilar 2 (Qualidade): regras de visibilidade por perfil importadas do código real (utils/acesso).

const professor: Usuario = { id: 'u1', nome: 'Prof', email: 'p@x.br', perfil: 'PROFESSOR' };
const responsavel: Usuario = { id: 'u2', nome: 'Resp', email: 'r@x.br', perfil: 'RESPONSAVEL' };

describe('Tipo de acesso', () => {
  it('distingue visitante, conta real e demonstração', () => {
    expect(tipoAcesso(null, false)).toBe('VISITANTE');
    expect(tipoAcesso(professor, false)).toBe('CONTA_REAL');
    expect(tipoAcesso(professor, true)).toBe('DEMONSTRACAO');
  });
});

describe('Visibilidade das visões por perfil', () => {
  it('visitante só acessa a prancha do aluno e recebe o motivo nas demais', () => {
    const v = acessoVisoes(null, false);
    expect(v.find((a) => a.perfil === 'ALUNO')?.permitida).toBe(true);
    for (const p of ['PROFESSOR', 'COORDENACAO', 'RESPONSAVEL'] as const) {
      const a = v.find((x) => x.perfil === p)!;
      expect(a.permitida).toBe(false);
      expect(a.motivo).toContain(NOME_PERFIL[p]);
    }
  });

  it('conta real acessa a visão do próprio perfil e a prancha do aluno', () => {
    expect(acessoVisao('PROFESSOR', professor, false).permitida).toBe(true);
    expect(acessoVisao('ALUNO', professor, false).permitida).toBe(true);
  });

  it('conta real não acessa visões de outros perfis e explica o motivo sem usar códigos técnicos', () => {
    const a = acessoVisao('PROFESSOR', responsavel, false);
    expect(a.permitida).toBe(false);
    expect(a.motivo).toContain('Responsável legal');
    expect(a.motivo).not.toContain('RESPONSAVEL');
  });

  it('modo demonstração libera todas as visões', () => {
    expect(acessoVisoes(professor, true).every((a) => a.permitida)).toBe(true);
  });
});

describe('Orientação por visão', () => {
  it('toda visão tem nome e frase de propósito', () => {
    for (const p of ORDEM_VISOES) {
      expect(NOME_PERFIL[p].length).toBeGreaterThan(0);
      expect(PROPOSITO_VISAO[p].length).toBeGreaterThan(20);
    }
  });
});
