import { createClient } from '@supabase/supabase-js';
import { CLINIC, esc } from './_lib/clinic.js';
import { verifyUnsubscribe } from './_lib/unsub.js';

const page = (title, msg) => `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)}</title></head>
<body style="margin:0;background:#FAF9F5;font-family:Georgia,serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:20px">
<div style="max-width:420px;background:#FFFEFB;border:1px solid #E7E2D3;border-radius:14px;padding:32px;text-align:center">
<h1 style="font-weight:400;font-size:24px;color:#172616;margin:0 0 12px">${esc(title)}</h1>
<p style="font:15px/1.7 -apple-system,Segoe UI,Arial,sans-serif;color:#5b6357;margin:0 0 20px">${msg}</p>
<a href="/" style="color:#B5924D;font:600 14px -apple-system,Arial,sans-serif">Ir a ${esc(CLINIC.nombre)}</a></div></body></html>`;

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const email = verifyUnsubscribe(req.query?.e, req.query?.t);
  if (!email) return res.status(400).send(page('Enlace no válido', 'Este enlace de baja no es válido o está incompleto. Escríbenos y te damos de baja a mano.'));

  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).send(page('Ups', 'No pudimos procesar tu solicitud. Intenta más tarde.'));
  const supabaseAdmin = createClient(url, key);

  const { data, error } = await supabaseAdmin.from('reservas').select('id, email').eq('acepta_promos', true);
  if (error) return res.status(500).send(page('Ups', 'No pudimos procesar tu solicitud. Intenta más tarde.'));

  const ids = data.filter(r => String(r.email).trim().toLowerCase() === email).map(r => r.id);
  if (ids.length) await supabaseAdmin.from('reservas').update({ acepta_promos: false }).in('id', ids);

  return res.status(200).send(page('Listo, te diste de baja', `Ya no recibirás promociones en <strong>${esc(email)}</strong>. Seguirás recibiendo los correos de tus citas.`));
}
