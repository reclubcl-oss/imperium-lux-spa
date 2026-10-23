-- ══════════════════════════════════════════════════════
--  IMPERIUM LUX SPA – Sistema de fidelidad
--  Ejecuta este SQL en: Supabase > SQL Editor > New Query > Run
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS configuracion (
  clave TEXT PRIMARY KEY,
  valor TEXT
);

INSERT INTO configuracion (clave, valor) VALUES ('visitas_para_premio', '5')
ON CONFLICT (clave) DO NOTHING;

ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de configuracion" ON configuracion FOR SELECT USING (true);

CREATE POLICY "Solo admin edita configuracion" ON configuracion
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'));
