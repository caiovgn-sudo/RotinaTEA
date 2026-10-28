import React from 'react';
import { Atividade } from '../utils/atividades';
import { History, Trash2 } from 'lucide-react';

interface RegistroAtividadesProps {
  atividades: Atividade[];
  onLimpar: () => void;
}

export const RegistroAtividades: React.FC<RegistroAtividadesProps> = ({ atividades, onLimpar }) => (
  <section className="registro-atividades" aria-labelledby="registro-atividades-titulo">
    <div className="registro-atividades-topo">
      <div>
        <h3 id="registro-atividades-titulo">
          <History size={18} aria-hidden="true" /> Atividades recentes
        </h3>
        <p className="registro-atividades-ajuda">
          Últimas ações feitas neste navegador. O registro fica só aqui e não guarda nomes nem dados do aluno.
        </p>
      </div>
      {atividades.length > 0 && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onLimpar}>
          <Trash2 size={14} aria-hidden="true" /> Limpar registro
        </button>
      )}
    </div>

    {atividades.length === 0 ? (
      <p className="estado-vazio">
        Nenhuma atividade ainda. Quando você iniciar uma crise, alterar o consentimento ou sincronizar, o registro
        aparece aqui.
      </p>
    ) : (
      <ol className="registro-atividades-lista">
        {atividades.map((a) => (
          <li key={a.id}>
            <time dateTime={a.em}>
              {new Date(a.em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </time>
            <span>{a.descricao}</span>
          </li>
        ))}
      </ol>
    )}
  </section>
);
