/**
 * Formata uma duração em segundos para uma string legível por humanos.
 * Ex: 310 → "5m 10s", 60 → "1m", 45 → "45s"
 */
export const formatarTempo = (totalSegundos: number): string => {
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;

  if (minutos === 0) return `${segundos}s`;
  if (segundos === 0) return `${minutos}m`;
  return `${minutos}m ${segundos}s`;
};
