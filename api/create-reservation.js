import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;

// Límite por IP: máximo 5 reservas cada 10 minutos. Es en memoria, así que
// cada instancia serverless lleva su propia cuenta — no es infalible, pero
// frena el spam simple (un script disparando la ruta en bucle) sin agregar
// infraestructura.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) {
    for (const [k, v] of hits) if (v.every(t => now - t >= RATE_WINDOW_MS)) hits.delete(k);
  }
  return recent.length > RATE_MAX;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return res.status(500).json({ success: false, error: 'Servidor no configurado (falta SUPABASE_SERVICE_ROLE_KEY en Vercel)' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ success: false, error: 'Demasiados intentos. Espera unos minutos e intenta de nuevo.' });
  }

  const { nombre, email, telefono, servicio, fecha, fechaIso, hora, notas, staffId } = req.body || {};

  if (!nombre || !email || !telefono || !servicio || !fecha || !hora) {
    return res.status(400).json({ success: false, error: 'Faltan datos obligatorios de la reserva' });
  }

  if (!EMAIL_RE.test(email) || nombre.length > 120 || email.length > 160 || telefono.length > 40 || (notas || '').length > 1000) {
    return res.status(400).json({ success: false, error: 'Revisa los datos ingresados (correo o largo de los campos)' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // El precio se toma del tratamiento en la base de datos (no de lo que
  // mande el navegador) — así siempre queda el precio real y actualizado,
  // y nadie puede manipular el precio de su propia reserva.
  const { data: servicioRow } = await supabaseAdmin
    .from('servicios')
    .select('precio')
    .eq('nombre', servicio)
    .maybeSingle();

  const { data, error } = await supabaseAdmin
    .from('reservas')
    .insert([{
      nombre, email, telefono, servicio, fecha,
      fecha_iso: fechaIso || null,
      hora,
      notas: notas || '',
      staff_id: staffId || null,
      precio: servicioRow?.precio ?? null,
    }])
    .select();

  if (error) {
    // Choque con el índice único (staff_id, fecha_iso, hora) — dos personas
    // reservaron el mismo horario casi al mismo tiempo. Mensaje amigable en
    // vez del error crudo de Postgres.
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'Ese horario se acaba de ocupar. Por favor elige otro.' });
    }
    return res.status(400).json({ success: false, error: error.message });
  }

  // Aviso a Zapier desde el servidor (la URL del webhook ya no viaja al
  // navegador). Se espera con un tope de 3s porque una función serverless
  // puede congelarse apenas responde; si falla, no afecta la reserva.
  if (ZAPIER_WEBHOOK_URL) {
    try {
      await fetch(ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, telefono, servicio, fecha, hora }),
        signal: AbortSignal.timeout(3000),
      });
    } catch (err) {
      console.warn('Zapier webhook error:', err.message);
    }
  }

  return res.status(200).json({ success: true, data });
}
