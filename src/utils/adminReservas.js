import { supabase } from './supabase';

// Cancelar, cambiar la hora o crear reservas desde el panel (endpoint de admin).
export async function adminReservaAction(payload) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { success: false, error: 'Tu sesión expiró. Vuelve a entrar al panel.' };
  try {
    const res = await fetch('/api/admin-reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return res.ok && json.success ? json : { success: false, error: json.error || `Error ${res.status}` };
  } catch {
    return { success: false, error: 'No pudimos conectarnos. Revisa tu internet.' };
  }
}
