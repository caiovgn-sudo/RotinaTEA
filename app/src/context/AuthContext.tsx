import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { Usuario, PerfilUsuario } from '../types';

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<{ error: Error | null }>;
  signUp: (nome: string, email: string, senha: string, perfil: PerfilUsuario) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const buscarUsuarioNoBanco = async (userId: string): Promise<Usuario | null> => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, perfil')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.warn('[Auth] Usuário não encontrado na tabela usuarios:', error?.message);
        return null;
      }

      return {
        id: data.id,
        nome: data.nome,
        email: data.email,
        perfil: data.perfil as PerfilUsuario
      };
    } catch (err) {
      console.error('[Auth] Erro ao buscar usuário:', err);
      return null;
    }
  };

  const refreshUsuario = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const usuarioCompleto = await buscarUsuarioNoBanco(session.user.id);
      setUsuario(usuarioCompleto);
    } else {
      setUsuario(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Verifica sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        buscarUsuarioNoBanco(session.user.id).then(u => {
          setUsuario(u);
        });
      }
      setLoading(false);
    });

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const usuarioCompleto = await buscarUsuarioNoBanco(session.user.id);
        setUsuario(usuarioCompleto);
      } else {
        setUsuario(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, senha: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (nome: string, email: string, senha: string, perfil: PerfilUsuario) => {
    const { data, error } = await supabase.auth.signUp({ email, password: senha });
    
    if (error) {
      return { error: new Error(error.message) };
    }

    if (data.user) {
      // Cria registro na tabela usuarios
      const { error: dbError } = await supabase
        .from('usuarios')
        .insert({
          id: data.user.id,
          nome,
          email,
          perfil
        });

      if (dbError) {
        console.error('[Auth] Erro ao criar perfil do usuário:', dbError);
        // Tenta fazer cleanup do auth user se falhar
        await supabase.auth.admin.deleteUser(data.user.id);
        return { error: new Error('Erro ao criar perfil. Tente novamente.') };
      }

      const novoUsuario: Usuario = {
        id: data.user.id,
        nome,
        email,
        perfil
      };
      setUsuario(novoUsuario);
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, signIn, signUp, signOut, refreshUsuario }}>
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