import React from 'react';
import { Estudante, ConsentimentoLGPD } from '../types';

interface ConsentimentoLGPDProps {
  estudante?: Estudante;
  consentimento?: ConsentimentoLGPD | null;
  onAlternarConsentimento?: () => void;
}

export const ConsentimentoLGPDComponent: React.FC<ConsentimentoLGPDProps> = ({
  estudante,
  consentimento,
  onAlternarConsentimento
}) => {
  // 1. Função que intercepta o clique antes de revogar
  const handleRevogarConsentimento = () => {
    const confirmacao = window.confirm(
      "⚠️ ATENÇÃO: AÇÃO DESTRUTIVA\n\n" +
      "Tem certeza que deseja revogar o consentimento de tratamento de dados?\n\n" +
      "Isso paralisará o uso do aplicativo RotinaTEA para o aluno e suspenderá a coleta de métricas para o PEI. Esta ação precisará de assinatura presencial para ser revertida."
    );

    // 2. Se o Responsável clicar em "OK", segue o fluxo. Se clicar "Cancelar", nada acontece.
    if (confirmacao) {
      executarRevogacao();
    }
  };

  const executarRevogacao = () => {
    console.log("Consentimento revogado com sucesso. Registrando log de auditoria...");
    if (onAlternarConsentimento) {
      onAlternarConsentimento();
    }
  };

  const isAtivo = consentimento ? consentimento.ativo : true;
  const codigoEstudante = estudante ? estudante.codigoAnonimizado : 'ALN-8921';

  return (
    <div className="painel-lgpd" style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', fontWeight: 700 }}>
          Gestão de Consentimento e Privacidade (LGPD)
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Transparência e controle para o Responsável Legal sobre os dados escolares da criança.
        </p>
      </div>

      <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 16, border: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: 12 }}>
          Termo de Tratamento de Dados de Menores no Ambiente Escolar
        </h3>
        
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p>
            O <strong>RotinaTEA</strong> atua como Tecnologia Assistiva com base no <strong>Artigo 14 da Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>, com o propósito exclusivo de fornecer previsibilidade visual ao estudante e auxiliar os educadores no acompanhamento de transições escolares.
          </p>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><strong>Anonimização na Origem (RN02):</strong> O estudante é identificado exclusivamente pelo código <code style={{ background: 'var(--bg-app)', padding: '2px 6px', borderRadius: 4 }}>{codigoEstudante}</code>.</li>
            <li><strong>Finalidade Exclusiva:</strong> Apoio pedagógico e elaboração do Plano de Ensino Individualizado (PEI).</li>
            <li><strong>Sem Comercialização:</strong> É terminantemente proibido o compartilhamento comercial ou publicidade com os dados coletados.</li>
            <li><strong>Direito à Revogação:</strong> O responsável legal pode retirar o consentimento a qualquer instante, suspendendo a coleta de métricas.</li>
          </ul>
        </div>

        <hr style={{ margin: '20px 0', borderColor: 'var(--border-light)' }} />

        <div className="status-rodape" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status da Autorização:</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: isAtivo ? 'var(--success)' : 'var(--crisis)' }}>
              {isAtivo ? '✔️ Consentimento Ativo e Autorizado' : '❌ Consentimento Revogado'}
            </div>
            {consentimento && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: 4 }}>
                IP Registrado: {consentimento.ipOrigem} • Versão: {consentimento.termoVersao}
              </div>
            )}
          </div>

          {/* 3. Botão com interceptação de confirmação de segurança */}
          {isAtivo ? (
            <button 
              type="button"
              className="btn-revogar-perigo" 
              onClick={handleRevogarConsentimento}
              aria-label="Revogar consentimento de tratamento de dados"
            >
              Revogar Consentimento
            </button>
          ) : (
            <button
              type="button"
              className="btn-timer primary"
              onClick={onAlternarConsentimento}
              style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
              aria-label="Reativar consentimento de tratamento de dados"
            >
              Reativar Consentimento
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Exporta também com o nome GestaoConsentimento
export const GestaoConsentimento = ConsentimentoLGPDComponent;
