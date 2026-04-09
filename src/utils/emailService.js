import emailjs from '@emailjs/browser';

const SERVICE_ID           = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID_CLINIC   = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;       // → clínica
const TEMPLATE_ID_CLIENT   = 'template_r9y2ubi';                              // → cliente
const PUBLIC_KEY           = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const CLINIC_EMAIL = import.meta.env.VITE_CLINIC_EMAIL || 'benjamin.tapia.r1@gmail.com';

export async function sendBookingEmail({ nombre, email, telefono, servicio, fecha, hora, notas }) {
  const params = {
    to_email:     CLINIC_EMAIL,
    client_email: email,
    reply_to:     email,
    nombre,
    email,
    telefono,
    servicio,
    fecha,
    hora,
    notas: notas || 'Sin notas adicionales',
  };

  try {
    // Enviar ambos emails en paralelo
    const [clinicRes, clientRes] = await Promise.all([
      emailjs.send(SERVICE_ID, TEMPLATE_ID_CLINIC, params, { publicKey: PUBLIC_KEY }),
      emailjs.send(SERVICE_ID, TEMPLATE_ID_CLIENT, params, { publicKey: PUBLIC_KEY }),
    ]);
    return { success: true, clinicRes, clientRes };
  } catch (error) {
    console.error('EmailJS error:', error);
    const msg = error?.text || error?.message || JSON.stringify(error);
    return { success: false, error: msg };
  }
}
