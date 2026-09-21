import { supabase } from './supabase';

/** Consulta el conteo de visitas de un email — vía /api/loyalty-status (server-side, no expone datos de otros). */
export async function checkLoyaltyStatus(email) {
  try {
    const res = await fetch('/api/loyalty-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) return { success: false, error: json.error || `Error ${res.status}` };
    return { success: true, ...json };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getLoyaltyThreshold() {
  if (!supabase) return { success: false, error: 'Supabase no configurado', value: 5 };
  const { data, error } = await supabase
    .from('configuracion')
    .select('valor')
    .eq('clave', 'visitas_para_premio')
    .maybeSingle();
  if (error) return { success: false, error: error.message, value: 5 };
  return { success: true, value: Number(data?.valor) || 5 };
}

export async function setLoyaltyThreshold(value) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const { error } = await supabase
    .from('configuracion')
    .upsert([{ clave: 'visitas_para_premio', valor: String(value) }], { onConflict: 'clave' });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
