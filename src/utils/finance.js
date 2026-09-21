import { supabase } from './supabase';

export async function getGastos() {
  if (!supabase) return { success: false, error: 'Supabase no configurado', data: [] };
  const { data, error } = await supabase
    .from('gastos')
    .select('*')
    .order('fecha', { ascending: false });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data };
}

export async function addGasto({ fecha, descripcion, monto, categoria }) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const { data, error } = await supabase
    .from('gastos')
    .insert([{ fecha, descripcion, monto, categoria: categoria || null }])
    .select();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteGasto(id) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const { error } = await supabase.from('gastos').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateReservationPrecio(id, precio) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const { error } = await supabase.from('reservas').update({ precio }).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
