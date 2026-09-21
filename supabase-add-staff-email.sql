-- Agrega el email de contacto de cada profesional (para notificarle cuando le agendan)
ALTER TABLE staff ADD COLUMN IF NOT EXISTS email TEXT;
