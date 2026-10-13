import React, { useState, useEffect } from 'react';
import { RegistroCrise, Estudante } from '../types';
import { formatarTempo } from './PainelPEI';

interface RegistroCriseProps {
  estudante: Estudante;
  criseAtiva: RegistroCrise | null;
  historicoCrises: RegistroCrise[];
  onIniciarCrise: () => void;
  onEncerrarCrise: (criseId: string, observacoes?: string) => void;
  isOnline: boolean;
}

export const RegistroCriseComponent: React.FC<RegistroCriseProps> = ({
  estudante,
  criseAtiva,
  historicoCrises,
  onIniciarCrise,
  onEncerrarCrise,
  isOnline
}) => {
  const [segundosDecorridos, setSegundosDecorridos] = useState(0);
  const [modalObservacaoAberto, setModalObservacaoAberto] = useState(false);
  const [criseRecenteId, setCriseRecenteId] = useState<string | null>(null);
  const [textoObservacao, setTextoObservacao] = useState('');

  // Contador em tempo real durante a crise
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (criseAtiva) {
      const inicioMs = new Date(criseAtiva.dataHoraInicio).getTime();
      const atualizar = () => {
        const agoraMs = Date.now();
        setSegundosDecorridos(Math.max(0, Math.floor((agoraMs - inicioMs) / 1000)));
      };
      atualizar();
      interval = setInterval(atualizar, 1000);
    } else {
      setSegundosDecorridos(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [criseAtiva]);

  const handleEncerrar = () => {
    if (!criseAtiva) return;
    const id = criseAtiva.id;
    setCriseRecenteId(id);
    onEncerrarCrise(id);
    setTextoObservacao('');
    setModalObservacaoAberto(true);
  };

  const handleSalvarObservacao = () => {
    if (criseRecenteId) {
      onEncerrarCrise(criseRecenteId, textoObservacao);
    }
    setModalObservacaoAberto(false);
  };

  const formatarRelogioDigital = (totalSegundos: number) => {
    const mins = Math.floor(totalSegundos / 60);
    const segs = totalSegundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  return (
    <section className={`crisis-panel ${criseAtiva ? 'active' : ''}`} aria-label="Painel de Registro Rápido de Crises">
      <div className="crisis-header">
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Registro Rápido em 1 Clique (RF03 / RN01)
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
            Acompanhamento de Desregulação — Aluno {estudante.codigoAnonimizado}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Modo: <strong>{isOnline ? 'Sincronização Direta' : 'Offline-First (IndexedDB)'}</strong>
          </span>
        </div>
      </div>

      {/* Botão de 1 Clique */}
      {!criseAtiva ? (
        <button
          type="button"
          className="btn-crisis-action start"
          onClick={onIniciarCrise}
          aria-label="Iniciar registro de crise em 1 clique"
        >
          <span style={{ fontSize: '1.4rem' }} aria-hidden="true">⚠️</span>
          <span>Iniciar Registro de Crise (1 Clique)</span>
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid var(--crisis)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--crisis)' }}></span>
              <strong style={{ color: 'var(--crisis)' }}>Crise em Andamento:</strong>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--crisis)', fontFamily: 'monospace' }}>
              {formatarRelogioDigital(segundosDecorridos)}
            </div>
          </div>

          <button
            type="button"
            className="btn-crisis-action stop"
            onClick={handleEncerrar}
            aria-label="Encerrar registro de crise e calcular duração"
          >
            <span style={{ fontSize: '1.4rem' }} aria-hidden="true">⏹️</span>
            <span>Encerrar Crise ({formatarRelogioDigital(segundosDecorridos)})</span>
          </button>
        </div>
      )}

      {/* Histórico Recente de Crises */}
      {historicoCrises.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Histórico Recente de Registros ({historicoCrises.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {historicoCrises.slice(0, 3).map((crise) => (
              <div
                key={crise.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: '8px',
                  fontSize: '0.85rem'
                }}
              >
                <div>
                  <strong>{new Date(crise.dataHoraInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                    Duração: {formatarTempo(crise.duracaoSegundos)} ({crise.duracaoSegundos}s)
                  </span>
                  {crise.observacoes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: 2 }}>
                      {crise.observacoes}
                    </div>
                  )}
                </div>

                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: crise.sincronizadoOffline ? 'var(--success-light)' : 'var(--warning-light)',
                    color: crise.sincronizadoOffline ? 'var(--success)' : 'var(--warning)',
                    fontWeight: 600
                  }}
                >
                  {crise.sincronizadoOffline ? '✓ Sincronizado' : '⏳ Salvo Offline'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Opcional de Observação Comportamental (Extensão) */}
      {modalObservacaoAberto && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-obs-titulo">
          <div className="modal-card">
            <h3 id="modal-obs-titulo" style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: 8 }}>
              Adicionar Observação Comportamental
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              O registro da crise já foi salvo com sucesso com os timestamps. Opcionalmente, adicione gatilhos ou notas para o PEI.
            </p>

            <label htmlFor="obs-text" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Observação / Possível Gatilho:
            </label>
            <textarea
              id="obs-text"
              rows={3}
              value={textoObservacao}
              onChange={(e) => setTextoObservacao(e.target.value)}
              placeholder="Ex: Mudança repentina de atividade, ruído intenso na quadra, agitação na sala..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                fontFamily: 'inherit',
                fontSize: '0.9rem'
              }}
            />

            <div className="modal-actions">
              <button
                type="button"
                className="btn-timer"
                onClick={() => setModalObservacaoAberto(false)}
              >
                Pular
              </button>
              <button
                type="button"
                className="btn-timer primary"
                onClick={handleSalvarObservacao}
              >
                Salvar Nota
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
