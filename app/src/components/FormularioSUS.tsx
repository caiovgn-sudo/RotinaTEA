import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface FormularioSUSProps {
  onClose: () => void;
}

const PERGUNTAS_SUS = [
  { id: 1, texto: 'Acho que gostaria de usar este sistema frequentemente.', positivo: true },
  { id: 2, texto: 'Achei o sistema desnecessariamente complexo.', positivo: false },
  { id: 3, texto: 'Achei o sistema fácil de usar.', positivo: true },
  { id: 4, texto: 'Acho que precisaria da assistência de uma pessoa técnica para conseguir usar este sistema.', positivo: false },
  { id: 5, texto: 'Achei que as várias funções deste sistema foram bem integradas.', positivo: true },
  { id: 6, texto: 'Achei que havia muita inconsistência neste sistema.', positivo: false },
  { id: 7, texto: 'Acho que a maioria das pessoas aprenderia a usar este sistema muito rapidamente.', positivo: true },
  { id: 8, texto: 'Achei o sistema muito complicado de usar.', positivo: false },
  { id: 9, texto: 'Me senti muito confiante usando o sistema.', positivo: true },
  { id: 10, texto: 'Precisei aprender muitas coisas antes de poder usar este sistema.', positivo: false },
];

const OPCOES_LIKERT = [
  { valor: 1, label: 'Discordo totalmente' },
  { valor: 2, label: 'Discordo' },
  { valor: 3, label: 'Neutro' },
  { valor: 4, label: 'Concordo' },
  { valor: 5, label: 'Concordo totalmente' },
];

export const FormularioSUS: React.FC<FormularioSUSProps> = ({ onClose }) => {
  const { usuario } = useAuth();
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ pontuacao: number; classificacao: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const handleResposta = (perguntaId: number, valor: number) => {
    setRespostas(prev => ({ ...prev, [perguntaId]: valor }));
    setErro(null);
  };

  const calcularPontuacao = (): number => {
    let soma = 0;
    PERGUNTAS_SUS.forEach((p) => {
      const resposta = respostas[p.id];
      if (resposta === undefined) return;
      
      if (p.positivo) {
        // Para itens positivos: (resposta - 1)
        soma += resposta - 1;
      } else {
        // Para itens negativos: (5 - resposta)
        soma += 5 - resposta;
      }
    });
    // SUS score = soma * 2.5 (máximo 100)
    return Math.round(soma * 2.5);
  };

  const getClassificacao = (pontuacao: number): string => {
    if (pontuacao >= 90) return 'Excelente (Melhor do que 99% dos sistemas)';
    if (pontuacao >= 80) return 'Bom (Melhor do que 85% dos sistemas)';
    if (pontuacao >= 70) return 'Aceitável (Média da indústria)';
    if (pontuacao >= 50) return 'Pobre (Abaixo da média)';
    return 'Crítico (Sérios problemas de usabilidade)';
  };

  const getCorClassificacao = (pontuacao: number): string => {
    if (pontuacao >= 80) return 'var(--success)';
    if (pontuacao >= 70) return 'var(--warning)';
    if (pontuacao >= 50) return 'var(--crisis)';
    return 'var(--crisis)';
  };

  const todasRespondidas = PERGUNTAS_SUS.every(p => respostas[p.id] !== undefined);

  const handleEnviar = async () => {
    if (!todasRespondidas) {
      setErro('Por favor, responda a todas as 10 perguntas antes de enviar.');
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const pontuacao = calcularPontuacao();
      const classificacao = getClassificacao(pontuacao);

      // Aqui poderia salvar no Supabase se necessário
      // await supabase.from('sus_respostas').insert({ ... });

      setResultado({ pontuacao, classificacao });
      setMensagemSucesso(`SUS enviado! Pontuação: ${pontuacao}/100 — ${classificacao}`);
    } catch (err) {
      setErro('Erro ao enviar formulário. Tente novamente.');
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
          <h2 id="sus-titulo" style={{ fontSize: '1.4rem', color: 'var(--primary)', fontWeight: 700 }}>
            Formulário SUS — System Usability Scale
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
            style={{
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
          <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', padding: '12px 16px', borderRadius: 8, fontWeight: 600, marginBottom: 16 }}>
            ✓ {mensagemSucesso}
          </div>
        )}

        {erro && (
          <div style={{ backgroundColor: 'var(--crisis-light)', color: 'var(--crisis)', padding: '12px 16px', borderRadius: 8, fontWeight: 600, marginBottom: 16 }}>
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
              {resultado.pontuacao} / 100
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
                  color: 'white', 
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
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 600, 
                    padding: '2px 6px', 
                    borderRadius: 4,
                    background: pergunta.positivo ? 'var(--success-light)' : 'var(--warning-light)',
                    color: pergunta.positivo ? 'var(--success)' : 'var(--warning)',
                    marginLeft: 8
                  }}>
                    {pergunta.positivo ? 'Positivo' : 'Negativo'}
                  </span>
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

        {/* Botões rápidos para teste */}
        {!resultado && !enviando && (
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