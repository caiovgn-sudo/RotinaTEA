import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Estudante, ItemRotina, RegistroCrise } from '../types';
import { PadroesCrises } from './PadroesCrises';
import { crisesEncerradas, resumirCrises } from '../utils/pei';
import { formatarTempo } from '../utils/tempo';
import { descricaoSegura } from '../utils/atividades';

interface RelatorioPEIProps {
  estudante: Estudante;
  crises: RegistroCrise[];
  itensRotina: ItemRotina[];
  modoDemo?: boolean;
  onFechar: () => void;
}

const LIMITE_LINHAS = 40;

/**
 * Relatório de acompanhamento para o PEI. É renderizado em um portal no <body> para que a impressão
 * (CSS @media print) mostre só ele. Só entram dados agregados e o código do aluno (RN02 e RN05).
 */
export const RelatorioPEI: React.FC<RelatorioPEIProps> = ({ estudante, crises, itensRotina, modoDemo = false, onFechar }) => {
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const agora = new Date();
  const resumo = resumirCrises(crises);
  const encerradas = crisesEncerradas(crises).sort((a, b) => b.dataHoraInicio.localeCompare(a.dataHoraInicio));
  const concluidas = itensRotina.filter((i) => i.concluido).length;

  useEffect(() => {
    tituloRef.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [onFechar]);

  return createPortal(
    <div id="relatorio-impressao" className="relatorio-fundo" role="dialog" aria-modal="true" aria-labelledby="relatorio-titulo">
      <article className="relatorio-pei">
        <div className="relatorio-acoes">
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            Imprimir ou salvar em PDF
          </button>
          <button type="button" className="btn btn-secondary" onClick={onFechar}>
            Fechar relatório
          </button>
        </div>

        <header className="relatorio-cabecalho">
          <h1 id="relatorio-titulo" tabIndex={-1} ref={tituloRef}>Relatório de acompanhamento para o PEI</h1>
          <p>
            Aluno <strong>{estudante.codigoAnonimizado}</strong> • {estudante.turma} • Nível de suporte {estudante.nivelSuporte}
          </p>
          <p className="relatorio-meta">
            Emitido em {agora.toLocaleDateString('pt-BR')} às {agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            {modoDemo ? ' • Dados de demonstração (fictícios)' : ''}
          </p>
        </header>

        <section aria-labelledby="rel-resumo">
          <h2 id="rel-resumo">Resumo</h2>
          <dl className="relatorio-resumo">
            <div><dt>Crises encerradas</dt><dd>{resumo.total}</dd></div>
            <div><dt>Duração média</dt><dd>{formatarTempo(resumo.mediaSegundos)}</dd></div>
            <div><dt>Crise mais longa</dt><dd>{formatarTempo(resumo.maximoSegundos)}</dd></div>
            <div><dt>Tempo total em crise</dt><dd>{formatarTempo(resumo.totalSegundos)}</dd></div>
            <div><dt>Rotina de hoje</dt><dd>{concluidas} de {itensRotina.length} concluídas</dd></div>
          </dl>
        </section>

        <section aria-labelledby="rel-padroes">
          <h2 id="rel-padroes">Padrões observados</h2>
          <PadroesCrises crises={crises} hoje={agora} />
        </section>

        <section aria-labelledby="rel-episodios">
          <h2 id="rel-episodios">Episódios registrados</h2>
          {encerradas.length === 0 ? (
            <p>Nenhuma crise encerrada para este aluno.</p>
          ) : (
            <>
              <table className="relatorio-tabela">
                <thead>
                  <tr>
                    <th scope="col">Data e horário</th>
                    <th scope="col">Duração</th>
                    <th scope="col">Observação do educador</th>
                  </tr>
                </thead>
                <tbody>
                  {encerradas.slice(0, LIMITE_LINHAS).map((c) => (
                    <tr key={c.id}>
                      <td>
                        {new Date(c.dataHoraInicio).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(c.dataHoraInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>{formatarTempo(c.duracaoSegundos)}</td>
                      <td>{c.observacoes ? descricaoSegura(c.observacoes) : 'Sem observação.'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {encerradas.length > LIMITE_LINHAS && (
                <p className="relatorio-nota">Exibidos os {LIMITE_LINHAS} episódios mais recentes, de {encerradas.length} no total.</p>
              )}
            </>
          )}
        </section>

        <footer className="relatorio-rodape">
          <p>
            Privacidade: o aluno é identificado só pelo código {estudante.codigoAnonimizado}; nome, CPF e fotos não são
            armazenados (RN02) e o relatório traz apenas dados agregados e episódios sem identificação (RN05).
          </p>
          <p>
            As observações são escritas pelo educador. Antes de compartilhar o relatório, confira se elas não citam nomes de pessoas.
            Este documento apoia a equipe no PEI e não substitui a avaliação profissional.
          </p>
        </footer>
      </article>
    </div>,
    document.body
  );
};
