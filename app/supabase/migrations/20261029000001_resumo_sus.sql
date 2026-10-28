-- =====================================================================
-- RotinaTEA — Resumo agregado do SUS para a Coordenação (Pilar 3: Governança / LGPD)
-- Problema: a política "sus_select_proprio" deixa cada avaliador ler só as próprias respostas,
-- então ninguém consegue ver a média da avaliação de usabilidade do TCC.
-- Solução: uma função que devolve SÓ agregados (total, média, mínimo, máximo, acima da meta
-- e média por item). Nenhuma resposta individual sai do banco, e a média por item só é
-- calculada com 3 ou mais avaliações, para não expor a resposta de uma única pessoa.
-- Depende de perfil_usuario_atual() (20261028000002) e da tabela respostas_sus (20261028000003).
-- =====================================================================

CREATE OR REPLACE FUNCTION public.resumo_sus()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
  v_resultado jsonb;
  v_itens jsonb;
BEGIN
  IF public.perfil_usuario_atual() IS DISTINCT FROM 'COORDENACAO'::perfil_usuario THEN
    RAISE EXCEPTION 'O resumo do SUS é restrito à coordenação.' USING ERRCODE = '42501';
  END IF;

  SELECT COUNT(*) INTO v_total FROM respostas_sus;

  SELECT jsonb_build_object(
    'total', COUNT(*),
    'media', COALESCE(ROUND(AVG(pontuacao), 1), 0),
    'minimo', COALESCE(MIN(pontuacao), 0),
    'maximo', COALESCE(MAX(pontuacao), 0),
    'acima_meta', COUNT(*) FILTER (WHERE pontuacao >= 68)
  ) INTO v_resultado
  FROM respostas_sus;

  IF v_total >= 3 THEN
    SELECT jsonb_agg(ROUND(media, 2) ORDER BY item) INTO v_itens
    FROM (
      SELECT i AS item, AVG(respostas[i]) AS media
      FROM respostas_sus, generate_series(1, 10) AS i
      GROUP BY i
    ) t;
  ELSE
    v_itens := NULL;
  END IF;

  RETURN v_resultado || jsonb_build_object('media_por_item', v_itens);
END;
$$;

REVOKE ALL ON FUNCTION public.resumo_sus() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resumo_sus() TO authenticated;

COMMENT ON FUNCTION public.resumo_sus() IS 'Agregados do SUS para a coordenação; sem respostas individuais e sem média por item com menos de 3 avaliações.';
