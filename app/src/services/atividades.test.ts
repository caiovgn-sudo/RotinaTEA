import { describe, it, expect } from 'vitest';
import {
  registrarAtividade,
  descricaoSegura,
  lerAtividades,
  gravarAtividades,
  LIMITE_ATIVIDADES,
  CHAVE_ATIVIDADES,
  type Atividade
} from '../utils/atividades';

// Pilar 2 (Qualidade) e Pilar 3 (RN02): o registro de atividades é local e sem dados pessoais.

const memoria = () => {
  const dados: Record<string, string> = {};
  return {
    getItem: (k: string) => (k in dados ? dados[k] : null),
    setItem: (k: string, v: string) => {
      dados[k] = v;
    },
    dados
  };
};

describe('Registro de atividades — privacidade (RN02)', () => {
  it('remove código de aluno, e-mail e número de CPF do texto', () => {
    const t = descricaoSegura('Crise do ALN-8921 anotada por ana@escola.edu.br, CPF 123.456.789-09');
    expect(t).not.toMatch(/ALN-\d{4}/);
    expect(t).not.toContain('@');
    expect(t).not.toContain('123.456.789-09');
    expect(t).toContain('[código do aluno]');
  });

  it('preserva textos comuns sem alteração', () => {
    expect(descricaoSegura('Crise encerrada: 45s. Salva neste aparelho.')).toBe('Crise encerrada: 45s. Salva neste aparelho.');
  });

  it('aplica a limpeza ao registrar', () => {
    const lista = registrarAtividade([], 'CRISE_INICIADA', 'Crise do ALN-1234 iniciada');
    expect(lista[0].descricao).not.toContain('ALN-1234');
  });
});

describe('Registro de atividades — lista', () => {
  it('coloca a mais recente no topo sem alterar a lista original', () => {
    const base = registrarAtividade([], 'ACESSO', 'Primeira', '2026-10-28T10:00:00.000Z', 'a');
    const nova = registrarAtividade(base, 'CONEXAO', 'Segunda', '2026-10-28T10:01:00.000Z', 'b');
    expect(nova.map((a) => a.descricao)).toEqual(['Segunda', 'Primeira']);
    expect(base).toHaveLength(1);
  });

  it('mantém no máximo o limite de itens, descartando os mais antigos', () => {
    let lista: Atividade[] = [];
    for (let i = 0; i < LIMITE_ATIVIDADES + 5; i++) {
      lista = registrarAtividade(lista, 'ROTINA', 'Ação ' + i, new Date(2026, 9, 28, 10, i).toISOString(), 'id' + i);
    }
    expect(lista).toHaveLength(LIMITE_ATIVIDADES);
    expect(lista[0].descricao).toBe('Ação ' + (LIMITE_ATIVIDADES + 4));
  });
});

describe('Registro de atividades — armazenamento local', () => {
  it('grava e lê de volta o mesmo conteúdo', () => {
    const m = memoria();
    const lista = registrarAtividade([], 'SINCRONIZACAO', '2 registro(s) enviados ao servidor.', '2026-10-28T10:00:00.000Z', 'x');
    gravarAtividades(m, lista);
    expect(lerAtividades(m)).toEqual(lista);
  });

  it('dados corrompidos, de formato errado ou ausentes resultam em lista vazia', () => {
    const m = memoria();
    expect(lerAtividades(m)).toEqual([]);
    m.dados[CHAVE_ATIVIDADES] = '{não é json';
    expect(lerAtividades(m)).toEqual([]);
    m.dados[CHAVE_ATIVIDADES] = JSON.stringify({ a: 1 });
    expect(lerAtividades(m)).toEqual([]);
  });

  it('descarta entradas inválidas e preserva as válidas', () => {
    const m = memoria();
    m.dados[CHAVE_ATIVIDADES] = JSON.stringify([
      { id: '1', tipo: 'ACESSO', descricao: 'ok', em: '2026-10-28T10:00:00.000Z' },
      { id: '2', tipo: 'TIPO_QUE_NAO_EXISTE', descricao: 'x', em: '2026-10-28T10:00:00.000Z' },
      { id: '3', tipo: 'ACESSO', descricao: 'data ruim', em: 'ontem' },
      42
    ]);
    expect(lerAtividades(m).map((a) => a.id)).toEqual(['1']);
  });

  it('funciona sem armazenamento disponível e tolera falha de gravação', () => {
    expect(lerAtividades(null)).toEqual([]);
    expect(() => gravarAtividades(null, [])).not.toThrow();
    const cheio = {
      setItem: () => {
        throw new Error('cota excedida');
      }
    };
    expect(() => gravarAtividades(cheio, [])).not.toThrow();
  });
});
