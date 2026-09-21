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
