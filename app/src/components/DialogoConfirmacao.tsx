import React, { useEffect, useRef } from 'react';

interface DialogoConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  /** Texto curto em linguagem simples: o que vai acontecer e se dá para desfazer. */
  mensagem: React.ReactNode;
  rotuloConfirmar: string;
  rotuloCancelar?: string;
  /** Destaca a ação como difícil de desfazer. */
  perigo?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/**
 * Diálogo de confirmação acessível (alertdialog): o foco inicial fica em "Cancelar" (escolha segura),
 * Esc cancela, Tab circula entre os botões e o foco volta ao elemento que abriu o diálogo.
 */
export const DialogoConfirmacao: React.FC<DialogoConfirmacaoProps> = ({
  aberto,
  titulo,
  mensagem,
  rotuloConfirmar,
  rotuloCancelar = 'Cancelar',
  perigo = false,
  onConfirmar,
  onCancelar
}) => {
  const cancelarRef = useRef<HTMLButtonElement>(null);
  const confirmarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    cancelarRef.current?.focus();
    return () => anterior?.focus?.();
  }, [aberto]);

  if (!aberto) return null;

  const aoTeclar = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onCancelar();
    } else if (e.key === 'Tab') {
      const ativo = document.activeElement;
      if (e.shiftKey && ativo === cancelarRef.current) {
        e.preventDefault();
        confirmarRef.current?.focus();
      } else if (!e.shiftKey && ativo === confirmarRef.current) {
        e.preventDefault();
        cancelarRef.current?.focus();
      }
    }
  };

  return (
    <div className="modal-overlay" onKeyDown={aoTeclar}>
      <div
        className="modal-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialogo-titulo"
        aria-describedby="dialogo-mensagem"
      >
        <h3 id="dialogo-titulo" style={{ fontSize: '1.2rem', marginBottom: 8 }}>
          {titulo}
        </h3>
        <div id="dialogo-mensagem" style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {mensagem}
        </div>
        <div className="modal-actions">
          <button ref={cancelarRef} type="button" className="btn btn-secondary" onClick={onCancelar}>
            {rotuloCancelar}
          </button>
          <button
            ref={confirmarRef}
            type="button"
            className={perigo ? 'btn btn-perigo' : 'btn btn-primary'}
            onClick={onConfirmar}
          >
            {rotuloConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};
