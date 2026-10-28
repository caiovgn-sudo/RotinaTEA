import React, { useId } from 'react';
import type { PontoGrafico } from '../utils/pei';

interface GraficoBarrasProps {
  titulo: string;
  /** Frase que resume o gráfico para leitores de tela (o texto equivalente completo está na tabela oculta). */
  descricao: string;
  pontos: PontoGrafico[];
  /** Nome da unidade no singular e no plural, por exemplo ['crise', 'crises']. */
  unidade?: [string, string];
}

const LARGURA = 600;
const ALTURA = 210;
const MARGEM = { topo: 22, base: 34, esq: 28, dir: 8 };

/**
 * Gráfico de barras em SVG, sem biblioteca externa. Usa só as variáveis de cor do tema, mostra o valor
 * sobre cada barra (a informação não depende só de cor) e traz uma tabela equivalente para leitor de tela.
 */
export const GraficoBarras: React.FC<GraficoBarrasProps> = ({ titulo, descricao, pontos, unidade = ['crise', 'crises'] }) => {
  const id = useId();
  const total = pontos.reduce((a, p) => a + p.valor, 0);
  const maximo = Math.max(1, ...pontos.map((p) => p.valor));
  const areaL = LARGURA - MARGEM.esq - MARGEM.dir;
  const areaA = ALTURA - MARGEM.topo - MARGEM.base;
  const passo = areaL / pontos.length;
  const larguraBarra = Math.min(46, passo * 0.62);
  const y = (v: number) => MARGEM.topo + areaA - (v / maximo) * areaA;
  const marcas = Array.from(new Set([0, Math.ceil(maximo / 2), maximo]));

  return (
    <figure className="grafico-barras">
      <figcaption id={id + '-t'}>{titulo}</figcaption>
      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        role="img"
        aria-labelledby={id + '-t ' + id + '-d'}
        preserveAspectRatio="xMidYMid meet"
      >
        <desc id={id + '-d'}>{descricao}</desc>
        {marcas.map((m) => (
          <g key={m}>
            <line x1={MARGEM.esq} x2={LARGURA - MARGEM.dir} y1={y(m)} y2={y(m)} className="grafico-grade" />
            <text x={MARGEM.esq - 6} y={y(m) + 4} textAnchor="end" className="grafico-eixo">{m}</text>
          </g>
        ))}
        {pontos.map((p, i) => {
          const x = MARGEM.esq + passo * i + (passo - larguraBarra) / 2;
          const altura = (p.valor / maximo) * areaA;
          return (
            <g key={p.rotulo + i}>
              {p.valor > 0 && <rect x={x} y={y(p.valor)} width={larguraBarra} height={altura} rx={3} className="grafico-barra" />}
              {p.valor > 0 && (
                <text x={x + larguraBarra / 2} y={y(p.valor) - 5} textAnchor="middle" className="grafico-valor">{p.valor}</text>
              )}
              <text x={x + larguraBarra / 2} y={ALTURA - 12} textAnchor="middle" className="grafico-rotulo">{p.rotulo}</text>
            </g>
          );
        })}
      </svg>
      {total === 0 && <p className="grafico-vazio">Nenhum registro neste período.</p>}
      <table className="visualmente-oculto">
        <caption>{titulo}</caption>
        <thead>
          <tr><th scope="col">Categoria</th><th scope="col">Quantidade de {unidade[1]}</th></tr>
        </thead>
        <tbody>
          {pontos.map((p, i) => (
            <tr key={p.rotulo + i}><th scope="row">{p.rotulo}</th><td>{p.valor}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};
