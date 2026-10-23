import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return res.status(500).json({ success: false, error: 'Servidor no configurado (falta SUPABASE_SERVICE_ROLE_KEY en Vercel)' });
  }

  const { email } = req.body || {};
  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, error: 'Falta el email' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Solo se devuelve el CONTEO de este email — nunca filas individuales,
  // así nunca se exponen datos de otros clientes.
  const { count, error: countError } = await supabaseAdmin
    .from('reservas')
    .select('id', { count: 'exact', head: true })
    .ilike('email', email.trim());

  if (countError) {
    return res.status(400).json({ success: false, error: countError.message });
  }

  const { data: configRow } = await supabaseAdmin
    .from('configuracion')
    .select('valor')
    .eq('clave', 'visitas_para_premio')
    .maybeSingle();

  const visitasParaPremio = Number(configRow?.valor) || 5;
  const visitas = count || 0;
  const resto = visitas % visitasParaPremio;
  const faltanParaPremio = visitas === 0 ? visitasParaPremio : (resto === 0 ? 0 : visitasParaPremio - resto);

  return res.status(200).json({ success: true, visitas, visitasParaPremio, faltanParaPremio });
}
