import { supabase } from './supabase';

/**
 * Trae TODOS los profesionales (activos e inactivos), para la vista de administración.
 * A diferencia de getStaffList() en schedule.js, que solo trae activos.
 */
export async function getAllStaff() {
  if (!supabase) return { success: false, error: 'Supabase no configurado', data: [] };
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('orden', { ascending: true });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data };
}

export async function updateStaffMember(id, fields) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const { error } = await supabase.from('staff').update(fields).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Crea una cuenta nueva (Auth + fila staff) llamando al endpoint serverless
 * /api/create-staff, que es el único lugar donde se usa la Service Role Key.
 */
export async function createStaffMember({ nombre, email, especialidad, rol }) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) return { success: false, error: 'No hay sesión activa' };

  try {
    const res = await fetch('/api/create-staff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ nombre, email, especialidad, rol }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) return { success: false, error: json.error || `Error ${res.status}` };
    return { success: true, password: json.password };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
