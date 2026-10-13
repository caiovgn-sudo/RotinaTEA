-- ============================================================
-- RotinaTEA — Migração Inicial do Esquema de Banco de Dados
-- Arquivo: supabase/migrations/20261013000001_schema_inicial.sql
-- Ambiente: Supabase (PostgreSQL)
-- Autor: Equipe RotinaTEA (Caio / Pedro) — TCC CEUNI FAMETRO
-- Conformidade: LGPD Art. 14 — Privacy by Design
-- ============================================================
-- INSTRUÇÕES:
--   1. Execute via: supabase db push  (CLI Supabase)
--   2. Ou cole no SQL Editor do Supabase Dashboard.
--   3. Esta migração é idempotente (usa IF NOT EXISTS).
-- ============================================================

-- Extensão necessária para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------
-- ENUM TYPES
-- ----------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE perfil_usuario AS ENUM ('ALUNO', 'PROFESSOR', 'COORDENACAO', 'RESPONSAVEL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE papel_vinculo AS ENUM ('DOCENTE_REGENTE', 'MEDIADOR', 'RESPONSAVEL_LEGAL', 'COORDENADOR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE status_rotina AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE nivel_suporte AS ENUM ('1', '2', '3');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------
-- TABELA: usuarios
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  senha_hash    TEXT NOT NULL,
  perfil        perfil_usuario NOT NULL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  usuarios               IS 'Usuários autenticados do sistema (professores, coordenadores, responsáveis).';
COMMENT ON COLUMN usuarios.senha_hash    IS 'Hash bcrypt da senha. Nunca armazenar senha em texto plano.';
COMMENT ON COLUMN usuarios.perfil        IS 'Perfil de acesso: define as views e ações disponíveis no frontend.';

-- ----------------------------------------------------------
-- TABELA: estudantes
-- RN02 — Anonimização obrigatória na origem (LGPD Art. 14)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS estudantes (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_anonimizado   TEXT NOT NULL UNIQUE,  -- Formato: ALN-XXXX (nunca nome real)
  turma                TEXT NOT NULL,
  nivel_suporte        SMALLINT NOT NULL CHECK (nivel_suporte IN (1, 2, 3)),
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  estudantes                    IS 'Alunos com TEA — identificados apenas por código anonimizado (RN02/LGPD).';
COMMENT ON COLUMN estudantes.codigo_anonimizado IS 'Código no formato ALN-XXXX. Nenhum dado pessoal direto é armazenado aqui.';
COMMENT ON COLUMN estudantes.nivel_suporte      IS '1=Leve, 2=Moderado, 3=Substancial (DSM-5).';

-- ----------------------------------------------------------
-- TABELA: vinculos_usuario_estudante
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS vinculos_usuario_estudante (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  estudante_id UUID NOT NULL REFERENCES estudantes(id) ON DELETE CASCADE,
  papel        papel_vinculo NOT NULL,
  data_inicio  DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (usuario_id, estudante_id, papel)
);

COMMENT ON TABLE vinculos_usuario_estudante IS 'Relacionamento entre usuários e estudantes com papel definido.';

-- ----------------------------------------------------------
-- TABELA: rotinas_visuais
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS rotinas_visuais (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudante_id UUID NOT NULL REFERENCES estudantes(id) ON DELETE CASCADE,
  data         DATE NOT NULL DEFAULT CURRENT_DATE,
  status       status_rotina NOT NULL DEFAULT 'PENDENTE',
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (estudante_id, data)
);

COMMENT ON TABLE rotinas_visuais IS 'Rotina diária visual de um estudante. Uma rotina por estudante por dia.';

-- ----------------------------------------------------------
-- TABELA: itens_rotina
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS itens_rotina (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rotina_id        UUID NOT NULL REFERENCES rotinas_visuais(id) ON DELETE CASCADE,
  titulo           TEXT NOT NULL,
  categoria        TEXT NOT NULL,
  pictograma_key   TEXT NOT NULL,  -- Chave local do pictograma ARASAAC (ADR 03)
  ordem            SMALLINT NOT NULL DEFAULT 1,
  duracao_minutos  SMALLINT NOT NULL DEFAULT 15 CHECK (duracao_minutos > 0),
  concluido        BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itens_rotina_rotina_id ON itens_rotina(rotina_id);
CREATE INDEX IF NOT EXISTS idx_itens_rotina_ordem     ON itens_rotina(rotina_id, ordem);

COMMENT ON TABLE  itens_rotina               IS 'Cartões de atividade que compõem uma rotina visual.';
COMMENT ON COLUMN itens_rotina.pictograma_key IS 'Chave do pictograma local (bundle offline ARASAAC — ADR 03).';

-- ----------------------------------------------------------
-- TABELA: registros_crise
-- RN01 — Cálculo de duração em segundos com timestamps ISO
-- RN03 — Persistência offline; sincronizado_offline rastreia origem
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS registros_crise (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudante_id         UUID NOT NULL REFERENCES estudantes(id) ON DELETE RESTRICT,
  professor_id         UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  data_hora_inicio     TIMESTAMPTZ NOT NULL,
  data_hora_fim        TIMESTAMPTZ,
  duracao_segundos     INTEGER CHECK (duracao_segundos IS NULL OR duracao_segundos >= 1),
  observacoes          TEXT,
  sincronizado_offline BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em_local      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recebido_em          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crise_estudante_id ON registros_crise(estudante_id);
CREATE INDEX IF NOT EXISTS idx_crise_data_inicio  ON registros_crise(data_hora_inicio DESC);

COMMENT ON TABLE  registros_crise                    IS 'Episódios de desregulação registrados em 1 clique pelo professor.';
COMMENT ON COLUMN registros_crise.sincronizado_offline IS 'TRUE = enviado quando online; FALSE = originado em modo offline (RN03).';
COMMENT ON COLUMN registros_crise.duracao_segundos   IS 'Calculado no cliente: (fim - inicio) / 1000 arredondado (RN01).';

-- ----------------------------------------------------------
-- TABELA: consentimentos_lgpd
-- LGPD Art. 14 — consentimento explícito dos responsáveis legais
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS consentimentos_lgpd (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudante_id   UUID NOT NULL REFERENCES estudantes(id) ON DELETE RESTRICT,
  responsavel_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  data_aceite    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_origem      INET NOT NULL,
  ativo          BOOLEAN NOT NULL DEFAULT TRUE,
  termo_versao   TEXT NOT NULL,
  revogado_em    TIMESTAMPTZ,
  UNIQUE (estudante_id, responsavel_id, termo_versao)
);

COMMENT ON TABLE  consentimentos_lgpd            IS 'Registro formal de consentimento LGPD dos responsáveis legais.';
COMMENT ON COLUMN consentimentos_lgpd.ip_origem  IS 'IP de origem no momento do aceite, para auditoria LGPD.';
COMMENT ON COLUMN consentimentos_lgpd.ativo      IS 'FALSE indica revogação formal do consentimento pelo responsável.';

-- ----------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) — Segurança em nível de linha
-- Garante que cada usuário acessa apenas dados aos quais
-- tem vínculo explícito na tabela vinculos_usuario_estudante.
-- ----------------------------------------------------------

ALTER TABLE estudantes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotinas_visuais       ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_rotina          ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_crise       ENABLE ROW LEVEL SECURITY;
ALTER TABLE consentimentos_lgpd   ENABLE ROW LEVEL SECURITY;
ALTER TABLE vinculos_usuario_estudante ENABLE ROW LEVEL SECURITY;

-- Política: usuários só acessam estudantes vinculados a eles
CREATE POLICY IF NOT EXISTS "estudantes_acesso_vinculado"
  ON estudantes FOR SELECT
  USING (
    id IN (
      SELECT estudante_id FROM vinculos_usuario_estudante
      WHERE usuario_id = auth.uid()
    )
  );

-- Política: usuários só acessam rotinas de seus estudantes
CREATE POLICY IF NOT EXISTS "rotinas_acesso_vinculado"
  ON rotinas_visuais FOR ALL
  USING (
    estudante_id IN (
      SELECT estudante_id FROM vinculos_usuario_estudante
      WHERE usuario_id = auth.uid()
    )
  );

-- Política: professores podem inserir/atualizar crises apenas de seus estudantes
CREATE POLICY IF NOT EXISTS "crises_acesso_vinculado"
  ON registros_crise FOR ALL
  USING (
    estudante_id IN (
      SELECT estudante_id FROM vinculos_usuario_estudante
      WHERE usuario_id = auth.uid()
    )
  );

-- Política: consentimentos visíveis apenas ao responsável legal do estudante
CREATE POLICY IF NOT EXISTS "consentimentos_acesso_responsavel"
  ON consentimentos_lgpd FOR ALL
  USING (
    responsavel_id = auth.uid()
    OR estudante_id IN (
      SELECT estudante_id FROM vinculos_usuario_estudante
      WHERE usuario_id = auth.uid()
        AND papel IN ('COORDENADOR', 'DOCENTE_REGENTE')
    )
  );

-- Política: usuários só enxergam seus próprios vínculos
CREATE POLICY IF NOT EXISTS "vinculos_acesso_proprio"
  ON vinculos_usuario_estudante FOR SELECT
  USING (usuario_id = auth.uid());

-- ----------------------------------------------------------
-- FUNÇÕES AUXILIARES
-- ----------------------------------------------------------

-- Atualiza automaticamente o campo atualizado_em
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica o trigger nas tabelas que têm atualizado_em
DO $$ BEGIN
  CREATE TRIGGER tr_estudantes_atualizado_em
    BEFORE UPDATE ON estudantes
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER tr_rotinas_atualizado_em
    BEFORE UPDATE ON rotinas_visuais
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER tr_itens_atualizado_em
    BEFORE UPDATE ON itens_rotina
    FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
