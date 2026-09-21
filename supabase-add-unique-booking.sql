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
