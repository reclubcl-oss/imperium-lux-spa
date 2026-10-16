-- ══════════════════════════════════════════════════════════════════
--  IMPERIUM — RECONSTRUCCIÓN COMPLETA DE LA BASE (proyecto Supabase nuevo)
--  Pegar TODO en SQL Editor > New query > Run. Solo para un proyecto VACÍO.
--  Orden: base, equipo, tratamientos, precios, fidelidad, finanzas, anti-doble-reserva,
--  enlaces, notificaciones, recordatorios, promos y gestión de citas.
-- ══════════════════════════════════════════════════════════════════

-- ───────────── supabase-setup-completo.sql ─────────────
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

-- ───────────── supabase-add-staff-email.sql ─────────────
-- Agrega el email de contacto de cada profesional (para notificarle cuando le agendan)
ALTER TABLE staff ADD COLUMN IF NOT EXISTS email TEXT;

-- ───────────── supabase-add-servicios.sql ─────────────
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

-- ───────────── supabase-add-precio-servicios.sql ─────────────
-- ══════════════════════════════════════════════════════
--  IMPERIUM LUX SPA – Precio por tratamiento
--  Ejecuta este SQL en: Supabase > SQL Editor > New Query > Run
-- ══════════════════════════════════════════════════════
--
-- Antes el precio solo se podía poner reserva por reserva (pestaña Reservas
-- del admin). Ahora cada tratamiento tiene su propio precio de referencia:
-- se edita una vez en Servicios y de ahí en adelante se autocompleta en cada
-- reserva nueva (pestaña Finanzas) — igual se puede cambiar reserva por
-- reserva si un caso puntual fue distinto.
--
-- Nullable a propósito: un tratamiento puede quedar sin precio fijo (por
-- ejemplo, uno que se cotiza en la evaluación) y simplemente no se muestra
-- precio para ese caso, ni en el sitio ni al reservar.

ALTER TABLE servicios ADD COLUMN IF NOT EXISTS precio INTEGER;

-- ───────────── supabase-add-fidelidad.sql ─────────────
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

-- ───────────── supabase-add-finance.sql ─────────────
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

-- ───────────── supabase-add-unique-booking.sql ─────────────
-- ══════════════════════════════════════════════════════
--  IMPERIUM LUX SPA – Evita reservas duplicadas (doble-booking)
--  Ejecuta este SQL en: Supabase > SQL Editor > New Query > Run
-- ══════════════════════════════════════════════════════
--
-- Hoy nada impide que dos personas reserven el mismo profesional, mismo día
-- y misma hora si completan el formulario al mismo tiempo (la validación de
-- "¿está disponible?" se hace justo antes de guardar, pero entre esa
-- verificación y el guardado real hay una pequeña ventana de tiempo).
--
-- Este índice único a nivel de base de datos cierra esa ventana: si dos
-- reservas llegan casi simultáneas para el mismo profesional/fecha/hora, la
-- segunda falla al guardar en vez de crear un doble-booking silencioso — y
-- el sitio ya está preparado (api/create-reservation.js) para mostrarle a
-- esa persona "ese horario ya no está disponible" en vez de un error genérico.
--
-- No aplica a reservas sin profesional asignado (staff_id NULL) — no debería
-- haber ninguna en el flujo normal, pero por si acaso no las bloquea.

CREATE UNIQUE INDEX IF NOT EXISTS reservas_staff_fecha_hora_unica
  ON reservas (staff_id, fecha_iso, hora)
  WHERE staff_id IS NOT NULL AND fecha_iso IS NOT NULL;

-- ───────────── supabase-add-enlaces.sql ─────────────
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

-- ───────────── supabase-add-push.sql ─────────────
-- Suscripciones a notificaciones push (app instalada en iPhone / Android / escritorio).
-- Las escrituras las hace SOLO el servidor (api/push-subscribe.js y api/push-send.js
-- con la service role key), así que no hay políticas de INSERT/UPDATE/DELETE
-- públicas. El admin puede leer la tabla para ver cuántas personas hay suscritas.

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  user_agent  TEXT,
  email       TEXT,       -- se llena al activar el recordatorio desde una reserva
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin ve suscripciones push" ON push_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT auth_user_id FROM staff WHERE rol = 'admin'));

-- ───────────── supabase-add-recordatorios.sql ─────────────
-- Recordatorios de cita: marca qué reservas ya recibieron su aviso (para no
-- enviarlo dos veces) y vincula cada dispositivo con push al correo de la
-- clienta (para saber a qué teléfono avisarle).
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS recordatorio_enviado_at TIMESTAMPTZ;

-- Requiere haber corrido antes supabase-add-push.sql
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_email ON push_subscriptions (lower(email));

-- ───────────── supabase-add-promos.sql ─────────────
-- Consentimiento para recibir promociones por correo. Solo se envían correos
-- promocionales a quienes marcaron la casilla al reservar (queda en false por
-- defecto) y se pueden dar de baja con el enlace de cada correo.
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS acepta_promos BOOLEAN NOT NULL DEFAULT false;

-- ───────────── supabase-add-gestion-citas.sql ─────────────
-- Gestión de citas por la clienta (cambiar/cancelar con un enlace) y alertas
-- para administradoras. Correr una vez en el SQL Editor de Supabase.

-- Enlace secreto de cada reserva: /cita?t=<cancel_token>
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS cancel_token UUID NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS reservas_cancel_token_idx ON reservas (cancel_token);

-- Dispositivos de administradoras que reciben alertas (nuevas reservas, errores, cancelaciones)
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS es_admin BOOLEAN NOT NULL DEFAULT false;

-- ───────────── supabase-add-sitio.sql ─────────────
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
