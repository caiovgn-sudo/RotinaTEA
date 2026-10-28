import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { Usuario, PerfilUsuario } from '../types';

/**
 * Modo demonstração: acesso explícito, SEM senha e SEM sessão no servidor, que opera apenas
 * sobre dados fictícios locais (IndexedDB). Não concede nenhum acesso ao banco remoto, pois o
 * RLS exige uma sessão autenticada do Supabase. Pode ser desligado com VITE_MODO_DEMO=false.
 */
export const MODO_DEMO_HABILITADO = import.meta.env.VITE_MODO_DEMO !== 'false';

export interface ContaDemo {
  email: string;
  nome: string;
  perfil: 'PROFESSOR' | 'COORDENACAO' | 'RESPONSAVEL';
  id: string;
}

export const CONTAS_DEMO: Record<'PROFESSOR' | 'COORDENACAO' | 'RESPONSAVEL', ContaDemo> = {
  PROFESSOR: {
    email: 'professor@rotinatea.edu.br',
    nome: 'Prof. Helena Vasconcelos',
    perfil: 'PROFESSOR',
    id: 'd0000001-0000-4000-a000-000000000001'
  },
  COORDENACAO: {
    email: 'coordenacao@rotinatea.edu.br',
    nome: 'Coord. Marcelo Siqueira',
    perfil: 'COORDENACAO',
    id: 'd0000002-0000-4000-a000-000000000001'
  },
  RESPONSAVEL: {
    email: 'responsavel@rotinatea.edu.br',
    nome: 'Ana Beatriz (Mãe do Aluno)',
    perfil: 'RESPONSAVEL',
    id: 'd0000002-0000-4000-a000-000000000002'
  }
};

/** Usuários do modo demonstração (dados fictícios locais) — não são contas reais do servidor. */
export function ehUsuarioDemo(u: Usuario | null): boolean {
  return !!u && MODO_DEMO_HABILITADO && Object.values(CONTAS_DEMO).some((c) => c.id === u.id);
}

// Cache do perfil (apenas conveniência offline). Nunca é fonte de autorização:
// só é aceito se existir uma sessão do Supabase para o mesmo usuário (ou o modo demo explícito).
const CHAVE_SESSAO_LOCAL = 'rotinatea_sessao_usuario';
const CHAVE_MODO_DEMO = 'rotinatea_modo_demo';

interface ResultadoAuth {
  error: Error | null;
  /** Mensagem informativa (ex.: confirmação de e-mail pendente). Não é erro. */
  aviso?: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<ResultadoAuth>;
  signInDemo: (perfil: 'PROFESSOR' | 'COORDENACAO' | 'RESPONSAVEL') => void;
  signUp: (nome: string, email: string, senha: string) => Promise<ResultadoAuth>;
  signOut: () => Promise<void>;
  refreshUsuario: () => Promise<void>;
  /** Verdadeiro quando o servidor encerrou a sessão sem que o usuário tenha saído (tempo esgotado ou revogação). */
  sessaoExpirada: boolean;
  dispensarSessaoExpirada: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PERFIS_VALIDOS: PerfilUsuario[] = ['ALUNO', 'PROFESSOR', 'COORDENACAO', 'RESPONSAVEL'];

function lerCache(): Usuario | null {
  try {
    const bruto = localStorage.getItem(CHAVE_SESSAO_LOCAL);
    if (!bruto) return null;
    const u = JSON.parse(bruto) as Partial<Usuario>;
    if (
      u &&
      typeof u.id === 'string' &&
      typeof u.nome === 'string' &&
      typeof u.email === 'string' &&
      PERFIS_VALIDOS.includes(u.perfil as PerfilUsuario)
    ) {
      return u as Usuario;
    }
  } catch {
    // cache inválido: ignorado
  }
  return null;
}

function salvarCache(u: Usuario): void {
  localStorage.setItem(CHAVE_SESSAO_LOCAL, JSON.stringify(u));
}

function limparCache(): void {
  localStorage.removeItem(CHAVE_SESSAO_LOCAL);
  localStorage.removeItem(CHAVE_MODO_DEMO);
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessaoExpirada, setSessaoExpirada] = useState(false);
  // Distingue a saída pedida pelo usuário do encerramento feito pelo servidor
  const saidaManual = useRef(false);

