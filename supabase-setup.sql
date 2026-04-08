-- ══════════════════════════════════════════════════════
--  IMPERIUM LUX SPA – Setup Supabase
--  Ejecuta este SQL en: Supabase > SQL Editor > New Query
-- ══════════════════════════════════════════════════════

-- 1. Crear tabla de reservas
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

-- 2. Habilitar Row Level Security
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- 3. Política: cualquiera puede insertar (el formulario público)
CREATE POLICY "Allow public insert" ON reservas
  FOR INSERT TO anon WITH CHECK (true);

-- 4. Política: solo autenticados pueden leer (el admin usa anon key por ahora)
--    Para un proyecto simple con anon key en el admin, permitimos lectura anon:
CREATE POLICY "Allow anon read" ON reservas
  FOR SELECT TO anon USING (true);

-- 5. Índices para mejorar rendimiento en filtros
CREATE INDEX IF NOT EXISTS idx_reservas_created_at ON reservas (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservas_servicio   ON reservas (servicio);
