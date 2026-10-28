import React from 'react';
import { RegistroCrise, SyncItem } from '../types';
import { MAX_TENTATIVAS_SYNC } from '../utils/regras';
import { ROTULO_TIPO_SYNC, descreverTentativas, resumirFila } from '../utils/sync';
import { RefreshCw, RotateCcw } from 'lucide-react';

interface PainelSincronizacaoProps {
  fila: SyncItem[];
  crises: RegistroCrise[];
  isOnline: boolean;
  modoDemo: boolean;
  ocupado: boolean;
  onSincronizarAgora: () => void;
  onTentarNovamente: (itemId: string) => void;
}

const formatarDataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export const PainelSincronizacao: React.FC<PainelSincronizacaoProps> = ({
  fila,
  crises,
  isOnline,
  modoDemo,
  ocupado,
  onSincronizarAgora,
  onTentarNovamente
}) => {
  const { pendentes, comErro } = resumirFila(fila);
  const enviadas = modoDemo ? 0 : crises.filter((c) => c.sincronizadoOffline).length;
  const podeEnviar = isOnline && !modoDemo && pendentes > 0 && !ocupado;
  const ordenada = [...fila].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  return (
    <section className="painel-sync" aria-labelledby="painel-sync-titulo">
      <div className="painel-sync-topo">
        <div>
          <h3 id="painel-sync-titulo">Sincronização com o servidor</h3>
          <p className="painel-sync-ajuda">
            Todo registro é salvo primeiro neste aparelho e depois enviado. Se o envio falhar, o sistema tenta de novo
            até {MAX_TENTATIVAS_SYNC} vezes; depois o item fica com erro até você tocar em “Tentar novamente”.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onSincronizarAgora}
          disabled={!podeEnviar}
          title={
            modoDemo
              ? 'No modo demonstração nada é enviado ao servidor.'
              : !isOnline
                ? 'Sem conexão no momento.'
                : pendentes === 0
                  ? 'Não há itens aguardando envio.'
                  : 'Enviar agora os itens pendentes'
          }
        >
          <RefreshCw size={16} aria-hidden="true" /> {ocupado ? 'Enviando…' : 'Sincronizar agora'}
        </button>
      </div>

      {modoDemo && (
        <p className="painel-sync-aviso" role="note">
          Modo demonstração: nada é enviado ao servidor. Os registros ficam só neste navegador.
        </p>
      )}

      <dl className="painel-sync-resumo">
        <div>
          <dt>Aguardando envio</dt>
          <dd>{pendentes}</dd>
        </div>
        <div>
          <dt>Com erro</dt>
          <dd className={comErro > 0 ? 'texto-erro' : undefined}>{comErro}</dd>
        </div>
        <div>
          <dt>Crises já enviadas</dt>
          <dd>{enviadas}</dd>
        </div>
      </dl>

      {ordenada.length === 0 ? (
        <p className="estado-vazio">
          {modoDemo
            ? 'Nada na fila. No modo demonstração os registros não são enviados.'
            : 'Nada aguardando envio. Tudo o que foi registrado neste aparelho já chegou ao servidor.'}
        </p>
      ) : (
        <div className="data-table-container">
          <table className="custom-table">
            <caption className="visually-hidden">Itens na fila de sincronização</caption>
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">Criado em</th>
                <th scope="col">Tentativas</th>
                <th scope="col">Situação</th>
                <th scope="col">Ação</th>
              </tr>
            </thead>
            <tbody>
              {ordenada.map((item) => (
                <tr key={item.id}>
                  <td>{ROTULO_TIPO_SYNC[item.tipo]}</td>
                  <td>{formatarDataHora(item.criadoEm)}</td>
                  <td>{descreverTentativas(item)}</td>
                  <td>
                    <span className={item.status === 'ERRO' ? 'selo-sync selo-sync-falhou' : 'selo-sync selo-sync-local'}>
                      {item.status === 'ERRO' ? 'Falhou o envio' : 'Aguardando envio'}
                    </span>
                  </td>
                  <td>
                    {item.status === 'ERRO' && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onTentarNovamente(item.id)}
                        disabled={ocupado}
                      >
                        <RotateCcw size={14} aria-hidden="true" /> Tentar novamente
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
