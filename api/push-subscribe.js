import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Límite por IP en memoria (mismo criterio que create-reservation): frena
// que alguien llene la tabla de suscripciones falsas en bucle.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 20;
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return res.status(500).json({ success: false, error: 'Servidor no configurado' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ success: false, error: 'Demasiados intentos. Espera unos minutos.' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { action, endpoint, subscription } = req.body || {};

  if (action === 'unsubscribe') {
    if (typeof endpoint !== 'string' || !endpoint) {
      return res.status(400).json({ success: false, error: 'Falta el endpoint' });
    }
    const { error } = await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', endpoint);
    if (error) return res.status(400).json({ success: false, error: error.message });
    return res.status(200).json({ success: true });
  }

  const ep = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;
  if (
    typeof ep !== 'string' || !ep.startsWith('https://') || ep.length > 600 ||
    typeof p256dh !== 'string' || p256dh.length > 200 ||
    typeof auth !== 'string' || auth.length > 100
  ) {
    return res.status(400).json({ success: false, error: 'Suscripción inválida' });
  }

  const { error } = await supabaseAdmin.from('push_subscriptions').upsert(
    { endpoint: ep, p256dh, auth, user_agent: String(req.headers['user-agent'] || '').slice(0, 250) },
    { onConflict: 'endpoint' }
  );
  if (error) return res.status(400).json({ success: false, error: error.message });

  return res.status(200).json({ success: true });
}
