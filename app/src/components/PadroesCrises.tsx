import React from 'react';
import type { RegistroCrise } from '../types';
import { GraficoBarras } from './GraficoBarras';
import { crisesPorDia, crisesPorFaixaHoraria, crisesPorDiaSemana, gerarInsights, crisesEncerradas } from '../utils/pei';

interface PadroesCrisesProps {
  crises: RegistroCrise[];
  hoje?: Date;
}

/** Gráficos e leituras de padrão das crises, usados no painel do PEI e no relatório impresso. */
export const PadroesCrises: React.FC<PadroesCrisesProps> = ({ crises, hoje = new Date() }) => {
  const total = crisesEncerradas(crises).length;
  const insights = gerarInsights(crises, hoje);
  return (
    <section className="padroes-crises" aria-label="Padrões observados nas crises">
      <div className="padroes-grade">
        <GraficoBarras
          titulo="Crises por dia (últimos 14 dias)"
          descricao={'Quantidade de crises encerradas em cada um dos últimos 14 dias. O histórico tem ' + total + (total === 1 ? ' crise encerrada.' : ' crises encerradas.')}
          pontos={crisesPorDia(crises, hoje, 14)}
        />
        <GraficoBarras
          titulo="Crises por faixa de horário"
          descricao="Quantidade de crises encerradas em cada faixa de horário do dia."
          pontos={crisesPorFaixaHoraria(crises)}
        />
        <GraficoBarras
          titulo="Crises por dia da semana"
          descricao="Quantidade de crises encerradas em cada dia da semana, de segunda a domingo."
          pontos={crisesPorDiaSemana(crises)}
        />
      </div>

      <div className="padroes-leituras">
        <h4>Leituras do período</h4>
        <ul>
          {insights.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <p className="padroes-aviso" role="note">
          São indícios calculados só com o que foi registrado neste aparelho e no servidor. Eles ajudam a levantar
          hipóteses para o PEI, mas não substituem a avaliação da equipe.
        </p>
      </div>
    </section>
  );
};
