-- ══════════════════════════════════════════════════════
--  IMPERIUM LUX SPA – Migración: Intranet + horarios por profesional
--  Ejecuta este SQL en: Supabase > SQL Editor > New Query
--  (requiere haber corrido antes supabase-setup.sql)
-- ══════════════════════════════════════════════════════

-- 1. Personal de la clínica
CREATE TABLE IF NOT EXISTS staff (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id  UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  nombre        TEXT NOT NULL,
  especialidad  TEXT,
  foto_url      TEXT,
  rol           TEXT NOT NULL DEFAULT 'profesional' CHECK (rol IN ('admin','profesional')),
  activo        BOOLEAN NOT NULL DEFAULT true,
  orden         INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Horario semanal recurrente (un bloque por fila; sin filas ese día = día libre)
CREATE TABLE IF NOT EXISTS horarios_recurrentes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id     UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  dia_semana   INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=domingo ... 6=sábado
  hora_inicio  TIME NOT NULL,
  hora_fin     TIME NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  CHECK (hora_fin > hora_inicio)
);

-- 3. Excepciones puntuales: vacaciones/permisos (no_disponible) u horario especial ese día
CREATE TABLE IF NOT EXISTS horarios_excepciones (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id     UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  fecha        DATE NOT NULL,
  tipo         TEXT NOT NULL CHECK (tipo IN ('no_disponible','horario_especial')),
  hora_inicio  TIME,
  hora_fin     TIME,
  motivo       TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (staff_id, fecha)
);

-- 4. Vincular reservas a un profesional y a una fecha real (ISO)
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS staff_id  UUID REFERENCES staff(id);
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS fecha_iso DATE;
CREATE INDEX IF NOT EXISTS idx_reservas_staff_fecha ON reservas (staff_id, fecha_iso);

-- ══════════════════════════════════════════════════════
--  RLS
-- ══════════════════════════════════════════════════════

-- staff: lectura pública (se necesita para el picker de profesionales en el sitio),
-- escritura solo del propio usuario autenticado o de un admin.
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de staff" ON staff
  FOR SELECT USING (true);

CREATE POLICY "Staff edita su propia fila o admin edita cualquiera" ON staff
  FOR UPDATE TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin')
  );

-- horarios_recurrentes: lectura pública (para calcular disponibilidad en /reservar),
-- escritura solo del profesional dueño del horario o de un admin.
ALTER TABLE horarios_recurrentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica horarios recurrentes" ON horarios_recurrentes
  FOR SELECT USING (true);

CREATE POLICY "Staff administra su horario recurrente" ON horarios_recurrentes
  FOR ALL TO authenticated
  USING (
    staff_id IN (SELECT id FROM staff WHERE auth_user_id = auth.uid())
    OR auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin')
  )
  WITH CHECK (
    staff_id IN (SELECT id FROM staff WHERE auth_user_id = auth.uid())
    OR auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin')
  );

-- horarios_excepciones: mismo patrón
ALTER TABLE horarios_excepciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica excepciones" ON horarios_excepciones
  FOR SELECT USING (true);

CREATE POLICY "Staff administra sus excepciones" ON horarios_excepciones
  FOR ALL TO authenticated
  USING (
    staff_id IN (SELECT id FROM staff WHERE auth_user_id = auth.uid())
    OR auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin')
  )
  WITH CHECK (
    staff_id IN (SELECT id FROM staff WHERE auth_user_id = auth.uid())
    OR auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin')
  );

-- reservas: cerrar la lectura pública (antes cualquiera con la anon key podía leer
-- nombre/email/teléfono de todos los clientes). Ahora solo autenticados, y cada
-- profesional solo ve las suyas; el rol admin ve todas. El INSERT público se mantiene
-- intacto para que el formulario de reserva siga funcionando sin login.
DROP POLICY IF EXISTS "Allow anon read" ON reservas;

CREATE POLICY "Lectura de reservas solo autenticados" ON reservas
  FOR SELECT TO authenticated
  USING (
    staff_id IN (SELECT id FROM staff WHERE auth_user_id = auth.uid())
    OR auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin')
  );
