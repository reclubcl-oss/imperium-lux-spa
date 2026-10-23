import { supabase } from './supabase';

/** Lista pública de enlaces activos, para la landing /link. */
export async function getActiveLinks() {
  if (!supabase) return { success: false, error: 'Supabase no configurado', data: [] };
  const { data, error } = await supabase
    .from('enlaces')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data };
}

/** Todos los enlaces (activos e inactivos), para /admin. */
export async function getAllLinks() {
  if (!supabase) return { success: false, error: 'Supabase no configurado', data: [] };
  const { data, error } = await supabase
    .from('enlaces')
    .select('*')
    .order('orden', { ascending: true });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data };
}

export async function createLink({ titulo, url, icono }) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };

  const { count } = await supabase.from('enlaces').select('id', { count: 'exact', head: true });
  const orden = (count ?? 0) + 1;

  const { data, error } = await supabase
    .from('enlaces')
    .insert([{ titulo, url, icono: icono || null, activo: true, orden }])
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateLink(id, fields) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const { error } = await supabase.from('enlaces').update(fields).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function toggleLinkActivo(id, activo) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const { error } = await supabase.from('enlaces').update({ activo }).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteLink(id) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const { error } = await supabase.from('enlaces').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Reordena un link intercambiando su `orden` con el del vecino inmediato
 * (arriba o abajo) dentro de la lista completa ya cargada — más simple y
 * confiable que recalcular todo desde la base de datos.
 */
export async function moveLink(allLinks, id, direction) {
  const sorted = [...allLinks].sort((a, b) => a.orden - b.orden);
  const index = sorted.findIndex(l => l.id === id);
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || targetIndex < 0 || targetIndex >= sorted.length) {
    return { success: false, error: 'No se puede mover más' };
  }

  const current = sorted[index];
  const target = sorted[targetIndex];

  const [r1, r2] = await Promise.all([
    updateLink(current.id, { orden: target.orden }),
    updateLink(target.id, { orden: current.orden }),
  ]);
  if (!r1.success) return r1;
  if (!r2.success) return r2;
  return { success: true };
}
