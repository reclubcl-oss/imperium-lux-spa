-- Recordatorios de cita: marca qué reservas ya recibieron su aviso (para no
-- enviarlo dos veces) y vincula cada dispositivo con push al correo de la
-- clienta (para saber a qué teléfono avisarle).
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS recordatorio_enviado_at TIMESTAMPTZ;

-- Requiere haber corrido antes supabase-add-push.sql
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_email ON push_subscriptions (lower(email));
