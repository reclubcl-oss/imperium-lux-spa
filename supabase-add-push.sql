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
