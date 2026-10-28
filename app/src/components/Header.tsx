import React, { useState } from 'react';
import { PerfilUsuario, Usuario } from '../types';
import {
  AcessoVisao,
  NOME_PERFIL,
  ROTULO_TIPO_ACESSO,
  TipoAcesso
} from '../utils/acesso';
import { rotuloConexao } from '../utils/sync';
import {
  User,
  GraduationCap,
  BarChart3,
  ShieldCheck,
  Wifi,
  WifiOff,
  LogOut,
  LogIn,
  Type,
  Lock,
  Info,
  FlaskConical,
  UserCheck,
  Eye
} from 'lucide-react';

interface HeaderProps {
  perfilAtual: PerfilUsuario;
  onTrocarPerfil: (novoPerfil: PerfilUsuario) => void;
  /** Visões que a conta atual pode abrir, com o motivo quando bloqueadas. */
  acessos: AcessoVisao[];
  onVisaoBloqueada: (motivo: string) => void;
  tipoAcesso: TipoAcesso;
  sobreAberto: boolean;
  onAbrirSobre: () => void;
  onEntrar: () => void;
  /** Conexão efetiva (real, a menos que o simulador esteja forçando offline). */
  isOnline: boolean;
  conexaoReal: boolean;
  simuladoOffline: boolean;
  simuladorDisponivel: boolean;
  onAlternarSimulador: () => void;
  itensPendentesSync: number;
  altoContraste: boolean;
  onAlternarAltoContraste: () => void;
  contrasteAmarelo: boolean;
  onAlternarContrasteAmarelo: () => void;
  fonteAmpliada: boolean;
  onAlternarFonteAmpliada: () => void;
  usuario: Usuario | null;
  onLogout: () => void;
}

const VISOES: { perfil: PerfilUsuario; rotulo: string; icone: React.ReactNode }[] = [
  { perfil: 'ALUNO', rotulo: 'Aluno TEA', icone: <User size={16} aria-hidden="true" /> },
  { perfil: 'PROFESSOR', rotulo: 'Professor', icone: <GraduationCap size={16} aria-hidden="true" /> },
  { perfil: 'COORDENACAO', rotulo: 'Coordenação / PEI', icone: <BarChart3 size={16} aria-hidden="true" /> },
  { perfil: 'RESPONSAVEL', rotulo: 'Responsável LGPD', icone: <ShieldCheck size={16} aria-hidden="true" /> }
];

const ICONE_ACESSO: Record<TipoAcesso, React.ReactNode> = {
  VISITANTE: <Eye size={14} aria-hidden="true" />,
  CONTA_REAL: <UserCheck size={14} aria-hidden="true" />,
  DEMONSTRACAO: <FlaskConical size={14} aria-hidden="true" />
};

