-- =====================================================================
-- RotinaTEA — Respostas do questionário SUS (Pilar 2: Qualidade / Pilar 3: Governança)
-- O SUS mede a usabilidade percebida do sistema e é um dado do TCC, não do aluno:
-- a tabela não tem ligação com estudantes e não guarda nome do avaliador.
-- Regras: cada avaliador grava e lê apenas as próprias respostas; só COORDENACAO avalia
-- (espelha o botão do aplicativo); a resposta é imutável (sem UPDATE e sem DELETE).
-- Depende das funções criadas em 20261028000002_restringe_crises.sql.
-- =====================================================================

CREATE TABLE IF NOT EXISTS respostas_sus (
  id                UUID PRIMARY KEY,
  avaliador_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  perfil_avaliador  perfil_usuario NOT NULL,
  respostas         SMALLINT[] NOT NULL,
  pontuacao         NUMERIC(4,1) NOT NULL,
  versao_instrumento TEXT NOT NULL,
  criado_em_local   TIMESTAMPTZ NOT NULL,
  recebido_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT respostas_sus_dez_itens CHECK (
    array_length(respostas, 1) = 10
    AND respostas <@ ARRAY[1,2,3,4,5]::SMALLINT[]
  ),
  CONSTRAINT respostas_sus_pontuacao CHECK (pontuacao BETWEEN 0 AND 100)
);

COMMENT ON TABLE  respostas_sus           IS 'Respostas ao System Usability Scale (10 itens, 1 a 5) dadas pelos avaliadores do sistema.';
COMMENT ON COLUMN respostas_sus.respostas IS 'Respostas na ordem das 10 perguntas; itens ímpares são positivos e pares são negativos.';
COMMENT ON COLUMN respostas_sus.pontuacao IS 'Pontuação SUS de 0 a 100, calculada pelo aplicativo (soma x 2,5).';

ALTER TABLE respostas_sus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sus_insert_proprio" ON respostas_sus;
CREATE POLICY "sus_insert_proprio"
  ON respostas_sus FOR INSERT TO authenticated
  WITH CHECK (
    avaliador_id = auth.uid()
    AND perfil_usuario_atual() = 'COORDENACAO'
    AND perfil_avaliador = perfil_usuario_atual()
  );

DROP POLICY IF EXISTS "sus_select_proprio" ON respostas_sus;
CREATE POLICY "sus_select_proprio"
  ON respostas_sus FOR SELECT TO authenticated
  USING (avaliador_id = auth.uid());
