-- ══════════════════════════════════════════════════════
--  IMPERIUM LUX SPA – Calendario + Finanzas
--  Ejecuta este SQL en: Supabase > SQL Editor > New Query > Run
-- ══════════════════════════════════════════════════════

-- Precio de cada reserva (lo define el admin al confirmar/editar)
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS precio NUMERIC;

-- El admin puede editar reservas (antes solo existía política de lectura)
CREATE POLICY "Admin edita reservas" ON reservas
  FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'));

-- Gastos (módulo de finanzas)
CREATE TABLE IF NOT EXISTS gastos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha       DATE NOT NULL,
  descripcion TEXT NOT NULL,
  categoria   TEXT,
  monto       NUMERIC NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo admin gestiona gastos" ON gastos
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'));
