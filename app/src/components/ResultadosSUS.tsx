import React, { useEffect, useState } from 'react';
import { carregarRespostasSUS, buscarResumoSUSRemoto } from '../services/db';
import {
  META_SUS,
  MINIMO_DETALHE_SUS,
  PERGUNTAS_SUS,
  classificarSUS,
  formatarPontuacaoSUS,
  resumirSUS,
  type ResumoSUS
} from '../utils/sus';
import { GraficoBarras } from './GraficoBarras';

interface ResultadosSUSProps {
  modoDemo: boolean;
  isOnline: boolean;
  /** Muda quando uma avaliação é salva, para recarregar os números. */
  versao: number;
}

function BlocoResumo({ titulo, resumo, nota }: { titulo: string; resumo: ResumoSUS; nota?: string }) {
  return (
    <section className="sus-bloco" aria-label={titulo}>
      <h4>{titulo}</h4>
      {resumo.total === 0 ? (
        <p className="sus-vazio">Nenhuma avaliação registrada ainda.</p>
      ) : (
        <>
          <dl className="relatorio-resumo">
            <div><dt>Avaliações</dt><dd>{resumo.total}</dd></div>
            <div>
              <dt>Pontuação média</dt>
              <dd>{formatarPontuacaoSUS(resumo.media)} de 100</dd>
            </div>
            <div><dt>Menor e maior</dt><dd>{formatarPontuacaoSUS(resumo.minimo)} e {formatarPontuacaoSUS(resumo.maximo)}</dd></div>
            <div><dt>Acima da meta ({META_SUS})</dt><dd>{resumo.acimaDaMeta} de {resumo.total}</dd></div>
          </dl>
          <p className="sus-faixa">
            Faixa da média: <strong>{classificarSUS(resumo.media)}</strong>.{' '}
            {resumo.media >= META_SUS ? 'A média atinge a meta do TCC.' : 'A média ainda não atinge a meta do TCC.'}
          </p>
          {resumo.mediaPorItem ? (
            <GraficoBarras
              titulo="Média por pergunta (de 1 a 5)"
              descricao="Média das respostas em cada uma das 10 perguntas. Nas perguntas ímpares, quanto maior, melhor; nas pares, quanto menor, melhor."
              pontos={resumo.mediaPorItem.map((v, i) => ({ rotulo: 'P' + PERGUNTAS_SUS[i].id, valor: v }))}
              cabecalhoValor="Média da pergunta"
            />
          ) : (
            <p className="sus-vazio">
              A média por pergunta aparece a partir de {MINIMO_DETALHE_SUS} avaliações, para não expor a resposta de uma pessoa só.
            </p>
          )}
          {nota && <p className="padroes-aviso">{nota}</p>}
        </>
      )}
    </section>
  );
}

/** Resultados da avaliação de usabilidade (SUS) para a Coordenação: só agregados, nunca respostas individuais. */
export const ResultadosSUS: React.FC<ResultadosSUSProps> = ({ modoDemo, isOnline, versao }) => {
  const [local, setLocal] = useState<ResumoSUS | null>(null);
  const [remoto, setRemoto] = useState<ResumoSUS | null>(null);
  const [remotoTentado, setRemotoTentado] = useState(false);

  useEffect(() => {
    let ativo = true;
    void carregarRespostasSUS().then((r) => ativo && setLocal(resumirSUS(r)));
    if (!modoDemo && isOnline) {
      setRemotoTentado(false);
      void buscarResumoSUSRemoto().then((r) => {
        if (!ativo) return;
        setRemoto(r);
        setRemotoTentado(true);
      });
    }
    return () => {
      ativo = false;
    };
  }, [modoDemo, isOnline, versao]);

  return (
    <section className="data-table-container resultados-sus" aria-labelledby="sus-resultados-titulo" style={{ padding: '16px 20px' }}>
      <h3 id="sus-resultados-titulo" style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 600 }}>
        Resultados da avaliação de usabilidade (SUS)
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
        Só números agregados. A pontuação só vale para o artigo quando vem de avaliadores reais; respostas de teste
        devem ser apagadas antes da coleta oficial.
      </p>

      {modoDemo ? (
        <p className="sus-vazio">
          No modo demonstração nada é enviado ao servidor. Os números abaixo são só deste aparelho.
        </p>
      ) : !isOnline ? (
        <p className="sus-vazio">Sem conexão: o resumo do servidor volta a aparecer quando a internet voltar.</p>
      ) : remotoTentado && !remoto ? (
        <p className="sus-vazio" role="status">
          Não foi possível obter o resumo do servidor. Confira se a migração do SUS foi aplicada e se a conta é de Coordenação.
        </p>
      ) : null}

      {!modoDemo && remoto && <BlocoResumo titulo="No servidor (todas as avaliações enviadas)" resumo={remoto} />}
      {local && <BlocoResumo titulo="Neste aparelho" resumo={local} nota="Inclui avaliações ainda não enviadas ao servidor." />}
    </section>
  );
};
