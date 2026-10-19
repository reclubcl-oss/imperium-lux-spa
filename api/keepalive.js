import { createClient } from '@supabase/supabase-js';

// Mantiene activa la base de datos. El plan gratuito de Supabase pausa el proyecto tras 7 días sin
// actividad; esta tarea (Vercel Cron, una vez al día, vercel.json) hace una consulta liviana todos los días
// y, de paso, deja constancia de que todo responde.
//
// GET /api/keepalive  (con "Authorization: Bearer <CRON_SECRET>", que Vercel Cron manda solo)

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !CRON_SECRET) {
    return res.status(500).json({ success: false, error: 'Servidor no configurado (faltan variables en Vercel)' });
  }
  if (req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'No autorizado' });
  }

  const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const started = Date.now();
  const [servicios, reservas, storage] = await Promise.all([
    db.from('servicios').select('id', { count: 'exact', head: true }),
    db.from('reservas').select('id', { count: 'exact', head: true }),
    db.storage.from('servicios').list('', { limit: 1 }),
  ]);

  const failed = [servicios.error, reservas.error, storage.error].filter(Boolean);
  if (failed.length) {
    console.error('Keepalive: algo no respondió', failed.map(e => e.message));
    return res.status(502).json({ success: false, error: failed.map(e => e.message).join(' | ') });
  }
  return res.status(200).json({ success: true, servicios: servicios.count, reservas: reservas.count, ms: Date.now() - started });
}
