import React, { useState } from 'react';
import { useAuth, MODO_DEMO_HABILITADO } from '../context/AuthContext';
import {
  LogIn,
  UserPlus,
  ArrowLeft,
  GraduationCap,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  BookOpen,
  Heart,
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
  onVoltarAluno?: () => void;
}

type Aba = 'entrar' | 'cadastrar' | 'demo';

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onVoltarAluno }) => {
  const { signIn, signInDemo, signUp, loading: authLoading } = useAuth();

  const [aba, setAba] = useState<Aba>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    setCarregando(true);

    try {
      let result;
      if (aba === 'entrar') {
        result = await signIn(email, senha);
      } else {
        if (!nome.trim()) {
          setErro('Nome é obrigatório para cadastro');
          setCarregando(false);
          return;
        }
        result = await signUp(nome, email, senha);
      }

      if (result.error) {
        setErro(result.error.message);
      } else if (result.aviso) {
        setAviso(result.aviso);
        setAba('entrar');
      } else {
        onLoginSuccess();
      }
    } catch {
      setErro('Erro inesperado. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleMudarAba = (novaAba: Aba) => {
    setAviso(null);
    setAba(novaAba);
    setErro(null);
    setEmail('');
    setSenha('');
    setNome('');
  };

  const handleDemoLogin = (perfil: 'PROFESSOR' | 'COORDENACAO' | 'RESPONSAVEL') => {
    signInDemo(perfil);
    onLoginSuccess();
  };

  if (authLoading) {
    return (
      <div className="login-page" role="status" aria-label="Carregando autenticação">
        <div className="login-split-card">
          <div className="login-form-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="spinner" aria-hidden="true"></div>
              <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Verificando sessão...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const contas = [
    {
      perfil: 'PROFESSOR' as const,
      nome: 'Prof. Helena',
      descricao: 'Professor / Mediador',
      email: 'professor@rotinatea.edu.br',
      icon: GraduationCap,
      cor: 'var(--primary)',
      corLight: 'var(--primary-light)',
    },
    {
      perfil: 'COORDENACAO' as const,
      nome: 'Coord. Marcelo',
      descricao: 'Coordenação Pedagógica',
      email: 'coordenacao@rotinatea.edu.br',
      icon: BarChart3,
      cor: 'var(--success)',
      corLight: 'var(--success-light)',
    },
    {
      perfil: 'RESPONSAVEL' as const,
      nome: 'Ana Beatriz',
      descricao: 'Responsável Legal / LGPD',
      email: 'responsavel@rotinatea.edu.br',
      icon: ShieldCheck,
      cor: 'var(--warning)',
      corLight: 'var(--warning-light)',
    },
  ];

  return (
    <div className="login-page">
      <div className="login-split-card">
        {/* Painel Esquerdo — Identidade Visual */}
        <div className="login-brand-panel" aria-hidden="true">
          <div className="login-brand-content">
            <div className="login-brand-logo">
              <span>TEA</span>
            </div>
            <h2 className="login-brand-title">RotinaTEA</h2>
            <p className="login-brand-desc">
              Apoio à rotina e inclusão de estudantes com Transtorno do Espectro Autista
            </p>
            <div className="login-brand-features">
              <div className="login-brand-feature">
                <BookOpen size={18} />
                <span>Rotinas visuais acessíveis</span>
              </div>
              <div className="login-brand-feature">
                <BarChart3 size={18} />
                <span>Dashboard PEI analítico</span>
              </div>
              <div className="login-brand-feature">
                <ShieldCheck size={18} />
                <span>Conformidade com LGPD</span>
              </div>
              <div className="login-brand-feature">
                <Heart size={18} />
                <span>Offline-first para todos</span>
              </div>
            </div>
          </div>
          <p className="login-brand-footer">
            Alunos acessam pela prancha visual — sem necessidade de login.
          </p>
        </div>

        {/* Painel Direito — Formulário */}
        <div className="login-form-panel">
          {/* Tabs de Navegação */}
          <div className="login-tabs" role="tablist" aria-label="Modo de acesso">
            <button
              role="tab"
              aria-selected={aba === 'entrar'}
              className={`login-tab${aba === 'entrar' ? ' active' : ''}`}
              onClick={() => handleMudarAba('entrar')}
              type="button"
            >
              <LogIn size={15} aria-hidden="true" />
              Entrar
            </button>
            <button
              role="tab"
              aria-selected={aba === 'cadastrar'}
              className={`login-tab${aba === 'cadastrar' ? ' active' : ''}`}
              onClick={() => handleMudarAba('cadastrar')}
              type="button"
            >
              <UserPlus size={15} aria-hidden="true" />
              Cadastrar
            </button>
            {MODO_DEMO_HABILITADO && (
            <button
              role="tab"
              aria-selected={aba === 'demo'}
              className={`login-tab${aba === 'demo' ? ' active' : ''}`}
              onClick={() => handleMudarAba('demo')}
              type="button"
            >
              <Sparkles size={15} aria-hidden="true" />
              Demonstração
            </button>
            )}
          </div>

          {/* Mensagem de Erro */}
          {erro && (
            <div className="alert alert-error" role="alert" aria-live="polite">
              {erro}
            </div>
          )}

          {aviso && (
            <div className="alert alert-success" role="status" aria-live="polite">
              {aviso}
            </div>
          )}

          {/* Aba: Entrar / Cadastrar */}
          {(aba === 'entrar' || aba === 'cadastrar') && (
            <form onSubmit={handleSubmit} noValidate className="login-form">
              {aba === 'cadastrar' && (
                <div className="form-group">
                  <label htmlFor="nome">Nome Completo</label>
                  <input
                    type="text"
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    autoComplete="name"
                    disabled={carregando}
                  />
                </div>
              )}

              {aba === 'cadastrar' && (
                <p className="login-demo-hint">
                  Contas novas são criadas como <strong>Responsável Legal</strong>. Perfis de Professor e
                  Coordenação são atribuídos pela coordenação do sistema.
                </p>
              )}

              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                  disabled={carregando}
                />
              </div>

              <div className="form-group">
                <label htmlFor="senha">Senha</label>
                <div className="input-with-icon">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    id="senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder={aba === 'entrar' ? '••••••••' : 'Mínimo 6 caracteres'}
                    required
                    minLength={6}
                    autoComplete={aba === 'entrar' ? 'current-password' : 'new-password'}
                    disabled={carregando}
                  />
                  <button
                    type="button"
                    className="input-icon-btn"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={mostrarSenha}
                  >
                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block login-submit-btn"
                disabled={carregando || authLoading}
                aria-busy={carregando}
              >
                {carregando ? (
                  <>
                    <span className="spinner-sm" aria-hidden="true"></span>
                    {aba === 'entrar' ? 'Entrando...' : 'Criando conta...'}
                  </>
                ) : aba === 'entrar' ? (
                  <>
                    <LogIn size={16} aria-hidden="true" />
                    Entrar
                  </>
                ) : (
                  <>
                    <UserPlus size={16} aria-hidden="true" />
                    Criar Conta
                  </>
                )}
              </button>

              {onVoltarAluno && (
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  style={{ marginTop: 12 }}
                  onClick={onVoltarAluno}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Voltar para a Prancha do Aluno
                </button>
              )}
            </form>
          )}

          {/* Aba: Demonstração */}
          {MODO_DEMO_HABILITADO && aba === 'demo' && (
            <div className="login-demo-panel">
              <p className="login-demo-desc">
                Acesse com um perfil pré-configurado para explorar todas as funcionalidades do sistema.
              </p>
              <div className="login-demo-cards">
                {contas.map((conta) => {
                  const Icon = conta.icon;
                  return (
                    <button
                      key={conta.perfil}
                      type="button"
                      className="login-demo-card"
                      onClick={() => handleDemoLogin(conta.perfil)}
                      style={{ '--demo-cor': conta.cor, '--demo-cor-light': conta.corLight } as React.CSSProperties}
                    >
                      <div className="login-demo-card-icon">
                        <Icon size={22} />
                      </div>
                      <div className="login-demo-card-info">
                        <strong>{conta.nome}</strong>
                        <span>{conta.descricao}</span>
                        <code>{conta.email}</code>
                      </div>
                      <div className="login-demo-card-arrow">→</div>
                    </button>
                  );
                })}
              </div>
              <p className="login-demo-hint">
                Modo demonstração: dados fictícios, salvos apenas neste navegador. Sem acesso ao servidor.
              </p>

              {onVoltarAluno && (
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  style={{ marginTop: 16 }}
                  onClick={onVoltarAluno}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Voltar para a Prancha do Aluno
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};