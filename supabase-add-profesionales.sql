-- ══════════════════════════════════════════════════════
--  IMPERIUM – Tratamientos que realiza cada profesional
--  Ejecuta este SQL en: Supabase > SQL Editor > New Query > Run
--  Si un profesional no tiene ningún tratamiento marcado, se entiende que hace todos
--  (así nada cambia hasta que los asignes desde Admin > Equipo).
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS staff_servicios (
  staff_id    UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, servicio_id)
);

ALTER TABLE staff_servicios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica staff_servicios" ON staff_servicios;
CREATE POLICY "Lectura publica staff_servicios" ON staff_servicios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Solo admin gestiona staff_servicios" ON staff_servicios;
CREATE POLICY "Solo admin gestiona staff_servicios" ON staff_servicios
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'));