export const Header: React.FC<HeaderProps> = ({
  perfilAtual,
  onTrocarPerfil,
  acessos,
  onVisaoBloqueada,
  tipoAcesso,
  sobreAberto,
  onAbrirSobre,
  onEntrar,
  isOnline,
  conexaoReal,
  simuladoOffline,
  simuladorDisponivel,
  onAlternarSimulador,
  itensPendentesSync,
  altoContraste,
  onAlternarAltoContraste,
  contrasteAmarelo,
  onAlternarContrasteAmarelo,
  fonteAmpliada,
  onAlternarFonteAmpliada,
  usuario,
  onLogout
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

  const temVisaoBloqueada = acessos.some((a) => !a.permitida);
  const rotuloAcesso = ROTULO_TIPO_ACESSO[tipoAcesso];

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

      {/* Navegação: cada visão mostra se está liberada para a conta atual */}
      <nav aria-label="Visões do sistema" className="role-tabs">
        {VISOES.map(({ perfil, rotulo, icone }) => {
          const acesso = acessos.find((a) => a.perfil === perfil);
          const bloqueada = !!acesso && !acesso.permitida;
          const ativa = !sobreAberto && perfilAtual === perfil;
          return (
            <button
              key={perfil}
              type="button"
              className={`role-tab-btn ${ativa ? 'active' : ''} ${bloqueada ? 'blocked' : ''}`}
              onClick={() => (bloqueada && acesso?.motivo ? onVisaoBloqueada(acesso.motivo) : onTrocarPerfil(perfil))}
              aria-pressed={ativa}
              aria-disabled={bloqueada}
              title={bloqueada ? acesso?.motivo ?? undefined : `Abrir a visão: ${NOME_PERFIL[perfil]}`}
            >
              {icone} {rotulo}
              {bloqueada && <Lock size={13} aria-label="Bloqueada para a conta atual" />}
            </button>
          );
        })}
        <button
          type="button"
          className={`role-tab-btn ${sobreAberto ? 'active' : ''}`}
          onClick={onAbrirSobre}
          aria-pressed={sobreAberto}
          title="Entenda o objetivo, os perfis e as regras do sistema"
        >
          <Info size={16} aria-hidden="true" /> Sobre
        </button>
      </nav>

      {/* Ações de Acessibilidade e Conectividade */}
      <div className="header-actions">
        {/* Estado REAL da conexão (o simulador de demonstração fica na faixa abaixo) */}
        <span
          className={`badge-connection ${isOnline ? 'online' : 'offline'}`}
          role="status"
          title="Estado da conexão com a internet"
        >
          {isOnline ? <Wifi size={14} aria-hidden="true" /> : <WifiOff size={14} aria-hidden="true" />}
          <span>{rotuloConexao(conexaoReal, simuladoOffline, simuladorDisponivel)}</span>
        </span>

        {/* Alternância de Contraste */}
        <div className="contrast-selector" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            value={contrasteMode}
            onChange={(e) => handleContrasteChange(e.target.value as 'padrao' | 'alto' | 'amarelo')}
            aria-label="Selecionar modo de contraste"
            title="Modo de Contraste"
            className="control-select"
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
          <Type size={16} aria-hidden="true" />
          <span>{fonteAmpliada ? 'Grande' : 'Normal'}</span>
        </button>

        {/* Info do Usuário Logado / Botão Entrar ou Sair */}
        {usuario ? (
          <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {usuario.nome} <small style={{ opacity: 0.8 }}>({NOME_PERFIL[usuario.perfil]})</small>
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onLogout}
              aria-label="Sair da conta"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <LogOut size={14} aria-hidden="true" />
              Sair
            </button>
          </div>
        ) : (
          <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onEntrar}
              aria-label="Fazer login no sistema"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <LogIn size={14} aria-hidden="true" />
              Entrar
            </button>
          </div>
        )}
      </div>

      {/* Faixa de estado do acesso: sempre visível, para ninguém confundir dados fictícios com reais */}
      <div className="status-bar" role="group" aria-label="Estado do acesso">
        <span className={`selo-acesso selo-${tipoAcesso.toLowerCase()}`} title={rotuloAcesso.detalhe}>
          {ICONE_ACESSO[tipoAcesso]}
          <strong>{rotuloAcesso.titulo}</strong>
        </span>
        <span className="status-bar-detalhe">{rotuloAcesso.detalhe}</span>
        {itensPendentesSync > 0 && (
          <span className="status-bar-detalhe">
            <strong>{itensPendentesSync}</strong> registro(s) aguardando envio ao servidor.
          </span>
        )}
        {simuladorDisponivel && (
          <button
            type="button"
            className="btn btn-secondary btn-sm simulador-conexao"
            onClick={onAlternarSimulador}
            aria-pressed={simuladoOffline}
            title="Ferramenta de demonstração: simula a falta de internet sem desligar o Wi-Fi."
          >
            <FlaskConical size={14} aria-hidden="true" />
            Simulador de conexão (demonstração): {simuladoOffline ? 'restabelecer' : 'simular queda'}
          </button>
        )}
        {temVisaoBloqueada && (
          <span className="status-bar-detalhe">
            <Lock size={12} aria-hidden="true" /> Visões com cadeado exigem login com o perfil correspondente.
          </span>
        )}
      </div>
    </header>
  );
};
