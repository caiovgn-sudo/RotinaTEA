import React, { useState } from 'react';
import { ItemRotina } from '../types';
import { ACERVO_PICTOGRAMAS } from '../assets/pictograms';

interface ConfiguracaoRotinaProps {
  itens: ItemRotina[];
  onAdicionarItem: (novo: Omit<ItemRotina, 'id'>) => void;
  rotinaId: string;
}

export const ConfiguracaoRotina: React.FC<ConfiguracaoRotinaProps> = ({
  itens,
  onAdicionarItem,
  rotinaId
}) => {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Pedagógico');
  const [pictogramaKey, setPictogramaKey] = useState('atividade_mesa');
  const [duracaoMinutos, setDuracaoMinutos] = useState(20);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    onAdicionarItem({
      rotinaId,
      titulo: titulo.trim(),
      categoria,
      pictogramaKey,
      ordem: itens.length + 1,
      duracaoMinutos: Number(duracaoMinutos),
      concluido: false
    });

    setTitulo('');
    setMensagemSucesso('Nova atividade adicionada com sucesso à rotina!');
    setTimeout(() => setMensagemSucesso(''), 3000);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', fontWeight: 700 }}>
          Configuração da Rotina do Aluno
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Adicione e personalize os cartões de rotina com os símbolos padronizados ARASAAC.
        </p>
      </div>

      {mensagemSucesso && (
        <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', padding: '12px 16px', borderRadius: 8, fontWeight: 600 }}>
          ✓ {mensagemSucesso}
        </div>
      )}

      {/* Formulário de Novo Item */}
      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 16, border: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: 16 }}>Novo Cartão de Atividade</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div>
            <label htmlFor="card-title" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              Título da Atividade:
            </label>
            <input
              id="card-title"
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Pintura com Tinta Guache"
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border-light)', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label htmlFor="card-cat" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              Categoria:
            </label>
            <select
              id="card-cat"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border-light)', fontFamily: 'inherit' }}
            >
              <option value="Transição">Transição</option>
              <option value="Interação">Interação</option>
              <option value="Pedagógico">Pedagógico</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Lazer">Lazer</option>
              <option value="Artes">Artes</option>
              <option value="Autocuidado">Autocuidado</option>
            </select>
          </div>

          <div>
            <label htmlFor="card-pic" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              Pictograma Padronizado (ARASAAC):
            </label>
            <select
              id="card-pic"
              value={pictogramaKey}
              onChange={(e) => setPictogramaKey(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border-light)', fontFamily: 'inherit' }}
            >
              {Object.values(ACERVO_PICTOGRAMAS).map((pic) => (
                <option key={pic.key} value={pic.key}>
                  {pic.nome} ({pic.categoria})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="card-dur" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              Duração Estimada (minutos):
            </label>
            <input
              id="card-dur"
              type="number"
              min="5"
              max="120"
              value={duracaoMinutos}
              onChange={(e) => setDuracaoMinutos(Number(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border-light)', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Prévia do Pictograma Selecionado */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 16, backgroundColor: 'var(--bg-app)', padding: 12, borderRadius: 10 }}>
          <div
            style={{ width: 60, height: 60 }}
            dangerouslySetInnerHTML={{ __html: ACERVO_PICTOGRAMAS[pictogramaKey]?.svg || '' }}
          />
          <div>
            <strong style={{ fontSize: '0.9rem' }}>Prévia do Símbolo Visual:</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {ACERVO_PICTOGRAMAS[pictogramaKey]?.descricaoAcessivel}
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="btn-timer primary"
          style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}
        >
          + Adicionar Cartão à Rotina
        </button>
      </form>
    </div>
  );
};
