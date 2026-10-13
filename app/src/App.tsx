import React, { useState, useEffect } from 'react';
import { PerfilUsuario, Estudante, ItemRotina, RegistroCrise, ConsentimentoLGPD } from './types';
import {
  seedInitialDataIfEmpty,
  carregarEstudantes,
  carregarItensRotina,
  alternarStatusItem,
  salvarOrdemItens,
  adicionarItemRotina,
  obterCriseAtiva,
  iniciarCriseLocal,
  encerrarCriseLocal,
  carregarCrises,
  carregarItensFilaSync,
  sincronizarFilaBatch,
  carregarConsentimento,
  alternarConsentimento
} from './services/db';
import { Header } from './components/Header';
import { PranchaVisual } from './components/PranchaVisual';
import { TemporizadorVisual } from './components/TemporizadorVisual';
import { RegistroCriseComponent } from './components/RegistroCrise';
import { DashboardPEI } from './components/DashboardPEI';
import { ConsentimentoLGPDComponent } from './components/ConsentimentoLGPD';
import { ConfiguracaoRotina } from './components/ConfiguracaoRotina';

export const App: React.FC = () => {
  // Estado do Perfil e Conexão
  const [perfilAtual, setPerfilAtual] = useState<PerfilUsuario>('ALUNO');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [itensPendentesSync, setItensPendentesSync] = useState<number>(0);
  const [altoContraste, setAltoContraste] = useState<boolean>(false);
  const [fonteAmpliada, setFonteAmpliada] = useState<boolean>(false);

  // Sub-aba do Professor
  const [abaProfessor, setAbaProfessor] = useState<'ACOMPANHAMENTO' | 'CONFIGURACAO'>('ACOMPANHAMENTO');

  // Estado dos Dados
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [estudanteAtual, setEstudanteAtual] = useState<Estudante | null>(null);
  const [itensRotina, setItensRotina] = useState<ItemRotina[]>([]);
  const [criseAtiva, setCriseAtiva] = useState<RegistroCrise | null>(null);
  const [historicoCrises, setHistoricoCrises] = useState<RegistroCrise[]>([]);
  const [consentimento, setConsentimento] = useState<ConsentimentoLGPD | null>(null);

  // Atividade selecionada para o temporizador
  const [atividadeTimer, setAtividadeTimer] = useState<{ id: string; titulo: string; duracao: number } | null>(null);

  // Notificação suave
  const [aviso, setAviso] = useState<string | null>(null);

  const exibirAviso = (msg: string) => {
    setAviso(msg);
    setTimeout(() => setAviso(null), 4000);
  };

  // Inicialização do Banco de Dados
  useEffect(() => {
    const inicializar = async () => {
      await seedInitialDataIfEmpty();
      const listaEstudantes = await carregarEstudantes();
      setEstudantes(listaEstudantes);

      if (listaEstudantes.length > 0) {
        const est = listaEstudantes[0];
        setEstudanteAtual(est);
        await carregarDadosEstudante(est.id);
      }

      await atualizarFilaSync();
    };

    inicializar();
  }, []);

  const carregarDadosEstudante = async (estudanteId: string) => {
    const itens = await carregarItensRotina('rot-001');
    setItensRotina(itens);

    // Seleciona a primeira atividade não concluída para o timer
    const pendente = itens.find((i) => !i.concluido) || itens[0];
    if (pendente) {
      setAtividadeTimer({ id: pendente.id, titulo: pendente.titulo, duracao: pendente.duracaoMinutos });
    }

    const ativa = await obterCriseAtiva();
    setCriseAtiva(ativa);

    const crises = await carregarCrises(estudanteId);
    setHistoricoCrises(crises);

    const termo = await carregarConsentimento(estudanteId);
    setConsentimento(termo);
  };

  const atualizarFilaSync = async () => {
    const fila = await carregarItensFilaSync();
    setItensPendentesSync(fila.length);
  };

  // Alternância de Conexão (Simulação Offline-First)
  const handleAlternarConexao = async () => {
    const novoStatus = !isOnline;
    setIsOnline(novoStatus);

    if (novoStatus) {
      // Quando reconecta à rede, processa sincronização em lote da fila
      const sincronizados = await sincronizarFilaBatch();
      await atualizarFilaSync();
      if (estudanteAtual) {
        const crisesAtualizadas = await carregarCrises(estudanteAtual.id);
        setHistoricoCrises(crisesAtualizadas);
      }
      if (sincronizados > 0) {
        exibirAviso(`Conexão restabelecida! ${sincronizados} registro(s) sincronizados com sucesso.`);
      } else {
        exibirAviso('Conexão restabelecida. Sistema operando em modo online.');
      }
    } else {
      exibirAviso('Modo Offline Ativo. Todas as ações continuarão sendo salvas localmente no IndexedDB.');
    }
  };

  // Acessibilidade: Contraste e Fonte
  const handleAlternarAltoContraste = () => {
    const novo = !altoContraste;
    setAltoContraste(novo);
    if (novo) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  const handleAlternarFonteAmpliada = () => {
    const novo = !fonteAmpliada;
    setFonteAmpliada(novo);
    if (novo) {
      document.body.classList.add('large-font');
    } else {
      document.body.classList.remove('large-font');
    }
  };

  // Ações da Prancha
  const handleAlternarItem = async (itemId: string) => {
    await alternarStatusItem(itemId);
    const atualizados = await carregarItensRotina('rot-001');
    setItensRotina(atualizados);
  };

  const handleReordenarItens = async (novosItens: ItemRotina[]) => {
    setItensRotina(novosItens);
    await salvarOrdemItens(novosItens);
  };

  const handleAdicionarItem = async (novo: Omit<ItemRotina, 'id'>) => {
    await adicionarItemRotina(novo);
    const atualizados = await carregarItensRotina('rot-001');
    setItensRotina(atualizados);
    setAbaProfessor('ACOMPANHAMENTO');
    exibirAviso('Nova atividade inserida na rotina com sucesso!');
  };

  // Ações de Crise (1 Clique)
  const handleIniciarCrise = async () => {
    if (!estudanteAtual) return;
    const nova = await iniciarCriseLocal(estudanteAtual.id, 'usr-prof-01');
    setCriseAtiva(nova);
    exibirAviso('Registro de crise iniciado. Cronômetro ativado.');
  };

  const handleEncerrarCrise = async (criseId: string, observacoes?: string) => {
    const encerrada = await encerrarCriseLocal(criseId, observacoes, isOnline);
    setCriseAtiva(null);
    if (estudanteAtual) {
      const crises = await carregarCrises(estudanteAtual.id);
      setHistoricoCrises(crises);
    }
    await atualizarFilaSync();

    if (!isOnline) {
      exibirAviso(`Crise de ${encerrada.duracaoSegundos}s gravada localmente (offline). Sincronização pendente.`);
    } else {
      exibirAviso(`Crise de ${encerrada.duracaoSegundos}s gravada e sincronizada.`);
    }
  };

  // Ação de Consentimento LGPD
  const handleAlternarConsentimento = async () => {
    if (!consentimento) return;
    const atualizado = await alternarConsentimento(consentimento.id);
    setConsentimento(atualizado);
    exibirAviso(atualizado.ativo ? 'Consentimento reativado com sucesso.' : 'Consentimento revogado formalmente.');
  };

  return (
    <div className="app-container">
      <Header
        perfilAtual={perfilAtual}
        onTrocarPerfil={setPerfilAtual}
        isOnline={isOnline}
        onAlternarConexao={handleAlternarConexao}
        itensPendentesSync={itensPendentesSync}
        altoContraste={altoContraste}
        onAlternarAltoContraste={handleAlternarAltoContraste}
        fonteAmpliada={fonteAmpliada}
        onAlternarFonteAmpliada={handleAlternarFonteAmpliada}
      />

      {/* Notificação Flutuante / Toast Suave */}
      {aviso && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: 'var(--primary)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            fontSize: '0.9rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span aria-hidden="true">🔔</span>
          <span>{aviso}</span>
        </div>
      )}

      <main className="main-content" id="conteudo-principal">
        {/* Banner do Perfil Ativo */}
        <section className="profile-banner" aria-label="Informações do Perfil Selecionado">
          <div className="profile-info">
            <h2>
              {perfilAtual === 'ALUNO' && 'Visão do Aluno — Prancha de Rotina e Previsibilidade'}
              {perfilAtual === 'PROFESSOR' && 'Visão do Educador — Mediação de Aula e Registro Rápido'}
              {perfilAtual === 'COORDENACAO' && 'Visão da Coordenação Pedagógica — Métricas do PEI'}
              {perfilAtual === 'RESPONSAVEL' && 'Visão do Responsável Legal — Consentimento LGPD'}
            </h2>
            <p>
              Estudante Ativo: <strong>{estudanteAtual?.codigoAnonimizado || 'Carregando...'}</strong> • Turma: {estudanteAtual?.turma}
            </p>
          </div>

          {perfilAtual === 'PROFESSOR' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`btn-timer ${abaProfessor === 'ACOMPANHAMENTO' ? 'primary' : ''}`}
                onClick={() => setAbaProfessor('ACOMPANHAMENTO')}
              >
                Rotina & Crises
              </button>
              <button
                type="button"
                className={`btn-timer ${abaProfessor === 'CONFIGURACAO' ? 'primary' : ''}`}
                onClick={() => setAbaProfessor('CONFIGURACAO')}
              >
                + Configurar Cartões
              </button>
            </div>
          )}
        </section>

        {/* 1. VISÃO DO ALUNO */}
        {perfilAtual === 'ALUNO' && (
          <>
            <TemporizadorVisual
              tituloAtividade={atividadeTimer?.titulo || 'Atividade da Rotina'}
              duracaoMinutosPadrao={atividadeTimer?.duracao || 20}
            />
            <PranchaVisual
              itens={itensRotina}
              isVisaoAluno={true}
              onAlternarItem={handleAlternarItem}
              onReordenar={handleReordenarItens}
              onSelecionarParaTimer={(item) =>
                setAtividadeTimer({ id: item.id, titulo: item.titulo, duracao: item.duracaoMinutos })
              }
              itemIdAtivoTimer={atividadeTimer?.id || null}
            />
          </>
        )}

        {/* 2. VISÃO DO PROFESSOR */}
        {perfilAtual === 'PROFESSOR' && (
          <>
            {abaProfessor === 'ACOMPANHAMENTO' ? (
              <>
                {estudanteAtual && (
                  <RegistroCriseComponent
                    estudante={estudanteAtual}
                    criseAtiva={criseAtiva}
                    historicoCrises={historicoCrises}
                    onIniciarCrise={handleIniciarCrise}
                    onEncerrarCrise={handleEncerrarCrise}
                    isOnline={isOnline}
                  />
                )}
                <TemporizadorVisual
                  tituloAtividade={atividadeTimer?.titulo || 'Atividade da Rotina'}
                  duracaoMinutosPadrao={atividadeTimer?.duracao || 20}
                />
                <PranchaVisual
                  itens={itensRotina}
                  isVisaoAluno={false}
                  onAlternarItem={handleAlternarItem}
                  onReordenar={handleReordenarItens}
                  onSelecionarParaTimer={(item) =>
                    setAtividadeTimer({ id: item.id, titulo: item.titulo, duracao: item.duracaoMinutos })
                  }
                  itemIdAtivoTimer={atividadeTimer?.id || null}
                />
              </>
            ) : (
              <ConfiguracaoRotina
                itens={itensRotina}
                onAdicionarItem={handleAdicionarItem}
                rotinaId="rot-001"
              />
            )}
          </>
        )}

        {/* 3. VISÃO DA COORDENAÇÃO / PEI */}
        {perfilAtual === 'COORDENACAO' && estudanteAtual && (
          <DashboardPEI
            estudantes={estudantes}
            estudanteSelecionado={estudanteAtual}
            onSelecionarEstudante={(est) => {
              setEstudanteAtual(est);
              carregarDadosEstudante(est.id);
            }}
            itensRotina={itensRotina}
            crises={historicoCrises}
          />
        )}

        {/* 4. VISÃO DO RESPONSÁVEL LEGAL */}
        {perfilAtual === 'RESPONSAVEL' && estudanteAtual && (
          <ConsentimentoLGPDComponent
            estudante={estudanteAtual}
            consentimento={consentimento}
            onAlternarConsentimento={handleAlternarConsentimento}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          <strong>RotinaTEA</strong> — Trabalho de Conclusão de Curso (TCC) • CEUNI FAMETRO • Orientadora: Luana Leal
        </p>
        <p style={{ fontSize: '0.8rem', marginTop: 4 }}>
          Desenvolvido com foco em Tecnologia Assistiva, Acessibilidade Cognitiva (WCAG 2.1 AA) e Privacidade (LGPD).
        </p>
      </footer>
    </div>
  );
};
