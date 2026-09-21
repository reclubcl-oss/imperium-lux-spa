import { createClient } from '@supabase/supabase-js';
import { alertAdmins } from './_lib/alert.js';

// El sitio avisa aquí cuando algo falla en el navegador de una clienta (por
// ejemplo, no se pudo guardar una reserva). Llega como alerta a las
// administradoras. Solo se aceptan mensajes técnicos cortos: nada de datos
// personales, y con límite por IP para que nadie pueda inundar las alertas.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false });
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ success: false });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ success: false });

  const { where, message } = req.body || {};
  const clean = (v, max) => String(v ?? '').replace(/[\r\n\t]+/g, ' ').slice(0, max);
  const w = clean(where, 60) || 'sitio';
  const m = clean(message, 160) || 'sin detalle';

  await alertAdmins(createClient(url, key), { title: `Error en ${w}`, body: m, tag: 'error-sitio', dedupeMs: 5 * 60 * 1000 });
  return res.status(200).json({ success: true });
}
