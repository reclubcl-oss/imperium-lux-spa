import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { CLINIC, SITE_URL, esc } from './_lib/clinic.js';
import { unsubscribeUrl } from './_lib/unsub.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// Gmail permite ~500 correos al día y la función tiene un tope de tiempo:
// mejor pocos por envío que dejar un envío a medias.
const MAX_RECIPIENTS = 200;
const PARALLEL = 5;

function promoEmail({ nombre, title, message, path, unsub }) {
  const cta = `${SITE_URL}${path}`;
  const paragraphs = esc(message).split(/\n{2,}/).map(p => `<p style="font:15px/1.75 -apple-system,Segoe UI,Arial,sans-serif;color:#3b4237;margin:0 0 14px">${p.replace(/\n/g, '<br>')}</p>`).join('');
  const html = `
<div style="font-family:Georgia,'Times New Roman',serif;background:#FAF9F5;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#FFFEFB;border:1px solid #E7E2D3;border-radius:14px;padding:30px">
    <p style="font:700 11px -apple-system,Segoe UI,Arial,sans-serif;letter-spacing:.2em;color:#B5924D;margin:0 0 10px">${esc(CLINIC.nombre.toUpperCase())}</p>
    <h1 style="font-weight:400;font-size:26px;line-height:1.25;color:#172616;margin:0 0 18px">${esc(title)}</h1>
    <p style="font:15px -apple-system,Segoe UI,Arial,sans-serif;color:#3b4237;margin:0 0 14px">Hola ${esc(nombre || '')},</p>
    ${paragraphs}
    <a href="${cta}" style="display:inline-block;background:#263A22;color:#FFFEFB;text-decoration:none;padding:13px 26px;border-radius:8px;margin-top:6px;font:700 13px -apple-system,Segoe UI,Arial,sans-serif">Ver más</a>
  </div>
  <p style="text-align:center;font:12px/1.7 -apple-system,Segoe UI,Arial,sans-serif;color:#8a8f84;margin:16px 0 0">
    ${esc(CLINIC.nombre)} · ${esc(CLINIC.direccion)}<br>
    Recibes este correo porque aceptaste recibir promociones al reservar.
    <a href="${unsub}" style="color:#8a8f84">Darme de baja</a>
  </p>
</div>`;
  const text = `Hola ${nombre || ''},\n\n${message}\n\n${cta}\n\n--\n${CLINIC.nombre} · ${CLINIC.direccion}\nPara no recibir más promociones: ${unsub}`;
  return { html, text };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return res.status(500).json({ success: false, error: 'Servidor no configurado' });

  // ── Solo un admin autenticado ─────────────────────────────────────────────
  const accessToken = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!accessToken) return res.status(401).json({ success: false, error: 'No autenticado' });

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  if (userError || !userData?.user) return res.status(401).json({ success: false, error: 'Sesión inválida' });
  const { data: caller } = await supabaseAdmin.from('staff').select('rol').eq('auth_user_id', userData.user.id).single();
  if (caller?.rol !== 'admin') return res.status(403).json({ success: false, error: 'No autorizado' });

  const emailConfigured = !!(GMAIL_USER && GMAIL_APP_PASSWORD);

  // Clientas que aceptaron promociones, sin repetir correos.
  const loadAudience = async () => {
    const { data, error } = await supabaseAdmin.from('reservas').select('email, nombre, created_at').eq('acepta_promos', true).order('created_at', { ascending: false });
    if (error) return { error };
    const seen = new Map();
    for (const r of data) {
      const e = String(r.email || '').trim().toLowerCase();
      if (e && !seen.has(e)) seen.set(e, { email: e, nombre: r.nombre });
    }
    return { list: [...seen.values()] };
  };

  const { action, title, message, url, test } = req.body || {};

  if (action === 'status') {
    const { list, error } = await loadAudience();
    return res.status(200).json({
      success: true,
      emailConfigured,
      audience: error ? null : list.length,
      needsMigration: error?.code === '42703',
    });
  }

  // ── Enviar ────────────────────────────────────────────────────────────────
  if (!emailConfigured) {
    return res.status(400).json({ success: false, error: 'El correo aún no está configurado (falta la contraseña de aplicación de Gmail en Vercel).' });
  }
  if (typeof title !== 'string' || !title.trim() || title.length > 100) {
    return res.status(400).json({ success: false, error: 'El asunto es obligatorio (máx. 100 caracteres)' });
  }
  if (typeof message !== 'string' || !message.trim() || message.length > 1500) {
    return res.status(400).json({ success: false, error: 'El mensaje es obligatorio (máx. 1500 caracteres)' });
  }
  const path = typeof url === 'string' && url.startsWith('/') && !url.startsWith('//') && url.length <= 200 ? url : '/';

  let recipients;
  if (test) {
    recipients = [{ email: userData.user.email, nombre: 'equipo' }];
  } else {
    const { list, error } = await loadAudience();
    if (error) {
      return res.status(400).json({ success: false, error: error.code === '42703' ? 'Falta correr supabase-add-promos.sql en Supabase.' : error.message });
    }
    recipients = list;
  }
  if (!recipients.length) return res.status(200).json({ success: true, sent: 0, failed: 0, total: 0 });
  if (recipients.length > MAX_RECIPIENTS) {
    return res.status(400).json({ success: false, error: `Hay ${recipients.length} destinatarias y el máximo por envío es ${MAX_RECIPIENTS}.` });
  }

  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i += PARALLEL) {
    const results = await Promise.allSettled(recipients.slice(i, i + PARALLEL).map(r => {
      const unsub = unsubscribeUrl(r.email);
      const { html, text } = promoEmail({ nombre: r.nombre, title: title.trim(), message: message.trim(), path, unsub });
      return transporter.sendMail({
        from: `"${CLINIC.nombre}" <${GMAIL_USER}>`,
        to: r.email,
        subject: title.trim(),
        text,
        html,
        headers: { 'List-Unsubscribe': `<${unsub}>` },
      });
    }));
    results.forEach(r => { if (r.status === 'fulfilled') sent++; else { failed++; console.warn('Correo falló:', r.reason?.message); } });
  }

  return res.status(200).json({ success: true, sent, failed, total: recipients.length });
}
