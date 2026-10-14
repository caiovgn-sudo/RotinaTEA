import React, { useState } from 'react';
import { PerfilUsuario, Usuario } from '../types';

interface HeaderProps {
  perfilAtual: PerfilUsuario;
  onTrocarPerfil: (novoPerfil: PerfilUsuario) => void;
  isOnline: boolean;
  onAlternarConexao: () => void;
  itensPendentesSync: number;
  altoContraste: boolean;
  onAlternarAltoContraste: () => void;
  contrasteAmarelo: boolean;
  onAlternarContrasteAmarelo: () => void;
  fonteAmpliada: boolean;
  onAlternarFonteAmpliada: () => void;
  usuario: Usuario | null;
  onLogout: () => void;
  perfilRequerAuth: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  perfilAtual,
  onTrocarPerfil,
  isOnline,
  onAlternarConexao,
  itensPendentesSync,
  altoContraste,
  onAlternarAltoContraste,
  contrasteAmarelo,
  onAlternarContrasteAmarelo,
  fonteAmpliada,
  onAlternarFonteAmpliada,
  usuario,
  onLogout,
  perfilRequerAuth
}) => {
  const [contrasteMode, setContrasteMode] = useState<'padrao' | 'alto' | 'amarelo'>(
    contrasteAmarelo ? 'amarelo' : (altoContraste ? 'alto' : 'padrao')
  );

  const handleContrasteChange = (mode: 'padrao' | 'alto' | 'amarelo') => {
    setContrasteMode(mode);
    if (mode === 'amarelo') {
      onAlternarContrasteAmarelo();
    } else if (mode === 'alto') {
      onAlternarAltoContraste();
    } else {
      // Reset both
      if (altoContraste) onAlternarAltoContraste();
      if (contrasteAmarelo) onAlternarContrasteAmarelo();
    }
  };
  return (
    <header className="app-header" role="banner">
      <div className="brand-section">
        <div className="logo-badge" aria-hidden="true">
          TEA
        </div>
        <div>
          <h1 className="brand-title">RotinaTEA</h1>
          <p className="brand-subtitle">Tecnologia Assistiva e Inclusão Escolar</p>
        </div>
      </div>

      {/* Seletor de Perfis */}
      <nav aria-label="Seleção de Perfis de Acesso" className="role-tabs">
        <button
          type="button"
          className={`role-tab-btn ${perfilAtual === 'ALUNO' ? 'active' : ''}`}
          onClick={() => onTrocarPerfil('ALUNO')}
          aria-pressed={perfilAtual === 'ALUNO'}
        >
          <span aria-hidden="true">🧒</span> Aluno TEA
        </button>
        <button
          type="button"
          className={`role-tab-btn ${perfilAtual === 'PROFESSOR' ? 'active' : ''}`}
          onClick={() => onTrocarPerfil('PROFESSOR')}
          aria-pressed={perfilAtual === 'PROFESSOR'}
        >
          <span aria-hidden="true">👩‍🏫</span> Professor
        </button>
        <button
          type="button"
          className={`role-tab-btn ${perfilAtual === 'COORDENACAO' ? 'active' : ''}`}
          onClick={() => onTrocarPerfil('COORDENACAO')}
          aria-pressed={perfilAtual === 'COORDENACAO'}
        >
          <span aria-hidden="true">📊</span> Coordenação / PEI
        </button>
        <button
          type="button"
          className={`role-tab-btn ${perfilAtual === 'RESPONSAVEL' ? 'active' : ''}`}
          onClick={() => onTrocarPerfil('RESPONSAVEL')}
          aria-pressed={perfilAtual === 'RESPONSAVEL'}
        >
          <span aria-hidden="true">🛡️</span> Responsável LGPD
        </button>
      </nav>

      {/* Ações de Acessibilidade e Conectividade */}
      <div className="header-actions">
        {/* Simulador Offline-First */}
        <button
          type="button"
          className={`badge-connection ${isOnline ? 'online' : 'offline'}`}
          onClick={onAlternarConexao}
          title="Clique para simular perda de conexão ou restabelecimento de internet"
          aria-label={`Status da conexão: ${isOnline ? 'Online' : 'Offline'}. Clique para alternar.`}
        >
          <span aria-hidden="true">{isOnline ? '🟢' : '🔴'}</span>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
          {itensPendentesSync > 0 && (
            <span
              style={{
                marginLeft: 4,
                backgroundColor: '#D4A373',
                color: '#fff',
                borderRadius: '10px',
                padding: '1px 6px',
                fontSize: '0.75rem'
              }}
              title={`${itensPendentesSync} registro(s) aguardando sincronização`}
            >
              {itensPendentesSync}
            </span>
          )}
        </button>

        {/* Alternância de Contraste */}
        <div className="contrast-selector" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={contrasteMode}
            onChange={(e) => handleContrasteChange(e.target.value as 'padrao' | 'alto' | 'amarelo')}
            aria-label="Selecionar modo de contraste"
            title="Modo de Contraste"
            style={{
              padding: '6px 10px',
              border: '1px solid var(--border-light)',
              borderRadius: '6px',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontFamily: 'inherit',
              fontSize: '0.8rem',
              cursor: 'pointer',
              minHeight: '38px'
            }}
          >
            <option value="padrao">🌙 Padrão</option>
            <option value="alto">☀️ Alto Contraste</option>
            <option value="amarelo">🟡 Amarelo/Preto (Baixa Visão)</option>
          </select>
        </div>

        {/* Alternância de Tamanho de Fonte */}
        <button
          type="button"
          className={`accessibility-btn ${fonteAmpliada ? 'active' : ''}`}
          onClick={onAlternarFonteAmpliada}
          aria-label={fonteAmpliada ? 'Restaurar tamanho padrão da fonte' : 'Ampliar tamanho da fonte'}
          title={fonteAmpliada ? 'Fonte Padrão' : 'Fonte Ampliada (A+)'}
        >
          <span aria-hidden="true">A+</span>
          <span>{fonteAmpliada ? 'Grande' : 'Normal'}</span>
        </button>

        {/* Info do Usuário Logado / Botão Sair */}
        {perfilRequerAuth && (
          <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
            {usuario ? (
              <>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {usuario.nome} ({usuario.perfil})
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onLogout}
                  aria-label="Sair da conta"
                >
                  Sair
                </button>
              </>
            ) : (
              <span className="login-hint" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
                Login necessário
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
