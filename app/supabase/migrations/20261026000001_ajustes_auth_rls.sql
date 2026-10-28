-- ============================================================
-- RotinaTEA — Migração de Ajustes de Autenticação e RLS
-- Arquivo: supabase/migrations/20261026000001_ajustes_auth_rls.sql
-- Ambiente: Supabase (PostgreSQL)
-- Objetivo:
--   1. Tornar senha_hash opcional na tabela usuarios (gerenciada por auth.users)
--   2. Adicionar políticas RLS para INSERT/SELECT/UPDATE em usuarios
--   3. Trigger opcional para sincronizar auth.users com public.usuarios
-- ============================================================

-- 1. Torna senha_hash opcional (Supabase Auth armazena o hash internamente)
ALTER TABLE usuarios ALTER COLUMN senha_hash DROP NOT NULL;

-- 2. Habilita RLS na tabela usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS para usuarios
DROP POLICY IF EXISTS "usuarios_select_proprio" ON usuarios;
CREATE POLICY "usuarios_select_proprio"
  ON usuarios FOR SELECT
  USING (
    id = auth.uid()
    OR id IN (
      SELECT usuario_id FROM vinculos_usuario_estudante
      WHERE estudante_id IN (
        SELECT estudante_id FROM vinculos_usuario_estudante WHERE usuario_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "usuarios_insert_proprio" ON usuarios;
CREATE POLICY "usuarios_insert_proprio"
  ON usuarios FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "usuarios_update_proprio" ON usuarios;
CREATE POLICY "usuarios_update_proprio"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id);

-- 4. Função Trigger para inserção automática ao criar usuário via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'perfil')::perfil_usuario, 'PROFESSOR'::perfil_usuario)
  )
  ON CONFLICT (id) DO UPDATE
  SET nome = EXCLUDED.nome,
      email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparada na tabela interna auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
