import { supabase } from './supabase';

/** Lista pública de tratamientos activos, para el sitio y el selector de reserva. */
export async function getActiveServices() {
  if (!supabase) return { success: false, error: 'Supabase no configurado', data: [] };
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data };
}

/** Todos los tratamientos (activos e inactivos), para el panel de administración. */
export async function getAllServices() {
  if (!supabase) return { success: false, error: 'Supabase no configurado', data: [] };
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .order('orden', { ascending: true });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data };
}

export async function uploadServiceImage(file, serviceId) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const ext = file.name.split('.').pop();
  const path = `${serviceId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from('servicios').upload(path, file, { upsert: true });
  if (uploadError) return { success: false, error: uploadError.message };

  const { data } = supabase.storage.from('servicios').getPublicUrl(path);
  return { success: true, url: data.publicUrl };
}

export async function createService({ nombre, categoria, descripcion, precio, fotoFile }) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };

  const { count } = await supabase.from('servicios').select('id', { count: 'exact', head: true });
  const orden = (count ?? 0) + 1;

  const { data: inserted, error: insertError } = await supabase
    .from('servicios')
    .insert([{ nombre, categoria: categoria || null, descripcion: descripcion || null, precio: precio || null, activo: true, orden }])
    .select()
    .single();
  if (insertError) return { success: false, error: insertError.message };

  if (fotoFile) {
    const upload = await uploadServiceImage(fotoFile, inserted.id);
    if (!upload.success) return { success: false, error: upload.error };
    await supabase.from('servicios').update({ foto_url: upload.url }).eq('id', inserted.id);
    inserted.foto_url = upload.url;
  }

  return { success: true, data: inserted };
}

export async function updateService(id, fields, fotoFile) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };

  let foto_url;
  if (fotoFile) {
    const upload = await uploadServiceImage(fotoFile, id);
    if (!upload.success) return { success: false, error: upload.error };
    foto_url = upload.url;
  }

  const { error } = await supabase
    .from('servicios')
    .update({ ...fields, ...(foto_url ? { foto_url } : {}) })
    .eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true, foto_url };
}

export async function toggleServiceActivo(id, activo) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const { error } = await supabase.from('servicios').update({ activo }).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
