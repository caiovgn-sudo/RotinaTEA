/**
 * Log com nível. Em produção não emite detalhes técnicos (evita vazamento de informação
 * operacional); em desenvolvimento mostra tudo.
 */
const emDesenvolvimento = import.meta.env.DEV;

export const logger = {
  info: (...args: unknown[]): void => {
    if (emDesenvolvimento) console.info(...args);
  },
  erro: (mensagem: string, detalhe?: unknown): void => {
    if (emDesenvolvimento) {
      console.error(mensagem, detalhe);
    } else {
      console.error(mensagem);
    }
  },
};
