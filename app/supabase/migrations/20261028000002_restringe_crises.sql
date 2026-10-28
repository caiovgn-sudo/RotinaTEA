-- =====================================================================
-- RotinaTEA — Restrição da gravação de crises por perfil (Pilar 3: Governança / Segurança)
-- Problema: a política "crises_acesso_vinculado" (FOR ALL) exigia apenas vínculo com o
-- estudante. Qualquer perfil vinculado (inclusive RESPONSAVEL) podia inserir, alterar ou
-- excluir crises, e o professor_id gravado não era conferido.
-- Solução: leitura para vinculados; escrita apenas por PROFESSOR/COORDENACAO vinculados,
-- com autoria igual ao usuário autenticado; exclusão só de crise encerrada (RN01).
-- =====================================================================

-- 1. Funções auxiliares (SECURITY DEFINER: não dependem das políticas de `usuarios`)
CREATE OR REPLACE FUNCTION public.perfil_usuario_atual()
RETURNS perfil_usuario
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT perfil FROM public.usuarios WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.tem_vinculo_estudante(p_estudante_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.vinculos_usuario_estudante
    WHERE usuario_id = auth.uid() AND estudante_id = p_estudante_id
  );
$$;

REVOKE ALL ON FUNCTION public.perfil_usuario_atual() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.tem_vinculo_estudante(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.perfil_usuario_atual() TO authenticated;
GRANT EXECUTE ON FUNCTION public.tem_vinculo_estudante(UUID) TO authenticated;

-- 2. Substitui a política genérica por políticas por operação
DROP POLICY IF EXISTS "crises_acesso_vinculado" ON registros_crise;
DROP POLICY IF EXISTS "crises_select_vinculado" ON registros_crise;
DROP POLICY IF EXISTS "crises_insert_educador" ON registros_crise;
DROP POLICY IF EXISTS "crises_update_autor" ON registros_crise;
DROP POLICY IF EXISTS "crises_delete_encerrada" ON registros_crise;

-- Leitura: qualquer usuário vinculado ao estudante (inclui o responsável, para o PEI)
CREATE POLICY "crises_select_vinculado"
  ON registros_crise FOR SELECT
  TO authenticated
  USING (public.tem_vinculo_estudante(estudante_id));

-- Inserção: apenas PROFESSOR/COORDENACAO vinculados, registrando em seu próprio nome
CREATE POLICY "crises_insert_educador"
  ON registros_crise FOR INSERT
  TO authenticated
  WITH CHECK (
    public.perfil_usuario_atual() IN ('PROFESSOR', 'COORDENACAO')
    AND public.tem_vinculo_estudante(estudante_id)
    AND professor_id = auth.uid()
  );

-- Atualização (encerrar a crise, observações, reenvio idempotente da fila):
-- somente o autor, ainda com perfil de educador e vínculo ativo
CREATE POLICY "crises_update_autor"
  ON registros_crise FOR UPDATE
  TO authenticated
  USING (
    professor_id = auth.uid()
    AND public.perfil_usuario_atual() IN ('PROFESSOR', 'COORDENACAO')
    AND public.tem_vinculo_estudante(estudante_id)
  )
  WITH CHECK (
    professor_id = auth.uid()
    AND public.tem_vinculo_estudante(estudante_id)
  );

-- Exclusão: autor ou coordenação vinculada, e nunca de crise em andamento (RN01)
CREATE POLICY "crises_delete_encerrada"
  ON registros_crise FOR DELETE
  TO authenticated
  USING (
    data_hora_fim IS NOT NULL
    AND public.tem_vinculo_estudante(estudante_id)
    AND (
      (professor_id = auth.uid() AND public.perfil_usuario_atual() = 'PROFESSOR')
      OR public.perfil_usuario_atual() = 'COORDENACAO'
    )
  );

-- 3. Verificação manual (SQL Editor, como administrador):
--    SELECT policyname, cmd FROM pg_policies WHERE tablename = 'registros_crise';
