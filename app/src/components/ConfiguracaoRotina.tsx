import React, { useState, useCallback } from 'react';
import { ItemRotina } from '../types';
import { ACERVO_PICTOGRAMAS, PictogramaInfo } from '../assets/pictograms';

interface ConfiguracaoRotinaProps {
  itens: ItemRotina[];
  onAdicionarItem: (novo: Omit<ItemRotina, 'id'>) => void;
  rotinaId: string;
  isOnline?: boolean;
}

interface ArasaacPictogram {
  _id: string;
  keywords: string[];
  categories: string[];
  downloadURL: string;
  imageURL: string;
  loc: string;
}

export const ConfiguracaoRotina: React.FC<ConfiguracaoRotinaProps> = ({
  itens,
  onAdicionarItem,
  rotinaId,
  isOnline = true
}) => {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Pedagógico');
  const [pictogramaKey, setPictogramaKey] = useState('atividade_mesa');
  const [duracaoMinutos, setDuracaoMinutos] = useState(20);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  
  // Estados para busca ARASAAC
  const [buscaTermo, setBuscaTermo] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState<ArasaacPictogram[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erroBusca, setErroBusca] = useState<string | null>(null);
  const [mostrarBuscaOnline, setMostrarBuscaOnline] = useState(false);

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

  const buscarPictogramasARASAAC = useCallback(async (termo: string) => {
    if (!termo.trim() || termo.length < 2) {
      setResultadosBusca([]);
      return;
    }

    setBuscando(true);
    setErroBusca(null);

    try {
      const response = await fetch(
        `https://api.arasaac.org/api/pictograms/${encodeURIComponent(termo)}/pt?limit=10`
      );

      if (!response.ok) {
        throw new Error(`Erro na API ARASAAC: ${response.status}`);
      }

      const data: ArasaacPictogram[] = await response.json();
      setResultadosBusca(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao buscar pictogramas';
      setErroBusca(msg);
      console.error('[ARASAAC] Erro na busca:', err);
    } finally {
      setBuscando(false);
    }
  }, []);

  const handleBuscaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBuscaTermo(valor);
    // Debounce simples
    setTimeout(() => buscarPictogramasARASAAC(valor), 300);
  };

  const selecionarPictogramaOnline = (pictograma: ArasaacPictogram) => {
    // Cria uma chave única baseada no ID do ARASAAC
    const novaKey = `arasaac_${pictograma._id}`;
    
    // Adiciona ao acervo local dinamicamente (apenas para esta sessão)
    (ACERVO_PICTOGRAMAS as Record<string, PictogramaInfo>)[novaKey] = {
      key: novaKey,
      nome: pictograma.keywords[0] || 'Pictograma ARASAAC',
      categoria: pictograma.categories[0] || 'Importado',
      descricaoAcessivel: `Pictograma ARASAAC: ${pictograma.keywords.join(', ')}`,
      svg: '' // Será carregado via imageURL
    };

    setPictogramaKey(novaKey);
    setMostrarBuscaOnline(false);
    setBuscaTermo('');
    setResultadosBusca([]);
    setMensagemSucesso(`Pictograma "${pictograma.keywords[0]}" importado do ARASAAC!`);
    setTimeout(() => setMensagemSucesso(''), 3000);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
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
              <option value="Organização">Organização</option>
            </select>
          </div>

          {/* Seletor de Pictograma - Local + Online */}
          <div>
            <label htmlFor="card-pic" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              Pictograma Padronizado (ARASAAC):
            </label>
            
            {/* Toggle entre local e online */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-light)',
                  background: mostrarBuscaOnline ? 'var(--primary-light)' : 'var(--bg-surface)',
                  color: mostrarBuscaOnline ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
                onClick={() => { setMostrarBuscaOnline(false); setResultadosBusca([]); }}
              >
                📦 Offline (Curado)
              </button>
              <button
                type="button"
                disabled={!isOnline}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-light)',
                  background: mostrarBuscaOnline ? 'var(--primary)' : 'var(--bg-surface)',
                  color: mostrarBuscaOnline ? 'white' : isOnline ? 'var(--text-main)' : 'var(--text-subtle)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: isOnline ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  opacity: isOnline ? 1 : 0.6
                }}
                onClick={() => setMostrarBuscaOnline(true)}
              >
                🌐 Buscar Online (ARASAAC)
              </button>
            </div>

            {!mostrarBuscaOnline ? (
              // Seletor local
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
            ) : (
              // Busca online
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Buscar pictograma (ex: escola, comida, brincar)..."
                  value={buscaTermo}
                  onChange={handleBuscaChange}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--border-light)', fontFamily: 'inherit' }}
                  autoFocus
                />
                
                {buscando && (
                  <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)' }}>
                    <span className="spinner-sm" style={{ display: 'inline-block', marginRight: 8 }}></span>
                    Buscando no ARASAAC...
                  </div>
                )}
                
                {erroBusca && (
                  <div style={{ background: 'var(--crisis-light)', color: 'var(--crisis)', padding: '8px', borderRadius: 6, fontSize: '0.85rem' }}>
                    {erroBusca}
                  </div>
                )}

                {resultadosBusca.length > 0 && (
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: 8 }}>
                    {resultadosBusca.map((pic) => (
                      <button
                        key={pic._id}
                        type="button"
                        onClick={() => selecionarPictogramaOnline(pic)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 12px',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '1px solid var(--border-light)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontFamily: 'inherit'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <img
                          src={pic.imageURL}
                          alt={pic.keywords[0]}
                          style={{ width: 40, height: 40, borderRadius: 4 }}
                          loading="lazy"
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ fontSize: '0.85rem' }}>{pic.keywords[0]}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {pic.categories.join(', ')}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                          Selecionar
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {resultadosBusca.length === 0 && !buscando && buscaTermo.length >= 2 && !erroBusca && (
                  <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                    Nenhum pictograma encontrado para "{buscaTermo}"
                  </div>
                )}
              </div>
            )}
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
          {pictogramaKey.startsWith('arasaac_') ? (
            <img
              src={`https://api.arasaac.org/api/pictograms/${pictogramaKey.replace('arasaac_', '')}/download?format=svg`}
              alt={ACERVO_PICTOGRAMAS[pictogramaKey]?.descricaoAcessivel || 'Pictograma ARASAAC'}
              style={{ width: 60, height: 60 }}
            />
          ) : (
            <div
              style={{ width: 60, height: 60 }}
              dangerouslySetInnerHTML={{ __html: ACERVO_PICTOGRAMAS[pictogramaKey]?.svg || '' }}
            />
          )}
          <div>
            <strong style={{ fontSize: '0.9rem' }}>Prévia do Símbolo Visual:</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {ACERVO_PICTOGRAMAS[pictogramaKey]?.descricaoAcessivel || 'Pictograma importado da API ARASAAC'}
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