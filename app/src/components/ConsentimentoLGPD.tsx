import React, { useState } from 'react';
import { Estudante, ConsentimentoLGPD } from '../types';
import { descreverIpRegistrado } from '../utils/regras';
import { DialogoConfirmacao } from './DialogoConfirmacao';
import { Lock } from 'lucide-react';

interface ConsentimentoLGPDProps {
  estudante?: Estudante;
  consentimento?: ConsentimentoLGPD | null;
  onAlternarConsentimento?: () => void;
}

const formatarData = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export const ConsentimentoLGPDComponent: React.FC<ConsentimentoLGPDProps> = ({
  estudante,
  consentimento,
  onAlternarConsentimento
}) => {
  const [confirmandoRevogacao, setConfirmandoRevogacao] = useState(false);

  const executarRevogacao = () => {
    setConfirmandoRevogacao(false);
    onAlternarConsentimento?.();
  };

  const isAtivo = consentimento ? consentimento.ativo : true;
  const codigoEstudante = estudante ? estudante.codigoAnonimizado : 'ALN-8921';

  return (
    <div className="painel-lgpd">
      <div>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-text)', fontWeight: 700 }}>
          Gestão de Consentimento e Privacidade (LGPD)
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Transparência e controle para o Responsável Legal sobre os dados escolares da criança.
        </p>
      </div>

      {/* Anonimização: o que aparece e o que não é guardado */}
      <section className="lgpd-bloco lgpd-destaque" aria-labelledby="lgpd-anonimo">
        <h3 id="lgpd-anonimo">
          <Lock size={18} aria-hidden="true" /> Seu filho aparece só por um código
        </h3>
        <p>
          O aluno é identificado exclusivamente pelo código <code className="codigo-aluno">{codigoEstudante}</code>.
          Nome completo, CPF e fotos que identifiquem a criança <strong>não são armazenados</strong> nem exibidos em telas
          e relatórios (regra RN02).
        </p>
      </section>

      <section className="lgpd-bloco" aria-labelledby="lgpd-coletado">
        <h3 id="lgpd-coletado">O que é coletado</h3>
        <ul className="lgpd-lista">
          <li>Horário de início e de fim de cada crise e a duração calculada.</li>
          <li>Observação opcional escrita pelo educador (por exemplo, um possível gatilho).</li>
          <li>Quais atividades da rotina do dia foram concluídas.</li>
          <li>Os dados deste consentimento: data do aceite, versão do termo e endereço IP parcialmente oculto.</li>
        </ul>
      </section>

      <section className="lgpd-bloco" aria-labelledby="lgpd-finalidade">
        <h3 id="lgpd-finalidade">Para que serve</h3>
        <p>
          Exclusivamente para apoio pedagógico: dar previsibilidade ao estudante e ajudar os educadores a montar o Plano
          Educacional Individualizado (PEI). Não há uso comercial nem publicidade com esses dados.
        </p>
      </section>

      {/* REVISAR: redação jurídica a conferir com a orientação do curso antes da apresentação à banca. */}
      <section className="lgpd-bloco" aria-labelledby="lgpd-base">
        <h3 id="lgpd-base">Base legal</h3>
        <p>
          O tratamento segue a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Informações sobre comportamento e
          saúde são dados pessoais sensíveis (art. 11), e os dados de crianças exigem consentimento específico e em
          destaque de um dos pais ou do responsável legal (art. 14). Por isso esta tela existe: para você autorizar, ou
          retirar a autorização, a qualquer momento.
        </p>
      </section>

      <section className="lgpd-bloco" aria-labelledby="lgpd-status">
        <h3 id="lgpd-status">Seu consentimento</h3>
        <div className="lgpd-status">
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Situação:</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {isAtivo ? '✔️ Consentimento Ativo e Autorizado' : '❌ Consentimento Revogado'}
            </div>
          </div>

          {isAtivo ? (
            <button
              type="button"
              className="btn-revogar-perigo"
              onClick={() => setConfirmandoRevogacao(true)}
              aria-label="Revogar consentimento de tratamento de dados"
            >
              Revogar Consentimento
            </button>
          ) : (
            <button
              type="button"
              className="btn-timer primary"
              onClick={onAlternarConsentimento}
              style={{ backgroundColor: 'var(--success-fill)', borderColor: 'var(--success-fill)' }}
              aria-label="Reativar consentimento de tratamento de dados"
            >
              Reativar Consentimento
            </button>
          )}
        </div>

        <p className="lgpd-nota" role="note">
          Com o consentimento revogado, o aplicativo <strong>impede que novos registros de crise sejam iniciados</strong>{' '}
          para este aluno. Uma crise que já estava em andamento pode ser encerrada, e os registros anteriores
          continuam guardados (a exclusão de dados é um pedido separado à escola).
        </p>

        {consentimento && (
          <dl className="lgpd-detalhes">
            <div>
              <dt>Versão do termo</dt>
              <dd>{consentimento.termoVersao}</dd>
            </div>
            <div>
              <dt>Data do aceite</dt>
              <dd>{formatarData(consentimento.dataAceite)}</dd>
            </div>
            {consentimento.revogadoEm && (
              <div>
                <dt>Revogado em</dt>
                <dd>{formatarData(consentimento.revogadoEm)}</dd>
              </div>
            )}
            <div>
              <dt>IP registrado no aceite</dt>
              <dd>{descreverIpRegistrado(consentimento.ipOrigem)}</dd>
            </div>
          </dl>
        )}
      </section>

      <section className="lgpd-bloco" aria-labelledby="lgpd-revogar">
        <h3 id="lgpd-revogar">Como revogar</h3>
        <ol className="lgpd-lista">
          <li>Toque em “Revogar Consentimento”, no quadro acima.</li>
          <li>Leia o aviso e confirme em “Sim, revogar”. Se mudar de ideia, toque em “Não, manter”.</li>
          <li>A revogação fica registrada com a data. Você pode reativar o consentimento nesta mesma tela.</li>
        </ol>
      </section>

      <DialogoConfirmacao
        aberto={confirmandoRevogacao}
        titulo="Revogar o consentimento?"
        mensagem={
          <>
            <p>Ao revogar, o seu pedido fica registrado com a data e a escola deixa de poder iniciar novos registros de crise deste aluno.</p>
            <p style={{ marginTop: 8 }}>Você poderá reativar o consentimento depois, nesta mesma tela.</p>
          </>
        }
        rotuloConfirmar="Sim, revogar"
        rotuloCancelar="Não, manter"
        perigo
        onConfirmar={executarRevogacao}
        onCancelar={() => setConfirmandoRevogacao(false)}
      />
    </div>
  );
};

// Exporta também com o nome GestaoConsentimento
export const GestaoConsentimento = ConsentimentoLGPDComponent;
