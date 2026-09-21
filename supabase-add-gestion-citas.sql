-- Gestión de citas por la clienta (cambiar/cancelar con un enlace) y alertas
-- para administradoras. Correr una vez en el SQL Editor de Supabase.

-- Enlace secreto de cada reserva: /cita?t=<cancel_token>
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS cancel_token UUID NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS reservas_cancel_token_idx ON reservas (cancel_token);

-- Dispositivos de administradoras que reciben alertas (nuevas reservas, errores, cancelaciones)
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS es_admin BOOLEAN NOT NULL DEFAULT false;
