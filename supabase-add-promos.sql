-- Consentimiento para recibir promociones por correo. Solo se envían correos
-- promocionales a quienes marcaron la casilla al reservar (queda en false por
-- defecto) y se pueden dar de baja con el enlace de cada correo.
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS acepta_promos BOOLEAN NOT NULL DEFAULT false;
