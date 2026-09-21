import { supabase } from './supabase';

export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const SLOT_MINUTES = 30;

/** Fecha ISO (YYYY-MM-DD) en horario LOCAL — evita el corrimiento de día de toISOString(). */
export function toLocalISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function toHHMM(totalMinutes) {
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const m = String(totalMinutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

/** Genera horas de inicio cada 30 min dentro de cada bloque [hora_inicio, hora_fin] (ambos extremos incluidos). */
export function generateSlotsFromBlocks(blocks) {
  const slots = [];
  blocks.forEach(({ hora_inicio, hora_fin }) => {
    if (!hora_inicio || !hora_fin) return;
    const start = toMinutes(hora_inicio.slice(0, 5));
    const end = toMinutes(hora_fin.slice(0, 5));
    for (let t = start; t <= end; t += SLOT_MINUTES) slots.push(toHHMM(t));
  });
  return [...new Set(slots)].sort();
}

/**
 * Lista pública de profesionales activos, para el selector de /reservar.
 */
export async function getStaffList() {
  if (!supabase) return { success: false, error: 'Supabase no configurado', data: [] };
  const { data, error } = await supabase
    .from('staff')
    .select('id, nombre, especialidad, foto_url, orden, email')
    .eq('activo', true)
    .order('orden', { ascending: true });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data };
}

export async function getRecurringBlocks(staffId) {
  if (!supabase) return { success: false, error: 'Supabase no configurado', data: [] };
  const { data, error } = await supabase
    .from('horarios_recurrentes')
    .select('*')
    .eq('staff_id', staffId)
    .order('dia_semana', { ascending: true })
    .order('hora_inicio', { ascending: true });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data };
}

export async function addRecurringBlock({ staffId, diaSemana, horaInicio, horaFin }) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const { data, error } = await supabase
    .from('horarios_recurrentes')
    .insert([{ staff_id: staffId, dia_semana: diaSemana, hora_inicio: horaInicio, hora_fin: horaFin }])
    .select();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteRecurringBlock(id) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const { error } = await supabase.from('horarios_recurrentes').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getExceptions(staffId) {
  if (!supabase) return { success: false, error: 'Supabase no configurado', data: [] };
  const today = toLocalISODate(new Date());
  const { data, error } = await supabase
    .from('horarios_excepciones')
    .select('*')
    .eq('staff_id', staffId)
    .gte('fecha', today)
    .order('fecha', { ascending: true });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data };
}

export async function upsertException({ staffId, fecha, tipo, horaInicio, horaFin, motivo }) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const { data, error } = await supabase
    .from('horarios_excepciones')
    .upsert([{ staff_id: staffId, fecha, tipo, hora_inicio: horaInicio || null, hora_fin: horaFin || null, motivo: motivo || null }], { onConflict: 'staff_id,fecha' })
    .select();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteException(id) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const { error } = await supabase.from('horarios_excepciones').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Calcula los horarios disponibles de un profesional para una fecha:
 * excepción del día (si existe) > horario recurrente de ese día de semana,
 * menos las horas ya reservadas.
 */
export async function getAvailableSlots(staffId, date) {
  if (!supabase || !staffId || !date) return { success: false, error: 'Faltan datos', data: [] };

  const fechaIso = toLocalISODate(date);
  const diaSemana = date.getDay();

  const { data: excepcion, error: excError } = await supabase
    .from('horarios_excepciones')
    .select('*')
    .eq('staff_id', staffId)
    .eq('fecha', fechaIso)
    .maybeSingle();

  if (excError) return { success: false, error: excError.message, data: [] };

  let blocks = [];
  if (excepcion?.tipo === 'no_disponible') {
    blocks = [];
  } else if (excepcion?.tipo === 'horario_especial') {
    blocks = [{ hora_inicio: excepcion.hora_inicio, hora_fin: excepcion.hora_fin }];
  } else {
    const { data: recurrentes, error: recError } = await supabase
      .from('horarios_recurrentes')
      .select('hora_inicio, hora_fin')
      .eq('staff_id', staffId)
      .eq('dia_semana', diaSemana);
    if (recError) return { success: false, error: recError.message, data: [] };
    blocks = recurrentes;
  }

  const slots = generateSlotsFromBlocks(blocks);
  if (slots.length === 0) return { success: true, data: [] };

  const { data: reservadas, error: resError } = await supabase
    .from('reservas')
    .select('hora')
    .eq('staff_id', staffId)
    .eq('fecha_iso', fechaIso);

  if (resError) return { success: false, error: resError.message, data: [] };

  const ocupadas = new Set((reservadas || []).map(r => r.hora));
  let disponibles = slots.filter(s => !ocupadas.has(s));

  // Si la fecha consultada es hoy, no ofrecer horas que ya pasaron.
  if (fechaIso === toLocalISODate(new Date())) {
    const now = new Date();
    const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    disponibles = disponibles.filter(s => s > nowHHMM);
  }

  return { success: true, data: disponibles };
}

/**
 * Disponibilidad combinada de TODOS los profesionales activos para una fecha —
 * un horario aparece disponible si al menos uno está libre. Se usa en /reservar,
 * que ya no le pide al cliente elegir profesional; la asignación se resuelve
 * (silenciosamente) recién al confirmar, con resolveStaffForSlot().
 */
export async function getAvailableSlotsAnyStaff(date) {
  const { success, data: staffList, error } = await getStaffList();
  if (!success) return { success: false, error, data: [] };
  if (staffList.length === 0) return { success: true, data: [] };

  const results = await Promise.all(staffList.map(s => getAvailableSlots(s.id, date)));
  const union = new Set();
  results.forEach(r => { if (r.success) r.data.forEach(t => union.add(t)); });
  return { success: true, data: [...union].sort() };
}

/**
 * Elige qué profesional activo atiende una fecha/hora ya elegidas por el cliente.
 * Se llama justo antes de guardar la reserva (no al mostrar el calendario) para
 * no asignar a alguien que se ocupó mientras el cliente completaba el formulario.
 */
export async function resolveStaffForSlot(date, time) {
  const { success, data: staffList, error } = await getStaffList();
  if (!success) return { success: false, error };

  for (const s of staffList) {
    const result = await getAvailableSlots(s.id, date);
    if (result.success && result.data.includes(time)) {
      return { success: true, staffId: s.id, staffNombre: s.nombre, staffEmail: s.email };
    }
  }
  return { success: false, error: 'Ese horario ya no está disponible. Por favor elige otro.' };
}

/**
 * Reservas asignadas a un profesional (agenda personal para la intranet).
 */
export async function getMyBookings(staffId) {
  if (!supabase) return { success: false, error: 'Supabase no configurado', data: [] };
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('staff_id', staffId)
    .order('fecha_iso', { ascending: true, nullsFirst: false })
    .order('hora', { ascending: true });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data };
}
