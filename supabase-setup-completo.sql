-- ══════════════════════════════════════════════════════
--  IMPERIUM LUX SPA – Setup COMPLETO para un proyecto Supabase nuevo
--  Ejecuta este SQL en: Supabase > SQL Editor > New Query > Run
--  (combina supabase-setup.sql + supabase-migration-intranet.sql en el orden correcto)
-- ══════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────
-- PARTE 1: tabla base de reservas
-- ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reservas (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      TEXT NOT NULL,
  email       TEXT NOT NULL,
  telefono    TEXT,
  servicio    TEXT,
  fecha       TEXT,       -- fecha en formato legible español
  hora        TEXT,       -- ej: "10:00"
  notas       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON reservas
  FOR INSERT TO anon WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_reservas_created_at ON reservas (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservas_servicio   ON reservas (servicio);

-- ────────────────────────────────────────────────────────
-- PARTE 2: intranet — staff, horarios, y vínculo con reservas
-- ────────────────────────────────────────────────────────

-- Personal de la clínica
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

-- Horario semanal recurrente (un bloque por fila; sin filas ese día = día libre)
CREATE TABLE IF NOT EXISTS horarios_recurrentes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id     UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  dia_semana   INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=domingo ... 6=sábado
  hora_inicio  TIME NOT NULL,
  hora_fin     TIME NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  CHECK (hora_fin > hora_inicio)
);

-- Excepciones puntuales: vacaciones/permisos (no_disponible) u horario especial ese día
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

-- Vincular reservas a un profesional y a una fecha real (ISO)
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS staff_id  UUID REFERENCES staff(id);
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS fecha_iso DATE;
CREATE INDEX IF NOT EXISTS idx_reservas_staff_fecha ON reservas (staff_id, fecha_iso);

-- ────────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────────

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de staff" ON staff
  FOR SELECT USING (true);

CREATE POLICY "Staff edita su propia fila o admin edita cualquiera" ON staff
  FOR UPDATE TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin')
  );

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

-- Solo autenticados pueden leer reservas (staff ve las suyas, admin ve todas).
-- El INSERT público de la Parte 1 se mantiene intacto.
CREATE POLICY "Lectura de reservas solo autenticados" ON reservas
  FOR SELECT TO authenticated
  USING (
    staff_id IN (SELECT id FROM staff WHERE auth_user_id = auth.uid())
    OR auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin')
  );
