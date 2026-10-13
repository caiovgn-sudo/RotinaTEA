import { formatarTempo } from '../utils/tempo';

// Re-exporta do utilitário centralizado para manter compatibilidade
export { formatarTempo } from '../utils/tempo';

interface PainelPEIProps {
  duracaoMediaSegundos?: number;
}

export function PainelPEI({ duracaoMediaSegundos = 310 }: PainelPEIProps) {
  return (
    <div className="card-metrica stat-card">
      <h4 className="stat-label">Duração Média das Crises</h4>

      {/* 2. Aplicação da formatação na renderização */}
      <h2 className="destaque-tempo stat-value">{formatarTempo(duracaoMediaSegundos)}</h2>

      <p className="legenda" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
        Média para estabilização (anteriormente exibido como {duracaoMediaSegundos}s)
      </p>
    </div>
  );
}
