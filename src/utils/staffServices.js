import { supabase } from './supabase';

// Qué tratamientos hace cada profesional. Sin filas = hace todos (así el sitio
// sigue igual hasta que se asignen desde Admin > Equipo, o si la tabla aún no existe).

let cache = { at: 0, promise: null };

/** { [staffId]: [nombre de tratamiento, ...] } — solo profesionales con tratamientos asignados. */
export function getStaffServiceMap() {
  if (cache.promise && Date.now() - cache.at < 30000) return cache.promise;
  const promise = (async () => {
    if (!supabase) return {};
    const { data, error } = await supabase.from('staff_servicios').select('staff_id, servicios(nombre)');
    if (error || !data) return {};
    const map = {};
    data.forEach(r => { if (r.servicios?.nombre) (map[r.staff_id] ||= []).push(r.servicios.nombre); });
    return map;
  })();
  cache = { at: Date.now(), promise };
  return promise;
}

export function canDo(map, staffId, servicio) {
  const list = map[staffId];
  return !servicio || !list || list.length === 0 || list.includes(servicio);
}

/** Ids de los tratamientos asignados a un profesional (para el editor del admin). */
export async function getStaffServiceIds(staffId) {
  const { data, error } = await supabase.from('staff_servicios').select('servicio_id').eq('staff_id', staffId);
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: data.map(r => r.servicio_id) };
}

/** Reemplaza los tratamientos de un profesional (solo admin). */
export async function setStaffServices(staffId, servicioIds) {
  const del = await supabase.from('staff_servicios').delete().eq('staff_id', staffId);
  if (del.error) return { success: false, error: del.error.message };
  if (servicioIds.length) {
    const ins = await supabase.from('staff_servicios').insert(servicioIds.map(id => ({ staff_id: staffId, servicio_id: id })));
    if (ins.error) return { success: false, error: ins.error.message };
  }
  cache = { at: 0, promise: null };
  return { success: true };
}
