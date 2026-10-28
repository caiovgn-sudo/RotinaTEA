import React from 'react';
import { RegistroCrise, SyncItem } from '../types';
import { ROTULO_ESTADO_SYNC, estadoSyncCrise } from '../utils/sync';
import { HardDrive, CloudCheck, TriangleAlert } from 'lucide-react';

const ICONE = {
  SO_NESTE_APARELHO: <HardDrive size={13} aria-hidden="true" />,
  ENVIADA: <CloudCheck size={13} aria-hidden="true" />,
  FALHOU: <TriangleAlert size={13} aria-hidden="true" />
};

const CLASSE = {
  SO_NESTE_APARELHO: 'selo-sync-local',
  ENVIADA: 'selo-sync-enviada',
  FALHOU: 'selo-sync-falhou'
};

interface SeloSyncProps {
  crise: RegistroCrise;
  fila: SyncItem[];
  modoDemo: boolean;
}

/** Selo com ícone + texto (a informação nunca depende só da cor — WCAG 1.4.1). */
export const SeloSync: React.FC<SeloSyncProps> = ({ crise, fila, modoDemo }) => {
  const estado = estadoSyncCrise(crise, fila, modoDemo);
  const { texto, explicacao } = ROTULO_ESTADO_SYNC[estado];
  return (
    <span className={`selo-sync ${CLASSE[estado]}`} title={explicacao}>
      {ICONE[estado]} {texto}
    </span>
  );
};
