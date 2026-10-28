-- =====================================================================
-- RotinaTEA — Endurecimento de perfis (Pilar 3: Governança / Segurança)
-- Problema: o perfil de acesso vinha dos metadados do cadastro e a política de
-- UPDATE permitia o próprio usuário alterar seu perfil (escalonamento de privilégio).
-- Solução: perfil fixo no servidor + bloqueio de alteração por usuários comuns.
-- =====================================================================

-- 1. Gatilho de novo usuário: perfil SEMPRE 'RESPONSAVEL' (menor privilégio)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, perfil)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'nome', ''), split_part(NEW.email, '@', 1)),
    NEW.email,
    'RESPONSAVEL'::perfil_usuario
  )
  ON CONFLICT (id) DO UPDATE
  SET nome = EXCLUDED.nome,
      email = EXCLUDED.email;   -- o perfil NÃO é alterado em conflito
  RETURN NEW;
END;
$$;

-- 2. O cliente não insere em `usuarios` (somente o gatilho SECURITY DEFINER)
DROP POLICY IF EXISTS "usuarios_insert_proprio" ON usuarios;

-- 3. UPDATE apenas na própria linha
DROP POLICY IF EXISTS "usuarios_update_proprio" ON usuarios;
CREATE POLICY "usuarios_update_proprio"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Bloqueia qualquer mudança de perfil feita por usuários da aplicação
CREATE OR REPLACE FUNCTION public.proteger_perfil_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.perfil IS DISTINCT FROM OLD.perfil
     AND COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND current_user NOT IN ('postgres', 'supabase_admin', 'service_role') THEN
    RAISE EXCEPTION 'A alteração de perfil só pode ser feita pela coordenação do sistema.'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_proteger_perfil_usuario ON public.usuarios;
CREATE TRIGGER trg_proteger_perfil_usuario
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION public.proteger_perfil_usuario();

-- 5. Promoção manual de perfil (executar no SQL Editor do Supabase, como administrador):
--    UPDATE public.usuarios SET perfil = 'PROFESSOR' WHERE email = 'professor@escola.edu.br';
