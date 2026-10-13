import React from 'react';
import { PerfilUsuario } from '../types';

interface HeaderProps {
  perfilAtual: PerfilUsuario;
  onTrocarPerfil: (novoPerfil: PerfilUsuario) => void;
  isOnline: boolean;
  onAlternarConexao: () => void;
  itensPendentesSync: number;
  altoContraste: boolean;
  onAlternarAltoContraste: () => void;
  fonteAmpliada: boolean;
  onAlternarFonteAmpliada: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  perfilAtual,
  onTrocarPerfil,
  isOnline,
  onAlternarConexao,
  itensPendentesSync,
  altoContraste,
  onAlternarAltoContraste,
  fonteAmpliada,
  onAlternarFonteAmpliada
}) => {
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
        <button
          type="button"
          className="accessibility-btn"
          onClick={onAlternarAltoContraste}
          aria-label="Alternar modo de alto contraste suave"
          title="Modo Alto Contraste Suave"
        >
          <span aria-hidden="true">{altoContraste ? '☀️' : '🌙'}</span>
          <span>{altoContraste ? 'Padrão' : 'Contraste'}</span>
        </button>

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
      </div>
    </header>
  );
};
