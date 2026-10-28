import React, { useState, useEffect, useCallback } from 'react';
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
  alternarConsentimento,
  SEED_ROTINA_1_ID,
  SEED_PROFESSOR_ID
} from './services/db';
import { AuthProvider, useAuth, ehUsuarioDemo } from './context/AuthContext';
import { podeRegistrarCrise } from './utils/regras';
import { acessoVisao, acessoVisoes, tipoAcesso, PROPOSITO_VISAO } from './utils/acesso';
import { Header } from './components/Header';
import { PranchaVisual } from './components/PranchaVisual';
import { TemporizadorVisual } from './components/TemporizadorVisual';
import { RegistroCriseComponent } from './components/RegistroCrise';
import { DashboardPEI } from './components/DashboardPEI';
import { ConsentimentoLGPDComponent } from './components/ConsentimentoLGPD';
import { ConfiguracaoRotina } from './components/ConfiguracaoRotina';
import { Login } from './components/Login';
import { SobreRotinaTEA } from './components/SobreRotinaTEA';
import { FormularioSUS } from './components/FormularioSUS';
import { Bell, ClipboardList, Plus, Calendar } from 'lucide-react';

const AppContent: React.FC = () => {
  const { usuario, loading: authLoading, signOut, refreshUsuario } = useAuth();
  
  // Estado do Perfil e Conexão
  const [perfilAtual, setPerfilAtual] = useState<PerfilUsuario>('ALUNO');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [itensPendentesSync, setItensPendentesSync] = useState<number>(0);
  const [altoContraste, setAltoContraste] = useState<boolean>(false);
  const [contrasteAmarelo, setContrasteAmarelo] = useState<boolean>(false);
  const [fonteAmpliada, setFonteAmpliada] = useState<boolean>(false);

  // Navegação: página "Sobre" e tela de login são abertas sob demanda
  const [sobreAberto, setSobreAberto] = useState<boolean>(false);
  const [mostrarLogin, setMostrarLogin] = useState<boolean>(false);

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

  // SUS Form modal
  const [mostrarSUS, setMostrarSUS] = useState(false);

  const exibirAviso = useCallback((msg: string) => {
    setAviso(msg);
    setTimeout(() => setAviso(null), 4000);
  }, []);

  // Acesso: o que a conta atual pode abrir (o servidor continua sendo a fonte de verdade via RLS)
  const demo = ehUsuarioDemo(usuario);
  const acessos = acessoVisoes(usuario, demo);
  const visaoPermitida = acessoVisao(perfilAtual, usuario, demo).permitida;

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
    const itens = await carregarItensRotina(SEED_ROTINA_1_ID);
    setItensRotina(itens);

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
      document.body.classList.remove('high-contrast-yellow');
      setContrasteAmarelo(false);
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  const handleAlternarContrasteAmarelo = () => {
    const novo = !contrasteAmarelo;
    setContrasteAmarelo(novo);
    if (novo) {
      document.body.classList.add('high-contrast-yellow');
      document.body.classList.remove('high-contrast');
      setAltoContraste(false);
    } else {
      document.body.classList.remove('high-contrast-yellow');
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
    const atualizados = await carregarItensRotina(SEED_ROTINA_1_ID);
    setItensRotina(atualizados);
  };

  const handleReordenarItens = async (novosItens: ItemRotina[]) => {
    setItensRotina(novosItens);
    await salvarOrdemItens(novosItens);
  };

  const handleAdicionarItem = async (novo: Omit<ItemRotina, 'id'>) => {
    await adicionarItemRotina(novo, isOnline);
    const atualizados = await carregarItensRotina(SEED_ROTINA_1_ID);
    setItensRotina(atualizados);
    setAbaProfessor('ACOMPANHAMENTO');
    exibirAviso('Nova atividade inserida na rotina com sucesso!');
  };

  // Ações de Crise (1 Clique)
  const handleIniciarCrise = async () => {
    if (!estudanteAtual) return;
    if (!podeRegistrarCrise(usuario?.perfil)) {
      exibirAviso('Apenas Professor ou Coordenação podem registrar crises.');
      return;
    }
    const nova = await iniciarCriseLocal(estudanteAtual.id, usuario?.id || SEED_PROFESSOR_ID);
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
      exibirAviso(`Crise de ${encerrada.duracaoSegundos}s registrada. O envio ao servidor ocorre em segundo plano.`);
    }
  };

  // Ação de Consentimento LGPD
  const handleAlternarConsentimento = async () => {
    if (!consentimento) return;
    const atualizado = await alternarConsentimento(consentimento.id, isOnline);
    setConsentimento(atualizado);
    exibirAviso(atualizado.ativo ? 'Consentimento reativado com sucesso.' : 'Consentimento revogado formalmente.');
  };

  const handleLogout = async () => {
    await signOut();
    setPerfilAtual('ALUNO');
    setSobreAberto(false);
    exibirAviso('Sessão encerrada com sucesso.');
  };

  const handleTrocarPerfil = (novo: PerfilUsuario) => {
    const acesso = acessoVisao(novo, usuario, demo);
    if (!acesso.permitida) {
      exibirAviso(acesso.motivo ?? 'Esta visão não está liberada para a sua conta.');
      return;
    }
    setSobreAberto(false);
    setMostrarLogin(false);
    setPerfilAtual(novo);
  };

  // Após entrar, abre a visão do perfil da conta e fecha a tela de login
  useEffect(() => {
    if (usuario && mostrarLogin) {
      setMostrarLogin(false);
      setSobreAberto(false);
      setPerfilAtual(usuario.perfil);
      exibirAviso(`Bem-vindo(a), ${usuario.nome}!`);
    }
  }, [usuario, mostrarLogin, exibirAviso]);

  // Se a sessão terminar em uma visão restrita, volta para a prancha do aluno
  useEffect(() => {
    if (!usuario && !authLoading && perfilAtual !== 'ALUNO') setPerfilAtual('ALUNO');
  }, [usuario, authLoading, perfilAtual]);

  // Mostra loading durante verificação de auth
  if (authLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div role="status" aria-label="Carregando autenticação">
          <div className="spinner" aria-hidden="true"></div>
          <p>Verificando sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header
        perfilAtual={perfilAtual}
        onTrocarPerfil={handleTrocarPerfil}
        acessos={acessos}
        onVisaoBloqueada={exibirAviso}
        tipoAcesso={tipoAcesso(usuario, demo)}
        sobreAberto={sobreAberto}
        onAbrirSobre={() => {
          setMostrarLogin(false);
          setSobreAberto(true);
        }}
        onEntrar={() => {
          setSobreAberto(false);
          setMostrarLogin(true);
        }}
        isOnline={isOnline}
        onAlternarConexao={handleAlternarConexao}
        itensPendentesSync={itensPendentesSync}
        altoContraste={altoContraste}
        onAlternarAltoContraste={handleAlternarAltoContraste}
        contrasteAmarelo={contrasteAmarelo}
        onAlternarContrasteAmarelo={handleAlternarContrasteAmarelo}
        fonteAmpliada={fonteAmpliada}
        onAlternarFonteAmpliada={handleAlternarFonteAmpliada}
        usuario={usuario}
        onLogout={handleLogout}
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
          <Bell size={18} aria-hidden="true" />
          <span>{aviso}</span>
        </div>
      )}

      <main className="main-content" id="conteudo-principal">
        {mostrarLogin && !usuario && (
          <Login onLoginSuccess={refreshUsuario} onVoltarAluno={() => setMostrarLogin(false)} />
        )}

        {!mostrarLogin && sobreAberto && <SobreRotinaTEA />}

        {!mostrarLogin && !sobreAberto && (
        <>
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
            <p className="proposito-visao">{PROPOSITO_VISAO[perfilAtual]}</p>
          </div>

          {perfilAtual === 'COORDENACAO' && usuario && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setMostrarSUS(true)}
              style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ClipboardList size={16} aria-hidden="true" />
              <span>Formulário SUS</span>
            </button>
          )}

          {perfilAtual === 'PROFESSOR' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`btn-timer ${abaProfessor === 'ACOMPANHAMENTO' ? 'primary' : ''}`}
                onClick={() => setAbaProfessor('ACOMPANHAMENTO')}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Calendar size={14} aria-hidden="true" />
                <span>Rotina & Crises</span>
              </button>
              <button
                type="button"
                className={`btn-timer ${abaProfessor === 'CONFIGURACAO' ? 'primary' : ''}`}
                onClick={() => setAbaProfessor('CONFIGURACAO')}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} aria-hidden="true" />
                <span>Configurar Cartões</span>
              </button>
            </div>
          )}
        </section>

        {/* 1. VISÃO DO ALUNO */}
        {visaoPermitida && perfilAtual === 'ALUNO' && (
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
        {visaoPermitida && perfilAtual === 'PROFESSOR' && usuario && (
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
                    modoDemo={ehUsuarioDemo(usuario)}
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
                rotinaId={SEED_ROTINA_1_ID}
                isOnline={isOnline}
              />
            )}
          </>
        )}

        {/* 3. VISÃO DA COORDENAÇÃO / PEI */}
        {visaoPermitida && perfilAtual === 'COORDENACAO' && usuario && estudanteAtual && (
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
        {visaoPermitida && perfilAtual === 'RESPONSAVEL' && usuario && estudanteAtual && (
          <ConsentimentoLGPDComponent
            estudante={estudanteAtual}
            consentimento={consentimento}
            onAlternarConsentimento={handleAlternarConsentimento}
          />
        )}

        {/* Salvaguarda: visão fora do alcance da conta (a navegação já bloqueia, o servidor também) */}
        {!visaoPermitida && (
          <div className="acesso-negado" role="alert">
            <h3>Esta visão não está liberada para a sua conta</h3>
            <p>{acessoVisao(perfilAtual, usuario, demo).motivo}</p>
            <button type="button" className="btn btn-primary" onClick={() => setPerfilAtual('ALUNO')}>
              Ir para a prancha do aluno
            </button>
          </div>
        )}
        </>
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

      {/* Modal SUS */}
      {mostrarSUS && (
        <FormularioSUS onClose={() => setMostrarSUS(false)} />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};