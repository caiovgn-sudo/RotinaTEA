import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PerfilUsuario, Estudante, ItemRotina, RegistroCrise, ConsentimentoLGPD, SyncItem } from './types';
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
  reativarItemNaFila,
  carregarConsentimento,
  alternarConsentimento,
  SEED_ROTINA_1_ID,
  SEED_PROFESSOR_ID
} from './services/db';
import { AuthProvider, useAuth, ehUsuarioDemo, MODO_DEMO_HABILITADO } from './context/AuthContext';
import { useConexaoReal } from './hooks/useConexaoReal';
import { conexaoEfetiva } from './utils/sync';
import { podeRegistrarCrise, coletaPermitida, MENSAGEM_COLETA_BLOQUEADA } from './utils/regras';
import { acessoVisao, acessoVisoes, tipoAcesso, PROPOSITO_VISAO, NOME_PERFIL } from './utils/acesso';
import {
  Atividade,
  TipoAtividade,
  registrarAtividade,
  lerAtividades,
  gravarAtividades
} from './utils/atividades';
import { Header } from './components/Header';
import { PainelSincronizacao } from './components/PainelSincronizacao';
import { RegistroAtividades } from './components/RegistroAtividades';
import { PranchaVisual } from './components/PranchaVisual';
import { TemporizadorVisual } from './components/TemporizadorVisual';
import { RegistroCriseComponent } from './components/RegistroCrise';
import { DashboardPEI } from './components/DashboardPEI';
import { ConsentimentoLGPDComponent } from './components/ConsentimentoLGPD';
import { ConfiguracaoRotina } from './components/ConfiguracaoRotina';
import { Login } from './components/Login';
import { SobreRotinaTEA } from './components/SobreRotinaTEA';
import { FormularioSUS } from './components/FormularioSUS';
import { Bell, ClipboardList, Plus, Calendar, Lock } from 'lucide-react';

