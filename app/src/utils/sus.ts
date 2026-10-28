/**
 * System Usability Scale (SUS): perguntas, pontuação e classificação, sem dependência de navegador.
 * Pilar 2 (Qualidade): a avaliação de usabilidade do TCC precisa de um cálculo testado e de respostas guardadas.
 */

/** Versão do instrumento gravada junto de cada resposta, para o cálculo ser reproduzível. */
export const SUS_VERSAO_INSTRUMENTO = 'SUS-10-pt-BR-v1';

export interface PerguntaSUS {
  id: number;
  texto: string;
  /** Itens ímpares são positivos; pares são negativos (norma do instrumento). */
  positivo: boolean;
}

export const PERGUNTAS_SUS: readonly PerguntaSUS[] = [
  { id: 1, texto: 'Acho que gostaria de usar este sistema frequentemente.', positivo: true },
  { id: 2, texto: 'Achei o sistema desnecessariamente complexo.', positivo: false },
  { id: 3, texto: 'Achei o sistema fácil de usar.', positivo: true },
  { id: 4, texto: 'Acho que precisaria da assistência de uma pessoa técnica para conseguir usar este sistema.', positivo: false },
  { id: 5, texto: 'Achei que as várias funções deste sistema foram bem integradas.', positivo: true },
  { id: 6, texto: 'Achei que havia muita inconsistência neste sistema.', positivo: false },
  { id: 7, texto: 'Acho que a maioria das pessoas aprenderia a usar este sistema muito rapidamente.', positivo: true },
  { id: 8, texto: 'Achei o sistema muito complicado de usar.', positivo: false },
  { id: 9, texto: 'Me senti muito confiante usando o sistema.', positivo: true },
  { id: 10, texto: 'Precisei aprender muitas coisas antes de poder usar este sistema.', positivo: false }
];

export const OPCOES_LIKERT = [
  { valor: 1, label: 'Discordo totalmente' },
  { valor: 2, label: 'Discordo' },
  { valor: 3, label: 'Neutro' },
  { valor: 4, label: 'Concordo' },
  { valor: 5, label: 'Concordo totalmente' }
] as const;

/** Respostas válidas: exatamente 10 inteiros de 1 a 5, na ordem das perguntas. */
export function respostasSusValidas(respostas: readonly number[]): boolean {
  return (
    respostas.length === PERGUNTAS_SUS.length &&
    respostas.every((r) => Number.isInteger(r) && r >= 1 && r <= 5)
  );
}

/** Pontuação de 0 a 100, mantendo a casa decimal (ex.: 77,5). Não arredonda. */
export function calcularPontuacaoSUS(respostas: readonly number[]): number {
  if (!respostasSusValidas(respostas)) {
    throw new Error('SUS: são necessárias 10 respostas, cada uma de 1 a 5.');
  }
  const soma = PERGUNTAS_SUS.reduce((acc, p, i) => acc + (p.positivo ? respostas[i] - 1 : 5 - respostas[i]), 0);
  return soma * 2.5;
}

/**
 * Faixas a partir da média de referência 68 e da escala de notas de Sauro e Lewis (80,3 e 51).
 * REVISAR: conferir as faixas com a referência citada no artigo antes da banca.
 */
export function classificarSUS(pontuacao: number): string {
  if (pontuacao >= 80.3) return 'Excelente (muito acima da média)';
  if (pontuacao >= 68) return 'Boa (acima da média de 68)';
  if (pontuacao >= 51) return 'Regular (abaixo da média de 68)';
  return 'Ruim (problemas sérios de usabilidade)';
}

/** Formata a pontuação com vírgula e uma casa só quando houver fração (77,5 ou 80). */
export function formatarPontuacaoSUS(pontuacao: number): string {
  return Number.isInteger(pontuacao) ? String(pontuacao) : pontuacao.toFixed(1).replace('.', ',');
}
