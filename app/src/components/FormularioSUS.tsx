import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RespostaSUS } from '../types';
import { salvarRespostaSUS } from '../services/db';
import { PERGUNTAS_SUS, OPCOES_LIKERT, classificarSUS, formatarPontuacaoSUS } from '../utils/sus';

interface FormularioSUSProps {
  onClose: () => void;
  isOnline?: boolean;
  modoDemo?: boolean;
  onSalvo?: (resposta: RespostaSUS) => void;
}

export const FormularioSUS: React.FC<FormularioSUSProps> = ({ onClose, isOnline = true, modoDemo = false, onSalvo }) => {
  const { usuario } = useAuth();
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ pontuacao: number; classificacao: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const handleResposta = (perguntaId: number, valor: number) => {
    setRespostas(prev => ({ ...prev, [perguntaId]: valor }));
    setErro(null);
  };

  const getCorClassificacao = (pontuacao: number): string => {
    if (pontuacao >= 80) return 'var(--success-text)';
    if (pontuacao >= 70) return 'var(--warning-text)';
    if (pontuacao >= 50) return 'var(--crisis-text)';
    return 'var(--crisis-text)';
  };

  const todasRespondidas = PERGUNTAS_SUS.every(p => respostas[p.id] !== undefined);

  const handleEnviar = async () => {
    if (!todasRespondidas || !usuario) {
      setErro('Por favor, responda a todas as 10 perguntas antes de enviar.');
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      // Local primeiro (RN03): a resposta é gravada neste aparelho antes de qualquer envio
      const lista = PERGUNTAS_SUS.map((p) => respostas[p.id]);
      const salvo = await salvarRespostaSUS({ id: usuario.id, perfil: usuario.perfil }, lista, isOnline);
      const classificacao = classificarSUS(salvo.pontuacao);

      setResultado({ pontuacao: salvo.pontuacao, classificacao });
      setMensagemSucesso(
        'Avaliação salva ' +
          (modoDemo
            ? 'só neste aparelho (modo demonstração: nada é enviado ao servidor).'
            : isOnline
              ? 'neste aparelho e enviada ao servidor em segundo plano.'
              : 'neste aparelho. O envio ao servidor ocorre quando a conexão voltar.')
      );
      onSalvo?.(salvo);
    } catch {
      setErro('Não foi possível salvar a avaliação neste aparelho. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const responderTodas = (valor: number) => {
    const novasRespostas: Record<number, number> = {};
    PERGUNTAS_SUS.forEach(p => {
      novasRespostas[p.id] = valor;
    });
    setRespostas(novasRespostas);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="sus-titulo">
      <div className="modal-card" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 id="sus-titulo" style={{ fontSize: '1.4rem', color: 'var(--primary-text)', fontWeight: 700 }}>
            Formulário SUS — System Usability Scale
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
            style={{
              minWidth: 48,
              minHeight: 48,
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px 8px',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: 20, padding: 12, background: 'var(--bg-app)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <strong>Instruções:</strong> Avalie cada afirmação abaixo de 1 (Discordo totalmente) a 5 (Concordo totalmente). 
          Não há respostas certas ou erradas — queremos sua opinião sincera sobre a usabilidade do RotinaTEA.
        </div>

        {mensagemSucesso && (
          <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success-text)', padding: '12px 16px', borderRadius: 8, fontWeight: 600, marginBottom: 16 }}>
            ✓ {mensagemSucesso}
          </div>
        )}

        {erro && (
          <div style={{ backgroundColor: 'var(--crisis-light)', color: 'var(--crisis-text)', padding: '12px 16px', borderRadius: 8, fontWeight: 600, marginBottom: 16 }}>
            ✕ {erro}
          </div>
        )}

        {resultado && (
          <div style={{ 
            backgroundColor: 'var(--primary-light)', 
            color: getCorClassificacao(resultado.pontuacao), 
            padding: '16px', 
            borderRadius: 8, 
            fontWeight: 600, 
            marginBottom: 20,
            textAlign: 'center',
            border: `2px solid ${getCorClassificacao(resultado.pontuacao)}`
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 8 }}>
              {formatarPontuacaoSUS(resultado.pontuacao)} / 100
            </div>
            <div style={{ fontSize: '1.1rem' }}>
              {resultado.classificacao}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '50vh', overflowY: 'auto', paddingRight: 8 }}>
          {PERGUNTAS_SUS.map((pergunta) => (
            <div key={pergunta.id} style={{ 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-light)', 
              borderRadius: 10, 
              padding: '16px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ 
                  width: 28, 
                  height: 28, 
                  borderRadius: '50%', 
                  background: 'var(--primary)', 
                  color: 'var(--on-fill)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}>
                  {pergunta.id}
                </span>
                <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)', margin: 0 }}>
                  {pergunta.texto}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {OPCOES_LIKERT.map((opcao) => (
                  <button
                    key={opcao.valor}
                    type="button"
                    onClick={() => handleResposta(pergunta.id, opcao.valor)}
                    style={{
                      flex: 1,
                      minWidth: '80px',
                      padding: '10px 8px',
                      border: respostas[pergunta.id] === opcao.valor 
                        ? '2px solid var(--primary)' 
                        : '1px solid var(--border-light)',
                      borderRadius: 8,
                      background: respostas[pergunta.id] === opcao.valor 
                        ? 'var(--primary-light)' 
                        : 'var(--bg-surface)',
                      color: respostas[pergunta.id] === opcao.valor 
                        ? 'var(--primary)' 
                        : 'var(--text-main)',
                      fontWeight: respostas[pergunta.id] === opcao.valor ? 700 : 500,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                      textAlign: 'center'
                    }}
                    aria-pressed={respostas[pergunta.id] === opcao.valor}
                  >
                    {opcao.valor} — {opcao.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleEnviar}
            disabled={enviando || resultado !== null}
            style={{ flex: 1 }}
          >
            {enviando ? (
              <>
                <span className="spinner-sm" aria-hidden="true"></span>
                Enviando...
              </>
            ) : resultado ? (
              'Já Enviado ✓'
            ) : (
              'Enviar Avaliação SUS'
            )}
          </button>
        </div>

        {/* Atalhos de teste: só aparecem com VITE_SUS_ATALHOS_TESTE=true (geram dados inválidos para a avaliação real) */}
        {import.meta.env.VITE_SUS_ATALHOS_TESTE === 'true' && !resultado && !enviando && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border-light)' }}>
            <small style={{ color: 'var(--text-subtle)', flex: 1, textAlign: 'center' }}>
              Preenchimento rápido para testes:
            </small>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => responderTodas(3)}
              style={{ flex: 1 }}
            >
              Todos Neutro (3)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => responderTodas(4)}
              style={{ flex: 1 }}
            >
              Todos Concordo (4)
            </button>
          </div>
        )}

        <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-app)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
          <strong>Sobre o SUS:</strong> O System Usability Scale é um questionário padronizado de 10 itens 
          para avaliar a usabilidade percebida. Pontuação varia de 0 a 100. Média da indústria ≈ 68.
          <br />
          Avaliador: <strong>{usuario?.nome || 'Não identificado'}</strong> ({usuario?.perfil || 'N/A'})
        </div>
      </div>
    </div>
  );
};