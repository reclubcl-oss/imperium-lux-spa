import { createClient } from '@supabase/supabase-js';

// Horas ya ocupadas en una fecha (por profesional). Es público a propósito: la
// tabla `reservas` solo la leen usuarios autenticados (protege nombre/correo de
// las clientas), así que sin este endpoint la página de reservas no podría
// saber qué horarios están tomados y ofrecería horas ocupadas. Devuelve SOLO
// profesional + hora, nunca datos personales.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const fecha = String(req.query?.fecha || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return res.status(400).json({ success: false, error: 'Fecha inválida' });
  }
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ success: false, error: 'Servidor no configurado' });

  const { data, error } = await createClient(url, key).from('reservas').select('staff_id, hora').eq('fecha_iso', fecha);
  if (error) return res.status(500).json({ success: false, error: 'No se pudo cargar la disponibilidad' });
  return res.status(200).json({ success: true, busy: data });
}
