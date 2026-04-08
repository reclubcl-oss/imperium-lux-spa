import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;

const clean = (v) => (v || '').trim();
const isConfigured = clean(SUPABASE_URL).startsWith('https://') && clean(SUPABASE_KEY).length > 20;

export const supabase = isConfigured ? createClient(clean(SUPABASE_URL), clean(SUPABASE_KEY)) : null;

/**
 * Guarda una reserva en la tabla "reservas" de Supabase.
 */
export async function saveReservation({ nombre, email, telefono, servicio, fecha, hora, notas }) {
  if (!supabase) { console.warn('Supabase no configurado'); return { success: false, error: 'Supabase no configurado' }; }

  const { data, error } = await supabase
    .from('reservas')
    .insert([{ nombre, email, telefono, servicio, fecha, hora, notas: notas || '' }])
    .select();

  if (error) {
    console.error('Supabase error:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

/**
 * Obtiene todas las reservas ordenadas por fecha desc.
 */
export async function getReservations() {
  if (!supabase) return { success: false, error: 'Supabase no configurado. Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env', data: [] };

  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data };
}
