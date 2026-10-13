import React, { useState, useEffect } from 'react';

interface TemporizadorVisualProps {
  tituloAtividade: string;
  duracaoMinutosPadrao: number;
}

export const TemporizadorVisual: React.FC<TemporizadorVisualProps> = ({
  tituloAtividade,
  duracaoMinutosPadrao
}) => {
  const [segundosTotais, setSegundosTotais] = useState(duracaoMinutosPadrao * 60);
  const [segundosRestantes, setSegundosRestantes] = useState(duracaoMinutosPadrao * 60);
  const [ativo, setAtivo] = useState(false);
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    const novosSegundos = duracaoMinutosPadrao * 60;
    setSegundosTotais(novosSegundos);
    setSegundosRestantes(novosSegundos);
    setAtivo(false);
    setConcluido(false);
  }, [duracaoMinutosPadrao, tituloAtividade]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (ativo && segundosRestantes > 0) {
      interval = setInterval(() => {
        setSegundosRestantes((prev) => {
          if (prev <= 1) {
            setAtivo(false);
            setConcluido(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [ativo, segundosRestantes]);

  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  const textoTempoFormatado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

  const raio = 54;
  const circunferencia = 2 * Math.PI * raio;
  const percentual = segundosTotais > 0 ? segundosRestantes / segundosTotais : 0;
  const strokeDashoffset = circunferencia - percentual * circunferencia;

  const toggleAtivo = () => {
    if (segundosRestantes === 0) {
      setSegundosRestantes(segundosTotais);
      setConcluido(false);
    }
    setAtivo(!ativo);
  };

  const reiniciar = () => {
    setAtivo(false);
    setSegundosRestantes(segundosTotais);
    setConcluido(false);
  };

  return (
    <section className="timer-widget" aria-label="Temporizador Visual Adaptado">
      <div className="timer-info">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Temporizador Visual Adaptado
        </span>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginTop: '4px', fontWeight: 600 }}>
          {tituloAtividade || 'Atividade da Rotina'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Transição suave e sem sobrecarga sensorial. Acompanhe a diminuição do anel de tempo.
        </p>

        <div className="timer-controls" style={{ marginTop: '16px' }}>
          <button
            type="button"
            className="btn-timer primary"
            onClick={toggleAtivo}
            aria-label={ativo ? 'Pausar temporizador' : 'Iniciar temporizador'}
          >
            <span aria-hidden="true">{ativo ? '⏸️' : '▶️'}</span>
            <span>{ativo ? 'Pausar' : 'Iniciar'}</span>
          </button>
          <button
            type="button"
            className="btn-timer"
            onClick={reiniciar}
            aria-label="Reiniciar tempo da atividade"
          >
            <span aria-hidden="true">🔄</span>
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      <div className="timer-visual-circle" aria-live="polite">
        <svg width="140" height="140" className="timer-progress-ring" aria-hidden="true">
          {/* Anel de Fundo */}
          <circle
            cx="70"
            cy="70"
            r={raio}
            stroke="var(--bg-app)"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Anel Progressivo */}
          <circle
            cx="70"
            cy="70"
            r={raio}
            stroke={concluido ? 'var(--success)' : 'var(--warning)'}
            strokeWidth="12"
            strokeDasharray={circunferencia}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.4s' }}
          />
        </svg>

        <div className="timer-time-label">
          {concluido ? (
            <span style={{ color: 'var(--success)', fontSize: '1.1rem' }}>✓ Feito</span>
          ) : (
            textoTempoFormatado
          )}
        </div>
      </div>
    </section>
  );
};
