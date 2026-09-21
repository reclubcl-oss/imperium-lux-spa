import nodemailer from 'nodemailer';
import { CLINIC, SITE_URL, esc } from './clinic.js';

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

export const gmailConfigured = () => !!(GMAIL_USER && GMAIL_APP_PASSWORD);
export const clinicInbox = () => process.env.VITE_CLINIC_EMAIL || GMAIL_USER;

/** Envía un correo por Gmail; nunca lanza: devuelve true/false. */
export async function sendMailSafe({ to, subject, text, html }) {
  if (!gmailConfigured() || !to) return false;
  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
    await transporter.sendMail({ from: `"${CLINIC.nombre}" <${GMAIL_USER}>`, to, subject, text, html });
    return true;
  } catch (err) {
    console.warn('Correo falló:', err.message);
    return false;
  }
}

/** Correo con el diseño de marca. rows = [[etiqueta, valor], ...] se muestran en el recuadro. */
export function brandedEmail({ eyebrow, title, intro, rows = [], ctaLabel, ctaUrl, note }) {
  const rowsHtml = rows.length
    ? `<div style="background:#F3F0E6;border-radius:10px;padding:14px 16px;margin:0 0 18px;font:15px/1.7 -apple-system,Segoe UI,Arial,sans-serif;color:#172616">${rows.map(([k, v]) => `<div><span style="color:#8a8f84;font-size:12px;letter-spacing:.08em">${esc(k.toUpperCase())}</span><br><strong>${esc(v)}</strong></div>`).join('<div style="height:8px"></div>')}</div>`
    : '';
  const html = `
<div style="font-family:Georgia,'Times New Roman',serif;background:#FAF9F5;padding:24px">
  <div style="max-width:500px;margin:0 auto;background:#FFFEFB;border:1px solid #E7E2D3;border-radius:14px;padding:28px">
    <p style="font:700 11px -apple-system,Segoe UI,Arial,sans-serif;letter-spacing:.2em;color:#B5924D;margin:0 0 10px">${esc(eyebrow)}</p>
    <h1 style="font-weight:400;font-size:24px;line-height:1.25;color:#172616;margin:0 0 14px">${esc(title)}</h1>
    ${intro ? `<p style="font:15px/1.7 -apple-system,Segoe UI,Arial,sans-serif;color:#3b4237;margin:0 0 16px">${esc(intro)}</p>` : ''}
    ${rowsHtml}
    ${note ? `<p style="font:13px/1.7 -apple-system,Segoe UI,Arial,sans-serif;color:#5b6357;margin:0 0 18px">${esc(note)}</p>` : ''}
    ${ctaUrl ? `<a href="${ctaUrl}" style="display:inline-block;background:#263A22;color:#FFFEFB;text-decoration:none;padding:13px 26px;border-radius:8px;font:700 13px -apple-system,Segoe UI,Arial,sans-serif">${esc(ctaLabel)}</a>` : ''}
  </div>
  <p style="text-align:center;font:12px/1.7 -apple-system,Segoe UI,Arial,sans-serif;color:#8a8f84;margin:14px 0 0">${esc(CLINIC.nombre)} · ${esc(CLINIC.direccion)}<br>WhatsApp <a href="${CLINIC.whatsapp}" style="color:#8a8f84">${esc(CLINIC.telefono)}</a></p>
</div>`;
  const text = [title, intro, ...rows.map(([k, v]) => `${k}: ${v}`), note, ctaUrl ? `${ctaLabel}: ${ctaUrl}` : '', `${CLINIC.nombre} · ${CLINIC.direccion} · ${CLINIC.telefono}`].filter(Boolean).join('\n');
  return { html, text };
}

export const manageUrlFor = (token) => (token ? `${SITE_URL}/cita?t=${token}` : null);
