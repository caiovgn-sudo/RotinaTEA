import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[RotinaTEA] Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não estão configuradas. ' +
    'Copie o arquivo .env.example para .env e preencha com as credenciais do projeto Supabase.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persistência de sessão via localStorage (compatível com PWA offline-first)
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    // Desabilitado por padrão — habilitado apenas quando online (RN03)
    params: { eventsPerSecond: 2 }
  }
});

/**
 * Verifica conectividade com o Supabase.
 * Retorna true se a resposta for bem-sucedida, false em caso de erro de rede.
 */
export async function verificarConectividadeSupabase(): Promise<boolean> {
  try {
    const { error } = await supabase.from('estudantes').select('id').limit(1);
    // PGRST116 = nenhuma linha retornada (ok, tabela existe)
    // 42501 = permissão negada por RLS (ok, banco online — usuário não autenticado)
    if (error && error.code !== 'PGRST116' && error.code !== '42501') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