const AppContent: React.FC = () => {
  const { usuario, loading: authLoading, signOut, refreshUsuario, sessaoExpirada, dispensarSessaoExpirada } = useAuth();
  
  // Estado do Perfil e Conexão
  const [perfilAtual, setPerfilAtual] = useState<PerfilUsuario>('ALUNO');
  // Conexão: a real vem do navegador; o simulador (só em demonstração) força "offline" para fins didáticos
  const conexaoReal = useConexaoReal();
  const [simuladoOffline, setSimuladoOffline] = useState<boolean>(false);
  const simuladorDisponivel = MODO_DEMO_HABILITADO;
  const isOnline = conexaoEfetiva(conexaoReal, simuladoOffline, simuladorDisponivel);
  const [filaSync, setFilaSync] = useState<SyncItem[]>([]);
  const [sincronizando, setSincronizando] = useState<boolean>(false);
  const itensPendentesSync = filaSync.length;
  const [altoContraste, setAltoContraste] = useState<boolean>(false);
  const [contrasteAmarelo, setContrasteAmarelo] = useState<boolean>(false);
  const [fonteAmpliada, setFonteAmpliada] = useState<boolean>(false);

  // Navegação: página "Sobre" e tela de login são abertas sob demanda
  const [sobreAberto, setSobreAberto] = useState<boolean>(false);
  const [mostrarLogin, setMostrarLogin] = useState<boolean>(false);
  // Motivo de uma visão bloqueada, mostrado até o usuário fechar (não some sozinho como o aviso rápido)
  const [avisoAcesso, setAvisoAcesso] = useState<string | null>(null);

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

  // Registro local das últimas ações (sem dados pessoais — RN02)
  const [atividades, setAtividades] = useState<Atividade[]>(() =>
    lerAtividades(typeof localStorage === 'undefined' ? null : localStorage)
  );
  const registrar = useCallback((tipo: TipoAtividade, descricao: string) => {
    setAtividades((anteriores) => {
      const novas = registrarAtividade(anteriores, tipo, descricao);
      gravarAtividades(typeof localStorage === 'undefined' ? null : localStorage, novas);
      return novas;
    });
  }, []);
  const limparAtividades = () => {
    setAtividades([]);
    gravarAtividades(typeof localStorage === 'undefined' ? null : localStorage, []);
  };

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
    setFilaSync(fila);
  };

  const handleAlternarSimulador = () => setSimuladoOffline((v) => !v);

  // Reage a mudanças da conexão efetiva (real ou simulada): ao voltar, envia a fila; ao cair, avisa.
  const conexaoAnterior = useRef<boolean>(isOnline);
  useEffect(() => {
    if (conexaoAnterior.current === isOnline) return;
    conexaoAnterior.current = isOnline;

    const reagir = async () => {
      if (!isOnline) {
        registrar('CONEXAO', conexaoReal ? 'Queda de conexão simulada.' : 'Sem internet: registros salvos só neste aparelho.');
        exibirAviso(
          conexaoReal
            ? 'Queda de conexão simulada. Os registros continuam sendo salvos neste aparelho.'
            : 'Sem internet. Os registros continuam sendo salvos neste aparelho e serão enviados quando a conexão voltar.'
        );
        return;
      }
      const enviados = await sincronizarFilaBatch();
      await atualizarFilaSync();
      if (estudanteAtual) setHistoricoCrises(await carregarCrises(estudanteAtual.id));
      const restantes = (await carregarItensFilaSync()).length;
      registrar('CONEXAO', 'Conexão restabelecida.');
      if (enviados > 0) registrar('SINCRONIZACAO', enviados + ' registro(s) enviados ao servidor.');
      exibirAviso(
        enviados > 0
          ? 'Conexão restabelecida. ' + enviados + ' registro(s) enviados ao servidor.'
          : demo
            ? 'Conexão restabelecida. No modo demonstração nada é enviado ao servidor.'
            : restantes > 0
              ? 'Conexão restabelecida, mas ' + restantes + ' registro(s) ainda aguardam envio. Veja o painel de sincronização.'
              : 'Conexão restabelecida. Não havia registros aguardando envio.'
      );
    };
    void reagir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const handleSincronizarAgora = async () => {
    setSincronizando(true);
    try {
      const enviados = await sincronizarFilaBatch();
      await atualizarFilaSync();
      if (estudanteAtual) setHistoricoCrises(await carregarCrises(estudanteAtual.id));
      registrar('SINCRONIZACAO', enviados > 0 ? enviados + ' registro(s) enviados ao servidor.' : 'Sincronização manual: nada foi enviado.');
      exibirAviso(enviados > 0 ? enviados + ' registro(s) enviados ao servidor.' : 'Nada foi enviado. Confira a situação dos itens.');
    } finally {
      setSincronizando(false);
    }
  };

  const handleTentarNovamente = async (itemId: string) => {
    await reativarItemNaFila(itemId);
    registrar('SINCRONIZACAO', 'Novo envio solicitado para um item com erro.');
    await handleSincronizarAgora();
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
    registrar('ROTINA', 'Cartão adicionado à rotina do aluno.');
    exibirAviso('Nova atividade inserida na rotina com sucesso!');
  };

  // Ações de Crise (1 Clique)
  const handleIniciarCrise = async () => {
    if (!estudanteAtual) return;
    if (!podeRegistrarCrise(usuario?.perfil)) {
      exibirAviso('Apenas Professor ou Coordenação podem registrar crises.');
      return;
    }
    // LGPD: relê o termo no armazenamento local, para não depender de um estado de tela desatualizado
    const termoAtual = await carregarConsentimento(estudanteAtual.id);
    setConsentimento(termoAtual);
    if (!coletaPermitida(termoAtual)) {
      registrar('CONSENTIMENTO', 'Registro de crise bloqueado: consentimento revogado.');
      exibirAviso(MENSAGEM_COLETA_BLOQUEADA);
      return;
    }
    const nova = await iniciarCriseLocal(estudanteAtual.id, usuario?.id || SEED_PROFESSOR_ID);
    setCriseAtiva(nova);
    registrar('CRISE_INICIADA', 'Crise iniciada. O horário foi guardado neste aparelho.');
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
    registrar('CRISE_ENCERRADA', 'Crise encerrada: ' + encerrada.duracaoSegundos + 's. Salva neste aparelho' + (isOnline ? ' e na fila de envio.' : '; envio pendente (sem conexão).'));

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
    registrar('CONSENTIMENTO', atualizado.ativo ? 'Consentimento reativado pelo responsável.' : 'Consentimento revogado pelo responsável.');
    exibirAviso(atualizado.ativo ? 'Consentimento reativado com sucesso.' : 'Consentimento revogado formalmente.');
  };

  const handleLogout = async () => {
    await signOut();
    registrar('ACESSO', 'Sessão encerrada.');
    setPerfilAtual('ALUNO');
    setSobreAberto(false);
    exibirAviso('Sessão encerrada com sucesso.');
  };

  const handleTrocarPerfil = (novo: PerfilUsuario) => {
    const acesso = acessoVisao(novo, usuario, demo);
    if (!acesso.permitida) {
      setAvisoAcesso(acesso.motivo ?? 'Esta visão não está liberada para a sua conta.');
      return;
    }
    setAvisoAcesso(null);
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
      registrar('ACESSO', 'Acesso como ' + NOME_PERFIL[usuario.perfil] + (ehUsuarioDemo(usuario) ? ' (modo demonstração).' : ' (conta real).'));
    }
  }, [usuario, mostrarLogin, exibirAviso, registrar]);

  useEffect(() => {
    if (sessaoExpirada) registrar('ACESSO', 'Sessão encerrada pelo servidor (tempo esgotado ou revogação).');
  }, [sessaoExpirada, registrar]);

  // Se a sessão terminar em uma visão restrita, volta para a prancha do aluno
  useEffect(() => {
    if (!usuario && !authLoading && perfilAtual !== 'ALUNO') setPerfilAtual('ALUNO');
  }, [usuario, authLoading, perfilAtual]);

  const irParaLogin = () => {
    setAvisoAcesso(null);
    dispensarSessaoExpirada();
    setSobreAberto(false);
    setMostrarLogin(true);
  };

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
        onVisaoBloqueada={setAvisoAcesso}
        tipoAcesso={tipoAcesso(usuario, demo)}
        sobreAberto={sobreAberto}
        onAbrirSobre={() => {
          setAvisoAcesso(null);
          setMostrarLogin(false);
          setSobreAberto(true);
        }}
        onEntrar={irParaLogin}
        isOnline={isOnline}
        conexaoReal={conexaoReal}
        simuladoOffline={simuladoOffline}
        simuladorDisponivel={simuladorDisponivel}
        onAlternarSimulador={handleAlternarSimulador}
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
            color: 'var(--on-fill)',
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
        {sessaoExpirada && !usuario && !mostrarLogin && (
          <div className="aviso-persistente" role="alert">
            <p>
              <strong>Sua sessão terminou.</strong> Por segurança, o acesso foi encerrado. Entre novamente para continuar.
              Os registros salvos neste aparelho não foram perdidos.
            </p>
            <div className="aviso-persistente-acoes">
              <button type="button" className="btn btn-primary" onClick={irParaLogin}>
                Entrar novamente
              </button>
              <button type="button" className="btn btn-secondary" onClick={dispensarSessaoExpirada}>
                Fechar
              </button>
            </div>
          </div>
        )}

        {avisoAcesso && !mostrarLogin && (
          <div className="aviso-persistente" role="alert">
            <p>
              <strong>Esta visão está bloqueada.</strong> {avisoAcesso}
            </p>
            <div className="aviso-persistente-acoes">
              {!usuario && (
                <button type="button" className="btn btn-primary" onClick={irParaLogin}>
                  Entrar
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={() => setAvisoAcesso(null)}>
                Fechar
              </button>
            </div>
          </div>
        )}

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
            <p className="aviso-anonimizacao">
              <Lock size={13} aria-hidden="true" /> O aluno aparece só pelo código (ALN-XXXX). Nomes reais não são armazenados.
            </p>
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
                    modoDemo={demo}
                    filaSync={filaSync}
                    coletaBloqueada={!coletaPermitida(consentimento)}
                  />
                )}
                <PainelSincronizacao
                  fila={filaSync}
                  crises={historicoCrises}
                  isOnline={isOnline}
                  modoDemo={demo}
                  ocupado={sincronizando}
                  onSincronizarAgora={handleSincronizarAgora}
                  onTentarNovamente={handleTentarNovamente}
                />
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
            filaSync={filaSync}
            modoDemo={demo}
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

        <RegistroAtividades atividades={atividades} onLimpar={limparAtividades} />
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