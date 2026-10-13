import React, { useState } from 'react';
import { ItemRotina } from '../types';
import { CartaoRotina, StatusCartao } from './CartaoRotina';

interface PranchaVisualProps {
  itens: ItemRotina[];
  isVisaoAluno: boolean; // Identifica se a renderização é para o Aluno ou Educador
  onAlternarItem: (itemId: string) => void;
  onReordenar: (novosItens: ItemRotina[]) => void;
  onSelecionarParaTimer: (item: ItemRotina) => void;
  itemIdAtivoTimer: string | null;
}

export const PranchaVisual: React.FC<PranchaVisualProps> = ({
  itens,
  isVisaoAluno,
  onAlternarItem,
  onReordenar,
  onSelecionarParaTimer,
  itemIdAtivoTimer
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isDragOverDropzone, setIsDragOverDropzone] = useState(false);
  const [mensagemAcessivel, setMensagemAcessivel] = useState('');

  // Identifica a primeira tarefa pendente como a tarefa ativa principal ("agora")
  const primeiroPendente = itens.find((it) => !it.concluido);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setIsDragOverDropzone(false);
  };

  const handleDropzoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (id) {
      const item = itens.find((it) => it.id === id);
      if (item && !item.concluido) {
        onAlternarItem(id);
        setMensagemAcessivel(`Atividade ${item.titulo} concluída com sucesso.`);
      }
    }
    setIsDragOverDropzone(false);
    setDraggedId(null);
  };

  const moverCima = (index: number) => {
    if (index === 0) return;
    const novos = [...itens];
    const temp = novos[index];
    novos[index] = novos[index - 1];
    novos[index - 1] = temp;
    onReordenar(novos);
    setMensagemAcessivel(`Atividade ${novos[index - 1].titulo} movida para cima.`);
  };

  const moverBaixo = (index: number) => {
    if (index === itens.length - 1) return;
    const novos = [...itens];
    const temp = novos[index];
    novos[index] = novos[index + 1];
    novos[index + 1] = temp;
    onReordenar(novos);
    setMensagemAcessivel(`Atividade ${novos[index + 1].titulo} movida para baixo.`);
  };

  return (
    <div className="prancha-container">
      {/* Região ao vivo para leitores de tela */}
      <div className="sr-only" aria-live="polite">
        {mensagemAcessivel}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', fontWeight: 700 }}>
            {isVisaoAluno ? 'Minha Rotina Escolar' : 'Gerenciamento da Rotina Escolar'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {isVisaoAluno
              ? 'Acompanhe suas atividades com os símbolos visuais. Você pode clicar em "Concluir Tarefa" ou arrastar para a cesta.'
              : 'Configuração dos cartões com pictogramas ARASAAC. Ordene e gerencie as etapas do estudante.'}
          </p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Progresso: <strong>{itens.filter((it) => it.concluido).length}</strong> de <strong>{itens.length}</strong> concluídas
        </div>
      </div>

      {/* Grid de Cartões da Rotina usando CartaoRotina */}
      <div className="prancha-grid" role="list" aria-label="Lista de Atividades da Rotina">
        {itens.map((item, index) => {
          let status: StatusCartao = 'aguardando';
          if (item.concluido) {
            status = 'concluido';
          } else if (primeiroPendente?.id === item.id) {
            status = 'agora';
          }

          return (
            <CartaoRotina
              key={item.id}
              id={item.id}
              titulo={item.titulo}
              tempo={`${item.duracaoMinutos} min`}
              categoria={item.categoria}
              status={status}
              isVisaoAluno={isVisaoAluno}
              pictogramaKey={item.pictogramaKey}
              ordem={index + 1}
              isTimerAtivo={itemIdAtivoTimer === item.id}
              onAlternar={(id) => {
                onAlternarItem(id);
                setMensagemAcessivel(`Atividade ${item.titulo} atualizada.`);
              }}
              onSelecionarParaTimer={() => onSelecionarParaTimer(item)}
              onMoverCima={() => moverCima(index)}
              onMoverBaixo={() => moverBaixo(index)}
              isPrimeiro={index === 0}
              isUltimo={index === itens.length - 1}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragEnd={handleDragEnd}
            />
          );
        })}
      </div>

      {/* Cesto / Dropzone para arrastar e concluir */}
      <section
        className={`completion-dropzone ${isDragOverDropzone ? 'drag-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOverDropzone(true);
        }}
        onDragLeave={() => setIsDragOverDropzone(false)}
        onDrop={handleDropzoneDrop}
        aria-label="Área para soltar cartões e concluir tarefas"
      >
        <span style={{ fontSize: '1.6rem' }} aria-hidden="true">📥</span>
        <span>
          {isDragOverDropzone
            ? 'Solte o cartão aqui para marcar como CONCLUÍDO!'
            : 'Arrastar e Soltar: Solte o cartão da atividade nesta área para concluir com sucesso'}
        </span>
      </section>
    </div>
  );
};
