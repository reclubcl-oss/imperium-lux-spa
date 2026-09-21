-- ══════════════════════════════════════════════════════
--  IMPERIUM LUX SPA – Tratamientos con foto + gestión en /admin
--  Ejecuta este SQL en: Supabase > SQL Editor > New Query > Run
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS servicios (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      TEXT NOT NULL,
  categoria   TEXT,
  descripcion TEXT,
  foto_url    TEXT,
  activo      BOOLEAN NOT NULL DEFAULT true,
  orden       INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de servicios" ON servicios FOR SELECT USING (true);

CREATE POLICY "Solo admin gestiona servicios" ON servicios
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'));

-- Bucket de Storage para las fotos (público para lectura, solo admin escribe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('servicios', 'servicios', true, 5242880, ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Lectura publica bucket servicios" ON storage.objects
  FOR SELECT USING (bucket_id = 'servicios');

CREATE POLICY "Admin sube fotos de servicios" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'servicios' AND auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'));

CREATE POLICY "Admin reemplaza fotos de servicios" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'servicios' AND auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'));

-- Semilla: los 24 tratamientos ya existentes en el sitio, sin foto (el admin las sube después)
INSERT INTO servicios (nombre, categoria, orden) VALUES
  ('Hidratación Profunda', 'Tratamientos Faciales', 1),
  ('Peeling Químico', 'Tratamientos Faciales', 2),
  ('Radiofrecuencia Facial', 'Tratamientos Faciales', 3),
  ('Mesoterapia', 'Tratamientos Faciales', 4),
  ('Bótox & Rellenos', 'Medicina Estética', 5),
  ('Plasma Rico en Plaquetas', 'Medicina Estética', 6),
  ('Hilos Tensores', 'Medicina Estética', 7),
  ('Bioestimuladores', 'Medicina Estética', 8),
  ('Reducción de Medidas', 'Tratamientos Corporales', 9),
  ('Drenaje Linfático', 'Tratamientos Corporales', 10),
  ('Cavitación', 'Tratamientos Corporales', 11),
  ('Presoterapia', 'Tratamientos Corporales', 12),
  ('Láser Depilación', 'Tecnología Avanzada', 13),
  ('Ultrasonido Focalizado', 'Tecnología Avanzada', 14),
  ('Luz Pulsada IPL', 'Tecnología Avanzada', 15),
  ('Criolipólisis', 'Tecnología Avanzada', 16),
  ('Masajes Terapéuticos', 'Relajación & Spa', 17),
  ('Ritual de Oro', 'Relajación & Spa', 18),
  ('Aromaterapia', 'Relajación & Spa', 19),
  ('Envoltura Corporal', 'Relajación & Spa', 20),
  ('Diseño de Cejas', 'Zona Ocular & Labios', 21),
  ('Pestañas', 'Zona Ocular & Labios', 22),
  ('Perfilado de Labios', 'Zona Ocular & Labios', 23),
  ('Contorno de Ojos', 'Zona Ocular & Labios', 24);
