import React from 'react';
import { ACERVO_PICTOGRAMAS } from '../assets/pictograms';

export type StatusCartao = 'concluido' | 'agora' | 'aguardando';

export interface CartaoRotinaProps {
  id: string;
  titulo: string;
  tempo: string;
  categoria: string;
  status: StatusCartao;
  isVisaoAluno: boolean; // Prop para diferenciar visão do Aluno vs. Educador
  pictogramaKey: string;
  ordem: number;
  isTimerAtivo?: boolean;
  onAlternar: (id: string) => void;
  onSelecionarParaTimer?: () => void;
  onMoverCima?: () => void;
  onMoverBaixo?: () => void;
  isPrimeiro?: boolean;
  isUltimo?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

export function CartaoRotina({
  id,
  titulo,
  tempo,
  categoria,
  status,
  isVisaoAluno,
  pictogramaKey,
  ordem,
  isTimerAtivo,
  onAlternar,
  onSelecionarParaTimer,
  onMoverCima,
  onMoverBaixo,
  isPrimeiro,
  isUltimo,
  onDragStart,
  onDragEnd
}: CartaoRotinaProps) {
  const pictograma = ACERVO_PICTOGRAMAS[pictogramaKey] || ACERVO_PICTOGRAMAS.acolhimento;

  return (
    <article
      role="listitem"
      draggable={isVisaoAluno}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`routine-card cartao-rotina ${status} ${status === 'agora' ? 'active-card' : ''} ${status === 'concluido' ? 'completed-card' : ''}`}
      tabIndex={0}
      aria-label={`Atividade ${ordem}: ${titulo}. Categoria: ${categoria}. Duração: ${tempo}. Status: ${
        status === 'concluido' ? 'Concluída' : status === 'agora' ? 'Em andamento agora' : 'Aguardando'
      }.`}
    >
      {/* Badge de Ordem */}
      <div className="card-order-badge" aria-hidden="true">
        {ordem}
      </div>

      {/* Badge de Status */}
      <span className={`card-status-badge ${status === 'concluido' ? 'done' : status === 'agora' ? 'now' : 'pending'}`}>
        {status === 'concluido' ? '✓ Concluído' : status === 'agora' ? '▶ Agora' : 'Aguardando'}
      </span>

      {/* Pictograma Padronizado ARASAAC */}
      <div
        className="card-pictogram"
        dangerouslySetInnerHTML={{ __html: pictograma.svg }}
        title={pictograma.descricaoAcessivel}
      />

      <h3 className="card-title">{titulo}</h3>

      <div className="card-time">
        <span aria-hidden="true">⏱️</span>
        <span>{tempo}</span>
        <span style={{ margin: '0 4px' }}>•</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>{categoria}</span>
      </div>

      {/* 2. Renderização Condicional: Só mostra controles de edição se NÃO for o aluno */}
      {!isVisaoAluno && (
        <div className="card-actions controles-edicao-professor">
          <button
            type="button"
            className={`btn-toggle-task ${status === 'concluido' ? 'btn-undo btn-desfazer' : 'btn-finish'}`}
            onClick={() => onAlternar(id)}
            aria-label={status === 'concluido' ? `Desfazer conclusão de ${titulo}` : `Marcar ${titulo} como concluída`}
          >
            <span aria-hidden="true">{status === 'concluido' ? '↩️' : '✓'}</span>
            <span>{status === 'concluido' ? 'Desfazer' : 'Concluir'}</span>
          </button>

          {onSelecionarParaTimer && (
            <button
              type="button"
              className="btn-order-nav"
              onClick={onSelecionarParaTimer}
              title="Carregar no Temporizador Visual"
              aria-label={`Carregar ${titulo} no Temporizador`}
              style={{
                backgroundColor: isTimerAtivo ? 'var(--primary-light)' : 'transparent',
                borderColor: isTimerAtivo ? 'var(--primary)' : 'var(--border-light)'
              }}
            >
              ⏱️
            </button>
          )}

          <button
            type="button"
            className="btn-order-nav btn-ordem"
            onClick={onMoverCima}
            disabled={isPrimeiro}
            title="Mover para antes"
            aria-label={`Mover ${titulo} para cima`}
          >
            ↑
          </button>
          <button
            type="button"
            className="btn-order-nav btn-ordem"
            onClick={onMoverBaixo}
            disabled={isUltimo}
            title="Mover para depois"
            aria-label={`Mover ${titulo} para baixo`}
          >
            ↓
          </button>
        </div>
      )}

      {/* 3. Botão de concluir amplo e acolhedor para o aluno na atividade que é AGORA */}
      {isVisaoAluno && status === 'agora' && (
        <div className="area-interacao-aluno" style={{ width: '100%', marginTop: 'auto' }}>
          <button
            type="button"
            className="btn-concluir-amplo"
            onClick={() => onAlternar(id)}
            aria-label={`Concluir tarefa atual: ${titulo}`}
          >
            <span style={{ fontSize: '1.3rem' }} aria-hidden="true">✓</span>
            <span>Concluir Tarefa</span>
          </button>
        </div>
      )}

      {/* Feedback visual sereno para tarefas já concluídas pelo aluno */}
      {isVisaoAluno && status === 'concluido' && (
        <div style={{ marginTop: 'auto', width: '100%', textAlign: 'center' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: 'rgba(92, 131, 116, 0.15)',
              color: 'var(--success)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <span aria-hidden="true">🌟</span>
            <span>Tarefa Concluída!</span>
          </div>
        </div>
      )}

      {/* Indicação serena para tarefas que estão aguardando sua vez */}
      {isVisaoAluno && status === 'aguardando' && (
        <div style={{ marginTop: 'auto', width: '100%', textAlign: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
            Próxima da rotina
          </span>
        </div>
      )}
    </article>
  );
}
