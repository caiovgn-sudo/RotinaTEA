import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PerfilUsuario } from '../types';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { signIn, signUp, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('PROFESSOR');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, senha);
      } else {
        if (!nome.trim()) {
          setErro('Nome é obrigatório para cadastro');
          setCarregando(false);
          return;
        }
        result = await signUp(nome, email, senha, perfil);
      }

      if (result.error) {
        setErro(result.error.message);
      } else {
        onLoginSuccess();
      }
    } catch (err) {
      setErro('Erro inesperado. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setErro(null);
  };

  if (authLoading) {
    return (
      <div className="login-container" role="status" aria-label="Carregando autenticação">
        <div className="login-card">
          <div className="spinner" aria-hidden="true"></div>
          <p>Verificando sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-badge" aria-hidden="true">TEA</div>
          <h1>RotinaTEA</h1>
          <p className="subtitle">{isLogin ? 'Acesse sua conta' : 'Crie sua conta'}</p>
        </div>

        {erro && (
          <div className="alert alert-error" role="alert" aria-live="polite">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="nome">Nome Completo</label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required={!isLogin}
                autoComplete="name"
                disabled={carregando}
              />
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="perfil">Perfil de Acesso</label>
              <select
                id="perfil"
                value={perfil}
                onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
                disabled={carregando}
              >
                <option value="PROFESSOR">Professor / Mediador</option>
                <option value="COORDENACAO">Coordenação Pedagógica</option>
                <option value="RESPONSAVEL">Responsável Legal</option>
              </select>
            </div>
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
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              disabled={carregando}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={carregando || authLoading}
            aria-busy={carregando}
          >
            {carregando ? (
              <>
                <span className="spinner-sm" aria-hidden="true"></span>
                {isLogin ? 'Entrando...' : 'Criando conta...'}
              </>
            ) : (
              isLogin ? 'Entrar' : 'Cadastrar'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? 'Não tem conta?' : 'Já tem conta?'}
            <button
              type="button"
              className="link-btn"
              onClick={handleToggleMode}
              disabled={carregando}
            >
              {isLogin ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>
        </div>

        <div className="login-info">
          <p><strong>Perfis disponíveis:</strong></p>
          <ul>
            <li><strong>Professor/Mediador:</strong> Registro de crises, acompanhamento de rotinas</li>
            <li><strong>Coordenação:</strong> Dashboard PEI, métricas anonimizadas</li>
            <li><strong>Responsável:</strong> Gestão de consentimento LGPD</li>
          </ul>
          <p className="hint">Alunos acessam diretamente pela prancha visual (sem login).</p>
        </div>
      </div>
    </div>
  );
};