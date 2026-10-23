-- ══════════════════════════════════════════════════════
--  IMPERIUM LUX SPA – Landing de enlaces ("link in bio") para Instagram
--  Ejecuta este SQL en: Supabase > SQL Editor > New Query > Run
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS enlaces (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo      TEXT NOT NULL,
  url         TEXT NOT NULL,
  icono       TEXT,               -- un emoji, ej. '📅' (opcional)
  activo      BOOLEAN NOT NULL DEFAULT true,
  orden       INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE enlaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de enlaces" ON enlaces FOR SELECT USING (true);

CREATE POLICY "Solo admin gestiona enlaces" ON enlaces
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'));

-- Semilla: 5 links iniciales — el admin puede agregar, editar, borrar y
-- reordenar libremente desde /admin → Enlaces.
INSERT INTO enlaces (titulo, url, icono, orden) VALUES
  ('Reservar hora',        '/reservar',    '📅', 1),
  ('Ver tratamientos',     '/#servicios',  '✨', 2),
  ('Club de Fidelidad',    '/fidelidad',   '🎁', 3),
  ('Cómo llegar',          'https://www.google.com/maps/place/2+Ote.+124,+2520784+Vi%C3%B1a+del+Mar,+Valpara%C3%ADso', '📍', 4),
  ('Instagram',            'https://www.instagram.com/clinica.estetica.imperium', '📷', 5);
