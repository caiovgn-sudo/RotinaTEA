import React from 'react';
import { Estudante, ItemRotina, RegistroCrise } from '../types';
import { formatarTempo } from '../utils/tempo';
import { PainelPEI } from './PainelPEI';

export { formatarTempo, PainelPEI };


interface DashboardPEIProps {
  estudantes: Estudante[];
  estudanteSelecionado: Estudante;
  onSelecionarEstudante: (estudante: Estudante) => void;
  itensRotina: ItemRotina[];
  crises: RegistroCrise[];
}

export const DashboardPEI: React.FC<DashboardPEIProps> = ({
  estudantes,
  estudanteSelecionado,
  onSelecionarEstudante,
  itensRotina,
  crises
}) => {
  const totalTarefas = itensRotina.length;
  const concluidas = itensRotina.filter((i) => i.concluido).length;
  const percentualConclusao = totalTarefas > 0 ? Math.round((concluidas / totalTarefas) * 100) : 0;

  const totalCrises = crises.length;
  const duracaoMediaSegundos = totalCrises > 0
    ? Math.round(crises.reduce((acc, c) => acc + c.duracaoSegundos, 0) / totalCrises)
    : 0;

  const exportarParaPEI = () => {
    window.print();
  };

  return (
    <div className="dashboard-container" aria-label="Painel Analítico para o Plano de Ensino Individualizado">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', fontWeight: 700 }}>
            Painel Pedagógico & Métricas do PEI
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Cruzamento entre cumprimento da rotina e ocorrência de crises com anonimização na origem (LGPD).
          </p>
        </div>

        <button
          type="button"
          className="btn-timer primary"
          onClick={exportarParaPEI}
          aria-label="Exportar relatório consolidado para o PEI"
        >
          <span aria-hidden="true">📄</span>
          <span>Exportar Relatório PEI (PDF)</span>
        </button>
      </div>

      {/* Seletor de Estudante Anonimizado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-surface)', padding: '12px 18px', borderRadius: '12px' }}>
        <label htmlFor="select-estudante" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
          Selecionar Estudante (Código Anonimizado):
        </label>
        <select
          id="select-estudante"
          value={estudanteSelecionado.id}
          onChange={(e) => {
            const found = estudantes.find((est) => est.id === e.target.value);
            if (found) onSelecionarEstudante(found);
          }}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-light)',
            fontFamily: 'inherit',
            fontWeight: 600
          }}
        >
          {estudantes.map((est) => (
            <option key={est.id} value={est.id}>
              {est.codigoAnonimizado} — {est.turma} (Nível {est.nivelSuporte})
            </option>
          ))}
        </select>
      </div>

      {/* Indicadores / Cards de Resumo */}
      <div className="stats-cards-row">
        <div className="stat-card">
          <div className="stat-label">Conclusão de Tarefas</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {percentualConclusao}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {concluidas} de {totalTarefas} atividades concluídas hoje
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Registros de Desregulação</div>
          <div className="stat-value" style={{ color: totalCrises > 0 ? 'var(--crisis)' : 'var(--success)' }}>
            {totalCrises}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Episódios registrados pelo professor
          </div>
        </div>

        <div className="stat-card card-metrica">
          <div className="stat-label">Duração Média das Crises</div>
          <h2 className="stat-value destaque-tempo" style={{ color: 'var(--primary)' }}>
            {formatarTempo(duracaoMediaSegundos)}
          </h2>
          <p className="legenda" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Média para estabilização (anteriormente exibido como {duracaoMediaSegundos}s)
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-label">Conformidade LGPD</div>
          <div className="stat-value" style={{ color: 'var(--primary)', fontSize: '1.4rem', marginTop: 12 }}>
            100% Anonimizado
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Código único: {estudanteSelecionado.codigoAnonimizado}
          </div>
        </div>
      </div>

      {/* Tabela de Cruzamento Comportamental para o PEI */}
      <div className="data-table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 600 }}>
            Tabela Analítica de Eventos Comportamentais (PEI)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Dados estruturados para reuniões de planejamento pedagógico individualizado.
          </p>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Código Estudante</th>
              <th>Data / Horário</th>
              <th>Duração</th>
              <th>Status Rede</th>
              <th>Observação do Educador / Gatilho</th>
            </tr>
          </thead>
          <tbody>
            {crises.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                  Nenhum episódio de crise registrado para este estudante.
                </td>
              </tr>
            ) : (
              crises.map((crise) => (
                <tr key={crise.id}>
                  <td>
                    <span className="anon-code-badge">{estudanteSelecionado.codigoAnonimizado}</span>
                  </td>
                  <td>
                    {new Date(crise.dataHoraInicio).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(crise.dataHoraInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <strong>{formatarTempo(crise.duracaoSegundos)}</strong> ({crise.duracaoSegundos}s)
                  </td>
                  <td>
                    <span style={{ color: crise.sincronizadoOffline ? 'var(--success)' : 'var(--warning)', fontWeight: 600, fontSize: '0.85rem' }}>
                      {crise.sincronizadoOffline ? '✓ Sincronizado' : '⏳ Em Fila Local'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {crise.observacoes || 'Nenhuma observação registrada.'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
