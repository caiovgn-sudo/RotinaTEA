-- =====================================================================
-- RotinaTEA — Dados de exemplo no banco remoto (Pilar 1: Engenharia)
-- Problema: o IndexedDB nasce com 2 estudantes, 1 rotina e 6 cartões de exemplo, mas esses
-- registros não existem no Supabase. O envio da fila (crises, cartões) então falhava nas chaves
-- estrangeiras (estudante_id e rotina_id inexistentes) e os itens chegavam ao estado ERRO.
-- Solução: criar no servidor os MESMOS identificadores do exemplo local (idempotente) e uma
-- função administrativa para vincular uma conta real aos estudantes de exemplo.
-- Os dados são fictícios e anonimizados (RN02): só código, turma e nível de suporte.
-- =====================================================================

INSERT INTO estudantes (id, codigo_anonimizado, turma, nivel_suporte) VALUES
  ('e0000001-0000-4000-a000-000000000001', 'ALN-8921', '3º Ano B - Manhã', 1),
  ('e0000002-0000-4000-a000-000000000002', 'ALN-4412', '2º Ano A - Tarde', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rotinas_visuais (id, estudante_id, data, status) VALUES
  ('b0000001-0000-4000-a000-000000000001', 'e0000001-0000-4000-a000-000000000001', CURRENT_DATE, 'EM_ANDAMENTO')
ON CONFLICT (id) DO NOTHING;

INSERT INTO itens_rotina (id, rotina_id, titulo, categoria, pictograma_key, ordem, duracao_minutos, concluido) VALUES
  ('c0000001-0000-4000-a000-000000000001', 'b0000001-0000-4000-a000-000000000001', 'Entrada e Acolhimento', 'Transição', 'acolhimento', 1, 15, TRUE),
  ('c0000001-0000-4000-a000-000000000002', 'b0000001-0000-4000-a000-000000000001', 'Roda de Conversa', 'Interação', 'roda_conversa', 2, 20, TRUE),
  ('c0000001-0000-4000-a000-000000000003', 'b0000001-0000-4000-a000-000000000001', 'Atividade no Caderno', 'Pedagógico', 'atividade_mesa', 3, 30, FALSE),
  ('c0000001-0000-4000-a000-000000000004', 'b0000001-0000-4000-a000-000000000001', 'Lavar Mãos e Lanche', 'Alimentação', 'lanche', 4, 25, FALSE),
  ('c0000001-0000-4000-a000-000000000005', 'b0000001-0000-4000-a000-000000000001', 'Parque / Recreio', 'Lazer', 'parque', 5, 30, FALSE),
  ('c0000001-0000-4000-a000-000000000006', 'b0000001-0000-4000-a000-000000000001', 'Guardar Mochila e Saída', 'Transição', 'saida', 6, 15, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Função administrativa: vincula uma conta real aos estudantes de exemplo, com o papel
-- que corresponde ao perfil da conta. Só quem tem acesso ao banco (SQL Editor) executa;
-- nenhum usuário da aplicação consegue chamá-la.
--   select public.vincular_conta_aos_exemplos('professor@escola.edu.br');
CREATE OR REPLACE FUNCTION public.vincular_conta_aos_exemplos(p_email TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_perfil perfil_usuario;
  v_papel papel_vinculo;
  v_linhas INTEGER;
BEGIN
  SELECT id, perfil INTO v_id, v_perfil FROM usuarios WHERE lower(email) = lower(p_email);
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Conta não encontrada: %. Crie a conta no aplicativo antes de vincular.', p_email;
  END IF;

  v_papel := CASE v_perfil
    WHEN 'PROFESSOR'   THEN 'DOCENTE_REGENTE'::papel_vinculo
    WHEN 'COORDENACAO' THEN 'COORDENADOR'::papel_vinculo
    WHEN 'RESPONSAVEL' THEN 'RESPONSAVEL_LEGAL'::papel_vinculo
    ELSE NULL
  END;
  IF v_papel IS NULL THEN
    RAISE EXCEPTION 'O perfil % não tem papel de vínculo definido.', v_perfil;
  END IF;

  INSERT INTO vinculos_usuario_estudante (usuario_id, estudante_id, papel)
  SELECT v_id, e.id, v_papel
  FROM estudantes e
  WHERE e.id IN ('e0000001-0000-4000-a000-000000000001', 'e0000002-0000-4000-a000-000000000002')
  ON CONFLICT (usuario_id, estudante_id, papel) DO NOTHING;

  GET DIAGNOSTICS v_linhas = ROW_COUNT;
  RETURN v_linhas;
END;
$$;

REVOKE ALL ON FUNCTION public.vincular_conta_aos_exemplos(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.vincular_conta_aos_exemplos(TEXT) FROM anon, authenticated;