  /** O perfil vem SEMPRE da tabela `usuarios` (protegida por RLS), nunca do formulário nem dos metadados. */
  const buscarUsuarioNoBanco = async (userId: string): Promise<Usuario | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, perfil')
        .eq('id', userId)
        .single();
      if (error || !data) return null;
      return { id: data.id, nome: data.nome, email: data.email, perfil: data.perfil as PerfilUsuario };
    } catch {
      return null;
    }
  };

  const restaurarSessao = async (): Promise<void> => {
    // 1) Sessão real do Supabase é a fonte de verdade
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (session?.user) {
        const doBanco = await buscarUsuarioNoBanco(session.user.id);
        if (doBanco) {
          salvarCache(doBanco);
          setUsuario(doBanco);
          return;
        }
        // Sem rede: aceita o cache somente se pertencer à mesma sessão
        const cache = lerCache();
        if (cache && cache.id === session.user.id) {
          setUsuario(cache);
          return;
        }
      }
    } catch {
      // segue para o modo demo / sem usuário
    }

    // 2) Modo demonstração explícito (sem acesso remoto)
    if (MODO_DEMO_HABILITADO && localStorage.getItem(CHAVE_MODO_DEMO) === '1') {
      const cache = lerCache();
      if (cache && Object.values(CONTAS_DEMO).some((c) => c.id === cache.id)) {
        setUsuario(cache);
        return;
      }
    }

    limparCache();
    setUsuario(null);
  };

  useEffect(() => {
    restaurarSessao().finally(() => setLoading(false));

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((evento, session) => {
      // Evita chamar o Supabase de forma síncrona dentro do callback (recomendação do SDK)
      setTimeout(async () => {
        if (session?.user) {
          const doBanco = await buscarUsuarioNoBanco(session.user.id);
          if (doBanco) {
            salvarCache(doBanco);
            setUsuario(doBanco);
          }
        } else if (evento === 'SIGNED_OUT') {
          if (saidaManual.current) {
            saidaManual.current = false;
          } else if (localStorage.getItem(CHAVE_SESSAO_LOCAL)) {
            setSessaoExpirada(true);
          }
          limparCache();
          setUsuario(null);
        }
        setLoading(false);
      }, 0);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInDemo = (perfil: 'PROFESSOR' | 'COORDENACAO' | 'RESPONSAVEL') => {
    if (!MODO_DEMO_HABILITADO) return;
    const conta = CONTAS_DEMO[perfil];
    const u: Usuario = { id: conta.id, nome: conta.nome, email: conta.email, perfil: conta.perfil };
    localStorage.setItem(CHAVE_MODO_DEMO, '1');
    salvarCache(u);
    setUsuario(u);
  };

  const signIn = async (email: string, senha: string): Promise<ResultadoAuth> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha
      });
      if (error) {
        const naoConfirmado = /not confirmed/i.test(error.message);
        return {
          error: new Error(
            naoConfirmado
              ? 'Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).'
              : 'E-mail ou senha inválidos.'
          )
        };
      }
      if (!data.user) {
        return { error: new Error('Não foi possível autenticar. Tente novamente.') };
      }

      const doBanco = await buscarUsuarioNoBanco(data.user.id);
      if (!doBanco) {
        await supabase.auth.signOut();
        return { error: new Error('Conta sem perfil cadastrado. Procure a coordenação do sistema.') };
      }

      localStorage.removeItem(CHAVE_MODO_DEMO);
      salvarCache(doBanco);
      setUsuario(doBanco);
      return { error: null };
    } catch {
      return { error: new Error('Falha na conexão com o servidor. Verifique sua internet.') };
    }
  };

  /**
   * Cadastro: NÃO envia perfil. O servidor (gatilho handle_new_user) atribui o perfil mínimo
   * (Responsável) e apenas a coordenação pode promover a conta (ver migração 20261028000001).
   */
  const signUp = async (nome: string, email: string, senha: string): Promise<ResultadoAuth> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: { data: { nome: nome.trim() } }
      });
      if (error) {
        return { error: new Error(error.message) };
      }

      if (data.session && data.user) {
        const doBanco = await buscarUsuarioNoBanco(data.user.id);
        if (doBanco) {
          localStorage.removeItem(CHAVE_MODO_DEMO);
          salvarCache(doBanco);
          setUsuario(doBanco);
        }
        return { error: null };
      }

      return {
        error: null,
        aviso:
          'Cadastro realizado. Confirme seu e-mail para entrar. Contas novas iniciam como Responsável Legal; outros perfis são atribuídos pela coordenação.'
      };
    } catch {
      return { error: new Error('Falha ao registrar usuário. Tente novamente.') };
    }
  };

  const signOut = async () => {
    saidaManual.current = true;
    limparCache();
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignora falha de rede ao deslogar
    }
    // Se o servidor não emitir o evento (sem rede), a marca não pode ficar presa
    setTimeout(() => {
      saidaManual.current = false;
    }, 2000);
    setSessaoExpirada(false);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        signIn,
        signInDemo,
        signUp,
        signOut,
        refreshUsuario: restaurarSessao,
        sessaoExpirada,
        dispensarSessaoExpirada: () => setSessaoExpirada(false)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
