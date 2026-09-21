import { supabase } from './supabase';

export async function signIn(email, password) {
  if (!supabase) return { success: false, error: 'Supabase no configurado' };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  return { success: true, session: data.session };
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session || null;
}

export function onAuthStateChange(callback) {
  if (!supabase) return { data: { subscription: { unsubscribe() {} } } };
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}

/**
 * Obtiene la fila de `staff` asociada al usuario autenticado actual.
 */
export async function getMyStaffProfile() {
  if (!supabase) return { success: false, error: 'Supabase no configurado', data: null };

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return { success: false, error: 'No hay sesión activa', data: null };

  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (error) return { success: false, error: error.message, data: null };
  return { success: true, data };
}
