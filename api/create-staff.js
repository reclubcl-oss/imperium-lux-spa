import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

function randomPassword() {
  return Math.random().toString(36).slice(-6) + Math.random().toString(36).slice(-4).toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
    return res.status(500).json({ success: false, error: 'Servidor no configurado (falta SUPABASE_SERVICE_ROLE_KEY en Vercel)' });
  }

  // ── Verificar que quien llama es un admin autenticado ──────────────────────
  const authHeader = req.headers.authorization || '';
  const accessToken = authHeader.replace(/^Bearer\s+/i, '');
  if (!accessToken) {
    return res.status(401).json({ success: false, error: 'No autenticado' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  if (userError || !userData?.user) {
    return res.status(401).json({ success: false, error: 'Sesión inválida' });
  }

  const { data: callerStaff, error: callerError } = await supabaseAdmin
    .from('staff')
    .select('rol')
    .eq('auth_user_id', userData.user.id)
    .single();

  if (callerError || callerStaff?.rol !== 'admin') {
    return res.status(403).json({ success: false, error: 'No autorizado' });
  }

  // ── Validar body ─────────────────────────────────────────────────────────
  const { nombre, email, especialidad, rol } = req.body || {};
  if (!nombre || !email) {
    return res.status(400).json({ success: false, error: 'Faltan nombre o email' });
  }
  const rolFinal = rol === 'admin' ? 'admin' : 'profesional';

  // ── Crear usuario + fila de staff ───────────────────────────────────────
  const password = randomPassword();

  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    return res.status(400).json({ success: false, error: createError.message });
  }

  const { count } = await supabaseAdmin.from('staff').select('id', { count: 'exact', head: true });
  const orden = (count || 0) + 1;

  const { error: insertError } = await supabaseAdmin.from('staff').insert([{
    auth_user_id: newUser.user.id,
    nombre,
    email,
    especialidad: especialidad || null,
    rol: rolFinal,
    activo: true,
    orden,
  }]);

  if (insertError) {
    return res.status(400).json({ success: false, error: insertError.message });
  }

  return res.status(200).json({ success: true, password });
}
