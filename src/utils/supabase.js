import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;

const clean = (v) => (v || '').trim();
const isConfigured = clean(SUPABASE_URL).startsWith('https://') && clean(SUPABASE_KEY).length > 20;

export const supabase = isConfigured ? createClient(clean(SUPABASE_URL), clean(SUPABASE_KEY)) : null;

/**
 * Guarda una reserva. Pasa por /api/create-reservation (usa la Service Role Key
 * en el servidor) en vez de insertar directo desde el navegador con la anon key,
 * para no depender de la política RLS de INSERT público en `reservas`.
 */
export async function saveReservation({ nombre, email, telefono, servicio, fecha, fechaIso, hora, notas, staffId, aceptaPromos }) {
  try {
    const res = await fetch('/api/create-reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, telefono, servicio, fecha, fechaIso, hora, notas, staffId, aceptaPromos }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      console.error('Reservation error:', json.error);
      return { success: false, error: json.error || `Error ${res.status}` };
    }
    return { success: true, data: json.data };
  } catch (err) {
    console.error('Reservation error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Obtiene todas las reservas ordenadas por fecha desc.
 */
export async function getReservations() {
  if (!supabase) return { success: false, error: 'Supabase no configurado. Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env', data: [] };

  const { data, error } = await supabase
    .from('reservas')
    .select('*, staff(nombre)')
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data };
}
