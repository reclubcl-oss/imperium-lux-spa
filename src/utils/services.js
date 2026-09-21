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

// Las fotos que llegan del celular o de un generador pesan 2–3 MB, y con 24
// tratamientos eso hacía la página lentísima. Se reducen a un ancho de 1000 px y
// se guardan como WebP (unos 40 KB) antes de subirlas. Si algo falla, se sube
// el archivo original tal cual.
async function compressImage(file, maxWidth = 1000, quality = 0.82) {
  try {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadServiceImage(originalFile, serviceId) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const file = await compressImage(originalFile);
  const ext = file === originalFile ? originalFile.name.split('.').pop() : 'webp';
  const path = `${serviceId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from('servicios').upload(path, file, { upsert: true, cacheControl: '31536000', contentType: file.type || undefined });
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
