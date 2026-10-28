// Tipagem mínima do módulo do Node usado apenas pelos testes (o projeto não depende de @types/node).
declare module 'node:fs' {
  export function readFileSync(caminho: string | URL, codificacao: 'utf8'): string;
}
