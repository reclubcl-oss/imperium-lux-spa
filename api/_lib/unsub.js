import crypto from 'node:crypto';
import { SITE_URL } from './clinic.js';

// Enlace de baja firmado: solo quien recibió el correo puede darse de baja,
// nadie puede dar de baja a otra persona adivinando su dirección.
const secret = () => process.env.CRON_SECRET || '';
const sign = (email) => crypto.createHmac('sha256', secret()).update(email).digest('hex').slice(0, 32);

export function unsubscribeUrl(email) {
  const e = String(email).trim().toLowerCase();
  return `${SITE_URL}/api/unsubscribe?e=${Buffer.from(e).toString('base64url')}&t=${sign(e)}`;
}

export function verifyUnsubscribe(encodedEmail, token) {
  try {
    const email = Buffer.from(String(encodedEmail), 'base64url').toString('utf8').trim().toLowerCase();
    const expected = Buffer.from(sign(email));
    const given = Buffer.from(String(token));
    if (!email || expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
    return email;
  } catch {
    return null;
  }
}
