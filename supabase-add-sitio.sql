-- ══════════════════════════════════════════════════════
--  IMPERIUM – Editor del sitio web (admin → SITIO WEB)
--  Ejecuta este SQL en: Supabase > SQL Editor > New Query > Run
--  Es seguro correrlo más de una vez.
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sitio_contenido (
  clave       TEXT PRIMARY KEY,
  valor       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sitio_contenido ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica del contenido del sitio" ON sitio_contenido;
CREATE POLICY "Lectura publica del contenido del sitio" ON sitio_contenido FOR SELECT USING (true);

DROP POLICY IF EXISTS "Solo admin edita el contenido del sitio" ON sitio_contenido;
CREATE POLICY "Solo admin edita el contenido del sitio" ON sitio_contenido
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'));
